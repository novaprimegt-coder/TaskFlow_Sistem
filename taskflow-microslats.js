/* TaskFlow · MicroSlats WebGL2. Adaptación sin React/OGL del efecto provisto.
   Exclusivo de la pantalla de carga; sin acceso a cuentas, almacenamiento ni datos. */
(function(){
'use strict';
if(window.TaskFlowMicroSlats)return;
let active=null;
window.TaskFlowMicroSlats={stop:function(){if(active){active.stop();active=null}},isRunning:function(){return !!active}};
const root=document.getElementById('tfSplash');
const host=document.getElementById('tfSplashSlats');
if(!root||!host||root.hidden)return;
/* Respuesta táctil nativa incluso cuando Android no permite WebGL2. */
let lastPulse=-1000,pulseTimer=0;
function touchPoint(event){
 const p=event.changedTouches&&event.changedTouches[0]||event.touches&&event.touches[0]||event;
 const rect=host.getBoundingClientRect();
 if(!rect.width||!rect.height||!Number.isFinite(p.clientX)||!Number.isFinite(p.clientY))return null;
 return {x:Math.max(0,Math.min(rect.width,p.clientX-rect.left)),y:Math.max(0,Math.min(rect.height,p.clientY-rect.top)),rect};
}
function pulse(event){
 const now=performance.now();
 if(now-lastPulse<85)return;
 const p=touchPoint(event);
 if(!p)return;
 lastPulse=now;
 const wave=document.createElement('span');
 wave.className='tfSplashWave';
 wave.style.left=p.x+'px';wave.style.top=p.y+'px';
 host.appendChild(wave);
 wave.addEventListener('animationend',()=>wave.remove(),{once:true});
 setTimeout(()=>wave.remove(),1100);
 root.classList.add('tf-slats-touched');
 clearTimeout(pulseTimer);
 pulseTimer=setTimeout(()=>root.classList.remove('tf-slats-touched'),850);
}
const touchAllowed=!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
if(touchAllowed){
 root.addEventListener('pointerdown',pulse,{passive:true});
 root.addEventListener('touchstart',pulse,{passive:true});
}
const previousStop=window.TaskFlowMicroSlats.stop;
window.TaskFlowMicroSlats.stop=function(){
 previousStop();
 root.removeEventListener('pointerdown',pulse);
 root.removeEventListener('touchstart',pulse);
 clearTimeout(pulseTimer);
 root.classList.remove('tf-slats-touched');
 host.querySelectorAll('.tfSplashWave').forEach(node=>node.remove());
};
try{
 const reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 const saveData=!!(navigator.connection&&navigator.connection.saveData);
 if(reduced||saveData)return;
 const canvas=document.createElement('canvas');
 canvas.setAttribute('aria-hidden','true');
 canvas.style.cssText='display:block;width:100%;height:100%;opacity:0;transition:opacity .7s ease';
 host.appendChild(canvas);
 const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
 if(!gl){canvas.remove();return}
 const vs=[
  '#version 300 es','precision highp float;',
  'void main(){',
  'vec2 p=vec2(float((gl_VertexID << 1)&2),float(gl_VertexID&2));',
  'gl_Position=vec4(p*2.0-1.0,0.0,1.0);',
  '}'
 ].join('\n');
 const field=[
  '#version 300 es','precision highp float;',
  'uniform vec2 uSize;uniform vec4 uGrid;uniform vec2 uOrigin;uniform vec2 uSlat;',
  'uniform float uTime;uniform float uIntro;uniform float uScale;',
  'uniform float uDirection;uniform float uChop;uniform float uStretch;',
  'uniform float uGlint;uniform float uContrast;uniform float uPerspective;uniform float uFog;',
  'uniform vec4 uTouch;out vec4 fragColor;',
  'const float TURN[4]=float[4](0.0,-0.95,0.78,1.62);',
  'const float LENGTH[4]=float[4](2.6,1.7,1.12,0.76);',
  'const float HEIGHT[4]=float[4](1.0,0.75,0.5,0.3);',
  'const float SHIFT[4]=float[4](0.0,2.3,4.1,1.1);',
  'void main(){',
  'vec2 cell=floor(gl_FragCoord.xy);',
  'float row=uGrid.y-1.0-cell.y;',
  'vec2 center=uOrigin+vec2(cell.x,row)*uGrid.zw+uSlat*0.5;',
  'float v=clamp(center.y/uSize.y,0.0,1.0);',
  'float horizon=mix(8.0,0.5,uPerspective);',
  'float depth=(1.0+horizon)/(v+horizon);',
  'vec2 world=vec2((center.x-uSize.x*0.5)/uSize.y*depth,(depth-1.0)*horizon*2.2);',
  'world/=max(uScale,0.05);',
  'float meander=0.55*sin(dot(world,vec2(0.23,0.41))*0.9+uTime*0.13)+0.3*sin(dot(world,vec2(-0.37,0.19))*1.4-uTime*0.09);',
  'float steep=uChop*0.45;float height=0.0;float total=0.0;',
  'for(int i=0;i<4;i++){',
  'float angle=uDirection+TURN[i];vec2 heading=vec2(cos(angle),sin(angle));',
  'float k=6.2831853/LENGTH[i];float omega=sqrt(9.81*k)*0.35;',
  'float phase=k*dot(world,heading)-omega*uTime+SHIFT[i]+meander*(0.6+0.3*float(i));',
  'height+=HEIGHT[i]*(cos(phase)+steep*cos(2.0*phase));total+=HEIGHT[i]*(1.0+steep);',
  '}',
  'float dist=length(vec2((center.x/uSize.x-uTouch.x)*uSize.x/uSize.y,center.y/uSize.y-uTouch.y));',
  'float disturbance=sin(dist*30.0-uTouch.z*8.0)*exp(-dist*9.0)*uTouch.w*0.65;',
  'float ring=exp(-pow((dist-uTouch.z*0.23)/0.048,2.0))*uTouch.w;',
  'height+=disturbance*total;',
  'float level=clamp(0.5+0.5*height/(total*0.85),0.0,1.0);',
  'float crest=smoothstep(0.6,1.0,level);float glint=crest*crest*uGlint;',
  'float haze=mix(1.0,1.0-uFog,pow(1.0-v,1.4));',
  'float light=(pow(level,uContrast)+glint*0.8)*haze;',
  'float front=uIntro*1.35;',
  'float reveal=1.0-smoothstep(front-0.35,front,v);',
  'float sweep=exp(-pow((v-front+0.22)/0.07,2.0))*(1.0-uIntro);',
  'light=max((light+sweep*0.8)*reveal,0.045*reveal)+ring*0.7;',
  'float span=mix(1.0-uStretch,1.0,level);',
  'span=clamp(span,0.08,1.0)*mix(0.1,1.0,reveal);',
  'float tint=clamp(glint*1.4+sweep+abs(disturbance)*0.45+ring*1.2,0.0,1.0);',
  'float lean=clamp(disturbance*0.6,-1.0,1.0)*reveal;',
  'fragColor=vec4(clamp(light,0.0,1.0),span,tint,0.5+0.5*lean);',
  '}'
 ].join('\n');
 const slats=[
  '#version 300 es','precision highp float;',
  'uniform highp sampler2D tField;uniform vec2 uSize;uniform float uDpr;',
  'uniform vec4 uGrid;uniform vec2 uOrigin;uniform vec2 uSlat;',
  'uniform float uRound;uniform float uTilt;',
  'uniform vec3 uColor;uniform vec3 uGlintColor;',
  'out vec4 fragColor;',
  'float pill(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}',
  'void main(){',
  'vec2 p=vec2(gl_FragCoord.x,uSize.y*uDpr-gl_FragCoord.y)/uDpr;',
  'vec2 local=p-uOrigin;vec2 cell=floor(local/uGrid.zw);',
  'vec4 slat=vec4(0.0);',
  'for(int dx=-1;dx<=1;dx++){',
  'vec2 n=cell+vec2(float(dx),0.0);',
  'if(n.x<0.0||n.y<0.0||n.x>=uGrid.x||n.y>=uGrid.y)continue;',
  'vec4 f=texelFetch(tField,ivec2(int(n.x),int(uGrid.y-1.0-n.y)),0);',
  'vec2 offset=local-n*uGrid.zw-uSlat*0.5;',
  'float a=(f.a-0.5)*2.0*uTilt;float c=cos(a);float si=sin(a);',
  'vec2 turned=vec2(c*offset.x+si*offset.y,c*offset.y-si*offset.x);',
  'vec2 halfSize=vec2(uSlat.x*0.5,uSlat.y*0.5*f.g);',
  'float radius=uRound*min(halfSize.x,halfSize.y);',
  'float opacity=clamp(0.5-pill(turned,halfSize,radius)*uDpr,0.0,1.0)*f.r;',
  'if(opacity>slat.a)slat=vec4(mix(uColor,uGlintColor,f.b)*opacity,opacity);',
  '}',
  'fragColor=slat;',
  '}'
 ].join('\n');
 const compile=(kind,src)=>{
  const shader=gl.createShader(kind);gl.shaderSource(shader,src);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const reason=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error('MicroSlats shader: '+String(reason).slice(0,180))}
  return shader;
 };
 const createProgram=frag=>{
  const v=compile(gl.VERTEX_SHADER,vs),f=compile(gl.FRAGMENT_SHADER,frag),p=gl.createProgram();
  gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const reason=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error('MicroSlats link: '+String(reason).slice(0,180))}
  return p;
 };
 let fieldProgram=null,slatProgram=null,texture=null,fb=null,vao=null;
 let stopped=false,frameId=0,lastDraw=0,startedAt=performance.now(),lastTouch=-1e9;
 let viewW=0,viewH=0,dpr=1,cols=0,rows=0,pitchX=0,pitchY=0,originX=0,originY=0,slatW=11,slatH=27;
 const touch={x:0.5,y:0.5,strength:0};
 let observer=null,windowResize=null;
 const loc=(program,names)=>Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
 const setup=()=>{
  fieldProgram=createProgram(field);
  slatProgram=createProgram(slats);
  vao=gl.createVertexArray();gl.bindVertexArray(vao);
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  fb=gl.createFramebuffer();
  const fieldLoc=loc(fieldProgram,['uSize','uGrid','uOrigin','uSlat','uTime','uIntro','uScale','uDirection','uChop','uStretch','uGlint','uContrast','uPerspective','uFog','uTouch']);
  const slatLoc=loc(slatProgram,['tField','uSize','uDpr','uGrid','uOrigin','uSlat','uRound','uTilt','uColor','uGlintColor']);
  return {fieldLoc,slatLoc};
 };
 const resize=()=>{
  const rect=host.getBoundingClientRect();
  const w=Math.round(rect.width),h=Math.round(rect.height);
  if(w<30||h<30)return false;
  if(viewW===w&&viewH===h&&canvas.width&&canvas.height)return true;
  viewW=w;viewH=h;
  const pixelBudget=2700000;
  dpr=Math.max(1,Math.min(window.devicePixelRatio||1,1.65,Math.sqrt(pixelBudget/(w*h))));
  canvas.width=Math.max(1,Math.round(w*dpr));
  canvas.height=Math.max(1,Math.round(h*dpr));
  const gap=4;
  pitchX=slatW+gap;pitchY=slatH+gap;
  cols=Math.min(256,Math.ceil((w+gap)/pitchX)+1);
  rows=Math.min(256,Math.ceil((h+gap)/pitchY)+1);
  originX=(w-(cols*pitchX-gap))*0.5;
  originY=(h-(rows*pitchY-gap))*0.5;
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,cols,rows,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('MicroSlats framebuffer incompleto');
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  return true;
 };
 function dispose(){
  if(stopped)return;
  stopped=true;cancelAnimationFrame(frameId);
  if(observer)observer.disconnect();
  if(windowResize)window.removeEventListener('resize',windowResize);
  document.removeEventListener('visibilitychange',visibility);
  root.removeEventListener('pointerdown',onPointerDown);
  root.removeEventListener('pointermove',onPointerMove);
  root.removeEventListener('touchstart',onPointerDown);
  root.removeEventListener('touchmove',onPointerMove);
  canvas.removeEventListener('webglcontextlost',onContextLost);
  try{if(fb)gl.deleteFramebuffer(fb);if(texture)gl.deleteTexture(texture);if(fieldProgram)gl.deleteProgram(fieldProgram);if(slatProgram)gl.deleteProgram(slatProgram);if(vao)gl.deleteVertexArray(vao)}catch(_){}
  canvas.remove();
 }
 function onContextLost(event){event.preventDefault();dispose()}
 function visibility(){if(!document.hidden&&!stopped&&!root.hidden&&!frameId)frameId=requestAnimationFrame(frame)}
 function onPointerDown(event){
  const p=touchPoint(event);
  if(!p)return;
  touch.x=p.x/p.rect.width;
  touch.y=p.y/p.rect.height;
  touch.strength=1;lastTouch=performance.now();
 }
 function onPointerMove(event){
  if(event.type==='pointermove'&&event.buttons===0)return;
  onPointerDown(event);touch.strength=0.7;
 }
 const uniforms=setup();
 function frame(now){
  frameId=0;
  if(stopped||!root.isConnected||root.hidden){dispose();return}
  if(document.hidden)return;
  if(now-lastDraw<1000/30){frameId=requestAnimationFrame(frame);return}
  lastDraw=now;
  try{
   if(!resize()){frameId=requestAnimationFrame(frame);return}
   const elapsed=(now-startedAt)/1000;
   const intro=Math.max(0,Math.min(1,elapsed/1.4));
   const introEase=intro<0.5?4*intro*intro*intro:1-Math.pow(-2*intro+2,3)/2;
   const touchAge=Math.min(20,Math.max(0,(now-lastTouch)/1000));
   const strength=touchAge<2.2?touch.strength*(1-touchAge/2.2):0;
   gl.bindVertexArray(vao);
   gl.disable(gl.BLEND);
   gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
   gl.viewport(0,0,cols,rows);
   gl.useProgram(fieldProgram);
   const a=uniforms.fieldLoc;
   gl.uniform2f(a.uSize,viewW,viewH);
   gl.uniform4f(a.uGrid,cols,rows,pitchX,pitchY);
   gl.uniform2f(a.uOrigin,originX,originY);
   gl.uniform2f(a.uSlat,slatW,slatH);
   gl.uniform1f(a.uTime,elapsed*0.54);
   gl.uniform1f(a.uIntro,introEase);
   gl.uniform1f(a.uScale,1.3);gl.uniform1f(a.uDirection,262*Math.PI/180);
   gl.uniform1f(a.uChop,0.24);gl.uniform1f(a.uStretch,0.16);
   gl.uniform1f(a.uGlint,0.88);gl.uniform1f(a.uContrast,1.16);
   gl.uniform1f(a.uPerspective,0.5);gl.uniform1f(a.uFog,0.39);
   gl.uniform4f(a.uTouch,touch.x,touch.y,touchAge,strength);
   gl.drawArrays(gl.TRIANGLES,0,3);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   gl.viewport(0,0,canvas.width,canvas.height);
   gl.useProgram(slatProgram);
   const b=uniforms.slatLoc;
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.uniform1i(b.tField,0);
   gl.uniform2f(b.uSize,viewW,viewH);gl.uniform1f(b.uDpr,dpr);
   gl.uniform4f(b.uGrid,cols,rows,pitchX,pitchY);
   gl.uniform2f(b.uOrigin,originX,originY);gl.uniform2f(b.uSlat,slatW,slatH);
   gl.uniform1f(b.uRound,0.75);gl.uniform1f(b.uTilt,0.22);
   gl.uniform3f(b.uColor,0.13,0.84,0.99);
   gl.uniform3f(b.uGlintColor,0.73,0.34,1.0);
   gl.drawArrays(gl.TRIANGLES,0,3);
   if(canvas.style.opacity!=='1')canvas.style.opacity='1';
  }catch(e){console.warn('TaskFlow MicroSlats: se conserva imagen sin efecto',e&&e.message);dispose();return}
  frameId=requestAnimationFrame(frame);
 }
 function stop(){dispose()}
 active={stop};
 root.addEventListener('pointerdown',onPointerDown,{passive:true});
 root.addEventListener('pointermove',onPointerMove,{passive:true});
 root.addEventListener('touchstart',onPointerDown,{passive:true});
 root.addEventListener('touchmove',onPointerMove,{passive:true});
 document.addEventListener('visibilitychange',visibility,{passive:true});
 canvas.addEventListener('webglcontextlost',onContextLost,{passive:false});
 if(typeof ResizeObserver==='function'){observer=new ResizeObserver(()=>{viewW=0});observer.observe(host)}
 else{windowResize=()=>{viewW=0};window.addEventListener('resize',windowResize,{passive:true})}
 frameId=requestAnimationFrame(frame);
}catch(error){console.warn('TaskFlow MicroSlats: animación opcional no disponible',error&&error.message);if(active){active.stop();active=null}const c=host.querySelector('canvas');if(c)c.remove()}
})();