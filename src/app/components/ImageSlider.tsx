import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Link } from 'react-router';
import { GalleryImage } from '@/types/edition';
import { useEditionOptional } from '@/app/hooks/useEdition';

interface ImageSliderProps {
  images?: GalleryImage[];
  title?: string;
  editionNumber?: number;
}

interface CloudinaryPhoto {
  publicId: string;
  url: string;
  thumbnail: string;
  isStarred: boolean;
}

export function ImageSlider({ images: staticImages, title = 'Z naszego wydarzenia', editionNumber }: ImageSliderProps) {
  const edCtx = useEditionOptional();
  const edition = editionNumber ?? edCtx?.meta?.number;

  const [apiPhotos, setApiPhotos] = useState<CloudinaryPhoto[] | null>(null);
  const [apiFetched, setApiFetched] = useState(false);

  useEffect(() => {
    if (!edition) return;
    fetch(`/api/gallery/${edition}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.photos?.length > 0) setApiPhotos(d.photos);
      })
      .catch(() => {})
      .finally(() => setApiFetched(true));
  }, [edition]);

  // Gallery link — use basePath from EditionContext
  const galleryLink = edCtx ? `${edCtx.basePath}/galeria` : null;

  // Image list: if editionNumber set, use API photos only; otherwise use static
  const images: GalleryImage[] = edition
    ? (apiPhotos ? apiPhotos.slice(0, 12).map(p => ({ imageUrl: p.url, alt: '' })) : [])
    : (staticImages || []);

  const totalCount = apiPhotos?.length ?? images.length;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      emblaApi?.scrollNext();
    }, 5000);
  }, [emblaApi]);

  const debounceAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startAutoplay();
    }, 3000);
  }, [startAutoplay]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
    debounceAutoplay();
  }, [emblaApi, debounceAutoplay]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
    debounceAutoplay();
  }, [emblaApi, debounceAutoplay]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
    debounceAutoplay();
  }, [emblaApi, debounceAutoplay]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    startAutoplay();

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect, startAutoplay]);

  // Hide while waiting for API response, or if no images at all
  if (edition && !apiFetched) return null;
  if (!images || images.length === 0) return null;

  return (
    <section id="galeria" className="py-16 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto"></div>
        </motion.div>

        <div className="max-w-5xl mx-auto relative">
          {/* Gradient fade edges */}
          <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_80%] px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="h-[60vh] w-full">
                      <img
                        src={image.imageUrl}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all shadow-lg hover:shadow-cyan-500/50"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all shadow-lg hover:shadow-pink-500/50"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-gradient-to-r from-cyan-400 to-pink-400 w-8'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Full gallery link */}
        {galleryLink && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-8"
          >
            <Link
              to={galleryLink}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-sm text-gray-300 hover:text-white transition-all"
            >
              <Images className="w-4 h-4 text-cyan-400" />
              Pełna galeria
              {totalCount > images.length && (
                <span className="text-gray-500 text-xs">({totalCount} zdjęć)</span>
              )}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
