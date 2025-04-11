// Liste des fichiers à mettre en cache
const CACHE_NAME = 'nina-carducci-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/maugallery.js',
  '/assets/scripts.js',
  '/assets/bootstrap/bootstrap.bundle.js',
  // Ajoutez ici vos CSS, images principales, etc.
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Stratégie de cache : Cache First, puis réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Le fichier est dans le cache
        if (response) {
          return response;
        }
        
        // Sinon, on fait la requête au réseau
        return fetch(event.request)
          .then(response => {
            // On ne met en cache que les requêtes réussies
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // On clone la réponse car elle ne peut être utilisée qu'une fois
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});