# TaskFlow — Eliminar anuncios por PayPal

## Estado

**Frontend y backend preparados en `main`, pero el servicio de cobro NO está desplegado ni habilitado para producción.** No se ha verificado ningún cargo real. `public-config.json` permanece desactivado y no debe activarse hasta completar la conexión comercial, despliegue y pruebas.

**Precio autorizado: US$6.00 al mes**, renovación automática. No es un enlace de pago único, no es un período fijo de 30 días, no incluye prueba gratuita ni cuota de instalación. El cargo es mensual hasta que el titular cancele. PayPal puede ofrecer tarjeta de crédito/débito sin cuenta PayPal, sujeto a elegibilidad de la región y cuenta comercial.

## Componentes

- `functions/index.js`: Firebase Functions v2 protegida por Firebase Auth y secretos PayPal. Verifica que el plan de PayPal sea ACTIVO, USD 6, frecuencia MONTH e intervalo 1, sin ciclos promocionales ni cuota de alta; rechaza cualquier plan diferente.
- `client.js`: PayPal JavaScript SDK con `vault=true&intent=subscription`. Presenta el importe y la renovación. Permite cancelar futuras renovaciones. No procesa datos de tarjetas.
- `public-config.json`: inicia deliberadamente en `{"enabled":false,"apiBase":""}`.
- `create-monthly-plan.cjs`: utilidad para aprovisionar un producto y un plan mensual PayPal usando credenciales del entorno; por defecto opera en Sandbox. No almacena ni imprime claves.
- `t57/runtime-24.txt` y `taskflow-ads-bridge.js`: integración preparada para impedir banners, anuncio al abrir y anuncios de interacción **solo** cuando el servidor confirme que la cuenta tiene un período pagado vigente.
- `taskflowPayPalEntitlements/{uid}`: colección privada en Firestore, gestionada exclusivamente por Firebase Admin. El navegador consulta `/status`, no puede concederse el beneficio a sí mismo.

## Requisitos antes de activar

1. Cuenta comercial PayPal con suscripciones habilitadas y capacidades de cobro aplicables. El plugin PayPal de ChatGPT disponible actualmente solo ofrece enlaces de pago **único**, no crea planes recurrentes.
2. Aplicación REST PayPal Live: Client ID y Client Secret, configurados directamente como secretos de Firebase; **no los compartas por chat ni en GitHub**.
3. Plan de PayPal **ACTIVE**, `6.00 USD` cada `MONTH`, de duración indefinida (total_cycles 0), sin prueba gratuita ni comisión de activación.
4. ID del webhook de PayPal, entregado al registrar la dirección HTTPS de Firebase para los eventos indicados a continuación.
5. Proyecto Firebase `taskflow-b0ece`, acceso administrativo autorizado, plan con Cloud Functions disponible, facturación habilitada si aplica y política de Firestore revisada.
6. Verificar dónde se distribuye la app Android. Si está en Google Play, la compra dentro de la app para desactivar anuncios puede estar sujeta a Google Play Billing, salvo excepción o programa alternativo aplicable. No habilitar pagos externos dentro de la versión Play sin comprobar las reglas vigentes.

## Configuración (operador autorizado)

Ejecutar en un entorno privado y protegido — nunca en un navegador, repositorio público o chat.

Crear primero el plan en Sandbox usando `payments/paypal/create-monthly-plan.cjs` (o el panel empresarial PayPal Subscriptions). Tras aprobar pruebas, crear el plan correspondiente en Live. En ambos casos comprobar precio y periodicidad.

Configurar los siguientes **secretos** de Firebase Functions:

- `TASKFLOW_PAYPAL_CLIENT_ID`
- `TASKFLOW_PAYPAL_CLIENT_SECRET`
- `TASKFLOW_PAYPAL_WEBHOOK_ID`

Configurar las siguientes **variables de servidor** (no son secretos comerciales):

