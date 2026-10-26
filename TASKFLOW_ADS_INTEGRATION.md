# TaskFlow ADS — contrato de integración (preparado, no activado)

## Arquitectura acordada
TaskFlow_Sistem es el sistema principal. El sistema de anuncios será otro proyecto, con **repositorio y código independientes**, enlazado mediante el puente `taskflow-ads-bridge.js`. **El repositorio `novaprimegt-coder/TaskFlow_Ads` todavía no existe; la conexión pública sigue desactivada y no hay URL desplegada verificada**.

## Estado
- El puente está incluido en el arranque, pero comienza deshabilitado.
- No crea anuncios, espacios vacíos, navegación ni elementos administrativos visibles por defecto.
- No llama a Firebase ni envía datos de usuario.
- Se soportan exclusivamente los tipos solicitados: `banner`, `interstitial`, `native_profile`, `native_menu`, `in_chat`, `rewarded_video`.
- La concesión de recompensas por vídeo **no está implementada**: requerirá verificación segura del servidor, separada del renderizado.
- El panel de ADS, autenticación administrativa y catálogo se implementarán en el nuevo repositorio, **sin modificar los módulos de rutinas, perfiles o tienda**.

## Contrato futuro de conexión
Tras crear y aprobar el nuevo repositorio ADS y publicar su URL HTTPS, el sistema podrá conectarse mediante:
```js
TaskFlowADS.configure({
  enabled: true,
  manifestUrl: "https://DOMINIO_APROBADO/ads.json",
  adminUrl: "https://DOMINIO_APROBADO/"
});
TaskFlowADS.refresh();
```
Estos dominios son ejemplos que **no deben copiarse al código publicado**.

Ejemplo de manifiesto público futuro:
```json
{"ads":[{"id":"ejemplo","type":"banner","title":"Anuncio de demostración","description":"Texto","destination":"https://example.com","image":"https://example.com/banner.jpg"}]}
```
`example.com` es solamente un ejemplo técnico.

Las posiciones deben agregarse explícitamente mediante `TaskFlowADS.mount(tipo, elementoDOM)`; el puente no altera las pantallas existentes por su cuenta. Renderiza texto como texto, restringe recursos y destinos a HTTPS y etiqueta cada pieza como «Publicidad».

## Reglas
1. No publicar contraseñas, claves de servidor ni credenciales privadas en GitHub.
2. No hacer accesible la administración de anuncios desde el código público sin autenticación y autorización del servidor.
3. No usar datos de cuentas, rutinas ni perfiles para segmentar anuncios sin consentimiento y diseño específico.
4. Los anuncios no deben afectar la carga ni la operación offline de TaskFlow.
5. El catálogo público no concede canjes ni recompensas: esos procesos necesitan validación del servidor.
6. No confundir el repositorio de presentación TaskFlow_Home con TaskFlow_Sistem ni con el futuro repositorio de ADS.

## Pendiente
Crear el repositorio independiente `TaskFlow_Ads`, cargar el paquete de código preparado, habilitar GitHub Pages y fusionar reglas administrativas en el Firebase actual. Autorizar una cuenta mediante claim del servidor, comprobar el catálogo y activar el puente después de pruebas. No activar publicidad antes de verificar la publicación.
