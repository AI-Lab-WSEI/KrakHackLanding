import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Images, Loader2, Star, EyeOff, Eye, AlertCircle, RefreshCw, ExternalLink, Save, Bug, Folder, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { getAdminToken } from './AdminAuth';

function adminFetch(path: string, options?: RequestInit) {
  const token = getAdminToken();
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  }).then(r => r.ok ? r.json() : r.json().then((e: { error?: string }) => Promise.reject(e.error || 'Błąd')));
}

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
  const [folder, setFolder] = useState('');
  const [cloudName, setCloudName] = useState('');
  const [hasApiCredentials, setHasApiCredentials] = useState(false);
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [folderInput, setFolderInput] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const load = (bust = false) => {
    setLoading(true);
    setError('');
    adminFetch(`/api/admin/gallery/${edition}${bust ? '?bust=1' : ''}`)
      .then(d => {
        setPhotos(d.photos || []);
        setCollectionUrl(d.collectionUrl || '');
        setUrlInput(d.collectionUrl || '');
        setFolder(d.folder || '');
        setFolderInput(d.folder || '');
        setCloudName(d.cloudName || '');
        setHasApiCredentials(d.hasApiCredentials || false);
        setMissingVars(d.missingVars || []);
      })
      .catch(e => setError(typeof e === 'string' ? e : 'Błąd ładowania galerii'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [edition]);

  const saveConfig = async () => {
    setSavingUrl(true);
    try {
      await adminFetch(`/api/admin/edition-config/${edition}/gallery-url`, {
        method: 'PATCH',
        body: JSON.stringify({
          cloudinary_collection_url: urlInput,
          cloudinary_folder: folderInput,
        }),
      });
      setCollectionUrl(urlInput);
      setFolder(folderInput);
      load(true);
    } catch {
      setError('Nie udało się zapisać konfiguracji');
    } finally {
      setSavingUrl(false);
    }
  };

  const browseFolders = async () => {
    setLoadingFolders(true);
    setShowFolderPicker(true);
    try {
      // cloudName comes from server — if empty, server uses CLOUDINARY_CLOUD_NAME env var
      const d = await adminFetch(`/api/admin/cloudinary-folders${cloudName ? `?cloudName=${encodeURIComponent(cloudName)}` : ''}`);
      setAvailableFolders(d.folders || []);
    } catch {
      setAvailableFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const runDebug = async () => {
    setDebugInfo(null);
    try {
      const d = await adminFetch(`/api/admin/gallery-debug/${edition}`);
      setDebugInfo(d);
    } catch (e) {
      setDebugInfo({ error: String(e) });
    }
  };

  const togglePref = async (publicId: string, field: 'isStarred' | 'isHidden', current: boolean) => {
    setSaving(publicId + field);
    try {
      const body: Record<string, unknown> = { publicId };
      if (field === 'isStarred') body.isStarred = !current;
      if (field === 'isHidden') body.isHidden = !current;

      await adminFetch(`/api/admin/gallery/${edition}/photo`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      setPhotos(prev => prev.map(p =>
        p.publicId === publicId ? { ...p, [field]: !current } : p
      ));
    } catch {
      setError('Nie udało się zapisać');
    } finally {
      setSaving(null);
    }
  };

  const isDirty = urlInput !== collectionUrl || folderInput !== folder;

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

      {/* Cloudinary config panel */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-4">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Konfiguracja Cloudinary</p>

        {/* Collection URL row */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-gray-500">URL kolekcji (opcjonalny — tylko do linku zewnętrznego)</label>
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://collection.cloudinary.com/cloud-name/token"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Folder row */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-gray-500">Prefix / folder Cloudinary (np. <code className="text-cyan-400">AIKrakHack2026_</code> lub <code className="text-cyan-400">myfolder/</code>)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderInput}
              onChange={e => setFolderInput(e.target.value)}
              placeholder="np. AIKrakHack2026_ lub ai-krak-hack-2026-photos/"
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500/50 font-mono"
            />
            <button
              onClick={showFolderPicker ? () => setShowFolderPicker(false) : browseFolders}
              disabled={loadingFolders}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs transition-all whitespace-nowrap"
              title="Przeglądaj foldery w Cloudinary"
            >
              {loadingFolders
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : showFolderPicker ? <ChevronUp className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />
              }
              {showFolderPicker ? 'Schowaj' : 'Przeglądaj'}
            </button>
          </div>

          {/* Folder picker */}
          {showFolderPicker && (
            <div className="bg-black/40 border border-white/10 rounded-lg p-2 max-h-40 overflow-y-auto space-y-0.5">
              {loadingFolders ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
              ) : availableFolders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-3">Brak folderów lub brak kluczy API</p>
              ) : (
                availableFolders.map(f => (
                  <button
                    key={f}
                    onClick={() => { setFolderInput(f + '/'); setShowFolderPicker(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs transition-colors ${
                      folderInput === f
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Folder className="w-3 h-3 text-yellow-500 shrink-0" />
                    {f}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={saveConfig}
            disabled={savingUrl || !isDirty}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
          >
            {savingUrl ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Zapisz konfigurację
          </button>
          <button
            onClick={runDebug}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-all"
            title="Diagnostyka połączenia Cloudinary"
          >
            <Bug className="w-3 h-3" /> Debug
          </button>
          {folder && (
            <span className="text-[11px] text-gray-500 flex items-center gap-1 ml-auto">
              <Folder className="w-3 h-3 text-yellow-500" />
              Aktualny folder: <code className="text-yellow-400 font-mono">{folder}</code>
            </span>
          )}
        </div>

        {debugInfo && (
          <pre className="text-[10px] text-gray-400 bg-black/40 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>

      {/* API credentials warning */}
      {!hasApiCredentials && missingVars.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Brakuje zmiennych środowiskowych:</p>
            <ul className="text-yellow-400/80 text-xs space-y-0.5">
              {missingVars.map(v => <li key={v}><code>{v}</code></li>)}
            </ul>
            <p className="text-yellow-400/60 text-xs mt-1">Ustaw je w Railway → Variables i zrestartuj serwer.</p>
          </div>
        </div>
      )}

      {!folder && !loading && hasApiCredentials && (
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Nie skonfigurowano folderu Cloudinary</p>
            <p className="text-blue-400/70 text-xs">
              Wpisz prefiks publicznego ID (np. <code>AIKrakHack2026_</code>) lub folder ze slashem (np. <code>myfolder/</code>). Możesz też kliknąć „Przeglądaj" — folder zostanie wybrany z ukośnikiem na końcu.
            </p>
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
          <p>{folder ? `Brak zdjęć w folderze „${folder}". Sprawdź nazwę folderu i klucze Cloudinary.` : 'Skonfiguruj folder Cloudinary powyżej, aby załadować zdjęcia.'}</p>
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
