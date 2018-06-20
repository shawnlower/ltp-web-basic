import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

function registerServiceWorker() {
  if (environment.production && 'serviceWorker' in navigator) {
    console.log('Registering servie worker');
    navigator.serviceWorker.register('sw.js');
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(registerServiceWorker)
  .catch(err => console.log(err));
