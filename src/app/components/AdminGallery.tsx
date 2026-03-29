import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Images, Loader2, Star, EyeOff, Eye, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface GalleryPhoto {
  publicId: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  isStarred: boolean;
  isHidden: boolean;
  createdAt: string;
}

interface AdminGalleryProps {
  edition: number;
}

export function AdminGallery({ edition }: AdminGalleryProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionUrl, setCollectionUrl] = useState('');
  const [hasApiCredentials, setHasApiCredentials] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = (bust = false) => {
    setLoading(true);
    setError('');
    fetch(`/api/admin/gallery/${edition}${bust ? '?bust=1' : ''}`, {
      headers: { 'x-admin-token': localStorage.getItem('adminToken') || '' },
    })
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.error)))
      .then(d => {
        setPhotos(d.photos || []);
        setCollectionUrl(d.collectionUrl || '');
        setHasApiCredentials(d.hasApiCredentials || false);
      })
      .catch(e => setError(typeof e === 'string' ? e : 'Błąd ładowania galerii'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [edition]);

  const togglePref = async (publicId: string, field: 'isStarred' | 'isHidden', current: boolean) => {
    setSaving(publicId + field);
    try {
      const body: Record<string, unknown> = { publicId };
      if (field === 'isStarred') body.isStarred = !current;
      if (field === 'isHidden') body.isHidden = !current;

      const r = await fetch(`/api/admin/gallery/${edition}/photo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('adminToken') || '',
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();

      setPhotos(prev => prev.map(p =>
        p.publicId === publicId ? { ...p, [field]: !current } : p
      ));
    } catch {
      setError('Nie udało się zapisać');
    } finally {
      setSaving(null);
    }
  };

  const starred = photos.filter(p => p.isStarred && !p.isHidden);
  const visible = photos.filter(p => !p.isStarred && !p.isHidden);
  const hidden = photos.filter(p => p.isHidden);

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Images className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-bold">Galeria — Edycja {edition}</span>
          {!loading && (
            <span className="text-gray-500 text-sm">
              {photos.length} zdjęć · {starred.length} wyróżnionych · {hidden.length} ukrytych
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {collectionUrl && (
            <a href={collectionUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              <ExternalLink className="w-3 h-3" /> Cloudinary Collection
            </a>
          )}
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Odśwież
          </button>
        </div>
      </div>

      {/* API credentials warning */}
      {!hasApiCredentials && (
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Brak kluczy Cloudinary API</p>
            <p className="text-yellow-400/70 text-xs">Ustaw <code>CLOUDINARY_API_KEY</code> i <code>CLOUDINARY_API_SECRET</code> w zmiennych środowiskowych, żeby załadować zdjęcia z Cloudinary.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <Images className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Brak zdjęć. Upewnij się, że klucze Cloudinary są skonfigurowane.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Wyróżnione (widoczne w karuzeli na stronie)</span>
            <span className="flex items-center gap-1"><EyeOff className="w-3 h-3 text-red-400" /> Ukryte (niewidoczne publicznie)</span>
          </div>

          {/* Starred section */}
          {starred.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Wyróżnione ({starred.length})
              </h3>
              <PhotoGrid photos={starred} saving={saving} onToggle={togglePref} />
            </div>
          )}

          {/* Visible section */}
          {visible.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Widoczne ({visible.length})
              </h3>
              <PhotoGrid photos={visible} saving={saving} onToggle={togglePref} />
            </div>
          )}

          {/* Hidden section */}
          {hidden.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3 flex items-center gap-1.5">
                <EyeOff className="w-3 h-3" /> Ukryte ({hidden.length})
              </h3>
              <PhotoGrid photos={hidden} saving={saving} onToggle={togglePref} dimmed />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhotoGrid({ photos, saving, onToggle, dimmed = false }: {
  photos: GalleryPhoto[];
  saving: string | null;
  onToggle: (id: string, field: 'isStarred' | 'isHidden', current: boolean) => void;
  dimmed?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {photos.map((photo, idx) => (
        <motion.div
          key={photo.publicId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: Math.min(idx * 0.01, 0.3) }}
          className={`relative group rounded-xl overflow-hidden bg-white/3 border border-white/8 ${dimmed ? 'opacity-50 hover:opacity-80' : ''} transition-opacity`}
        >
          <div className="aspect-square">
            <img src={photo.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>

          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            {/* Star toggle */}
            <button
              onClick={() => onToggle(photo.publicId, 'isStarred', photo.isStarred)}
              disabled={saving === photo.publicId + 'isStarred'}
              title={photo.isStarred ? 'Usuń wyróżnienie' : 'Wyróżnij'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                photo.isStarred
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-white/20 text-white hover:bg-yellow-400 hover:text-black'
              }`}
            >
              {saving === photo.publicId + 'isStarred'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Star className="w-3.5 h-3.5" />
              }
            </button>

            {/* Hide toggle */}
            <button
              onClick={() => onToggle(photo.publicId, 'isHidden', photo.isHidden)}
              disabled={saving === photo.publicId + 'isHidden'}
              title={photo.isHidden ? 'Pokaż' : 'Ukryj'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                photo.isHidden
                  ? 'bg-red-500 text-white hover:bg-red-400'
                  : 'bg-white/20 text-white hover:bg-red-500'
              }`}
            >
              {saving === photo.publicId + 'isHidden'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : photo.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />
              }
            </button>
          </div>

          {/* Star badge */}
          {photo.isStarred && (
            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[9px] text-black font-bold pointer-events-none">
              ★
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
