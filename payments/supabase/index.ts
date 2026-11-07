// TaskFlow — suscripciones PayPal (Supabase Edge Function).
// El cobro real permanece deshabilitado hasta verificar credenciales Live,
// plan mensual de US$6 y webhooks. No autoriza beneficios desde el navegador.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.1.0";

const ORIGIN = "https://novaprimegt-coder.github.io";
const FIREBASE_PROJECT = "taskflow-b0ece";
const PRICE = "6.00";
const CURRENCY = "USD";
const BASE = Deno.env.get("TF_PAYPAL_MODE") === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const MODE = Deno.env.get("TF_PAYPAL_MODE") || "sandbox";
const CLIENT_ID = Deno.env.get("TF_PAYPAL_CLIENT_ID") || "";
const CLIENT_SECRET = Deno.env.get("TF_PAYPAL_CLIENT_SECRET") || "";
const PLAN_ID = Deno.env.get("TF_PAYPAL_PLAN_ID") || "";
const WEBHOOK_ID = Deno.env.get("TF_PAYPAL_WEBHOOK_ID") || "";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Vary": "Origin" };
let planValidCache = { until: 0, ok: false, trialDays: 0 };

function respond(req, status, data) {
  const origin = req.headers.get("Origin") || "";
  const headers = new Headers(JSON_HEADERS);
  if (origin === ORIGIN) headers.set("Access-Control-Allow-Origin", ORIGIN);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization,Content-Type");
  return new Response(JSON.stringify(data), { status, headers });
}
function fail(message, status = 503) {
  const e = new Error(message);
  e.status = status;
  return e;
}
function db() {
  let key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    key = keys.default || key;
  } catch (_) { /* legacy key fallback */ }
  const url = Deno.env.get("SUPABASE_URL") || "";
  if (!key || !url) throw fail("DATABASE_NOT_READY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function requireFirebaseUser(req) {
  const match = (req.headers.get("Authorization") || "").match(/^Bearer ([^\s]+)$/i);
  if (!match) throw fail("AUTH_REQUIRED", 401);
  let payload;
  try {
    ({ payload } = await jwtVerify(match[1], JWKS, {
      issuer: "https://securetoken.google.com/" + FIREBASE_PROJECT,
      audience: FIREBASE_PROJECT,
      algorithms: ["RS256"],
      clockTolerance: 30
    }));
  } catch (_) { throw fail("AUTH_REQUIRED", 401); }
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length > 128 ||
      typeof payload.auth_time !== "number" || payload.auth_time > Math.floor(Date.now() / 1000) ||
      payload.sub === "anonymous") throw fail("AUTH_REQUIRED", 401);
  return payload.sub;
}
function credentialsSet() {
  return MODE === "live" && /^P-[A-Za-z0-9-]{8,64}$/.test(PLAN_ID) &&
    CLIENT_ID.length > 8 && CLIENT_SECRET.length > 8 && WEBHOOK_ID.length > 8;
}
async function paypal(path, method = "GET", body) {
  if (!CLIENT_ID || !CLIENT_SECRET) throw fail("PAYPAL_NOT_CONFIGURED");
  const basic = btoa(CLIENT_ID + ":" + CLIENT_SECRET);
  const tokenResponse = await fetch(BASE + "/v1/oauth2/token", {
    method: "POST", headers: {
      Authorization: "Basic " + basic,
      "Content-Type": "application/x-www-form-urlencoded"
    }, body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(12000)
  });
  if (!tokenResponse.ok) throw fail("PAYPAL_AUTH_FAILED");
  const token = (await tokenResponse.json()).access_token;
  if (!token) throw fail("PAYPAL_AUTH_FAILED");
  const res = await fetch(BASE + path, {
    method, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(16000)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw fail("PAYPAL_API_ERROR");
  return data;
}
function validatedPlan(p) {
  if (p.id !== PLAN_ID || p.status !== "ACTIVE") return { ok: false, trialDays: 0 };
  const cycles = Array.isArray(p.billing_cycles) ? p.billing_cycles : [];
  const regular = cycles.filter(v => v.tenure_type === "REGULAR");
  if (regular.length !== 1) return { ok: false, trialDays: 0 };
  const monthly = regular[0];
  const regularValid = monthly.frequency?.interval_unit === "MONTH" &&
    Number(monthly.frequency?.interval_count) === 1 &&
    Number(monthly.total_cycles) === 0 &&
    monthly.pricing_scheme?.fixed_price?.currency_code === CURRENCY &&
    Number(monthly.pricing_scheme?.fixed_price?.value) === 6 &&
    Number(p.payment_preferences?.setup_fee?.value || 0) === 0;
  if (!regularValid) return { ok: false, trialDays: 0 };
  if (cycles.length === 1 && Number(monthly.sequence) === 1)
    return { ok: true, trialDays: 0 }; // Keep the existing monthly plan operational.
  if (cycles.length !== 2 || Number(monthly.sequence) !== 2)
    return { ok: false, trialDays: 0 };
  const trial = cycles.find(v => v.tenure_type === "TRIAL");
  const charge = trial?.pricing_scheme?.fixed_price;
  const free = !charge || (Number(charge.value) === 0 &&
    (!charge.currency_code || charge.currency_code === CURRENCY));
  const sevenDays = (trial.frequency?.interval_unit === "DAY" &&
    Number(trial.frequency?.interval_count) === 7) ||
    (trial.frequency?.interval_unit === "WEEK" &&
    Number(trial.frequency?.interval_count) === 1);
  const validTrial = trial && Number(trial.sequence) === 1 &&
    sevenDays && Number(trial.total_cycles) === 1 && free;
  return validTrial ? { ok: true, trialDays: 7 } : { ok: false, trialDays: 0 };
}
async function planReady() {
  if (!credentialsSet()) return false;
  if (planValidCache.until > Date.now()) return planValidCache.ok;
  try {
    const p = await paypal("/v1/billing/plans/" + encodeURIComponent(PLAN_ID));
    const checked = validatedPlan(p);
    planValidCache = { until: Date.now() + (checked.ok ? 60000 : 10000),
      ok: checked.ok, trialDays: checked.trialDays };
    return checked.ok;
  } catch (_) {
    planValidCache = { until: Date.now() + 10000, ok: false, trialDays: 0 };
    return false;
  }
}
async function ready() {
  if (!await planReady()) throw fail("PLAN_NOT_READY");
  db(); // Comprobar acceso seguro a la base de datos.
}
async function one(table, field, value) {
  const { data, error } = await db().from(table).select("*").eq(field, value).maybeSingle();
  if (error) throw fail("DATABASE_UNAVAILABLE");
  return data;
}
async function write(table, data, field) {
  const query = db().from(table).upsert(data, { onConflict: field });
  const { error } = await query;
  if (error) throw fail("DATABASE_UNAVAILABLE");
}
function paid(row) {
  return !!row && row.state === "active" && Date.parse(row.paid_until || "") > Date.now() &&
    !!row.subscription_id;
}
function showStatus(row) {
  return {
    active: paid(row), price: PRICE, currency: CURRENCY, frequency: "MONTH",
    subscriptionId: row?.subscription_id || null,
    paidUntil: row?.paid_until ? Date.parse(row.paid_until) : null,
    renewalStatus: row?.renewal_status || null,
    trialActive: paid(row) && row?.access_kind === "trial",
    trialEndsAt: row?.access_kind === "trial" ? Date.parse(row.paid_until) : null
  };
}
async function pastSubscription(uid, exceptId = "") {
  let query = db().from("taskflow_paypal_subscriptions")
    .select("paypal_id").eq("uid", uid);
  if (exceptId) query = query.neq("paypal_id", exceptId);
  const { data, error } = await query.limit(1);
  if (error) throw fail("DATABASE_UNAVAILABLE");
  return !!data?.length;
}
async function trialUsed(uid) {
  const claim = await one("taskflow_paypal_trial_claims", "uid", uid);
  return !!claim || await pastSubscription(uid);
}
async function trialEligible(uid, subscriptionId = "") {
  const claim = await one("taskflow_paypal_trial_claims", "uid", uid);
  return (!claim || claim.subscription_id === subscriptionId) &&
    !await pastSubscription(uid, subscriptionId);
}
async function getStatus(uid) {
  const status = showStatus(await one("taskflow_paypal_entitlements", "uid", uid));
  return planValidCache.trialDays === 7 ?
    { ...status, trialUsed: await trialUsed(uid) } : status;
}
async function getSubscription(id, currentPlanOnly = false) {
  if (!/^I-[A-Za-z0-9-]{8,64}$/.test(id)) throw fail("INVALID_SUBSCRIPTION", 400);
  const s = await paypal("/v1/billing/subscriptions/" + encodeURIComponent(id));
  // Existing subscriptions keep their original plan when a new trial plan is published.
  const linked = currentPlanOnly ? null :
    await one("taskflow_paypal_subscriptions", "paypal_id", id);
  const trustedPlan = currentPlanOnly ? PLAN_ID : linked?.plan_id;
  if (s.id !== id || s.plan_id !== trustedPlan) throw fail("PLAN_MISMATCH", 409);
  return s;
}
async function linkSubscription(uid, sub) {
  const existing = await one("taskflow_paypal_subscriptions", "paypal_id", sub.id);
  if (existing && existing.uid !== uid) throw fail("SUBSCRIPTION_ALREADY_LINKED", 409);
  if (!existing) {
    const { error } = await db().from("taskflow_paypal_subscriptions").insert({
      paypal_id: sub.id, uid, plan_id: PLAN_ID
    });
    if (error) {
      const after = await one("taskflow_paypal_subscriptions", "paypal_id", sub.id);
      if (!after || after.uid !== uid) throw fail("SUBSCRIPTION_ALREADY_LINKED", 409);
    }
  }
}
function paymentDate(sub) {
  const lp = sub.billing_info?.last_payment;
  if (!lp || lp.amount?.currency_code !== CURRENCY ||
      Number(lp.amount?.value) !== 6) return 0;
  const at = Date.parse(lp.time || "");
  if (!Number.isFinite(at) || at > Date.now() + 300000 ||
      at < Date.now() - 45 * 86400000) return 0;
  return at;
}
function nextMonth(at) {
  const d = new Date(at);
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  const e = new Date(Date.UTC(y, m + 1, 1, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
  const max = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth() + 1, 0)).getUTCDate();
  e.setUTCDate(Math.min(day, max));
  return e.getTime();
}
function paidUntil(sub, at) {
  const next = Date.parse(sub.billing_info?.next_billing_time || "");
  return sub.status === "ACTIVE" && Number.isFinite(next) &&
    next > at && next < at + 40 * 86400000 ? next : nextMonth(at);
}
async function recordPaid(uid, sub, saleId = "") {
  const at = paymentDate(sub);
  if (!at || !["ACTIVE", "CANCELLED"].includes(sub.status)) return false;
  const linked = await one("taskflow_paypal_subscriptions", "paypal_id", sub.id);
  if (!linked || linked.uid !== uid) throw fail("SUBSCRIPTION_NOT_OWNED", 403);
  const prior = await one("taskflow_paypal_entitlements", "uid", uid);
  if (prior && paid(prior) && prior.subscription_id !== sub.id)
    throw fail("ALREADY_SUBSCRIBED", 409);
  if (prior?.state === "revoked" && Date.parse(prior.last_paid_at || "") >= at)
    return false;
  if (saleId) {
    const prevSale = await one("taskflow_paypal_sales", "paypal_sale_id", saleId);
    if (prevSale && (prevSale.uid !== uid || prevSale.paypal_id !== sub.id))
      throw fail("SALE_ALREADY_LINKED", 409);
  }
  const until = Math.max(paidUntil(sub, at), prior?.subscription_id === sub.id ?
    Date.parse(prior.paid_until || "") || 0 : 0);
  if (until <= Date.now()) return false;
  await write("taskflow_paypal_entitlements", {
    uid, subscription_id: sub.id, state: "active", access_kind: "paid",
    renewal_status: sub.status, paid_until: new Date(until).toISOString(),
    last_paid_at: new Date(at).toISOString(),
    trial_started_at: prior?.trial_started_at || null,
    last_sale_id: saleId || prior?.last_sale_id || null,
    updated_at: new Date().toISOString()
  }, "uid");
  if (saleId) await write("taskflow_paypal_sales", {
    paypal_sale_id: saleId, paypal_id: sub.id, uid, amount: 6,
    state: "completed", paid_at: new Date(at).toISOString()
  }, "paypal_sale_id");
  return true;
}
// Free access is granted only to a PayPal ACTIVE subscription under a
// verified 7-day-zero-price plan. An unapproved intent never grants access.
function paypalTrialWindow(sub) {
  if (planValidCache.trialDays !== 7 || sub.status !== "ACTIVE" ||
      sub.plan_id !== PLAN_ID) return null;
  const start = Date.parse(sub.start_time || "");
  const next = Date.parse(sub.billing_info?.next_billing_time || "");
  const now = Date.now();
  const day = 86400000;
  if (!Number.isFinite(start) || !Number.isFinite(next) ||
      start > now + 5 * 60000 || now < start ||
      start < now - 7 * day || next <= now ||
      next < start + 6 * day || next > start + 8 * day)
    return null;
  const executions = sub.billing_info?.cycle_executions;
  if (Array.isArray(executions) && executions.length &&
      !executions.some(e => e.tenure_type === "TRIAL")) return null;
  const until = Math.min(start + 7 * day, next);
  return until > now ? { start, until } : null;
}
async function recordTrial(uid, sub) {
  const window = paypalTrialWindow(sub);
  if (!window) return false;
  const linked = await one("taskflow_paypal_subscriptions", "paypal_id", sub.id);
  if (!linked || linked.uid !== uid || linked.plan_id !== PLAN_ID)
    throw fail("SUBSCRIPTION_NOT_OWNED", 403);
  if (!await trialEligible(uid, sub.id)) throw fail("TRIAL_ALREADY_USED", 409);
  const previous = await one("taskflow_paypal_entitlements", "uid", uid);
  if (previous && paid(previous) && previous.subscription_id !== sub.id)
    throw fail("ALREADY_SUBSCRIBED", 409);
  if (previous?.access_kind === "paid" && previous.subscription_id === sub.id)
    return false; // Never downgrade a verified paid entitlement to a free trial.
  const claim = await one("taskflow_paypal_trial_claims", "uid", uid);
  if (!claim) {
    const { error } = await db().from("taskflow_paypal_trial_claims").insert({
      uid, subscription_id: sub.id, claimed_at: new Date(window.start).toISOString()
    });
    if (error) {
      const existing = await one("taskflow_paypal_trial_claims", "uid", uid);
      if (!existing || existing.subscription_id !== sub.id)
        throw fail("TRIAL_ALREADY_USED", 409);
    }
  }
  await write("taskflow_paypal_entitlements", {
    uid, subscription_id: sub.id, state: "active", access_kind: "trial",
    renewal_status: sub.status, paid_until: new Date(window.until).toISOString(),
    last_paid_at: null, last_sale_id: null,
    trial_started_at: new Date(window.start).toISOString(),
    updated_at: new Date().toISOString()
  }, "uid");
  return true;
}
async function intent(uid) {
  const existing = await getStatus(uid);
  if (existing.active) throw fail("ALREADY_SUBSCRIBED", 409);
  if (planValidCache.trialDays === 7 && !await trialEligible(uid))
    throw fail("TRIAL_ALREADY_USED", 409);
  const id = crypto.randomUUID();
  const { error } = await db().from("taskflow_paypal_intents").insert({
    intent_id: id, uid, plan_id: PLAN_ID,
    expires_at: new Date(Date.now() + 30 * 60000).toISOString()
  });
  if (error) throw fail("DATABASE_UNAVAILABLE");
  return { intent: id };
}
async function parse(req) {
  if (Number(req.headers.get("content-length") || 0) > 64000)
    throw fail("REQUEST_TOO_LARGE", 413);
  const raw = await req.text();
  if (raw.length > 64000) throw fail("REQUEST_TOO_LARGE", 413);
  try { return JSON.parse(raw); } catch (_) { throw fail("INVALID_JSON", 400); }
}
async function confirm(uid, req) {
  const payload = await parse(req);
  const id = String(payload.subscriptionId || "");
  const nonce = String(payload.intent || "");
  if (!/^I-[A-Za-z0-9-]{8,64}$/.test(id) ||
      !/^[a-f0-9-]{36}$/.test(nonce)) throw fail("INVALID_CONFIRMATION", 400);
  const pending = await one("taskflow_paypal_intents", "intent_id", nonce);
  if (!pending || pending.uid !== uid || pending.plan_id !== PLAN_ID ||
      Date.parse(pending.expires_at) < Date.now()) throw fail("INTENT_INVALID", 403);
  const sub = await getSubscription(id, true);
  if (sub.custom_id !== nonce) throw fail("SUBSCRIPTION_NOT_OWNED", 403);
  if (planValidCache.trialDays === 7 && !await trialEligible(uid, sub.id))
    throw fail("TRIAL_ALREADY_USED", 409);
  await linkSubscription(uid, sub);
  if (["APPROVAL_PENDING", "APPROVED"].includes(sub.status))
    return { paid: false, trialActive: false, pending: true };
  if (sub.status !== "ACTIVE") throw fail("SUBSCRIPTION_NOT_ACTIVE", 409);
  const trialActivated = planValidCache.trialDays === 7 && await recordTrial(uid, sub);
  const credited = trialActivated ? false : await recordPaid(uid, sub);
  const status = await getStatus(uid);
  return { paid: credited, ...status,
    pending: !credited && !status.trialActive };
}
async function cancel(uid) {
  const ent = await one("taskflow_paypal_entitlements", "uid", uid);
  if (!ent?.subscription_id) throw fail("SUBSCRIPTION_NOT_FOUND", 404);
  const sub = await getSubscription(ent.subscription_id);
  if (sub.status === "ACTIVE") await paypal(
    "/v1/billing/subscriptions/" + encodeURIComponent(sub.id) + "/cancel",
    "POST", { reason: "Customer requested cancellation in TaskFlow" }
  );
  await write("taskflow_paypal_entitlements", {
    ...ent, renewal_status: "CANCELLED", updated_at: new Date().toISOString()
  }, "uid");
  return { cancelled: true, ...(await getStatus(uid)) };
}
async function webhook(req) {
  if (!credentialsSet()) throw fail("PAYPAL_WEBHOOK_NOT_READY");
  const event = await parse(req);
  if (!event || typeof event !== "object") throw fail("INVALID_EVENT", 400);
  const verify = await paypal("/v1/notifications/verify-webhook-signature", "POST", {
    auth_algo: req.headers.get("paypal-auth-algo"),
    cert_url: req.headers.get("paypal-cert-url"),
    transmission_id: req.headers.get("paypal-transmission-id"),
    transmission_sig: req.headers.get("paypal-transmission-sig"),
    transmission_time: req.headers.get("paypal-transmission-time"),
    webhook_id: WEBHOOK_ID,
    webhook_event: event
  });
  if (verify.verification_status !== "SUCCESS") throw fail("INVALID_SIGNATURE", 401);
  const type = String(event.event_type || "");
  const resource = event.resource || {};
  if (type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const id = String(resource.id || "");
    if (!/^I-[A-Za-z0-9-]{8,64}$/.test(id)) return { ignored: true };
    const row = await one("taskflow_paypal_subscriptions", "paypal_id", id);
    // PayPal can deliver the webhook before the browser confirms ownership;
    // retry later rather than granting entitlement to an unlinked subscription.
    if (!row) throw fail("SUBSCRIPTION_PENDING");
    const sub = await getSubscription(id);
    if (sub.status !== "ACTIVE") return { pending: true };
    await planReady();
    if (planValidCache.trialDays === 7 && row.plan_id === PLAN_ID) {
      const trial = await recordTrial(row.uid, sub);
      return { ok: true, trial };
    }
    const credited = await recordPaid(row.uid, sub);
    return { ok: true, credited };
  }
  if (type === "PAYMENT.SALE.COMPLETED") {
    const sale = String(resource.id || "");
    const subId = String(resource.billing_agreement_id || "");
    if (!/^[A-Za-z0-9-]{5,100}$/.test(sale) ||
        !/^I-[A-Za-z0-9-]{8,64}$/.test(subId) ||
        resource.amount?.currency !== CURRENCY ||
        Number(resource.amount?.total) !== 6 ||
        String(resource.state || "").toLowerCase() !== "completed")
      return { ignored: true };
    const row = await one("taskflow_paypal_subscriptions", "paypal_id", subId);
    if (!row) throw fail("SUBSCRIPTION_PENDING");
    const sub = await getSubscription(subId);
    const credited = await recordPaid(row.uid, sub, sale);
    return { ok: true, credited };
  }
  if (type === "PAYMENT.SALE.REFUNDED" || type === "PAYMENT.SALE.REVERSED") {
    const sale = String(resource.sale_id || resource.id || "");
    if (!/^[A-Za-z0-9-]{5,100}$/.test(sale)) return { ignored: true };
    const row = await one("taskflow_paypal_sales", "paypal_sale_id", sale);
    if (!row) return { ignored: true };
    await write("taskflow_paypal_sales", { ...row, state: "reversed" }, "paypal_sale_id");
    const ent = await one("taskflow_paypal_entitlements", "uid", row.uid);
    if (ent && ent.subscription_id === row.paypal_id && ent.last_sale_id === sale)
      await write("taskflow_paypal_entitlements", { ...ent, state: "revoked" }, "uid");
    return { ok: true };
  }
  if (["BILLING.SUBSCRIPTION.CANCELLED",
       "BILLING.SUBSCRIPTION.SUSPENDED",
       "BILLING.SUBSCRIPTION.EXPIRED"].includes(type)) {
    const id = String(resource.id || "");
    if (!/^I-[A-Za-z0-9-]{8,64}$/.test(id)) return { ignored: true };
    const row = await one("taskflow_paypal_subscriptions", "paypal_id", id);
    if (!row) return { ignored: true };
    const ent = await one("taskflow_paypal_entitlements", "uid", row.uid);
    if (ent && ent.subscription_id === id) {
      await write("taskflow_paypal_entitlements", {
        ...ent, renewal_status: type.split(".").pop(),
        state: type === "BILLING.SUBSCRIPTION.CANCELLED" ? ent.state : "revoked"
      }, "uid");
    }
    return { ok: true };
  }
  return { ignored: true };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (origin && origin !== ORIGIN) return respond(req, 403, { error: "ORIGIN_NOT_ALLOWED" });
  if (req.method === "OPTIONS") {
    const headers = new Headers(JSON_HEADERS);
    if (origin === ORIGIN) headers.set("Access-Control-Allow-Origin", ORIGIN);
    headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Authorization,Content-Type");
    return new Response(null, { status: 204, headers });
  }
  const pathname = new URL(req.url).pathname;
  const path = pathname.match(/\/taskflow-noads(\/.*)?$/)?.[1] || "/";
  try {
    if (req.method === "GET" && path === "/health")
      return respond(req, 200, { ok: true, backend: "supabase", paymentsEnabled: await planReady() });
    if (req.method === "GET" && path === "/config") {
      const enabled = await planReady();
      if (!enabled) return respond(req, 200, { enabled: false, environment: MODE });
      return respond(req, 200, {
        enabled: true, environment: "live", clientId: CLIENT_ID,
        planId: PLAN_ID, price: PRICE, currency: CURRENCY,
        frequency: "MONTH", recurring: true, trialDays: planValidCache.trialDays
      });
    }
    if (req.method === "POST" && path === "/paypal/webhook")
      return respond(req, 200, await webhook(req));
    await ready();
    const uid = await requireFirebaseUser(req);
    if (req.method === "GET" && path === "/status")
      return respond(req, 200, await getStatus(uid));
    if (req.method === "POST" && path === "/intent")
      return respond(req, 200, await intent(uid));
    if (req.method === "POST" && path === "/confirm") {
      const data = await confirm(uid, req);
      return respond(req, data.active ? 200 : 202, data);
    }
    if (req.method === "POST" && path === "/cancel")
      return respond(req, 200, await cancel(uid));
    return respond(req, 404, { error: "NOT_FOUND" });
  } catch (e) {
    console.error("TaskFlow subscription server:", e?.message || "UNEXPECTED");
    return respond(req, e?.status || 503, {
      error: e?.status === 401 ? "AUTH_REQUIRED" :
        e?.message === "TRIAL_ALREADY_USED" ? "TRIAL_ALREADY_USED" :
        e?.message?.startsWith("INVALID") ? e.message : "PAYMENT_UNAVAILABLE"
    });
  }
});