```env
TASKFLOW_PAYPAL_MONTHLY_PLAN_ID=P-ID_VERIFICADO_DEL_PLAN_USD6_MONTH
PAYPAL_ENV=sandbox
```

Para producción, usar `PAYPAL_ENV=live` y credenciales e ID de plan **Live**, luego desplegar desde la carpeta `payments/paypal` el codebase `taskflow-noads`, función `taskflowNoAds` en `us-central1`.

Registrar en PayPal el webhook HTTPS de la función, con ruta `/paypal/webhook` y eventos:

- `PAYMENT.SALE.COMPLETED`
- `PAYMENT.SALE.REFUNDED`
- `PAYMENT.SALE.REVERSED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.SUSPENDED`
- `BILLING.SUBSCRIPTION.EXPIRED`

Confirmar que las reglas de Firestore **deniegan por completo todas las escrituras desde clientes** a `taskflowPayPalEntitlements`, `taskflowPayPalSubscriptions`, `taskflowPayPalSales` y `taskflowPayPalIntents`. El Admin SDK puede escribir independientemente de reglas. Revisar reglas existentes antes de publicar otras para evitar alterar TaskFlow.

**No activar `public-config.json`** hasta que el backend esté desplegado, el webhook firme y procese eventos válidos, y el equipo haya probado suscripción aprobada, primer pago, renovación, cancelación, reembolso, sesión de usuario, recarga, cambio de cuenta y estados pendientes. Cuando esté listo, fijar `apiBase` a la URL HTTPS real de la función y `enabled:true`, y fusionar los archivos de la rama de forma revisada.

## Contrato de pagos y seguridad

1. El usuario inicia sesión en TaskFlow y abre el botón existente «Eliminar anuncios».
2. El backend entrega un `intent` temporal vinculado a su UID. El SDK PayPal crea la suscripción asociada a ese `intent` y al plan de USD 6 mensuales.
3. PayPal verifica la autorización del cliente. El backend consulta los detalles de la suscripción directamente a PayPal: ID, plan, `custom_id`, estado ACTIVE y último pago de USD 6.
4. **Nunca** se activan beneficios solo por `onApprove`, redirección, texto en pantalla, almacenamiento local o envío del ID desde el cliente.
5. PayPal informa renovaciones y reembolsos con webhooks verificados. Firebase establece y caduca `paidUntil`; tras cancelación, el beneficio puede mantenerse durante lo pagado, pero no se renueva.
6. Si el backend no puede verificar el derecho, no se debe ocultar la publicidad; tampoco debe cobrarse mediante un enlace de pago único haciéndolo pasar por suscripción.

## Estado actual verificable

- Precio y periodicidad en código: **6.00 USD / MONTH**.
- Frontend: **integrado en `main`**, pero checkout desactivado mediante configuración pública.
- Backend: **código de integración preparado, no desplegado ni probado con PayPal Live**.
- PayPal: **no se ha creado un plan real ni se ha ejecutado ningún cargo desde esta conversación**.
- Configuración pública: **desactivada** para evitar ventas incorrectas.
- La rama `main` conserva la interfaz del checkout desactivado y las verificaciones de derecho de acceso. El cobro real permanece pendiente de configuración y despliegue de la función.

## Nota de seguridad de activación

El correo electrónico comunicado por el titular no autoriza transferencias ni confirma las credenciales REST de su cuenta PayPal. El administrador debe vincular y verificar su propia cuenta **PayPal Business** en el panel PayPal Developer, crear y comprobar el plan recurrente Live de US$6/mes, registrar el webhook Live, desplegar Firebase Functions y completar las pruebas de renovación/cancelación/reembolso. No colocar Client Secret ni Webhook ID en este repositorio ni en una conversación. El beneficio sin anuncios se concede únicamente por datos autenticados del servidor; ni una redirección a PayPal ni un `onApprove` sin cobro confirmado son suficientes.
