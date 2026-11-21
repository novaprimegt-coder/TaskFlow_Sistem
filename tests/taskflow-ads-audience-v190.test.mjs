import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";

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
 assert.match(index,/v=189-ads-vertical-fallback/);
 assert.match(index,/v=190-ads-audience-optin/);
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
test("Compatibilidad de región y WebCrypto limitado",()=>{
 assert.ok(audience.includes(".normalize('NFC')"));
 assert.ok(audience.includes("globalThis.crypto?.randomUUID?.()"));
});
