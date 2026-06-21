/* LTFNewTab Service Worker - v1.0 */
const CACHE_NAME = 'ltf-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './oled.html',
  './CSS/style.css',
  './CSS/weather.css',
  './CSS/crypto.css',
  './JS/defaults.js',
  './JS/script.js',
  './JS/toggle.js',
  './JS/drawer.js',
  './JS/weather.js',
  './JS/crypto_hopper_widget_ltfmod.js',
  // Resources root
  './Resources/Preview.png',
  './Resources/LTFNewTab.free',
  // Resources/Backgrounds
  './Resources/Backgrounds/GoldenGate_Color.jpg',
  './Resources/Backgrounds/GoldenGate_Color.png',
  './Resources/Backgrounds/GoldenGate_Light.jpg',
  // Resources/Icons
  './Resources/Icons/Bitcoin.png',
  './Resources/Icons/Dogecoin.png',
  './Resources/Icons/DuckDuckGo.svg',
  './Resources/Icons/Ethereum.png',
  './Resources/Icons/Fanart.png',
  './Resources/Icons/Favicon.svg',
  './Resources/Icons/Google.svg',
  './Resources/Icons/Moon.svg',
  './Resources/Icons/OLED_Care.svg',
  './Resources/Icons/Search.svg',
  './Resources/Icons/Sun.svg',
  // Resources/Tiles
  './Resources/Tiles/Aliexpress.jpg',
  './Resources/Tiles/Amazon.jpg',
  './Resources/Tiles/DeviantArt.png',
  './Resources/Tiles/DidatticaUnidav.jpg',
  './Resources/Tiles/EnteAuth.jpg',
  './Resources/Tiles/EsamiUnidav.jpg',
  './Resources/Tiles/Facebook.png',
  './Resources/Tiles/FlexTax.jpg',
  './Resources/Tiles/GitHub.jpg',
  './Resources/Tiles/Gmail.jpg',
  './Resources/Tiles/Google.jpg',
  './Resources/Tiles/ICV.jpg',
  './Resources/Tiles/Instagram.jpg',
  './Resources/Tiles/ISP.jpg',
  './Resources/Tiles/Jellyfin.svg',
  './Resources/Tiles/OLD_ICV.jpg',
  './Resources/Tiles/OneDrive.jpg',
  './Resources/Tiles/Outlook.jpg',
  './Resources/Tiles/PrimeVideo.jpg',
  './Resources/Tiles/Reddit.jpg',
  './Resources/Tiles/Stremio.jpg',
  './Resources/Tiles/Stremio.svg',
  './Resources/Tiles/Telegram.jpg',
  './Resources/Tiles/TGx.jpg',
  './Resources/Tiles/TVTime.jpg',
  './Resources/Tiles/Twitch.jpg',
  './Resources/Tiles/Unidav.jpg',
  './Resources/Tiles/WhatsApp Alt.jpg',
  './Resources/Tiles/WhatsApp.jpg',
  './Resources/Tiles/Youtube.jpg'
];

/* Install event: pre-cache all local static assets */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

/* Activate event: delete old caches that don't match current cache name */
self.addEventListener('activate', function(event) {
  var currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return cacheNames.filter(function(cacheName) {
        return currentCaches.indexOf(cacheName) === -1;
      });
    }).then(function(cachesToDelete) {
      return Promise.all(cachesToDelete.map(function(cacheToDelete) {
        return caches.delete(cacheToDelete);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch event: different strategies based on request type */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // API calls - network only, don't cache
  if (
    url.hostname === 'api.open-meteo.com' ||
    url.hostname === 'geocoding-api.open-meteo.com' ||
    url.hostname === 'min-api.cryptocompare.com' ||
    url.hostname === 'www.cryptohopper.com' ||
    url.hostname === 'static.cryptohopper.com'
  ) {
    return;
  }

  // External CDN requests (fonts, icons) - network first
  if (
    url.hostname === 'code.iconify.design' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'cdn.jsdelivr.net'
  ) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // Cache a clone of successful responses
          if (response && response.ok) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Same-origin local assets - cache first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then(function(response) {
            // Cache a clone of successful responses
            if (response && response.ok) {
              var responseClone = response.clone();
              caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }
});
