import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Compass,
  BarChart3,
  Bot,
  Download,
  Copy,
  Send,
  Map,
} from 'lucide-react';
import { getAdminToken } from '@/lib/adminApi';
import { COMPETENCY_LABELS, STATUS_LABELS, ENGAGEMENT_TYPE_LABELS } from '@/types/membership';
import type { CompetencyProfile, ApplicationStatus, EngagementType } from '@/types/membership';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AppRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  university: string;
  field_of_study: string;
  year_or_status: string;
  is_wsei: boolean;
  monthly_hours: number;
  competencies: CompetencyProfile;
  engagement_types: string[];
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const COMPETENCY_KEYS = Object.keys(COMPETENCY_LABELS) as (keyof CompetencyProfile)[];
const STATUS_ORDER: ApplicationStatus[] = ['nowe', 'w_kontakcie', 'rozmowa_umówiona', 'przyjęty', 'odrzucony'];
const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  const { adminFetch } = await import('@/lib/adminApi');
  const res = await adminFetch(path, options);
  if (res.status === 401) throw new Error('Sesja wygasła');
  if (!res.ok) throw new Error('Błąd API');
  return res.json();
}

function avgCompetencies(apps: AppRow[]): CompetencyProfile {
  if (!apps.length) return { programming: 0, analytics: 0, softSkills: 0, organization: 0, creativity: 0, marketing: 0 };
  const sums = COMPETENCY_KEYS.reduce((acc, k) => { acc[k] = 0; return acc; }, {} as Record<keyof CompetencyProfile, number>);
  for (const app of apps) {
    for (const k of COMPETENCY_KEYS) {
      sums[k] += (app.competencies?.[k] ?? 5);
    }
  }
  return COMPETENCY_KEYS.reduce((acc, k) => {
    acc[k] = Math.round((sums[k] / apps.length) * 10) / 10;
    return acc;
  }, {} as CompetencyProfile);
}

