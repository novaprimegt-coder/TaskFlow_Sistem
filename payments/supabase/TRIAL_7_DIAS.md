# TaskFlow — prueba de 7 días con PayPal Live

## Estado

La base de datos de prueba y el servidor Supabase Edge Function `taskflow-noads` ya admiten una prueba inicial de **7 días sin cobro** (frecuencia PayPal `7 DAY` o `1 WEEK`), seguida de un pago recurrente de **US$6.00 cada MONTH**. **No se ofrece ni se anuncia el período de prueba hasta que PayPal Live reconozca un plan nuevo con esas condiciones**. El plan actual de US$6 mensuales sigue vigente y no se modifica automáticamente.

## Única operación comercial pendiente

En PayPal Business Live, crear **un nuevo plan** (conservar el producto existente `TaskFlow sin anuncios`):

1. Plan de **precio fijo**, `TaskFlow sin anuncios — 7 días gratis, luego US$6/mes`.
2. Divisa USD, **sin cuota de apertura**.
3. Activar **período de prueba**: precio `0.00`, **cada 7 días** (o 1 semana), **1 ciclo**. No agregar otro período de prueba.
4. Período de suscripción normal: **US$6.00 cada 1 mes, ciclos ilimitados**. Aplicar el tratamiento fiscal correcto para el comercio.
5. Revisar y activar. Copiar el **Plan ID nuevo que comienza con P-** (no el Product ID).
6. En Supabase, proyecto `vgjpzvkfzahziwzwwkbx`, **Edge Functions → Secrets**, reemplazar **únicamente** `TF_PAYPAL_PLAN_ID` por ese Plan ID nuevo. Conservar sin cambios `TF_PAYPAL_MODE=live`, Client ID, Client Secret y Webhook ID del negocio.
7. Verificar que `https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-noads/config` responda `enabled:true`, `environment:"live"`, `trialDays:7`, `price:"6.00"`, `currency:"USD"` y `frequency:"MONTH"`.

## Comportamiento del servidor

- Solo permite el plan PayPal realmente activo con dos ciclos exactamente: uno `TRIAL` gratuito de 7 días (1 ciclo), seguido de uno `REGULAR` de US$6 mensuales (ilimitado), sin cuota de alta.
- Solo concede acceso cuando la suscripción está `ACTIVE` en PayPal, la propiedad de la solicitud está verificada y las fechas de prueba son coherentes; una simple aprobación no basta.
- Al concluir la prueba, el primer pago de US$6 debe confirmarse para continuar sin anuncios; sin pago, el acceso gratuito caduca automáticamente.
- Bloquea repetir la prueba desde la misma cuenta Firebase (tabla `taskflow_paypal_trial_claims` con clave única por usuario), incluso si se solicita otra suscripción.
- La cancelación de la renovación puede realizarse durante los 7 días; evita futuros cargos, manteniendo el acceso gratuito hasta la fecha de vencimiento registrada.
- Las suscripciones pagadas anteriores conservan la referencia a su plan original cuando el plan nuevo se convierte en el plan de venta.
- Recibe `BILLING.SUBSCRIPTION.ACTIVATED` en el webhook firmado de PayPal, además de renovaciones y cancelaciones; el frontend también vuelve a comprobar la misma suscripción aprobada.
- Las claves permanecen cifradas en Supabase Secrets, nunca en GitHub ni en el navegador.

## Pruebas finales

Antes de anunciar la oferta, comprobar en cuentas separadas la aprobación gratuita sin cargo, activación de los 7 días, cancelación antes del primer cobro, vencimiento sin pago, primer cargo al finalizar, renovación, reembolso y rechazo de una segunda prueba. Es necesario comprobar la elegibilidad del cobro real en PayPal y, si se distribuye TaskFlow por Google Play, las normas de facturación correspondientes.

**No cambiar la promoción por texto sin activar realmente el nuevo plan PayPal.**
