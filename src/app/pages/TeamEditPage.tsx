import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  Plus,
  X,
  ChevronLeft,
  Check,
  AlertCircle,
  Image,
  Code,
  FileText,
  Users,
  Loader2,
  GripVertical,
  Lock,
  Upload,
  Trash2,
  ExternalLink,
  ChevronDown,
  History,
} from 'lucide-react';
import { Footer } from '@/app/components/Footer';

interface TeamData {
  id: number;
  slug: string;
  name: string;
  placement?: number;
  placement_label?: string;
  challenge: string;
  members: string[];
  university: string;
  project_name: string;
  short_description: string;
  full_description: string[];
  key_features: string[];
  technologies: string[];
  images: { url: string; alt: string; caption?: string }[];
  presentation_file: string;
  edit_password?: string;
  edit_history?: EditHistoryEntry[];
}

interface EditHistoryEntry {
  timestamp: string;
  editor: 'admin' | 'team';
  fields: string[];
}

// ── Reusable UI primitives ──────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none transition-colors';

const smallBtnClass =
  'flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors';

// ── Password Gate ────────────────────────────────────────────────

function PasswordGate({
  teamName,
  slug,
  token,
  onAuthenticated,
}: {
  teamName: string;
  slug: string;
  token: string;
  onAuthenticated: (password: string) => void;
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${slug}/verify-edit-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem(`edit_auth_${slug}`, password);
        onAuthenticated(password);
      } else {
        setError('Nieprawidlowe haslo. Sprawdz email z linkiem edycji.');
      }
    } catch {
      setError('Blad polaczenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Edycja profilu zespolu</h2>
        <p className="text-gray-400 mb-2 text-sm">
          <span className="text-cyan-300 font-semibold">{teamName}</span>
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Wpisz haslo, ktore otrzymales w emailu z linkiem edycji.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Haslo dostepowe..."
            className={inputClass + ' text-center tracking-widest text-lg'}
            autoFocus
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? 'Sprawdzanie...' : 'Odblokuj'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function TeamEditPage() {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Auth state
  const [authenticated, setAuthenticated] = useState(false);
  const [editPassword, setEditPassword] = useState('');

  // Form state — editable fields only
  const [projectName, setProjectName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState<string[]>([]);
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; alt: string; caption?: string }[]>([]);
  const [presentationFile, setPresentationFile] = useState('');
  const [university, setUniversity] = useState('');
  const [techInput, setTechInput] = useState('');
  const [editHistory, setEditHistory] = useState<EditHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Check sessionStorage for saved auth on mount ──────────────

  useEffect(() => {
    if (!slug) return;
    const savedPassword = sessionStorage.getItem(`edit_auth_${slug}`);
    if (savedPassword) {
      setAuthenticated(true);
      setEditPassword(savedPassword);
    }
  }, [slug]);

  // ── Fetch team data ─────────────────────────────────────────────

  useEffect(() => {
    fetch(`/api/teams/${slug}/edit/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? 'Nieprawidlowy token' : 'Blad serwera');
        return r.json();
      })
      .then((data: TeamData) => {
        setTeam(data);
        setProjectName(data.project_name || '');
        setShortDesc(data.short_description || '');
        setFullDesc(data.full_description || []);
        setKeyFeatures(data.key_features || []);
        setTechnologies(data.technologies || []);
        setImages(data.images || []);
        setPresentationFile(data.presentation_file || '');
        setUniversity(data.university || '');
        setEditHistory(data.edit_history || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug, token]);

  // ── Handle authentication ──────────────────────────────────────

  const handleAuthenticated = (password: string) => {
    setAuthenticated(true);
    setEditPassword(password);
  };

  // ── Save handler ────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${slug}/edit/${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Edit-Password': editPassword,
        },
        body: JSON.stringify({
          project_name: projectName,
          short_description: shortDesc,
          full_description: fullDesc,
          key_features: keyFeatures,
          technologies,
          images,
          presentation_file: presentationFile,
          university,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          // Session expired, clear auth
          sessionStorage.removeItem(`edit_auth_${slug}`);
          setAuthenticated(false);
          setEditPassword('');
          throw new Error('Sesja wygasla — zaloguj sie ponownie');
        }
        throw new Error(data.error || 'Nie udalo sie zapisac');
      }
      const updated = await res.json();
      setEditHistory(updated.edit_history || []);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nie udalo sie zapisac zmian');
    } finally {
      setSaving(false);
    }
  };

  // ── PDF upload handler ──────────────────────────────────────────

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const res = await fetch(`/api/teams/${slug}/upload-presentation/${token}`, {
        method: 'POST',
        headers: { 'X-Edit-Password': editPassword },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad przeslania pliku');
      setPresentationFile(data.presentation_file);
      setPdfFile(null);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Blad przeslania');
    } finally {
      setUploading(false);
    }
  };

  // ── Array field helpers (immutable) ─────────────────────────────

  const updateArrayItem = <T,>(arr: T[], idx: number, value: T): T[] =>
    arr.map((item, i) => (i === idx ? value : item));

  const removeArrayItem = <T,>(arr: T[], idx: number): T[] =>
    arr.filter((_, i) => i !== idx);

  const addArrayItem = <T,>(arr: T[], value: T): T[] => [...arr, value];

  const moveArrayItem = <T,>(arr: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= arr.length) return arr;
    const result = [...arr];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);
    return result;
  };

  // ── Loading state ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────

  if (error && !team) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Blad dostepu</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Wroc na strone glowna
          </Link>
        </div>
      </div>
    );
  }

  if (!team) return null;

  // ── Password gate ───────────────────────────────────────────────

  if (!authenticated) {
    return (
      <PasswordGate
        teamName={team.name}
        slug={slug!}
        token={token!}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  // ── Render ──────────────────────────────────────────────────────

  const pdfFilename = presentationFile
    ? presentationFile.split('/').pop()
    : null;

  return (
    <>
      <div className="min-h-screen bg-black text-white pb-28">
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
          {/* ── Header ── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <Link
              to={`/zespoly/${slug}`}
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Wroc do strony zespolu
            </Link>

            <h1 className="text-2xl font-bold text-white mb-3">{team.name}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {team.placement && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-semibold border border-yellow-500/30">
                  {team.placement_label || `${team.placement}. miejsce`}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm border border-cyan-500/30">
                {team.challenge}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              <span>{team.members.join(', ')}</span>
            </div>
          </div>

          {/* ── Nazwa projektu ── */}
          <SectionCard title="Nazwa projektu" icon={<FileText className="w-4 h-4 text-cyan-400" />}>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nazwa projektu..."
              className={inputClass}
            />
          </SectionCard>

          {/* ── Uczelnia ── */}
          <SectionCard title="Uczelnia" icon={<Users className="w-4 h-4 text-cyan-400" />}>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Nazwa uczelni..."
              className={inputClass}
            />
          </SectionCard>

          {/* ── Krotki opis ── */}
          <SectionCard title="Krotki opis" icon={<FileText className="w-4 h-4 text-cyan-400" />}>
            <textarea
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value.slice(0, 300))}
              placeholder="Krotki opis projektu (max 300 znakow)..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {shortDesc.length}/300 znakow
            </p>
          </SectionCard>

          {/* ── Pelny opis ── */}
          <SectionCard title="Pelny opis" icon={<FileText className="w-4 h-4 text-cyan-400" />}>
            <div className="space-y-3">
              {fullDesc.map((para, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    value={para}
                    onChange={(e) => setFullDesc(updateArrayItem(fullDesc, idx, e.target.value))}
                    placeholder={`Akapit ${idx + 1}...`}
                    rows={3}
                    className={inputClass + ' resize-none flex-1'}
                  />
                  <button
                    onClick={() => setFullDesc(removeArrayItem(fullDesc, idx))}
                    className="self-start p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Usun akapit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setFullDesc(addArrayItem(fullDesc, ''))}
              className={smallBtnClass + ' mt-3'}
            >
              <Plus className="w-4 h-4" />
              Dodaj akapit
            </button>
          </SectionCard>

          {/* ── Kluczowe cechy ── */}
          <SectionCard title="Kluczowe cechy" icon={<Check className="w-4 h-4 text-cyan-400" />}>
            <div className="space-y-2">
              {keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => setKeyFeatures(moveArrayItem(keyFeatures, idx, idx - 1))}
                      disabled={idx === 0}
                      className="text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) =>
                      setKeyFeatures(updateArrayItem(keyFeatures, idx, e.target.value))
                    }
                    placeholder="Cecha..."
                    className={inputClass + ' flex-1'}
                  />
                  <button
                    onClick={() => setKeyFeatures(removeArrayItem(keyFeatures, idx))}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Usun ceche"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setKeyFeatures(addArrayItem(keyFeatures, ''))}
              className={smallBtnClass + ' mt-3'}
            >
              <Plus className="w-4 h-4" />
              Dodaj ceche
            </button>
          </SectionCard>

          {/* ── Technologie ── */}
          <SectionCard title="Technologie" icon={<Code className="w-4 h-4 text-cyan-400" />}>
            <div className="flex flex-wrap gap-2 mb-3">
              {technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300"
                >
                  {tech}
                  <button
                    onClick={() => setTechnologies(removeArrayItem(technologies, idx))}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && techInput.trim()) {
                  e.preventDefault();
                  setTechnologies(addArrayItem(technologies, techInput.trim()));
                  setTechInput('');
                }
              }}
              placeholder="Wpisz technologie i nacisnij Enter..."
              className={inputClass}
            />
          </SectionCard>

          {/* ── Screenshoty ── */}
          <SectionCard
            title="Screenshoty z projektu"
            icon={<Image className="w-4 h-4 text-cyan-400" />}
          >
            <div className="space-y-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">
                      Obraz {idx + 1}
                    </span>
                    <button
                      onClick={() => setImages(removeArrayItem(images, idx))}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      title="Usun obraz"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) =>
                      setImages(updateArrayItem(images, idx, { ...img, url: e.target.value }))
                    }
                    placeholder="URL obrazu..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) =>
                      setImages(updateArrayItem(images, idx, { ...img, alt: e.target.value }))
                    }
                    placeholder="Tekst alternatywny (alt)..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={img.caption || ''}
                    onChange={(e) =>
                      setImages(
                        updateArrayItem(images, idx, { ...img, caption: e.target.value }),
                      )
                    }
                    placeholder="Podpis (opcjonalnie)..."
                    className={inputClass}
                  />
                  {img.url && (
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full max-h-48 object-contain rounded-lg bg-gray-950 border border-white/5"
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setImages(addArrayItem(images, { url: '', alt: '' }))}
              className={smallBtnClass + ' mt-3'}
            >
              <Plus className="w-4 h-4" />
              Dodaj obraz
            </button>
          </SectionCard>

          {/* ── Prezentacja ── */}
          <SectionCard title="Prezentacja PDF" icon={<FileText className="w-4 h-4 text-cyan-400" />}>
            {pdfFilename && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                <a
                  href={presentationFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 text-sm font-medium hover:text-cyan-100 flex items-center gap-1 truncate"
                >
                  {pdfFilename}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <button
                  onClick={() => setPresentationFile('')}
                  className="ml-auto p-1 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  title="Usun plik"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Eksportuj prezentacje do PDF i wgraj ja tutaj (maks. 20MB)
              </p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setPdfFile(f);
                    setUploadError(null);
                  }}
                  className="flex-1 text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:text-gray-300 file:text-xs file:font-bold hover:file:bg-white/10 file:transition-colors cursor-pointer"
                />
                <button
                  onClick={handlePdfUpload}
                  disabled={!pdfFile || uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? 'Wysylanie...' : 'Wyslij'}
                </button>
              </div>
              {pdfFile && (
                <p className="text-xs text-gray-500">
                  Wybrany plik: <span className="text-gray-300">{pdfFile.name}</span>{' '}
                  ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
              {uploadError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {uploadError}
                </p>
              )}
            </div>
          </SectionCard>

          {/* ── Historia edycji ── */}
          {editHistory.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setHistoryOpen((o) => !o)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  Historia edycji ({editHistory.length})
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {historyOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-3 space-y-2">
                      {editHistory.slice(0, 5).map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-0.5 py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-500">
                              {new Date(entry.timestamp).toLocaleString('pl-PL', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                entry.editor === 'admin'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-cyan-500/20 text-cyan-400'
                              }`}
                            >
                              {entry.editor === 'admin' ? 'admin' : 'zespol'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-600">
                            Zmienione pola: {entry.fields.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Floating save bar ── */}
        <div className="fixed bottom-0 inset-x-0 z-50">
          <div className="bg-black/80 backdrop-blur-xl border-t border-white/10">
            <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between gap-4">
              {/* Toast area */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 text-sm text-red-400"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="ml-1 text-red-500 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 text-sm text-green-400"
                  >
                    <Check className="w-4 h-4" />
                    Zapisano pomyslnie
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
