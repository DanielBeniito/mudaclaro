(() => {
  'use strict';
  const tagId = 'AW-18536530149';
  const destination = tagId + '/Etq9CISAo6kdEOWB9IZF';
  const consentKey = 'mc-measurement-consent-v1';
  const pendingKey = 'mc-request-pending-v1';
  let consent = 'unknown', loaded = false, conversion = null, recorded = false;
  const read = (store, key) => { try { return store.getItem(key); } catch { return null; } };
  const write = (store, key, value) => { try { store.setItem(key, value); } catch {} };
  function preference() {
    try {
      const saved = JSON.parse(read(localStorage, consentKey));
      if (saved && Date.now() - saved.time < 180 * 86400000 && ['granted','denied'].includes(saved.value)) return saved.value;
    } catch {}
    return 'unknown';
  }
  function send() {
    if (consent !== 'granted' || !conversion || recorded) return;
    recorded = true;
    window.gtag('event', 'conversion', {send_to:destination, value:0, currency:'EUR', transaction_id:conversion});
  }
  function load() {
    if (loaded || consent !== 'granted') return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',analytics_storage:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',tagId,{allow_ad_personalization_signals:false,allow_google_signals:false,send_page_view:false});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + tagId;
    document.head.append(script);
  }
  function choose(value) {
    const previouslyLoaded = loaded;
    consent = value;
    write(localStorage,consentKey,JSON.stringify({value,time:Date.now()}));
    banner.hidden = true;
    if (value === 'granted') { load(); send(); }
    else if (previouslyLoaded) {
      window.gtag('consent','update',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      // Reload to return to basic mode: the Google script is not loaded after refusal.
      location.reload();
    }
  }
  const style = document.createElement('style');
  style.textContent = '.mc-consent{position:fixed;bottom:12px;left:12px;right:12px;max-width:680px;margin:auto;padding:20px;background:#fff;color:#203e36;border:1px solid #bbcabc;border-radius:10px;box-shadow:0 4px 30px #203e3620;z-index:1000;font:14px/1.5 Arial}.mc-consent[hidden]{display:none}.mc-consent p{margin:0 0 12px}.mc-consent-actions{display:flex;flex-wrap:wrap;gap:12px}.mc-consent button,.mc-settings{font:14px Arial;min-height:44px;padding:10px 16px;border:1px solid #174e43;border-radius:5px;background:#fff;color:#174e43;cursor:pointer}.mc-settings{display:block;margin:20px auto}.mc-consent a{text-decoration:underline}.mc-consent button:focus-visible,.mc-settings:focus-visible{outline:3px solid #b28a47;outline-offset:3px}';
  document.head.append(style);
  const banner = document.createElement('section');
  banner.className = 'mc-consent';
  banner.setAttribute('aria-label','Preferencias de medición publicitaria');
  banner.innerHTML = '<p><strong>Medición de nuestros anuncios</strong></p><p>Con tu permiso, Google Ads utilizará cookies y datos técnicos de navegación para relacionar las solicitudes enviadas con nuestros anuncios. No enviamos el contenido del formulario ni activamos anuncios personalizados. Puedes usar el formulario sin aceptar.</p><p><a href="/index.html#privacidad">Privacidad</a> · <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Cómo usa Google los datos</a></p><div class="mc-consent-actions"><button type="button" data-choice="granted">Aceptar medición</button><button type="button" data-choice="denied">Rechazar</button></div>';
  document.body.append(banner);
  banner.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click',() => choose(button.dataset.choice)));
  const settings = document.createElement('button');
  settings.className = 'mc-settings'; settings.type = 'button'; settings.textContent = 'Cambiar preferencias de medición';
  settings.addEventListener('click',() => { banner.hidden = false; banner.querySelector('button').focus(); });
  document.body.append(settings);
  window.mcMeasurement = {
    begin() {
      if (consent !== 'granted') return null;
      const pending = {id:crypto.randomUUID(),time:Date.now(),profile:'persona'};
      write(sessionStorage,pendingKey,JSON.stringify(pending));
      return pending.id;
    },
    accepted() {
      try {
        const pending = JSON.parse(read(sessionStorage,pendingKey));
        if (pending && Date.now()-pending.time < 3600000) conversion = pending.id;
        sessionStorage.removeItem(pendingKey);
      } catch {}
      send();
    }
  };
  consent = preference(); banner.hidden = consent !== 'unknown';
  if (consent === 'granted') load();
  // A direct visit to the thank-you URL is not a conversion.
  if (/\/gracias\.html$/.test(location.pathname) && /^https:\/\/formsubmit\.co\//.test(document.referrer)) window.mcMeasurement.accepted();
})();
