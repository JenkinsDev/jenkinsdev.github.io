const createApi = require('unsplash-js').createApi;
const fs = require('fs');

const key = process.argv[2];

const unsplash = createApi({accessKey: key});

unsplash.search.getPhotos({query: 'space', perPage: 50})
  .then(res => {
    const images = res.response.results.map(photo => ({
      urls: photo.urls, blur_hash: photo.blur_hash
    }));
    fs.writeFileSync('static/unsplash-cache.json', JSON.stringify(images));
  });
