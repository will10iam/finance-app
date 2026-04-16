/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
const CACHE_NAME = "seventwofinn-v2";

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
	console.log("Service Worker instalado");
});

self.addEventListener("activate", (event) => {
	console.log("Service Worker ativado");
});

self.addEventListener("fetch", (event) => {
	event.respondWith(fetch(event.request));
});
