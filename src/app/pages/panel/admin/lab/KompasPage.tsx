/**
 * /panel/admin/lab/kompas — Kompas kompetencji (standalone).
 *
 * CompetencyCompass sam pobiera dane (applications z membership). Ma 3 taby:
 *   • Mapa Pokrycia — radar kompetencji wszystkich aplikantów
 *   • Analityka BI — funnel statusów, histogramy, top 10, split WSEI
 *   • AI Rozmowa — chat z LLM (endpoint /api/ai/compass) o zanonimizowanych
 *                  kandydatach; QUICK_PROMPTS do szybkich pytań
 *   • Eksport Zbiorczy — 4 CSV-y (pełny, kompetencje, mailing, godziny)
 *
 * Widoczne: admin, ctx=lab.
 */
import { CompetencyCompass } from '@/app/components/membership/CompetencyCompass';

export function AdminKompasPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <CompetencyCompass />
    </div>
  );
}
