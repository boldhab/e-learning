const CLOUDINARY_URL_PATTERN = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|raw|video)\/upload\//i;

export const getDownloadableFileUrl = (url) => {
  if (!url || !/^https?:\/\//i.test(url)) {
    return '';
  }

  if (!CLOUDINARY_URL_PATTERN.test(url)) {
    return url;
  }

  return url.replace('/upload/', '/upload/fl_attachment/');
};

