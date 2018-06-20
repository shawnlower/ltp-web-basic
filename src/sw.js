importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
  workbox.LOG_LEVEL = 'debug';

  /*
   * String match of everything at our origin
   */
  workbox.routing.registerRoute(
    '/.*',
    workbox.strategies.staleWhileRevalidate()
  );

  /*
   * Regex matches all other routes (external, etc)
   */
  workbox.routing.registerRoute(
    /.*/,
    workbox.strategies.cacheFirst()
  );

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

