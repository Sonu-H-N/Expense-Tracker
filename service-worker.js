const CACHE_NAME = "expense-tracker-v3";
const STATIC_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json"
];

/* ---------------- INSTALL ---------------- */
self.addEventListener("install", event => {
    console.log("Service Worker Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching static files...");
            return cache.addAll(STATIC_CACHE);
        })
    );

    self.skipWaiting();
});

/* ---------------- ACTIVATE ---------------- */
self.addEventListener("activate", event => {
    console.log("Service Worker Activated");

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("Deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

/* ---------------- FETCH ---------------- */
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request)
                .then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // fallback if offline
                    if (event.request.destination === "document") {
                        return caches.match("/index.html");
                    }
                });
        })
    );
});