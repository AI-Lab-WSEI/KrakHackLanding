import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';

export interface EmailPreviewModalProps {
  open: boolean;
  subject: string;
  previewHtml: string;
  previewLabel: string;
  sendAllLabel: string;
  onClose: () => void;
  onSendTest: (email: string) => Promise<{ success: boolean; message: string }>;
  onSendAll: () => Promise<{ sent: number; failed: number; details?: unknown[] }>;
}

export function EmailPreviewModal({
  open,
  subject,
  previewHtml,
  previewLabel,
  sendAllLabel,
  onClose,
  onSendTest,
  onSendAll,
}: EmailPreviewModalProps) {
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [confirmSendAll, setConfirmSendAll] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [sendAllResult, setSendAllResult] = useState<{ sent: number; failed: number; details?: unknown[] } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setTestEmail('');
      setTestStatus(null);
      setConfirmSendAll(false);
      setSendAllResult(null);
    }
  }, [open]);

  const handleSendTest = async () => {
    if (!testEmail.trim()) return;
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const result = await onSendTest(testEmail.trim());
      setTestStatus(result);
    } catch {
      setTestStatus({ success: false, message: 'Błąd wysyłki testowej' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendAll = async () => {
    if (!confirmSendAll) {
      setConfirmSendAll(true);
      return;
    }
    setIsSendingAll(true);
    try {
      const result = await onSendAll();
      setSendAllResult(result);
      setConfirmSendAll(false);
    } catch {
      setTestStatus({ success: false, message: 'Błąd zbiorczej wysyłki' });
      setConfirmSendAll(false);
    } finally {
      setIsSendingAll(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-stretch"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-2/5 bg-gray-900 border-r border-white/10 flex flex-col overflow-y-auto shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-black uppercase italic tracking-wide text-white">
                Podgląd e-maila
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              aria-label="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-5 p-6 flex-1">
            {/* Subject */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Temat</p>
              <p className="text-sm font-bold text-white bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                {subject}
              </p>
            </div>

            {/* Preview context */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Podgląd dla</p>
              <p className="text-sm text-cyan-400 font-bold">{previewLabel}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Test send */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                Wyślij testowego maila
              </p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendTest(); }}
                  placeholder="adres@email.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handleSendTest}
                  disabled={isSendingTest || !testEmail.trim()}
                  className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl text-xs font-black flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isSendingTest
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Send className="w-3.5 h-3.5" />}
                  Wyślij test
                </button>
              </div>

              {/* Test feedback */}
              {testStatus && (
                <div className={`mt-2 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl ${
                  testStatus.success
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {testStatus.success
                    ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  {testStatus.message}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Send all / result */}
            {sendAllResult ? (
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                  <p className="text-sm font-black text-green-400 mb-1">Wysyłka zakończona</p>
                  <p className="text-xs text-gray-300">
                    Wysłano: <span className="text-green-400 font-bold">{sendAllResult.sent}</span>
                    {sendAllResult.failed > 0 && (
                      <span className="ml-3 text-red-400 font-bold">Błędy: {sendAllResult.failed}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-black transition-all"
                >
                  Zamknij
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleSendAll}
                  disabled={isSendingAll}
                  className={`w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    confirmSendAll
                      ? 'bg-red-500/30 hover:bg-red-500/40 text-red-300 border border-red-500/30'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20'
                  }`}
                >
                  {isSendingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : confirmSendAll ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Potwierdź: {sendAllLabel}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      {sendAllLabel}
                    </>
                  )}
                </button>
                {confirmSendAll && (
                  <p className="text-[11px] text-gray-500 text-center">
                    Kliknij ponownie aby potwierdzić zbiorczą wysyłkę
                  </p>
                )}
                <button
                  onClick={() => { setConfirmSendAll(false); onClose(); }}
                  disabled={isSendingAll}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Anuluj
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — email preview */}
        <div className="flex-1 flex flex-col bg-black min-h-0">
          <div className="px-6 py-4 border-b border-white/10 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Podgląd e-maila</p>
          </div>
          <div className="flex-1 p-4 min-h-0">
            <iframe
              srcDoc={previewHtml}
              title="Email preview"
              sandbox="allow-same-origin"
              className="w-full h-full min-h-[500px] rounded-xl border border-white/10 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
