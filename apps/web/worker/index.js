// Custom Service Worker logic injected by next-pwa
// Basic caching for lessons (Stale-While-Revalidate strategy)

const CACHE_NAME = 'lessons-cache-v1';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache API requests for lessons or lesson data
  if (url.pathname.includes('/lessons') || url.pathname.includes('/api/lessons')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Cache the new response if valid
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch((error) => {
          console.error('Fetch failed for lesson cache:', error);
          throw error;
        });

        // Return cached immediately if available, while updating cache in background
        return cachedResponse || fetchPromise;
      })
    );
  }
});
