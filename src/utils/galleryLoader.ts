import galleryData from '../../gallery.json';

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  category: string;
  year: string;
}

export function getGalleryImages(year?: string, category?: string, limit?: number): Array<{imageUrl: string, alt: string, caption: string}> {
  let images = galleryData.gallery;
  
  if (year) {
    images = images.filter(img => img.year === year);
  }
  
  if (category) {
    images = images.filter(img => img.category === category);
  }
  
  if (limit) {
    images = images.slice(0, limit);
  }
  
  return images.map(img => ({
    imageUrl: img.url,
    alt: img.alt,
    caption: img.caption
  }));
}

export function getRandomGalleryImages(count: number = 6, year?: string): Array<{imageUrl: string, alt: string, caption: string}> {
  let images = galleryData.gallery;
  
  if (year) {
    images = images.filter(img => img.year === year);
  }
  
  // Shuffle array and take first 'count' items
  const shuffled = [...images].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(img => ({
    imageUrl: img.url,
    alt: img.alt,
    caption: img.caption
  }));
}