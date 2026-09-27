const CACHE_NAME = "eldercare-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./ElderCare.jpg"
];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        console.log("[SW] Caching ElderCare files...");

        return cache.addAll(FILES_TO_CACHE);
      })

  );

  self.skipWaiting();
});


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {

              console.log(
                "[SW] Deleting old cache:",
                name
              );

              return caches.delete(name);
            })

        );

      })

  );

  self.clients.claim();
});


// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", event => {

  // Firebase requests jangan cache
  if (
    event.request.url.includes("firebaseio.com") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("gstatic.com")
  ) {

    event.respondWith(
      fetch(event.request)
    );

    return;
  }


  // Website files
  event.respondWith(

    caches.match(event.request)

      .then(response => {

        if (response) {
          return response;
        }

        return fetch(event.request);
      })

      .catch(() => {

        return caches.match("./index.html");

      })

  );
});
