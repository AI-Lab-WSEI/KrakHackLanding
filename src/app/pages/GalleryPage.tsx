import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Images, Loader2 } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { useEditionOptional } from '@/app/hooks/useEdition';

interface GalleryPhoto {
  publicId: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  isStarred: boolean;
}

export function GalleryPage() {
  const params = useParams();
  const edCtx = useEditionOptional();
  const edition = edCtx?.meta?.number ?? parseInt(params.editionId as string) ?? 3;
  const backLink = edCtx ? `/edycja/${params.editionId}` : '/';

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gallery/${edition}`)
      .then(r => r.ok ? r.json() : { photos: [] })
      .then(d => setPhotos(d.photos || []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [edition]);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);

  const slides = photos.map(p => ({ src: p.url, width: p.width, height: p.height }));

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-white/5">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link to={backLink} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Wróć
          </Link>
          <div className="flex items-center gap-2 text-white font-bold">
            <Images className="w-4 h-4 text-cyan-400" />
            Galeria
          </div>
          {!loading && (
            <span className="text-gray-500 text-xs ml-auto">{photos.length} zdjęć</span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-32 text-gray-500">
            <Images className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Galeria niedostępna</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
            {photos.map((photo, idx) => (
              <motion.div
                key={photo.publicId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                className="break-inside-avoid cursor-pointer group relative rounded-xl overflow-hidden"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={photo.thumbnail}
                  alt=""
                  loading="lazy"
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.isStarred && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px]">
                    ★
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        styles={{ container: { backgroundColor: 'rgba(0,0,0,0.95)' } }}
      />
    </div>
  );
}
