/**
 * ContextSwitcher — segmented control u góry sidebara panelu administracyjnego.
 *
 * Trzy konteksty:
 *   • krakhack  — edycje, rejestracje, zespoły, projekty, wyniki, certyfikaty, obecność, galeria
 *   • lab       — aplikacje do koła, kompas, współprace, zapytania, organizacja
 *   • system    — użytkownicy, team claims, wydarzenia, mailing, ankiety
 *
 * Ctx zapisany w URL search param `?ctx=...`. Zmiana buttona aktualizuje URL
 * przez navigate({ replace: true }) — historia przeglądarki nie rośnie.
 *
 * Widoczny tylko dla userów z dostępem do sekcji admin/moderator.
 */
import { useLocation, useNavigate } from 'react-router';
import { Rocket, Beaker, Settings2 } from 'lucide-react';

export type PanelCtx = 'krakhack' | 'lab' | 'system';

export const CTX_KEY = 'ctx';

interface CtxDef {
  id: PanelCtx;
  label: string;
  icon: typeof Rocket;
  activeCls: string;
}

const CONTEXTS: CtxDef[] = [
  { id: 'krakhack', label: 'Krak Hack', icon: Rocket,     activeCls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'lab',      label: 'AI Lab',    icon: Beaker,     activeCls: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'system',   label: 'System',    icon: Settings2,  activeCls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
];

/** Zwraca aktualny ctx z URL search param, default = 'krakhack'. */
export function readCtx(search: string): PanelCtx {
  const raw = new URLSearchParams(search).get(CTX_KEY);
  if (raw === 'lab' || raw === 'system' || raw === 'krakhack') return raw;
  return 'krakhack';
}

export function ContextSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const current  = readCtx(location.search);

  function change(ctx: PanelCtx) {
    const next = new URLSearchParams(location.search);
    next.set(CTX_KEY, ctx);
    // Przy przełączeniu kontekstu — kasujemy ?edition (żeby nie propagować
    // edycji KrakHack do Lab itp.), ale zachowujemy inne query params.
    if (ctx !== 'krakhack') next.delete('edition');
    navigate(`/panel?${next.toString()}`, { replace: true });
  }

  return (
    <div className="px-3 mb-4">
      <p className="text-[10px] font-medium text-gray-600 uppercase tracking-widest mb-2">
        Kontekst
      </p>
      <div className="grid grid-cols-3 gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
        {CONTEXTS.map(c => {
          const active = current === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => change(c.id)}
              className={`flex flex-col items-center gap-1 py-2 rounded-md text-[10px] font-medium transition-colors ${
                active
                  ? `${c.activeCls} border`
                  : 'text-gray-500 border border-transparent hover:text-white hover:bg-white/5'
              }`}
              title={c.label}
            >
              <c.icon className="w-4 h-4" />
              <span className="truncate w-full text-center">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
