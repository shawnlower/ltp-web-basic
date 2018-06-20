/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.3.0/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "app/actions/app.actions.ts",
    "revision": "b862154ebf79676f974486d383045744"
  },
  {
    "url": "app/actions/editor.actions.ts",
    "revision": "c2edf728d0c9a994dc4416a2bd40ac3c"
  },
  {
    "url": "app/actions/item.actions.ts",
    "revision": "0b7379bde33fe21e0e920b3728163d1c"
  },
  {
    "url": "app/app-routing.module.ts",
    "revision": "39e9abb5741bdf89dbb2479b596cd59b"
  },
  {
    "url": "app/app.module.ts",
    "revision": "c8959696afbcf75d3dce4db4dc796ea1"
  },
  {
    "url": "app/components/app/app.component.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "app/components/app/app.component.html",
    "revision": "0f3cf28119d26b2709baf769c28aa7a0"
  },
  {
    "url": "app/components/app/app.component.spec.ts",
    "revision": "0caee6d858bc6360f2e5ae26e8bbbefd"
  },
  {
    "url": "app/components/app/app.component.ts",
    "revision": "dbe15f3c79ce36bb305d0f0413d41399"
  },
  {
    "url": "app/components/basic-editor/basic-editor.component.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "app/components/basic-editor/basic-editor.component.html",
    "revision": "42a9ef1fe3012ef78e696891b4af8bc9"
  },
  {
    "url": "app/components/basic-editor/basic-editor.component.spec.ts",
    "revision": "8b97958d77a7d12d9419a713ca89e60d"
  },
  {
    "url": "app/components/basic-editor/basic-editor.component.ts",
    "revision": "7bb5037f66a20f0b93aff7f17a78e537"
  },
  {
    "url": "app/components/card/card.component.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "app/components/card/card.component.html",
    "revision": "1cab4196d8cee1af6de9eb8abdb9ef81"
  },
  {
    "url": "app/components/card/card.component.spec.ts",
    "revision": "1036eaccbf11f300e7be543b17708d43"
  },
  {
    "url": "app/components/card/card.component.ts",
    "revision": "66609814703048d2a5ababfd92121058"
  },
  {
    "url": "app/components/home/home.component.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "app/components/home/home.component.html",
    "revision": "8070f131c8e4e99cfc7542b52fe67524"
  },
  {
    "url": "app/components/home/home.component.spec.ts",
    "revision": "b09ec13a91ab3345bfb59bb913cee4d2"
  },
  {
    "url": "app/components/home/home.component.ts",
    "revision": "000c509243b37b4587a152f24a0c2321"
  },
  {
    "url": "app/components/item-header/item-header.component.ts",
    "revision": "cea46f118b5a34f14e1e6b0c9fe2f2ac"
  },
  {
    "url": "app/components/item-section/item-section.component.ts",
    "revision": "1e42d5bcf8f218586882dd4739493456"
  },
  {
    "url": "app/components/items-list/items-list.component.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "app/components/items-list/items-list.component.html",
    "revision": "1e6864c4d1aa6d3d05505c9ad25f5a33"
  },
  {
    "url": "app/components/items-list/items-list.component.spec.ts",
    "revision": "9670cf5516c09fc99887c8c17915432f"
  },
  {
    "url": "app/components/items-list/items-list.component.ts",
    "revision": "9a14043a54b98600ad58d1c56e59cefb"
  },
  {
    "url": "app/components/modal-editor/modal-editor.component.css",
    "revision": "df23398180132c1aba0d89d3be0ff02c"
  },
  {
    "url": "app/components/modal-editor/modal-editor.component.html",
    "revision": "051a5b71f99cf03a2a065423389817be"
  },
  {
    "url": "app/components/modal-editor/modal-editor.component.spec.ts",
    "revision": "2f107e983c1c838d640a92349f70b334"
  },
  {
    "url": "app/components/modal-editor/modal-editor.component.ts",
    "revision": "1b1982afc46f7ae7b93363aad451c3b6"
  },
  {
    "url": "app/components/rdfa-editor/rdfa-editor.component.css",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "app/components/rdfa-editor/rdfa-editor.component.html",
    "revision": "47f2c45563e47e765ac904860cce4708"
  },
  {
    "url": "app/components/rdfa-editor/rdfa-editor.component.spec.ts",
    "revision": "a7c242956c346993d306957fecc7ed83"
  },
  {
    "url": "app/components/rdfa-editor/rdfa-editor.component.ts",
    "revision": "4998cc74a5cfccce6acd1f4b78c28f2f"
  },
  {
    "url": "app/directives/item.directive.ts",
    "revision": "084992d9b0cd6d5e4165ce2407c73d85"
  },
  {
    "url": "app/jsonld2rdf.ts",
    "revision": "141aab0a89a3fb75cffbd101cb623cd1"
  },
  {
    "url": "app/models/item.model.ts",
    "revision": "b798c3ab3ab260da70739e95fe7134fb"
  },
  {
    "url": "app/models/mock-items.ts",
    "revision": "f6443bf5791f2619aeef1d35bdef3cda"
  },
  {
    "url": "app/reducers/app.reducer.ts",
    "revision": "5d30180ad3a317d576d03d6625b816c1"
  },
  {
    "url": "app/reducers/editor.reducer.ts",
    "revision": "b9e322c5fb8e9800a93c42c1ad41f090"
  },
  {
    "url": "app/reducers/index.ts",
    "revision": "e48ff4455716ef7e845e44bb0dfb4049"
  },
  {
    "url": "app/reducers/item.reducer.ts",
    "revision": "b4c1e75278a357598e9c9c7f7e5e115c"
  },
  {
    "url": "app/services/dynamic-content-service.service.spec.ts",
    "revision": "a8cc003b81ebe4105aefdefbe027502d"
  },
  {
    "url": "app/services/dynamic-content-service.service.ts",
    "revision": "5fd0a412024c3957bddfba5e918c7b97"
  },
  {
    "url": "app/services/item.service.spec.ts",
    "revision": "28b12e2d405998690397e1038a227849"
  },
  {
    "url": "app/services/item.service.ts",
    "revision": "57bd59f04d3a26b2289d2653d543c385"
  },
  {
    "url": "app/services/keyboard-shortcuts.service.spec.ts",
    "revision": "b0bbe1a992fb4f2bdbfae241259a02bb"
  },
  {
    "url": "app/services/keyboard-shortcuts.service.ts",
    "revision": "00c173445c75168b00e398ab8f7a4a92"
  },
  {
    "url": "assets/css/bootstrap.min.css",
    "revision": "450fc463b8b1a349df717056fbb3e078"
  },
  {
    "url": "assets/css/sticky-footer.css",
    "revision": "5ba7177e92b21c69ec2927f2ea5b70bc"
  },
  {
    "url": "assets/css/styles.css",
    "revision": "6f4319698b8ffe626aa3835b6f12b581"
  },
  {
    "url": "assets/js/draggabilly.pkgd.js",
    "revision": "02c6163ea2cec31e87959ebd34ae3253"
  },
  {
    "url": "assets/js/draggabilly.pkgd.min.js",
    "revision": "46275ff2ab2f46c4385dbe816d40ce01"
  },
  {
    "url": "assets/js/jsonld.js",
    "revision": "c57c6fefaf96b4ad19340cb7a0c3fdf1"
  },
  {
    "url": "assets/js/packery.pkgd.js",
    "revision": "2b57d429fa048f022eb95a708d043890"
  },
  {
    "url": "assets/js/packery.pkgd.min.js",
    "revision": "9f87f6e78c51bb3b335c5dd03280167f"
  },
  {
    "url": "environments/environment.prod.ts",
    "revision": "6de221395114600b523995704b7d1caa"
  },
  {
    "url": "environments/environment.ts",
    "revision": "a146518d07dd332cc3192489840efb20"
  },
  {
    "url": "favicon.ico",
    "revision": "b9aa7c338693424aae99599bec875b5f"
  },
  {
    "url": "index.html",
    "revision": "2f420cb7ccc0dbbe10c7a5390cb6eeea"
  },
  {
    "url": "karma.conf.js",
    "revision": "be570be20b6733c888a3c505eff44253"
  },
  {
    "url": "main.ts",
    "revision": "067b7f93be4fcbf21789dfadd4f11f28"
  },
  {
    "url": "polyfills.ts",
    "revision": "3dba718d7afe009e112e10d69073d2a2"
  },
  {
    "url": "test.ts",
    "revision": "3ddc24a1929f2cfe1b835548aaaa54f3"
  },
  {
    "url": "tsconfig.app.json",
    "revision": "cc170f1fade0510befc2e5719f48f556"
  },
  {
    "url": "tsconfig.spec.json",
    "revision": "793bf9465eb77064fc0926fbf15c0bf8"
  },
  {
    "url": "tslint.json",
    "revision": "076f57fdd2a3552afba0f31801729e11"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
