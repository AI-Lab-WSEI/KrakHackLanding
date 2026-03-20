import { useState, useEffect } from 'react';
import { AdminAuth, getAdminToken } from './AdminAuth';
import { motion, AnimatePresence } from 'motion/react';
import ReactEcharts from 'echarts-for-react';
import {
  Users,
  ClipboardList,
  BarChart3,
  Search,
  MessageSquare,
  Star,
  RefreshCw,
  Mail,
  Send,
  Download,
  FileText,
  LayoutDashboard,
  Check,
  AlertCircle,
  Save
} from 'lucide-react';

interface Registration {
  id: string;
  name: string;
  email: string;
  type: 'participant' | 'mentor' | 'sponsor' | 'company';
  status: 'pending' | 'confirmed';
  date: string;
  created_at?: string;
  fullData: {
    teamName?: string;
    skills?: string[];
    [key: string]: any;
  };
}

interface ChallengeResources {
  materials?: string;
  task?: string;
}

interface SurveyData {
  id: string;
  created_at: string;
  data: {
    rating: number;
    pros: string;
    cons: string;
    challenge: string;
  };
}

async function apiFetch(path: string) {
  const token = getAdminToken();
  const res = await fetch(path, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.status === 401) {
    localStorage.removeItem('admin_api_token');
    window.dispatchEvent(new Event('admin-logout'));
    throw new Error('Sesja wygasła — zaloguj się ponownie');
  }
  if (!res.ok) throw new Error('Błąd API');
  return res.json();
}

