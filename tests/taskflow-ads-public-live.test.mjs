import test from "node:test";
import assert from "node:assert/strict";

const base="https://novaprimegt-coder.github.io/TaskFlow_Sistem/";
async function read(path){
 let last;
 for(let i=0;i<3;i++){
  try{
   const url=base+path;
   const resp=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(18000)});
   if(!resp.ok)throw Error(url+" HTTP "+resp.status);
   return resp.text();
  }catch(e){
   last=e;
   if(i<2)await new Promise(r=>setTimeout(r,1300*(i+1)));
  }
 }
 throw last;
}

test("La versión pública de TaskFlow sirve index y el runtime V190",async()=>{
 const html=await read("index.html");
 assert.match(html,/v=190-ads-audience-optin/);
 assert.match(html,/v=189-ads-vertical-fallback/);
});
test("La carga real del runtime conserva anuncios y añade consentimiento",async()=>{
 const txt=await read("t57/runtime-19.txt?v=190-ads-audience-optin");
 assert.ok(txt.includes("taskflow-ads-bridge.js"));
 assert.ok(txt.includes("3.10-vertical-fallback-priority"));
 assert.ok(txt.includes("taskflow-ads-audience-v178.css"));
 assert.ok(txt.includes("taskflow-ads-audience-v178.js"));
 assert.ok(txt.indexOf("taskflow-ads-bridge.js")<txt.indexOf("taskflow-ads-audience-v178.js"));
});
test("El JS de analítica está publicado y protege sesión y menores",async()=>{
 const js=await read("taskflow-ads-audience-v178.js");
 for(const value of ["TaskFlowFirebase.getIdToken(false)","activityConsent","areaConsent","!loaded||!enabled||!eligible","TaskFlowNoAds?.isActive?.()"]){
  assert.ok(js.includes(value),"Falta "+value);
 }
 assert.ok(!/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEYS|TF_ADS_ACTIVITY_HASH_KEY/.test(js),"Nunca enviar secretos al cliente");
});
test("Estilos y políticas de consentimiento están publicados",async()=>{
 const [css,privacy]=await Promise.all([read("taskflow-ads-audience-v178.css"),read("taskflow-policies-v161.js")]);
 assert.ok(css.includes("#tfAudienceV178"));
 assert.ok(privacy.includes("Analítica de actividad opcional"));
 assert.ok(privacy.includes("90 días"));
});
