import { useState, useEffect } from 'react';
import { AdminAuth } from './AdminAuth';
import { motion } from 'motion/react';
import { 
  Users, 
  ClipboardList, 
  Download, 
  BarChart3, 
  FileText, 
  Plus,
  Trash2,
  ExternalLink,
  Search
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
  fullData: any;
}

const STORAGE_KEYS = {
  TASKS: 'admin-tasks-v1',
  REGS: 'admin-registrations-v1',
  CHALLENGE_LINKS: 'challenge-external-links-v1'
};

export function AdminDashboard() {
  const [tasks, setTasks] = useState<TaskLink[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [challengeLinks, setChallengeLinks] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const storedSubmissions = localStorage.getItem('hackathon_submissions');
    const storedLinks = localStorage.getItem(STORAGE_KEYS.CHALLENGE_LINKS);
    
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    else {
      const initialTasks = [
        { id: '1', name: 'Zadanie: Optymalizacja Tramwajów', url: 'https://github.com/example/tram-opt', active: true }
      ];
      setTasks(initialTasks);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
    }

    if (storedLinks) setChallengeLinks(JSON.parse(storedLinks));

    if (storedSubmissions) {
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
    }
  }, []);

  const saveChallengeLink = (id: string, url: string) => {
    const newLinks = { ...challengeLinks, [id]: url };
    setChallengeLinks(newLinks);
    localStorage.setItem(STORAGE_KEYS.CHALLENGE_LINKS, JSON.stringify(newLinks));
  };

  const stats = [
    {
      title: 'Uczestnicy',
      value: registrations.filter(r => r.type === 'participant').length,
      icon: Users,
      color: 'bg-indigo-500'
    },
    {
      title: 'Mentorzy',
      value: registrations.filter(r => r.type === 'mentor').length,
      icon: ClipboardList,
      color: 'bg-purple-500'
    },
    {
      title: 'Sponsorzy',
      value: registrations.filter(r => r.type === 'sponsor').length,
      icon: BarChart3,
      color: 'bg-pink-500'
    }
  ];

  const exportData = (format: 'csv' | 'json') => {
    if (registrations.length === 0) return;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(registrations, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hackathon_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      // Get all unique keys from all fullData objects
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
  };

  const addTask = () => {
    const name = prompt('Nazwa zadania:');
    const url = prompt('URL do zadania:');
    if (name && url) {
      setTasks([...tasks, { id: Date.now().toString(), name, url, active: true }]);
    }
  };

  const deleteTask = (id: string) => {
    if (confirm('Usunąć to zadanie?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <AdminAuth>
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            AI Krak Hack Admin
          </h1>
          <p className="text-muted-foreground text-lg">Zarządzanie rejestracjami i treścią.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color} shadow-lg shadow-indigo-500/10`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-black">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => exportData('csv')}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Download className="w-4 h-4" /> Eksportuj CSV
          </button>
          <button 
            onClick={() => exportData('json')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" /> Eksportuj JSON
          </button>
          <button 
            onClick={addTask}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Dodaj Zadanie
          </button>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Registrations List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-400" /> Baza Rejestracji
              </h2>
              <div className="relative w-64 text-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Szukaj..." 
                  className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 rounded-full focus:ring-1 focus:ring-indigo-500/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase font-black text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Uczestnik</th>
                      <th className="px-6 py-4">Typ</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {registrations
                      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((reg) => (
                      <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold">{reg.name}</div>
                          <div className="text-[10px] text-muted-foreground">{reg.email}</div>
                        </td>
                        <td className="px-6 py-4 text-[10px] uppercase font-black">
                          <span className={reg.type === 'participant' ? 'text-indigo-400' : reg.type === 'mentor' ? 'text-purple-400' : 'text-pink-400'}>
                            {reg.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`w-3 h-3 rounded-full ${reg.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'} shadow-lg shadow-current/20`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side: Task CMS */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-purple-400" /> Zasoby Zadań 2026
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'geospatial', name: 'Smart Infrastructure (Tramwaje)' },
                  { id: 'process-automation', name: 'Process-to-Automation (Asystent)' }
                ].map((c) => (
                  <div key={c.id} className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest">{c.name}</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Link do repo/zasobów..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-cyan-500/50 outline-none"
                        value={challengeLinks[c.id] || ''}
                        onChange={(e) => saveChallengeLink(c.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ExternalLink className="w-6 h-6 text-cyan-400" /> Szybkie Linki
              </h2>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{task.name}</p>
                      <a href={task.url} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1">
                        Link <ExternalLink className="w-2 h-2" />
                      </a>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm italic">Brak zadań.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}