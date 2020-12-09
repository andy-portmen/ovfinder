const valid = response => {
  if (!response) {
    return false;
  }
  const fetched = response.headers.get('sw-fetched-on');
  if (fetched && (parseFloat(fetched) + 1000 * 60 * 5) > Date.now()) {
    return true;
  }
  return false;
};

self.addEventListener('fetch', e => {
  if (e.request.url.startsWith('http')) {
    e.respondWith(caches.match(e.request).then(response => {
      if (response) {
        if (valid(response)) {
          return response;
        }
      }
      return fetch(e.request);
    }));
  }
  else {
    e.respondWith(fetch(e.request));
  }
});
