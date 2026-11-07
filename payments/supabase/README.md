# TaskFlow — servidor gratuito de suscripciones (Supabase)

## Estado verificado

- Proyecto Supabase existente **vgjpzvkfzahziwzwwkbx** recuperado y activo (organización Free).
- Función `taskflow-noads` desplegada como Edge Function con autorización propia.
- Base de datos aislada: cuatro tablas `public.taskflow_paypal_*`, RLS activado, sin permisos para `anon` ni `authenticated`.
- Cliente TaskFlow apunta a `https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-noads` mediante `payments/paypal/public-config.json`.
- **Los cobros reales siguen DESACTIVADOS** hasta configurar una aplicación PayPal Live del comercio, un plan de US$6/mes y el webhook. Ninguna función debe reconocer pagos simulados como reales.

## Rutas

- `GET /health`: disponibilidad de la función y bandera de pago (sin datos privados).
- `GET /config`: activa el checkout solo cuando existe configuración Live, webhook y plan confirmado directamente por PayPal.
- `GET /status`: verifica la suscripción del UID mediante Firebase ID Token validado por firma y proyecto.
- `POST /intent`: emite una intención única, temporal y vinculada al UID.
- `POST /confirm`: verifica propiedad, plan, estado y cobro usando la API PayPal.
- `POST /cancel`: cancela las renovaciones futuras sin borrar un período pagado legítimamente.
- `POST /paypal/webhook`: verifica la firma PayPal y procesa compras, reembolsos, cancelaciones y suspensiones.

## Configuración comercial pendiente, en el panel privado de Supabase

En **Project Settings → Edge Functions → Secrets**, configurar los nombres siguientes; nunca incluir sus valores en GitHub o ChatGPT:

```text
TF_PAYPAL_MODE=live
TF_PAYPAL_CLIENT_ID=<ID de la aplicación REST PayPal Live>
TF_PAYPAL_CLIENT_SECRET=<nuevo secreto REST Live, generado después de revocar secretos expuestos>
TF_PAYPAL_PLAN_ID=<P-... plan activo mensual de US$6, sin prueba gratuita ni cuota de alta>
TF_PAYPAL_WEBHOOK_ID=<ID de webhook PayPal Live verificado>
```

El webhook debe registrarse en el panel PayPal Developer Live con esta URL:

`https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-noads/paypal/webhook`

Eventos: `PAYMENT.SALE.COMPLETED`, `PAYMENT.SALE.REFUNDED`, `PAYMENT.SALE.REVERSED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `BILLING.SUBSCRIPTION.EXPIRED`.

### Controles imprescindibles antes de habilitar pagos

1. Confirmar la elegibilidad para **PayPal Subscriptions en Live** de la cuenta comercial y país.
2. Revocar cualquier Client Secret mostrado anteriormente en capturas; usar un secreto nuevo.
3. Verificar `/config` responde `enabled:true` con Live, precio 6.00 USD mensual.
4. Probar con cuentas independientes autorización, cobro real consentido, renovación, duplicados, cancelación, suspensión y reembolso; comprobar que `/status` nunca devuelve `active:true` sin pago real vigente.
5. Comprobar las reglas de Google Play Billing antes de integrar pagos externos en una distribución Android por Google Play.

No crear un enlace PayPal de **pago único** como reemplazo de esta suscripción recurrente. GitHub Pages y Firebase existentes permanecen intactos.

## Archivos

- `payments/supabase/index.ts`: backend Edge Function.
- `payments/supabase/migration.sql`: estructura de las tablas de pago y permisos.
- `payments/paypal/client.js`: checkout frontend existente y comprobación de derecho de usuario.
- `payments/paypal/public-config.json`: dirección pública del backend.

**Plan Supabase Free:** puede pausar el proyecto tras aproximadamente una semana sin suficiente actividad; debe comprobarse su disponibilidad antes de abrir los cobros reales. La infraestructura gratuita no garantiza disponibilidad permanente.
