# TaskFlow — PayPal «Eliminar anuncios» (preparación segura)

**Estado: NO activado y NO desplegado.** Este código está aislado en la rama `feature/paypal-noads`. El TaskFlow público continúa funcionando como antes.

## Qué hará la integración

1. Un usuario autenticado en Firebase abre el botón existente **Eliminar anuncios**.
2. El navegador muestra PayPal Checkout. Según la cuenta del comercio y del comprador, PayPal ofrece tarjetas de débito o crédito (pago invitado) además de su cartera.
3. El backend calcula el importe configurado en el servidor, crea la orden PayPal y asocia su ID a la cuenta de Firebase. El cliente **no elige ni puede modificar** el importe.
4. Tras aprobarse el pago, **el backend** lo captura, comprueba `COMPLETED`, moneda e importe, registra la captura y activa `users/{uid}/entitlements/noAds`.
5. La aplicación consulta el estado autenticado; únicamente cuando está confirmado oculta banners, anuncio de entrada y anuncios por interacción.
6. El backend recibe reembolsos y reversiones mediante un webhook de PayPal con firma verificada. Nunca concede beneficios por redirecciones, capturas de pantalla o cambios en `localStorage`.

La implementación está diseñada para **pago único** sin renovación automática. La duración se configura explícitamente (número de días o `lifetime`), no se ha elegido ninguna todavía.

## Datos indispensables que faltan

- Precio exacto.
- Moneda admitida por PayPal para la cuenta comercial.
- Duración del beneficio (días concretos o permanente).
- Credenciales oficiales `Client ID` y `Client Secret` de una aplicación PayPal REST y su `Webhook ID`. **Nunca deben enviarse por chat ni subirse a GitHub**. Configurarlas directamente como secretos de Firebase.
- Confirmación de elegibilidad de pagos con tarjeta en la cuenta comercial PayPal.

## Backend (Firebase Functions)

La función se encuentra en `payments/paypal/functions/index.js`; proyecto Firebase actual: `taskflow-b0ece`. Usa Firebase Authentication, Firestore Admin, PayPal Orders API y firma de webhooks.

1. Instalar Node compatible y Firebase CLI, y configurar acceso autorizado al proyecto Firebase.
2. Desde `payments/paypal/functions`, ejecutar `npm install`.
3. Configurar secretos en Firebase con `firebase functions:secrets:set TASKFLOW_PAYPAL_CLIENT_ID`, `TASKFLOW_PAYPAL_CLIENT_SECRET` y `TASKFLOW_PAYPAL_WEBHOOK_ID`.
4. En el entorno privado del proyecto de Functions, configurar **todas** estas variables sin publicar su contenido:

```env
NOADS_PRICE=<PRECIO_ELEGIDO_CON_DOS_DECIMALES>
NOADS_CURRENCY=<MONEDA_ADMITIDA>
NOADS_DURATION=<CANTIDAD_DE_DIAS_O_lifetime>
PAYPAL_ENV=sandbox
```

5. Realizar pruebas en Sandbox sin cargos reales. Después de aprobarlas, configurar producción conscientemente con `PAYPAL_ENV=live` y credenciales `live` en secretos.
6. Desplegar únicamente la función `taskflowNoAds`, según la configuración local de Firebase Functions.
7. Registrar el endpoint HTTPS `/paypal/webhook` en PayPal para los eventos `PAYMENT.CAPTURE.REFUNDED` y `PAYMENT.CAPTURE.REVERSED`; verificarlo con PayPal y configurar el `Webhook ID` real.
8. Revisar y aplicar reglas de Firestore que permitan leer el estado al usuario autenticado pero **nunca escribir el beneficio desde el cliente**. Asegurar que ninguna regla amplia permita editar `users/{uid}/entitlements/noAds`.
9. Probar pago correcto, cancelación, intento duplicado, usuario distinto, reembolso, caducidad, error de red, inicio de sesión y restauración de sesión.

## Frontend

El archivo `payments/paypal/client.js` muestra PayPal Checkout y verifica el derecho a no ver anuncios. `public-config.json` comienza con `enabled:false` y `apiBase:""`. **No activar** hasta que el backend y la verificación de pagos funcionen y se haya determinado precio y duración.

Cuando el servidor esté disponible, configurar `apiBase` con su URL HTTPS pública (sin final `/`) y solo entonces cambiar `enabled` a `true`, tras probar el enlace y las reglas de datos. Ningún dato de tarjeta se recopila en TaskFlow; todo lo maneja PayPal.

La aceptación de tarjeta sin abrir una cuenta PayPal depende de la elegibilidad regional y del análisis de riesgo de PayPal. No se puede garantizar para todos los compradores.

## Alcance y limitaciones

- No hay pagos activos ni enlaces de pago publicados.
- Sin importe y vigencia no hay manera segura de cobrar ni atribuir un beneficio correcto. **No inventar estos datos.**
- No fusionar con `main` hasta la prueba de Sandbox y aprobación de la configuración comercial.
- Los códigos de usuario se publican en GitHub Pages; las credenciales comerciales permanecen exclusivamente en los secretos del backend.
