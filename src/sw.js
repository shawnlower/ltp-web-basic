importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

if (workbox) {
  console.log('Workbox is loaded 🎉');

  workbox.LOG_LEVEL = 'debug';
  workbox.setConfig({
    debug: true
  });

  /*
   * Regex matches all other routes (external, etc)
   */
  workbox.routing.registerRoute(
    /https:.*/,
    workbox.strategies.cacheFirst()
  );

  workbox.routing.registerRoute(
    /http:\/\/schema.*/,
    workbox.strategies.cacheFirst()
  );

  /*
   * String match of everything at our origin
   */
  workbox.routing.registerRoute(
    /.*/,
    // workbox.strategies.staleWhileRevalidate()
    workbox.strategies.networkFirst()
  );

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}


