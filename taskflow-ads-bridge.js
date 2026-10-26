/* TaskFlow ADS — puente hacia un sitio/repo independiente.
   No muestra anuncios ni contacta servicios externos hasta configurarse.
   Nunca transmite uid, email, hábitos, tareas, contraseñas o datos de Firebase. */
(function () {
  'use strict';
  if (window.TaskFlowADS) return;

  var TYPES = Object.freeze([
    'banner', 'interstitial', 'native_profile', 'native_menu',
    'in_chat', 'rewarded_video'
  ]);
  var config = { enabled: false, manifestUrl: null, adminUrl: null };
  var catalog = [];
  var slots = new Map();

  function validHTTPS(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      var url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      return url.href;
    } catch (_) { return null; }
  }
  function normalize(ad) {
    if (!ad || typeof ad !== 'object' || !TYPES.includes(ad.type)) return null;
    var title = typeof ad.title === 'string' ? ad.title.trim().slice(0, 110) : '';
    var description = typeof ad.description === 'string' ? ad.description.trim().slice(0, 260) : '';
    var destination = validHTTPS(ad.destination);
    var image = validHTTPS(ad.image);
    if (!title || !destination) return null;
    return { id: String(ad.id || title).slice(0, 100), type: ad.type, title: title,
      description: description, destination: destination, image: image };
  }
  function node(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function show(type, root) {
    if (!root || typeof root.appendChild !== 'function' || !TYPES.includes(type)) return false;
    var current = root.querySelector('[data-taskflow-ads-owned="true"]');
    if (current) current.remove();
    if (!config.enabled) return false;
    var ad = catalog.find(function (item) { return item.type === type; });
    if (!ad) return false;
    var frame = node('aside', 'taskflow-ads-unit');
    frame.dataset.taskflowAdsOwned = 'true';
    frame.setAttribute('aria-label', 'Publicidad');
    frame.appendChild(node('small', 'taskflow-ads-label', 'Publicidad'));
    var link = node('a', 'taskflow-ads-link');
    link.href = ad.destination;
    link.target = '_blank';
    link.rel = 'sponsored noopener noreferrer';
    link.referrerPolicy = 'no-referrer';
    if (ad.image && type !== 'in_chat') {
      var img = node('img', 'taskflow-ads-image');
      img.src = ad.image;
      img.alt = '';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      link.appendChild(img);
    }
    link.appendChild(node('strong', 'taskflow-ads-title', ad.title));
    if (ad.description) link.appendChild(node('span', 'taskflow-ads-description', ad.description));
    frame.appendChild(link);
    root.appendChild(frame);
    return true;
  }
  var API = {
    version: '1.0.0',
    types: TYPES,
    connection: function () {
      return Object.freeze({ enabled: config.enabled, connected: !!config.manifestUrl,
        adminUrl: config.adminUrl, adsLoaded: catalog.length });
    },
    configure: function (options) {
      if (!options || typeof options !== 'object') return false;
      var manifest = validHTTPS(options.manifestUrl), admin = validHTTPS(options.adminUrl);
      if (options.enabled && !manifest) return false;
      config.enabled = !!options.enabled;
      config.manifestUrl = manifest;
      config.adminUrl = admin;
      if (!config.enabled) {
        catalog = [];
        slots.forEach(function (root, type) { show(type, root); });
      }
      return true;
    },
    refresh: function () {
      if (!config.enabled || !config.manifestUrl) return Promise.resolve(false);
      return fetch(config.manifestUrl, { mode: 'cors', cache: 'no-store',
        credentials: 'omit', referrerPolicy: 'no-referrer' }).then(function (response) {
        if (!response.ok) throw new Error('ADS HTTP ' + response.status);
        return response.json();
      }).then(function (data) {
        if (!data || !Array.isArray(data.ads) || data.ads.length > 100) throw new Error('Catálogo ADS inválido');
        catalog = data.ads.map(normalize).filter(Boolean);
        slots.forEach(function (root, type) { show(type, root); });
        return true;
      }).catch(function (error) {
        // Los errores del servidor ADS no pueden impedir la carga de TaskFlow.
        console.warn('TaskFlow ADS no disponible:', error && error.message || error);
        return false;
      });
    },
    mount: function (type, element) {
      if (!TYPES.includes(type) || !element || typeof element.appendChild !== 'function') return false;
      slots.set(type, element);
      return show(type, element);
    },
    unmount: function (type) {
      var root = slots.get(type);
      if (!root) return;
      var owned = root.querySelector('[data-taskflow-ads-owned="true"]');
      if (owned) owned.remove();
      slots.delete(type);
    }
  };
  Object.defineProperty(window, 'TaskFlowADS', { value: Object.freeze(API),
    writable: false, configurable: false });
}());
