/* 인터넷이 없어도 안내가 열리도록 파일을 휴대폰에 저장해 두는 장치입니다.
   index.html 이나 사진을 바꾼 뒤에는 아래 VERSION 숫자를 하나 올려 주세요. */
var VERSION = "atmoreddp-10";
var FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./img/main.jpg",
  "./img/about/bedroom.jpg",
  "./img/about/lamp.jpg",
  "./img/about/lattice-detail.jpg",
  "./img/about/lattice-door.jpg",
  "./img/about/living.jpg",
  "./img/about/window-desk.jpg",
  "./img/about/window-sofa.jpg"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); }));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  /* 안내 화면은 항상 최신 내용을 먼저 가져오고, 인터넷이 없을 때만 저장본을 씁니다 */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put("./index.html", copy); });
      return res;
    }).catch(function () { return caches.match("./index.html"); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
