import { useState, useEffect } from 'react';
import { AdminAuth } from './AdminAuth';
import { motion } from 'motion/react';
import ReactEcharts from 'echarts-for-react';
import { 
  Users, 
  ClipboardList, 
  BarChart3, 
  Search,
  MessageSquare,
  Star
} from 'lucide-react';

interface TaskLink {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  type: 'participant' | 'mentor' | 'sponsor';
  status: 'pending' | 'confirmed';
  date: string;
  fullData: {
    teamName?: string;
    [key: string]: any;
  };
}

interface ChallengeResources {
  materials?: string;
  task?: string;
}

interface SurveyData {
  id: string;
  timestamp: string;
  data: {
    rating: number;
    pros: string;
    cons: string;
    challenge: string;
  };
}

const STORAGE_KEYS = {
  REGS: 'admin-registrations-v1',
  CHALLENGE_RESOURCES: 'challenge-resources-v1',
  SURVEYS: 'hackathon_surveys'
};

export function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceLinks, setResourceLinks] = useState<Record<string, ChallengeResources>>({});
  const [activeTab, setActiveTab] = useState<'regs' | 'surveys' | 'teams'>('regs');

  const handleResetData = () => {
    if (window.confirm('CZY NA PEWNO CHCESZ USUNĄĆ WSZYSTKIE DANE? Tej operacji nie można cofnąć.')) {
      localStorage.removeItem('hackathon_submissions');
      localStorage.removeItem(STORAGE_KEYS.SURVEYS);
      setRegistrations([]);
      setSurveys([]);
      alert('Wszystkie dane zostały usunięte.');
    }
  };

  // Load data
  useEffect(() => {
    const storedSubmissions = localStorage.getItem('hackathon_submissions');
    const storedResources = localStorage.getItem(STORAGE_KEYS.CHALLENGE_RESOURCES);
    const storedSurveys = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    
    if (storedResources) setResourceLinks(JSON.parse(storedResources));

    if (storedSubmissions) {
      try {
        const rawSubmissions = JSON.parse(storedSubmissions);
        const mappedRegs: Registration[] = rawSubmissions.map((s: any) => ({
          id: s.id,
          name: `${s.data.firstName || ''} ${s.data.lastName || s.data.companyName || ''}`.trim(),
          email: s.data.email,
          type: s.type === 'company' ? 'sponsor' : s.type,
          status: s.status === 'new' ? 'pending' : 'confirmed',
          date: s.timestamp.split('T')[0],
          fullData: s.data
        }));
        setRegistrations(mappedRegs);
      } catch (e) {
        console.error('Error parsing submissions:', e);
      }
    }

    if (storedSurveys) setSurveys(JSON.parse(storedSurveys));
  }, []);

  const teams = registrations
    .filter(r => r.type === 'participant' && r.fullData && r.fullData.teamName)
    .reduce((acc: Record<string, Registration[]>, reg) => {
      const team = reg.fullData.teamName as string;
      if (!acc[team]) acc[team] = [];
      acc[team].push(reg);
      return acc;
    }, {});

  const stats = [
    {
      title: 'Zespoły',
      value: Object.keys(teams).length,
      icon: Users,
      color: 'bg-indigo-500'
    },
    {
      title: 'Uczestnicy',
      value: registrations.filter(r => r.type === 'participant').length,
      icon: ClipboardList,
      color: 'bg-purple-500'
    },
    {
      title: 'Śr. Ocena',
      value: surveys.length > 0 ? (surveys.reduce((acc, s) => acc + s.data.rating, 0) / surveys.length).toFixed(1) : '-',
      icon: Star,
      color: 'bg-cyan-500'
    }
  ];

  const getChartOptions = () => {
    const ratings = [0, 0, 0, 0, 0];
    surveys.forEach(s => {
      if (s.data.rating >= 1 && s.data.rating <= 5) {
        ratings[s.data.rating - 1]++;
      }
    });

    return {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: 'Ocena',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#1f2937',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          labelLine: { show: false },
          data: [
            { value: ratings[0], name: '1 Gwiazdka', itemStyle: { color: '#ef4444' } },
            { value: ratings[1], name: '2 Gwiazdki', itemStyle: { color: '#f97316' } },
            { value: ratings[2], name: '3 Gwiazdki', itemStyle: { color: '#eab308' } },
            { value: ratings[3], name: '4 Gwiazdki', itemStyle: { color: '#84cc16' } },
            { value: ratings[4], name: '5 Gwiazdek', itemStyle: { color: '#22c55e' } },
          ]
        }
      ]
    };
  };

  const saveResourceLink = (challengeId: string, type: 'materials' | 'task', url: string) => {
    const newResources = {
      ...resourceLinks,
      [challengeId]: {
        ...(resourceLinks[challengeId] || {}),
        [type]: url
      }
    };
    setResourceLinks(newResources);
    localStorage.setItem(STORAGE_KEYS.CHALLENGE_RESOURCES, JSON.stringify(newResources));
  };

  const exportData = (format: 'csv' | 'json') => {
    const dataToExport = activeTab === 'regs' ? registrations : activeTab === 'surveys' ? surveys : Object.values(teams).flat();
    if (dataToExport.length === 0) return;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hackathon_${activeTab}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      if (activeTab === 'regs' || activeTab === 'teams') {
        const allKeys = new Set<string>();
        registrations.forEach(r => {
          Object.keys(r.fullData).forEach(k => allKeys.add(k));
        });
        const keys = ['type', 'status', 'date', ...Array.from(allKeys)];
        const headers = keys.join(',');
        const rows = registrations.map(r => {
          return keys.map(k => {
            const val = k === 'type' || k === 'status' || k === 'date' ? r[k as keyof Registration] : r.fullData[k];
            const stringVal = Array.isArray(val) ? val.join('; ') : String(val || '');
            return `"${stringVal.replace(/"/g, '""')}"`;
          }).join(',');
        });
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hackathon_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    }
  };

  return (
    <AdminAuth>
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 uppercase tracking-tighter italic">
            Admin / Control Center
          </h1>
          <p className="text-muted-foreground text-sm uppercase font-bold tracking-[0.3em]">AI KRAK HACK DASHBOARD</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl"
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${stat.color} shadow-lg shadow-current/20`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{stat.title}</p>
                  <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs Selector */}
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => setActiveTab('regs')}
            className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'regs' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
          >
            Rejestracje
          </button>
          <button 
            onClick={() => setActiveTab('teams')}
            className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
          >
            Zespoły
          </button>
          <button 
            onClick={() => setActiveTab('surveys')}
            className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'surveys' ? 'bg-cyan-500 text-black shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
          >
            Ankiety ({surveys.length})
          </button>
        </div>

        {activeTab === 'regs' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ... Regs View ... */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase italic italic flex items-center gap-3">
                  <Users className="w-6 h-6 text-indigo-400" /> Baza Rejestracji
                </h2>
                <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="SZUKAJ..." 
                    className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3 rounded-2xl focus:ring-1 focus:ring-indigo-500/50 text-xs font-bold transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase font-black text-muted-foreground">
                      <tr>
                        <th className="px-8 py-6">Uczestnik</th>
                        <th className="px-8 py-6">Typ</th>
                        <th className="px-8 py-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {registrations
                        .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((reg) => (
                        <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="font-bold text-gray-200">{reg.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{reg.email}</div>
                          </td>
                          <td className="px-8 py-6 text-[10px] uppercase font-black">
                            <span className={reg.type === 'participant' ? 'text-indigo-400' : reg.type === 'mentor' ? 'text-purple-400' : 'text-pink-400'}>
                              {reg.type}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`w-2.5 h-2.5 rounded-full ${reg.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'} shadow-[0_0_10px_currentcolor] animate-pulse`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-purple-400" /> Zadania 2026
                </h2>
                <div className="space-y-6">
                  {[
                    { id: 'geospatial', name: 'SMART INFRASTRUCTURE' },
                    { id: 'process-automation', name: 'PROCESS COPILOT' }
                  ].map((c) => (
                    <div key={c.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                      <p className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.2em]">{c.name}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Materiały przygotowawcze</label>
                          <input 
                            type="text" 
                            placeholder="Link do materiałów STARTOWYCH..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all mt-1"
                            value={resourceLinks[c.id]?.materials || ''}
                            onChange={(e) => saveResourceLink(c.id, 'materials', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Zadanie (Repo/Zasoby)</label>
                          <input 
                            type="text" 
                            placeholder="Link do repo/arkusza ZADANIA..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all mt-1"
                            value={resourceLinks[c.id]?.task || ''}
                            onChange={(e) => saveResourceLink(c.id, 'task', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'teams' ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-400" /> Zarządzanie Zespołami
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(teams).map(([teamName, members]) => (
                <div key={teamName} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-white uppercase tracking-wider">{teamName}</h3>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/20">
                      {members.length} {members.length === 1 ? 'OSZ' : 'OSOBY'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {members.map(m => (
                      <div key={m.id} className="text-xs text-gray-400 font-medium flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-500 rounded-full" />
                        {m.name}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 flex gap-2">
                     <span className="text-[8px] font-black text-gray-600 uppercase">Tagi techniczne:</span>
                     <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(members.flatMap(m => m.fullData.skills || []))).slice(0, 3).map(s => (
                          <span key={s} className="text-[7px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400">#{s}</span>
                        ))}
                     </div>
                  </div>
                </div>
              ))}
              {Object.keys(teams).length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500 italic">Brak zarejestrowanych zespołów.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-8">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-cyan-400" /> Analiza Ocen
              </h2>
              {surveys.length > 0 ? (
                <div className="h-[300px]">
                  <ReactEcharts option={getChartOptions()} style={{ height: '100%', width: '100%' }} />
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground italic text-sm">Brak danych do wyświetlenia.</div>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-pink-400" /> Feedback Uczestników
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                {surveys.map((s) => (
                  <div key={s.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < s.data.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">{s.data.challenge}</span>
                    </div>
                    {s.data.pros && (
                      <p className="text-xs text-green-400 bg-green-400/5 p-3 rounded-xl border border-green-400/10 italic">
                        "+ {s.data.pros}"
                      </p>
                    )}
                    {s.data.cons && (
                      <p className="text-xs text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/10 italic">
                        "- {s.data.cons}"
                      </p>
                    )}
                  </div>
                ))}
                {surveys.length === 0 && <p className="text-center py-12 text-muted-foreground italic text-sm">Brak ankiet.</p>}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => exportData('csv')}
            className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            Eksportuj Dane (.CSV)
          </button>
        </div>
      </div>
    </AdminAuth>
  );
}