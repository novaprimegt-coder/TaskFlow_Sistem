import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script,runInNewContext} from "node:vm";
import {webcrypto} from "node:crypto";

const read=file=>readFileSync(new URL("../"+file,import.meta.url),"utf8");
const index=read("index.html");
const runtime=read("t57/runtime-19.txt");
const audience=read("taskflow-ads-audience-v178.js");
const policies=read("taskflow-policies-v161.js");
const css=read("taskflow-ads-audience-v178.css");

test("Sintaxis de controles y políticas",()=>{
 new Script(audience,{filename:"taskflow-ads-audience-v178.js"});
 new Script(policies,{filename:"taskflow-policies-v161.js"});
 assert.ok(css.includes("#tfAudienceV178"));
});
test("Preservar versión de pagos y actualizar solamente el recurso de audiencia",()=>{
 assert.match(index,/v=(?:189-ads-vertical-fallback|192-rutinas-reloj-cierre)/);
 assert.match(index,/v=(?:191-ads-audience-reliability|193-iconografia-unificada|194-iconografia-unificada)/);
 assert.match(index,/runtime-19\.txt/);
});
test("Cargar el consentimiento después del puente existente",()=>{
 const bridge=runtime.indexOf("taskflow-ads-bridge.js");
 const style=runtime.indexOf("taskflow-ads-audience-v178.css");
 const script=runtime.indexOf("taskflow-ads-audience-v178.js");
 assert.ok(bridge>=0&&style>bridge&&script>style);
});
test("Solicitudes privadas y sin secretos en frontend",()=>{
 assert.ok(audience.includes("window.TaskFlowFirebase.getIdToken(false)"));
 assert.ok(audience.includes("Authorization"));
 assert.ok(!/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEYS|TF_ADS_ACTIVITY_HASH_KEY/.test(audience));
});
test("Medición solo para adultos autorizados y app visible",()=>{
 for(const s of ["!loaded||!enabled||!eligible","document.visibilityState!=='visible'","window.TaskFlowNoAds?.isActive?.()===true","Date.now()-lastInput>120000"]){
  assert.ok(audience.includes(s),s);
 }
});
test("Consentimientos independientes y política explicativa",()=>{
 assert.ok(audience.includes("activityConsent"));
 assert.ok(audience.includes("areaConsent"));
 assert.ok(policies.includes("Analítica de actividad opcional."));
 assert.ok(policies.includes("90 días"));
});
test("Compatibilidad de región y recuperación sin randomUUID en WebViews",()=>{
 assert.ok(audience.includes(".normalize('NFC')"));
 assert.ok(audience.includes("function secureSessionId()"));
 assert.ok(audience.includes("getRandomValues(new Uint8Array(16))"));
 assert.ok(!audience.includes("Math.random"));
 assert.ok(audience.includes("lastHiddenAt>=15*60*1000"));
 assert.ok(audience.includes("result?.recorded===false)void load()"));
 assert.ok(audience.includes("user()?.uid!==nowUid"));
});
function syntheticSession({randomUUID,getRandomValues}={}){
 const window={};
 const exported=audience.replace(
  "window.TaskFlowAdsAudienceV178=Object.freeze({refresh:load});",
  "window.TaskFlowAdsAudienceV178=Object.freeze({refresh:load,secureSessionId});"
 );
 assert.notEqual(exported,audience,"Test hook not found");
 const crypto={};
 if(randomUUID)crypto.randomUUID=randomUUID;
 if(getRandomValues)crypto.getRandomValues=getRandomValues;
 runInNewContext(exported,{window,crypto,document:{readyState:"loading",addEventListener(){}}});
 return window.TaskFlowAdsAudienceV178.secureSessionId();
}
test("UUID criptográfico compatible con navegadores sin crypto.randomUUID",()=>{
 const c=webcrypto;
 const id=syntheticSession({getRandomValues:c.getRandomValues.bind(c)});
 assert.match(id,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
});
test("Nunca envía una sesión generada con aleatoriedad insegura",()=>{
 assert.equal(syntheticSession({}),"");
});
test("Prioriza UUID nativo en navegadores compatibles",()=>{
 const known="a5b682d1-16bc-4949-98ff-2bc3ad1bb171";
 assert.equal(syntheticSession({randomUUID:()=>known}),known);
});