function totalScore(c: CompetencyProfile): number {
  return COMPETENCY_KEYS.reduce((s, k) => s + (c?.[k] ?? 0), 0);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const bom = '\uFEFF';
  const lines = [headers.join(';'), ...rows.map(r => r.join(';'))];
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-tab: Mapa Pokrycia ───────────────────────────────────────────────────

function MapaPokrycia({ apps }: { apps: AppRow[] }) {
  const avg = avgCompetencies(apps);

  // Build recharts data: one entry per axis
  const axisData = COMPETENCY_KEYS.map((k) => ({
    subject: COMPETENCY_LABELS[k],
    avg: avg[k],
    fullMark: 10,
    ...apps.reduce((acc, app, i) => {
      acc[`p${i}`] = app.competencies?.[k] ?? 5;
      return acc;
    }, {} as Record<string, number>),
  }));

  const barData = COMPETENCY_KEYS.map((k) => ({
    name: COMPETENCY_LABELS[k].split(' ')[0],
    fullName: COMPETENCY_LABELS[k],
    avg: avg[k],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Overlay Radar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase text-gray-400 mb-1">Mapa nałożonych profili</h3>
          <p className="text-xs text-gray-600 mb-4">Ciemniejszy obszar = więcej kandydatów z tą kompetencją</p>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={axisData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#475569', fontSize: 9 }} />
              {/* Individual profiles at low opacity */}
              {apps.map((_, i) => (
                <Radar
                  key={`p${i}`}
                  name={`Kandydat ${i + 1}`}
                  dataKey={`p${i}`}
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={Math.max(0.02, Math.min(0.08, 4 / (apps.length || 1)))}
                  strokeOpacity={0.15}
                  strokeWidth={1}
                  dot={false}
                />
              ))}
              {/* Aggregate average on top */}
              <Radar
                name="Średnia"
                dataKey="avg"
                stroke="#f0f9ff"
                fill="#7dd3fc"
                fillOpacity={0.45}
                strokeWidth={2.5}
                dot={{ fill: '#38bdf8', r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-gray-500 mt-2">
            {apps.length} profil{apps.length === 1 ? '' : apps.length < 5 ? 'e' : 'i'} nałożonych · biała linia = średnia
          </p>
        </div>

        {/* Average bar chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Średnia siła kompetencji</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, _: string, props: any) => [v, props?.payload?.fullName || '']}
                labelFormatter={() => ''}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="avg" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={`hsl(${190 + i * 20}, 70%, ${30 + entry.avg * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Competency summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {COMPETENCY_KEYS.map((k, i) => {
          const val = avg[k];
          const pct = (val / 10) * 100;
          return (
            <div key={k} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1 leading-tight">{COMPETENCY_LABELS[k]}</div>
              <div className="text-2xl font-black" style={{ color: CHART_COLORS[i] }}>{val}</div>
              <div className="mt-1.5 w-full bg-white/5 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-tab: Analityka BI ────────────────────────────────────────────────────

function AnalitykaBI({ apps }: { apps: AppRow[] }) {
  // 1. Status funnel
  const statusData = STATUS_ORDER.map((s) => ({
    name: STATUS_LABELS[s].label,
    count: apps.filter((a) => a.status === s).length,
    fill: s === 'przyjęty' ? '#10b981' : s === 'odrzucony' ? '#ef4444' : s === 'rozmowa_umówiona' ? '#f59e0b' : s === 'w_kontakcie' ? '#06b6d4' : '#6b7280',
  }));

  // 2. WSEI vs External
  const wseiCount = apps.filter((a) => a.is_wsei).length;
  const extCount = apps.length - wseiCount;
  const wseiData = [
    { name: 'WSEI', value: wseiCount },
    { name: 'Zewnętrzni', value: extCount },
  ];

  // 3. Engagement types
  const engagementCounts: Record<string, number> = {};
  for (const app of apps) {
    for (const t of (app.engagement_types || [])) {
      engagementCounts[t] = (engagementCounts[t] || 0) + 1;
    }
  }
  const engagementData = Object.entries(ENGAGEMENT_TYPE_LABELS).map(([key, info]) => ({
    name: `${info.emoji} ${info.title.split(' ')[0]}`,
    fullName: info.title,
    count: engagementCounts[key] || 0,
  })).sort((a, b) => b.count - a.count);

  // 4. Hours histogram
  const hourBuckets = [
    { label: '< 5h', min: 0, max: 4 },
    { label: '5–10h', min: 5, max: 10 },
    { label: '11–20h', min: 11, max: 20 },
    { label: '> 20h', min: 21, max: Infinity },
  ];
  const hoursData = hourBuckets.map((b) => ({
    name: b.label,
    count: apps.filter((a) => (a.monthly_hours || 0) >= b.min && (a.monthly_hours || 0) <= b.max).length,
  }));

  // 5. Trend by week
  const weeklyMap: Record<string, number> = {};
  for (const app of apps) {
    const d = new Date(app.created_at);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    weeklyMap[key] = (weeklyMap[key] || 0) + 1;
  }
  const trendData = Object.entries(weeklyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week: week.slice(5), count }));

  // 6. Top 10 by total competency score
  const top10 = [...apps]
    .map((a) => ({ ...a, score: totalScore(a.competencies) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Stats
  const totalHours = apps.reduce((s, a) => s + (a.monthly_hours || 0), 0);
  const avgHours = apps.length ? Math.round(totalHours / apps.length) : 0;

  const tooltipStyle = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 };

  return (
    <div className="space-y-6">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Łączne zgłoszenia', value: apps.length, color: '#06b6d4' },
          { label: 'Przyjętych', value: apps.filter(a => a.status === 'przyjęty').length, color: '#10b981' },
          { label: 'Śr. godzin/mies.', value: `${avgHours}h`, color: '#8b5cf6' },
          { label: 'WSEI / Zewnętrzni', value: `${wseiCount} / ${extCount}`, color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status funnel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Lejek statusów</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* WSEI vs External */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">WSEI vs Zewnętrzni</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={wseiData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11} fill="#06b6d4">
                  {wseiData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#06b6d4' : '#8b5cf6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-sm text-gray-300">WSEI: <span className="text-white font-bold">{wseiCount}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-sm text-gray-300">Zewnętrzni: <span className="text-white font-bold">{extCount}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement types */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Typy zaangażowania</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engagementData} layout="vertical" margin={{ left: 8, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, _, p) => [v, p?.payload?.fullName || '']} labelFormatter={() => ''} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                {engagementData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hours histogram */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Deklarowane godziny/mies.</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hoursData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                {hoursData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${160 + i * 15}, 60%, ${35 + i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend line (full width) */}
      {trendData.length > 1 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Trend zgłoszeń (tygodniowo)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} name="Zgłoszenia" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 10 */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Top 10 kandydatów wg sumy kompetencji</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-white/8">
                <th className="text-left py-2 pr-4">#</th>
                <th className="text-left py-2 pr-4">Imię i nazwisko</th>
                <th className="text-left py-2 pr-4">Status</th>
                {COMPETENCY_KEYS.map((k) => (
                  <th key={k} className="text-center py-2 pr-2" title={COMPETENCY_LABELS[k]}>
                    {COMPETENCY_LABELS[k].split(' ')[0].slice(0, 4)}
                  </th>
                ))}
                <th className="text-right py-2">Suma</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((app, i) => {
                const sl = STATUS_LABELS[app.status];
                return (
                  <tr key={app.id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="py-2 pr-4 text-gray-500">{i + 1}</td>
                    <td className="py-2 pr-4 text-white">{app.first_name} {app.last_name}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sl.color} ${sl.textColor}`}>{sl.label}</span>
                    </td>
                    {COMPETENCY_KEYS.map((k) => (
                      <td key={k} className="text-center py-2 pr-2 font-mono text-xs" style={{ color: (app.competencies?.[k] ?? 0) >= 8 ? '#10b981' : (app.competencies?.[k] ?? 0) >= 5 ? '#94a3b8' : '#6b7280' }}>
                        {app.competencies?.[k] ?? '–'}
                      </td>
                    ))}
                    <td className="text-right py-2 font-bold text-cyan-400">{app.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-tab: AI Rozmowa ──────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  'Które kompetencje są najmniej pokryte w obecnym pipeline kandydatów?',
  'Rekomenduj top 5 kandydatów do przyjęcia i uzasadnij wybór.',
  'Jakie jest ryzyko w obecnym pipeline? Co może zawieść?',
  'Oceń różnorodność kompetencji i wskaż luki do uzupełnienia.',
  'Ile potencjalnych godzin zaangażowania mamy łącznie w pipeline?',
];

function buildContext(apps: AppRow[]): string {
  const avg = avgCompetencies(apps);
  const statusCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const engCounts: Record<string, number> = {};
  for (const app of apps) {
    for (const t of (app.engagement_types || [])) {
      engCounts[t] = (engCounts[t] || 0) + 1;
    }
  }

  const anonymized = apps.map((app, i) => ({
    id: `Kandydat #${i + 1}`,
    university: app.is_wsei ? 'WSEI' : 'Zewnętrzny',
    year: app.year_or_status,
    hours: app.monthly_hours,
    status: STATUS_LABELS[app.status]?.label,
    engagements: (app.engagement_types || []).map(t => ENGAGEMENT_TYPE_LABELS[t as EngagementType]?.title || t),
    competencies: COMPETENCY_KEYS.reduce((acc, k) => {
      acc[COMPETENCY_LABELS[k]] = app.competencies?.[k] ?? 5;
      return acc;
    }, {} as Record<string, number>),
    score: totalScore(app.competencies),
  }));

  return JSON.stringify({
    summary: {
      total: apps.length,
      statusDistribution: statusCounts,
      wseiCount: apps.filter(a => a.is_wsei).length,
      externalCount: apps.filter(a => !a.is_wsei).length,
      avgMonthlyHours: Math.round(apps.reduce((s, a) => s + (a.monthly_hours || 0), 0) / (apps.length || 1)),
      totalCapacityHours: apps.filter(a => a.status !== 'odrzucony').reduce((s, a) => s + (a.monthly_hours || 0), 0),
      avgCompetencies: COMPETENCY_KEYS.reduce((acc, k) => { acc[COMPETENCY_LABELS[k]] = avg[k]; return acc; }, {} as Record<string, number>),
      engagementDistribution: Object.fromEntries(Object.entries(engCounts).map(([k, v]) => [ENGAGEMENT_TYPE_LABELS[k as EngagementType]?.title || k, v])),
    },
    candidates: anonymized,
  }, null, 2);
}

function AIRozmowa({ apps }: { apps: AppRow[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput('');
    setError('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const context = buildContext(apps);
      const data = await apiFetch(`${apiBase}/api/ai/compass`, {
        method: 'POST',
        body: JSON.stringify({ question, context, history: messages.slice(-6) }),
      });
      setMessages([...newMessages, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase text-gray-400">AI Asystent HR</h3>
          <span className="ml-auto text-xs text-gray-600 bg-white/5 px-2 py-1 rounded-full">Grok / DataBees</span>
        </div>
        <p className="text-xs text-gray-600">Zadaj pytanie o kandydatów do koła. Dane są zanonimizowane — AI nie widzi imion ani maili.</p>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={loading}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/30 transition-all text-left disabled:opacity-40"
          >
            {p.length > 60 ? p.slice(0, 58) + '…' : p}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="bg-white/3 border border-white/8 rounded-2xl min-h-[300px] max-h-[450px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[260px] text-gray-600 text-sm">
            Wybierz pytanie powyżej lub napisz własne...
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-500/20 text-white border border-cyan-500/30'
                  : 'bg-white/8 text-gray-200 border border-white/10'
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 bg-white/8 border border-white/10 rounded-2xl text-sm text-gray-400">
              <span className="animate-pulse">Analizuję dane kandydatów…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Zadaj pytanie o kandydatów..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Sub-tab: Eksport Zbiorczy ────────────────────────────────────────────────

function EksportZbiorczy({ apps }: { apps: AppRow[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const doCopy = (key: string, text: string) => {
    copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const emails = apps.map(a => a.email).filter(Boolean).join(', ');
  const names = apps.map(a => `${a.first_name} ${a.last_name}`).join(', ');
  const activeApps = apps.filter(a => a.status !== 'odrzucony');

  const totalHours = activeApps.reduce((s, a) => s + (a.monthly_hours || 0), 0);
  const avgHours = activeApps.length ? Math.round(totalHours / activeApps.length) : 0;
  const sortedHours = [...activeApps].map(a => a.monthly_hours || 0).sort((a, b) => a - b);
  const medianHours = sortedHours.length ? sortedHours[Math.floor(sortedHours.length / 2)] : 0;

  const CopyBtn = ({ label, copyKey, text }: { label: string; copyKey: string; text: string }) => (
    <button
      onClick={() => doCopy(copyKey, text)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
        copied === copyKey
          ? 'bg-green-500/20 border-green-500/40 text-green-400'
          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Copy className="w-4 h-4" />
      {copied === copyKey ? 'Skopiowano!' : label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Zgłoszeń łącznie', value: apps.length, color: '#06b6d4' },
          { label: 'Aktywnych (nie odrzuceni)', value: activeApps.length, color: '#10b981' },
          { label: 'Suma godzin/mies.', value: `${totalHours}h`, color: '#8b5cf6' },
          { label: 'Śr. / Med. godzin', value: `${avgHours}h / ${medianHours}h`, color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Copy actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Kopiuj do schowka</h3>
        <div className="flex flex-wrap gap-3">
          <CopyBtn label="Wszystkie e-maile" copyKey="emails" text={emails} />
          <CopyBtn label="Imiona i nazwiska" copyKey="names" text={names} />
          <CopyBtn label="E-maile aktywnych" copyKey="activeEmails" text={activeApps.map(a => a.email).join(', ')} />
          <CopyBtn label="E-maile przyjętych" copyKey="acceptedEmails"
            text={apps.filter(a => a.status === 'przyjęty').map(a => a.email).join(', ')} />
        </div>
      </div>

      {/* Download CSVs */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Pobierz CSV</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadCSV(
              `aplikacje_pelne_${new Date().toISOString().slice(0, 10)}.csv`,
              ['id', 'imię', 'nazwisko', 'email', 'uczelnia', 'kierunek', 'rok', 'wsei', 'godziny', 'typy_zaangazowania', 'status', 'data', 'programowanie', 'analityka', 'soft_skills', 'organizacja', 'kreatywnosc', 'marketing'],
              apps.map(a => [
                a.id, `"${a.first_name}"`, `"${a.last_name}"`, `"${a.email}"`,
                `"${a.university || ''}"`, `"${a.field_of_study || ''}"`, `"${a.year_or_status || ''}"`,
                a.is_wsei ? 'TAK' : 'NIE', a.monthly_hours ?? 0,
                `"${(a.engagement_types || []).join(', ')}"`, a.status,
                new Date(a.created_at).toLocaleDateString('pl-PL'),
                a.competencies?.programming ?? '', a.competencies?.analytics ?? '',
                a.competencies?.softSkills ?? '', a.competencies?.organization ?? '',
                a.competencies?.creativity ?? '', a.competencies?.marketing ?? '',
              ])
            )}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Pełny CSV
          </button>

          <button
            onClick={() => downloadCSV(
              `kompetencje_${new Date().toISOString().slice(0, 10)}.csv`,
              ['id', 'imię', 'nazwisko', 'status', 'programowanie', 'analityka', 'soft_skills', 'organizacja', 'kreatywnosc', 'marketing', 'suma'],
              apps.map(a => [
                a.id, `"${a.first_name}"`, `"${a.last_name}"`, a.status,
                a.competencies?.programming ?? '', a.competencies?.analytics ?? '',
                a.competencies?.softSkills ?? '', a.competencies?.organization ?? '',
                a.competencies?.creativity ?? '', a.competencies?.marketing ?? '',
                totalScore(a.competencies),
              ])
            )}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            CSV Kompetencji
          </button>

          <button
            onClick={() => downloadCSV(
              `mailing_${new Date().toISOString().slice(0, 10)}.csv`,
              ['id', 'imię', 'email', 'status'],
              apps.map(a => [a.id, `"${a.first_name}"`, `"${a.email}"`, a.status])
            )}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            CSV do mailingu
          </button>

          <button
            onClick={() => downloadCSV(
              `godziny_${new Date().toISOString().slice(0, 10)}.csv`,
              ['id', 'imię', 'nazwisko', 'status', 'godziny_miesiecznie', 'typy_zaangazowania'],
              activeApps.map(a => [
                a.id, `"${a.first_name}"`, `"${a.last_name}"`, a.status,
                a.monthly_hours ?? 0, `"${(a.engagement_types || []).join(', ')}"`,
              ])
            )}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            CSV Godzin i zaangażowania
          </button>
        </div>
      </div>

      {/* Hours distribution preview */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">Rozkład godzin (aktywni kandydaci)</h3>
        <div className="space-y-2">
          {activeApps.sort((a, b) => b.monthly_hours - a.monthly_hours).slice(0, 15).map((app) => (
            <div key={app.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-32 truncate">{app.first_name} {app.last_name}</span>
              <div className="flex-1 bg-white/5 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${Math.min(100, (app.monthly_hours / 40) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-cyan-400 w-8 text-right">{app.monthly_hours}h</span>
            </div>
          ))}
          {activeApps.length > 15 && (
            <p className="text-xs text-gray-600 text-center pt-2">+ {activeApps.length - 15} więcej…</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main: CompetencyCompass ──────────────────────────────────────────────────

type CompassTab = 'mapa' | 'bi' | 'ai' | 'eksport';

interface CompassTabDef {
  id: CompassTab;
  label: string;
  icon: React.ElementType;
}

const COMPASS_TABS: CompassTabDef[] = [
  { id: 'mapa', label: 'Mapa Pokrycia', icon: Map },
  { id: 'bi', label: 'Analityka BI', icon: BarChart3 },
  { id: 'ai', label: 'AI Rozmowa', icon: Bot },
  { id: 'eksport', label: 'Eksport Zbiorczy', icon: Download },
];

export function CompetencyCompass() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<CompassTab>('mapa');
  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';

  useEffect(() => {
    setLoading(true);
    apiFetch(`${apiBase}/api/membership-applications?limit=500`)
      .then((data) => setApps(data.applications || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div key="kompas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Compass className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-black uppercase italic">Kompas Kompetencji</h2>
            <p className="text-xs text-gray-500 mt-0.5">TalentHub BI · {apps.length} kandydatów załadowanych</p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex gap-1 bg-white/3 border border-white/8 rounded-xl p-1 mb-6 w-fit">
          {COMPASS_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">Ładowanie danych kandydatów…</div>
        ) : (
          <>
            {activeTab === 'mapa' && <MapaPokrycia apps={apps} />}
            {activeTab === 'bi' && <AnalitykaBI apps={apps} />}
            {activeTab === 'ai' && <AIRozmowa apps={apps} />}
            {activeTab === 'eksport' && <EksportZbiorczy apps={apps} />}
          </>
        )}
      </div>
    </motion.div>
  );
}