export function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceLinks, setResourceLinks] = useState<Record<string, ChallengeResources>>({});
  const [activeTab, setActiveTab] = useState<'regs' | 'surveys' | 'teams' | 'participants' | 'mailing'>('regs');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mailing state
  const [mailSubject, setMailSubject] = useState('');
  const [mailHtml, setMailHtml] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailStatus, setMailStatus] = useState<{success: boolean, message: string} | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const EMAIL_TEMPLATES: Record<string, { subject: string, html: string }> = {
    PREP: {
      subject: 'Zestaw Startowy i Potwierdzenie Udziału - AI Krak Hack 2026',
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
  <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px;">Witaj na AI Krak Hack 2026!</h1>
  </div>
  <div style="padding: 30px 20px;">
    <p style="font-size: 16px; line-height: 1.6; font-weight: bold;">Z radością potwierdzamy przyjęcie Twojego zgłoszenia!</p>
    <p style="font-size: 16px; line-height: 1.6;">Bardzo się cieszymy, że dołączasz do grona uczestników. Nasz zespół intensywnie pracuje nad tym, aby tegoroczna edycja była dla Ciebie niezapomnianym doświadczeniem pełnym merytorycznych wyzwań.</p>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #06b6d4; padding: 20px; margin: 25px 0;">
      <p style="font-size: 15px; margin: 0; line-height: 1.5;">
        <strong>Wyrównanie szans:</strong> Przed ogłoszeniem finałowych zadań, przygotowaliśmy pakiety startowe. Znajdziesz w nich najważniejsze "highlighty" i informacje o tym, jak będą wyglądać wyzwania w poszczególnych kategoriach. Polecamy zapoznanie się z nimi wcześniej – pomoże to Twojemu zespołowi lepiej przygotować się do pracy.
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; text-align: center; font-weight: bold; margin-bottom: 20px;">Twój przewodnik po wyzwaniach:</p>
    
    <div style="margin: 30px 0;">
      <!-- Challenge 1 -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; color: #06b6d4;">1. Smart Infrastructure</p>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Dla osób zainteresowanych GIS, analizą danych przestrzennych i modelowaniem miast.</p>
        <div style="display: flex; gap: 10px;">
          <a href="{{challenge_1_url}}" style="background: #06b6d4; color: white; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Pobierz Zestaw Startowy</a>
          <a href="https://krakhack.info/infrasruktura" style="background: white; border: 1px solid #06b6d4; color: #06b6d4; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Szczegóły Wyzwania &rarr;</a>
        </div>
      </div>

      <!-- Challenge 2 -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
        <p style="margin: 0 0 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; color: #3b82f6;">2. Process Mining & Automation</p>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Dla fanów Process Mining, optymalizacji workflow i asystentów AI.</p>
        <div style="display: flex; gap: 10px;">
          <a href="{{challenge_2_url}}" style="background: #3b82f6; color: white; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Pobierz Zestaw Startowy</a>
          <a href="https://krakhack.info/asystent" style="background: white; border: 1px solid #3b82f6; color: #3b82f6; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Szczegóły Wyzwania &rarr;</a>
        </div>
      </div>
    </div>
    
    <p style="font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 25px; margin-top: 30px; text-align: center;">
      Powodzenia! Widzimy się już niebawem.<br>
      <strong>Zespół AI Krak Hack 2026</strong>
    </p>
  </div>
</div>
      `
    },
    START: {
      subject: 'STARTUJEMY! Wyzwania są już dostępne - AI Krak Hack 2026',
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
  <div style="background: linear-gradient(135deg, #22c55e, #10b981); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px;">CZAS START! 🚀</h1>
  </div>
  <div style="padding: 30px 20px;">
    <p style="font-size: 16px; line-height: 1.6; font-weight: bold;">Właśnie wystartowaliśmy!</p>
    <p style="font-size: 16px; line-height: 1.6;">Arkusze zadań oraz repozytoria dla wszystkich kategorii są już dostępne. Czas przełożyć pomysły na kod. Poniżej znajdziesz bezpośrednie linki do stron Twojego wyzwania:</p>
    
    <div style="margin: 30px 0;">
      <!-- Challenge 1 -->
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; color: #16a34a;">1. Smart Infrastructure</p>
        <div style="display: flex; gap: 10px;">
          <a href="{{challenge_1_task_url}}" style="background: #16a34a; color: white; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Pobierz Arkusz Zadania</a>
          <a href="https://krakhack.info/infrasruktura" style="background: white; border: 1px solid #16a34a; color: #16a34a; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Strona Konkursowa &rarr;</a>
        </div>
      </div>

      <!-- Challenge 2 -->
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 16px; padding: 20px;">
        <p style="margin: 0 0 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; color: #15803d;">2. Process Mining & Automation</p>
        <div style="display: flex; gap: 10px;">
          <a href="{{challenge_2_task_url}}" style="background: #15803d; color: white; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Pobierz Arkusz Zadania</a>
          <a href="https://krakhack.info/asystent" style="background: white; border: 1px solid #15803d; color: #15803d; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Strona Konkursowa &rarr;</a>
        </div>
      </div>
    </div>
    
    <p style="font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 25px; margin-top: 30px; text-align: center;">
      Powodzenia w kodowaniu! Nie puszczamy Waszej ręki – mentorzy są dostępni na Discordzie.<br>
      <strong>Zespół AI Krak Hack 2026</strong>
    </p>
  </div>
</div>
      `
    },
    SURVEY: {
      subject: 'Twoja opinia jest dla nas ważna - AI Krak Hack 2026',
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
  <h1 style="color: #06b6d4; margin-top: 0;">Dziękujemy za udział!</h1>
  <p style="font-size: 16px; line-height: 1.6;">Mamy nadzieję, że AI Krak Hack 2026 był dla Ciebie świetną przygodą.</p>
  <p style="font-size: 16px; line-height: 1.6;">Będziemy wdzięczni za podzielenie się opinią w krótkiej ankiecie satysfakcji.</p>
  <div style="margin: 40px 0; text-align: center;">
    <a href="https://krakhack.info/survey" style="background: #06b6d4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Wypełnij ankietę</a>
  </div>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 14px; color: #666;">Do zobaczenia za rok!<br>Zespół AI Krak Hack 2026</p>
</div>
      `
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [submissionsData, surveysData] = await Promise.all([
        apiFetch('/api/submissions'),
        apiFetch('/api/surveys')
      ]);

      const mappedRegs: Registration[] = submissionsData.map((s: any) => ({
        id: String(s.id),
        name: s.name || 'Nieznany',
        email: s.email || '',
        type: s.type,
        status: s.status === 'confirmed' ? 'confirmed' : 'pending',
        date: s.created_at ? s.created_at.split('T')[0] : '',
        created_at: s.created_at,
        fullData: s.data || {}
      }));
      setRegistrations(mappedRegs);
      setSurveys(surveysData);
      
      // Fetch resource links for challenges
      const res1 = await fetch('/api/config/challenge_resources');
      if (res1.ok) {
        const data = await res1.json();
        const formatted: Record<string, ChallengeResources> = {};
        if (data.geospatial) formatted.geospatial = data.geospatial;
        if (data['process-automation']) formatted['process-automation'] = data['process-automation'];
        setResourceLinks(formatted);
      }
    } catch (err: any) {
      setError(err.message || 'Błąd ładowania danych');
    } finally {
      setLoading(false);
    }
  }

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Błąd aktualizacji');
      
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
    } catch (err) {
      console.error(err);
      alert('Nie udało się zaktualizować statusu.');
    }
  };

  const exportCSV = (type: 'all' | 'teams' | 'certs') => {
    let headers = '';
    let rows: string[] = [];
    let fileName = '';

    if (type === 'all') {
      const allKeys = new Set<string>();
      registrations.forEach(r => Object.keys(r.fullData).forEach(k => allKeys.add(k)));
      const keys = ['id', 'name', 'email', 'type', 'status', 'date', ...Array.from(allKeys)];
      headers = keys.join(';');
      rows = registrations.map(r => keys.map(k => {
        const val = ['id', 'name', 'email', 'type', 'status', 'date'].includes(k) ? (r as any)[k] : r.fullData[k];
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(';'));
      fileName = 'wszyscy_uczestnicy.csv';
    } else if (type === 'teams') {
      headers = 'Team Name;Members;Emails';
      rows = Object.entries(teams).map(([name, members]) => {
        const names = members.map(m => m.name).join(', ');
        const emails = members.map(m => m.email).join(', ');
        return `"${name}";"${names}";"${emails}"`;
      });
      fileName = 'zespoly.csv';
    } else if (type === 'certs') {
      headers = 'First Name;Last Name;Email;Team';
      rows = registrations.filter(r => r.type === 'participant').map(r => {
        const parts = r.name.trim().split(/\s+/);
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ') || '';
        return `"${first}";"${last}";"${r.email}";"${r.fullData.teamName || ''}"`;
      });
      fileName = 'dane_do_certyfikatow.csv';
    }

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const copyEmailsForOutlook = () => {
    const emails = registrations.filter(r => r.email).map(r => r.email).join('; ');
    navigator.clipboard.writeText(emails);
    alert('Maile skopiowane do schowka (format: email; email; ...)');
  };

  const saveAllResourceLinks = async () => {
    try {
      const challenge_1 = { 
        name: 'Smart Infrastructure', 
        url: resourceLinks.geospatial?.materials || '',
        task_url: resourceLinks.geospatial?.task || ''
      };
      const challenge_2 = { 
        name: 'Process Mining', 
        url: resourceLinks['process-automation']?.materials || '',
        task_url: resourceLinks['process-automation']?.task || ''
      };

      const res = await fetch('/api/config/challenge_resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ value: { geospatial: resourceLinks.geospatial, 'process-automation': resourceLinks['process-automation'], challenge_1, challenge_2 } })
      });
      if (!res.ok) throw new Error('API Error');
      alert('Zapisano pomyślnie w bazie danych!');
    } catch (err) {
      console.error(err);
      alert('Błąd zapisu w bazie danych.');
    }
  };

  const updateResourceLink = (challengeId: string, type: 'materials' | 'task', url: string) => {
    setResourceLinks(prev => ({
      ...prev,
      [challengeId]: {
        ...prev[challengeId],
        [type]: url
      }
    }));
  };

  const applyTemplate = (key: string) => {
    const t = EMAIL_TEMPLATES[key];
    if (t) {
      setMailSubject(t.subject);
      setMailHtml(t.html);
      setSelectedTemplate(key);
    }
  };

  const sendMail = async (target: 'single' | 'all') => {
    if (target === 'all' && !confirm('CZY NA PEWNO chcesz wysłać ten e-mail do WSZYSTKICH uczestników?')) return;
    
    setIsSendingMail(true);
    setMailStatus(null);
    try {
      const res = await fetch('/api/admin/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          target,
          email: target === 'single' ? testEmail : undefined,
          subject: mailSubject,
          message: mailHtml
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMailStatus({ success: true, message: target === 'single' ? 'E-mail testowy wysłany!' : `Wysłano do ${data.sent} osób.` });
      } else {
        throw new Error(data.error || 'Błąd wysyłki');
      }
    } catch (err: any) {
      setMailStatus({ success: false, message: err.message });
    } finally {
      setIsSendingMail(false);
    }
  };

  const teams = registrations
    .filter(r => r.type === 'participant' && r.fullData?.teamName)
    .reduce((acc: Record<string, Registration[]>, reg) => {
      const team = reg.fullData.teamName as string;
      if (!acc[team]) acc[team] = [];
      acc[team].push(reg);
      return acc;
    }, {});

  const stats = [
    { title: 'Zespoły', value: Object.keys(teams).length, icon: Users, color: 'bg-indigo-500' },
    { title: 'Uczestnicy', value: registrations.filter(r => r.type === 'participant').length, icon: ClipboardList, color: 'bg-purple-500' },
    { title: 'Śr. Ocena', value: surveys.length > 0 ? (surveys.reduce((acc, s) => acc + s.data.rating, 0) / surveys.length).toFixed(1) : '-', icon: Star, color: 'bg-cyan-500' }
  ];

  const getChartOptions = () => {
    const ratings = [0, 0, 0, 0, 0];
    surveys.forEach(s => { if (s.data.rating >= 1 && s.data.rating <= 5) ratings[s.data.rating - 1]++; });
    return {
      tooltip: { trigger: 'item' },
      series: [{
        name: 'Ocena', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#1f2937', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold', color: '#fff' } },
        data: [
          { value: ratings[0], name: '1 Gwiazdka', itemStyle: { color: '#ef4444' } },
          { value: ratings[1], name: '2 Gwiazdki', itemStyle: { color: '#f97316' } },
          { value: ratings[2], name: '3 Gwiazdki', itemStyle: { color: '#eab308' } },
          { value: ratings[3], name: '4 Gwiazdki', itemStyle: { color: '#84cc16' } },
          { value: ratings[4], name: '5 Gwiazdek', itemStyle: { color: '#22c55e' } },
        ]
      }]
    };
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-cyan-500 font-black animate-pulse uppercase tracking-[0.3em]">Synchornizacja danych...</div>;

  return (
    <AdminAuth>
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 uppercase tracking-tighter italic">
            Admin / Control Center
          </h1>
          <p className="text-muted-foreground text-sm uppercase font-bold tracking-[0.3em]">AI KRAK HACK DASHBOARD</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-sm flex items-center justify-center gap-4">
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={fetchData} className="underline font-bold">Odśwież</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${stat.color} shadow-lg shadow-current/20`}><stat.icon className="w-8 h-8 text-white" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase mb-1 tracking-widest">{stat.title}</p>
                  <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'regs', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'participants', label: 'Dane Uczestników', icon: Users },
            { id: 'teams', label: 'Zespoły', icon: Users },
            { id: 'mailing', label: 'Mailing', icon: Mail },
            { id: 'surveys', label: 'Ankiety', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'regs' && (
            <motion.div key="regs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase italic flex items-center gap-3"><Users className="w-6 h-6 text-indigo-400" /> Baza Konta</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="SZUKAJ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold" />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase font-black text-muted-foreground">
                      <tr><th className="px-8 py-6">Uczestnik</th><th className="px-8 py-6">Typ</th><th className="px-8 py-6">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {registrations.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map(reg => (
                        <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-bold text-gray-200">{reg.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{reg.email}</div>
                          </td>
                          <td className="px-8 py-6 text-[10px] uppercase font-black">
                            <span className={reg.type === 'participant' ? 'text-indigo-400' : 'text-purple-400'}>{reg.type}</span>
                          </td>
                          <td className="px-8 py-6"><div className={`w-2 h-2 rounded-full ${reg.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'} shadow-[0_0_8px_currentcolor]`} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3"><ClipboardList className="w-6 h-6 text-cyan-400" /> Zadania</h2>
                {[
                  { id: 'geospatial', name: 'SMART INFRASTRUCTURE' },
                  { id: 'process-automation', name: 'PROCESS COPILOT' }
                ].map(c => (
                  <div key={c.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{c.name}</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Zestaw Startowy (Materials)</label>
                        <input type="text" placeholder="https://res.cloudinary.com/..." value={resourceLinks[c.id]?.materials || ''} onChange={e => updateResourceLink(c.id, 'materials', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold focus:border-cyan-500/50 outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Arkusz Zadania (Task PDF/Repo)</label>
                        <input type="text" placeholder="https://github.com/..." value={resourceLinks[c.id]?.task || ''} onChange={e => updateResourceLink(c.id, 'task', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold focus:border-indigo-500/50 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/10 flex justify-center">
                  <button 
                    onClick={saveAllResourceLinks}
                    className="group relative px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    Zapisz Linki
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'participants' && (
            <motion.div key="participants" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase italic flex items-center gap-4">
                  <Users className="w-8 h-8 text-indigo-400" /> Baza Zgłoszeń
                </h2>
                <div className="flex gap-3">
                   <select 
                    value={roleFilter} 
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 outline-none focus:ring-1 focus:ring-indigo-500"
                   >
                     <option value="all">WSZYSTKIE ROLE</option>
                     <option value="participant">UCZESTNICY</option>
                     <option value="mentor">MENTORZY</option>
                     <option value="company">PARTNERZY / FIRMY</option>
                   </select>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" placeholder="SZUKAJ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-black/20 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold" />
                   </div>
                </div>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => exportCSV('all')} className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/30">
                    <Download className="w-4 h-4" /> Eksportuj wszystkich
                 </button>
                 <button onClick={() => exportCSV('teams')} className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/30">
                    <Download className="w-4 h-4" /> Eksportuj zespoły
                 </button>
                 <button onClick={copyEmailsForOutlook} className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/30">
                    <Mail className="w-4 h-4" /> Kopiuj do Outlooka
                 </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 font-black uppercase tracking-widest text-muted-foreground">
                         <tr>
                            <th className="px-6 py-5">Osoba / Firma</th>
                            <th className="px-6 py-5">Typ</th>
                            <th className="px-6 py-5">Email</th>
                            <th className="px-6 py-5">Szczegóły</th>
                            <th className="px-6 py-5">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {registrations.filter(r => 
                            (roleFilter === 'all' || r.type === roleFilter) && 
                            (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()))
                         ).map(reg => (
                            <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                               <td className="px-6 py-4 font-bold text-gray-200">
                                 {reg.name}
                                 {reg.fullData?.teamName && <div className="text-[9px] text-cyan-400 mt-0.5">TEAM: {reg.fullData.teamName}</div>}
                               </td>
                               <td className="px-6 py-4">
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                   reg.type === 'participant' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                   reg.type === 'mentor' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                   'bg-green-500/10 border-green-500/30 text-green-400'
                                 }`}>
                                   {reg.type === 'company' ? 'Partner' : reg.type === 'mentor' ? 'Mentor' : 'Uczestnik'}
                                 </span>
                               </td>
                               <td className="px-6 py-4 font-mono text-gray-400 opacity-60">{reg.email}</td>
                               <td className="px-6 py-4 truncate max-w-[200px] text-[10px] text-gray-400">
                                 {reg.type === 'company' ? reg.fullData?.position : (reg.fullData?.university || '-')}
                               </td>
                               <td className="px-6 py-4">
                                 <button 
                                  onClick={() => updateSubmissionStatus(reg.id, reg.status === 'confirmed' ? 'pending' : 'confirmed')}
                                  className={`w-2 h-2 rounded-full cursor-pointer transition-all hover:scale-125 ${reg.status === 'confirmed' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`} 
                                 />
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'mailing' && (
            <motion.div key="mailing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto space-y-8">
               <div className="flex items-center gap-4 mb-2">
                 <Mail className="w-10 h-10 text-indigo-400" />
                 <div>
                   <h2 className="text-3xl font-black uppercase tracking-tighter italic">Sektor Mailingowy</h2>
                   <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">AUTOMATYZACJA KOMUNIKACJI</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'PREP', label: 'Zestaw Startowy', color: 'border-orange-500/30 text-orange-400' },
                    { id: 'START', label: 'Start Hackathonu', color: 'border-green-500/30 text-green-400' },
                    { id: 'SURVEY', label: 'Ankieta Końcowa', color: 'border-cyan-500/30 text-cyan-400' }
                  ].map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t.id)} className={`p-4 border rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedTemplate === t.id ? 'bg-white/10 ' + t.color : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t.label}
                    </button>
                  ))}
               </div>

               <div className="space-y-4 bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Temat wiadomości</label>
                    <input type="text" value={mailSubject} onChange={e => setMailSubject(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Temat..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Treść HTML (Podgląd poniżej)</label>
                    <textarea value={mailHtml} onChange={e => setMailHtml(e.target.value)} className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 font-mono text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none" placeholder="<div...>...</div>" />
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                       <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Email testowy..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold" />
                       <button onClick={() => sendMail('single')} disabled={isSendingMail || !testEmail} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
                          <Send className="w-3.5 h-3.5" /> Test
                       </button>
                    </div>
                    <button onClick={() => sendMail('all')} disabled={isSendingMail || !mailSubject} className="px-10 py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50">
                       <Mail className="w-4 h-4" /> WYŚLIJ DO WSZYSTKICH ({registrations.filter(r => r.type === 'participant').length})
                    </button>
                  </div>

                  {mailStatus && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${mailStatus.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                       {mailStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                       {mailStatus.message}
                    </motion.div>
                  )}
               </div>

               {mailHtml && (
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">PODGLĄD WIADOMOŚCI</p>
                    <div className="bg-white rounded-[2rem] p-8 shadow-2xl" dangerouslySetInnerHTML={{ __html: mailHtml }} />
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === 'teams' && (
            <motion.div key="teams" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(teams).map(([name, members]) => (
                  <div key={name} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-purple-500/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{name}</h3>
                      <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/20">{members.length}</span>
                    </div>
                    <div className="space-y-3">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                          <div className="text-sm font-bold text-gray-300">{m.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'surveys' && (
             <motion.div key="surveys" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-8 h-fit">
                  <h2 className="text-2xl font-black uppercase italic flex items-center gap-3"><BarChart3 className="w-6 h-6 text-cyan-400" /> Analiza Ocen</h2>
                  <div className="h-[350px]"><ReactEcharts option={getChartOptions()} style={{ height: '100%' }} /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Głosów</p>
                        <p className="text-2xl font-black">{surveys.length}</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Poleca</p>
                        <p className="text-2xl font-black">{Math.round((surveys.filter(s => s.data.rating >= 4).length / (surveys.length || 1)) * 100)}%</p>
                     </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {surveys.map(s => (
                    <div key={s.id} className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-all">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < s.data.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />)}
                        </div>
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{s.data.challenge}</span>
                      </div>
                      <p className="text-sm text-gray-300 italic group flex gap-3"><span className="text-indigo-400 text-xl font-black">"</span>{s.data.pros || s.data.cons}<span className="text-indigo-400 text-xl font-black self-end">"</span></p>
                      <div className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-4">
          <button onClick={() => exportCSV('all')} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-all">
            Eksportuj Wszystko (.CSV)
          </button>
        </div>
      </div>
    </AdminAuth>
  );
}
