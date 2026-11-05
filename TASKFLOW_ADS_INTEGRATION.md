# TaskFlow ADS — integración V2

## Arquitectura actual

TaskFlow_Sistem permanece como sistema principal.

El administrador comercial vive en el repositorio independiente:

`novaprimegt-coder/TaskFlow_ADS_Manager`

Ambos proyectos usan el mismo Firebase:

`taskflow-b0ece`

## Conexión

TaskFlow_Sistem carga `taskflow-ads-bridge.js` V2.

El puente:
- consulta únicamente la colección pública `adsPublicCampaigns`;
- no recibe correo, contraseña, uid privado, hábitos, tareas ni datos administrativos;
- acepta únicamente campañas `active + approved`;
- valida HTTPS;
- valida las medidas del creativo;
- evita video en Banner;
- valida video vertical de 10 segundos;
- evita repetir inmediatamente el mismo anuncio cuando hay alternativas;
- no bloquea el arranque de TaskFlow si Firebase ADS no está disponible.

## Ubicaciones conectadas

### Banner

Una campaña de tipo `banner` puede aparecer en cualquiera de estos tres espacios existentes:

- `tfAdBannerTimer`
- `tfAdBannerHabitsTasks`
- `tfAdBannerFooter`

El puente selecciona anuncios Banner aprobados para los espacios disponibles.

Especificación:
- 1200 × 180 px;
- imagen o GIF;
- video prohibido.

### Ingreso

El puente entrega el creativo seleccionado mediante:

`TaskFlowEntryAdV56.setCreative(...)`

Especificación:
- 1080 × 1920 px;
- imagen, GIF o video;
- video de 10 segundos;
- audio permitido cuando la campaña lo habilita;
- TaskFlow conserva su control de audio y pausa/reanudación de música.

### Interacción

El puente entrega el creativo mediante:

`TaskFlowInteractionAdV57.setCreative(...)`

Especificación:
- 1080 × 1920 px;
- imagen, GIF o video;
- video de 10 segundos;
- TaskFlow conserva el contador acumulativo de 10 interacciones.

## Segmentación

El catálogo incluye país, región y ciudad.

El puente puede recibir contexto local mediante:

```js
TaskFlowADS.setContext({
  country: "GT",
  region: "Huehuetenango",
  city: "Huehuetenango"
});
```

Ese contexto se usa localmente para filtrar campañas y no se transmite al ADS Manager.

Cuando no existe región/ciudad disponible en TaskFlow, las campañas que exijan esos niveles no se entregan incorrectamente.

## Aprobación

El anunciante no publica directamente al sistema principal.

Flujo:

1. Crea o edita la campaña en ADS Manager.
2. La campaña queda `pending`.
3. Una cuenta administrativa con custom claim `taskflowAdsAdmin=true` revisa la campaña.
4. Solo al aprobarla se crea/actualiza el espejo público en `adsPublicCampaigns`.
5. El puente V2 la incorpora a TaskFlow.
6. Pausar o eliminar la campaña elimina la entrega pública.

## Estado de publicación

El código de conexión ya está integrado en el repositorio.

Antes del lanzamiento público todavía se debe:
- fusionar/desplegar las reglas Firestore de ADS;
- fusionar/desplegar las reglas Storage de ADS;
- asignar el custom claim administrativo;
- autorizar el dominio definitivo del ADS Manager en Firebase Authentication;
- publicar el ADS Manager;
- realizar prueba real de extremo a extremo.

No se habilitó hosting ni GitHub Pages desde esta actualización porque la orden actual fue dejarlo listo para publicar, no ejecutar el lanzamiento.

## Seguridad

No incluir claves privadas ni service accounts en GitHub.

La API key web de Firebase es configuración pública del cliente; la autorización real depende de Firebase Authentication, Firestore Rules, Storage Rules y el custom claim administrativo.

El puente nunca debe conceder permisos administrativos ni aceptar campañas privadas directamente.
