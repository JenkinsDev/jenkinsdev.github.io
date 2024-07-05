const UNSPLASH_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function loadUnsplashCacheData() {
  const cache = JSON.parse(localStorage.getItem("unsplash-cache") || "{}");
  if (cache.lastFetched && Date.now() - cache.lastFetched < UNSPLASH_CACHE_TTL) {
    return cache.images;
  }

  const data = await fetch("/unsplash-cache.json");
  const cacheData = {images: await data.json(), lastFetched: Date.now()};
  localStorage.setItem("unsplash-cache", JSON.stringify(cacheData));

  return cacheData.images;
}

document.addEventListener("DOMContentLoaded", () => {
  loadUnsplashCacheData().then((images) => {
    const rndmIdx = Math.floor(Math.random() * images.length);
    document.querySelector('.body-image').style.backgroundImage = `url(${images[rndmIdx].urls.full})`;
  });
});
