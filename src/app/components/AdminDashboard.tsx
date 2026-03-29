import { useState, useEffect } from 'react';
import { AdminAuth, getAdminToken } from './AdminAuth';
import { AdminAttendance } from '@/app/pages/AdminAttendance';
import { AdminCertificates } from './AdminCertificates';
import { motion, AnimatePresence } from 'motion/react';
import { EDITIONS_META, CURRENT_EDITION_NUMBER } from '@/data/edition-registry';
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
  Save,
  Smartphone,
  Award,
  UserPlus,
  X,
  FolderEdit,
  Menu,
  LogOut,
} from 'lucide-react';
import { AdminApplications } from './AdminApplications';
import { AdminAddParticipant } from './AdminAddParticipant';
import { AdminEditParticipant } from './AdminEditParticipant';
import { AdminTeamProjects } from './AdminTeamProjects';
import { AdminResults } from './AdminResults';

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

// Sidebar nav definition
type TabId = 'regs' | 'surveys' | 'teams' | 'participants' | 'mailing' | 'sms' | 'attendance' | 'certificates' | 'applications' | 'projekty' | 'wyniki';

const NAV_GROUPS: { label: string; items: { id: TabId; label: string; icon: any }[] }[] = [
  {
    label: 'Przegląd',
    items: [
      { id: 'regs', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Uczestnicy',
    items: [
      { id: 'participants', label: 'Rejestracje', icon: ClipboardList },
      { id: 'teams', label: 'Zespoły', icon: Users },
      { id: 'attendance', label: 'Obecność', icon: Check },
    ],
  },
  {
    label: 'Komunikacja',
    items: [
      { id: 'mailing', label: 'Mailing', icon: Mail },
      { id: 'sms', label: 'SMS', icon: Smartphone },
    ],
  },
  {
    label: 'Po evencie',
    items: [
      { id: 'projekty', label: 'Projekty', icon: FolderEdit },
      { id: 'wyniki', label: 'Wyniki / Jury', icon: BarChart3 },
      { id: 'certificates', label: 'Certyfikaty', icon: Award },
      { id: 'surveys', label: 'Ankiety', icon: MessageSquare },
    ],
  },
  {
    label: 'Koło naukowe',
    items: [
      { id: 'applications', label: 'Aplikacje', icon: UserPlus },
    ],
  },
];

function getBreadcrumb(activeTab: TabId): { group: string; page: string } {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.id === activeTab) {
        return { group: group.label, page: item.label };
      }
    }
  }
  return { group: '', page: '' };
}

export function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceLinks, setResourceLinks] = useState<Record<string, ChallengeResources>>({
    geospatial: {
      materials: 'https://res.cloudinary.com/dyux0lw71/image/upload/v1774013122/Smart_Infrastructure_Challenge_Materials_lwxd0z.pdf',
      task: ''
    },
    'process-automation': {
      materials: 'https://res.cloudinary.com/dyux0lw71/image/upload/v1774013122/Process_Mining_Preparation_Materials_av7ijw.pdf',
      task: ''
    }
  });
  const [activeTab, setActiveTab] = useState<TabId>('regs');
  const [selectedEdition, setSelectedEdition] = useState(CURRENT_EDITION_NUMBER);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mailing state
  const [mailSubject, setMailSubject] = useState('');
  const [mailHtml, setMailHtml] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailStatus, setMailStatus] = useState<{success: boolean, message: string} | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // SMS state
  const [smsMessage, setSmsMessage] = useState('Czesc! Twoj zestaw przygotowawczy do AI Krak Hack 2026 jest juz gotowy. Sprawdz maila oraz strone krakhack.info. Powodzenia!');
  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsStatus, setSmsStatus] = useState<{success: boolean, message: string} | null>(null);
  const [mailTarget, setMailTarget] = useState<'all' | 'attendance' | 'participant' | 'mentor' | 'company'>('all');

  // Add/Edit participant modals
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Registration | null>(null);
  const [teamFilter, setTeamFilter] = useState<'all' | 'no-team' | string>('all');

  // Scheduled mailing state
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleStep, setScheduleStep] = useState(0); // 0=form, 1=confirm1, 2=confirm2, 3=confirm3

  const EMAIL_TEMPLATES: Record<string, { subject: string, html: string }> = {
    ATTENDANCE: {
      subject: 'POTWIERDZENIE PRZYJAZDU: AI Krak Hack 2026',
      html: `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Potwierdź obecność 🚀</h1>
      <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.8;">Zespół: <strong>{{team_name}}</strong></p>
    </div>

    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Cześć!</p>
      <p style="font-size: 16px; margin-bottom: 24px;">
        Przygotowania do AI Krak Hack 2026 idą pełną parą. Abyśmy mogli zarezerwować dla Was miejsca, pakiety powitalne oraz catering, potrzebujemy ostatecznego potwierdzenia przyjazdu Twojego zespołu.
      </p>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
        <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.5;">
          <strong>Uwaga:</strong> Potwierdzenie jest wymagane do jutra (28.03) do godziny 12:00. Teams, które nie potwierdzą udziału, mogą zostać usunięte z listy uczestników ze względu na limit miejsc.
        </p>
      </div>

      <div style="margin: 40px 0; text-align: center;">
        <a href="{{confirm_url}}" style="background: #3b82f6; color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);">POTWIERDZAM PRZYJAZD &rarr;</a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 32px;">
        Jeśli wiecie już teraz, że nie dacie rady dotrzeć, prosimy o kliknięcie w przycisk powyżej i wybranie opcji "Nie dotrzemy". Dzięki temu zwolnicie miejsce innym chętnym osobom.
      </p>

      <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 32px; margin-top: 32px;">
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">
          Do zobaczenia w Krakowie!<br>
          <strong>Zespół AI Krak Hack 2026</strong>
        </p>
      </div>
    </div>
  </div>
</div>
      `
    },
    PREP: {
      subject: 'Zestaw Startowy i Harmonogram - AI Krak Hack 2026',
      html: `
<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Zestaw Startowy 🛠️</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.8; font-weight: 500;">Twoje materiały przygotowawcze do Krak Hack 2026</p>
    </div>

    <div style="padding: 40px; color: #334155;">
      <p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Cześć!</p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Przyjęliśmy Twoje zgłoszenie! Cieszymy się, że będziesz z nami podczas tej edycji. To będzie intensywny czas pełen innowacji i AI.
      </p>

      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
        <p style="margin: 0; font-size: 15px; color: #92400e; line-height: 1.5;">
          <strong>Pro-tip:</strong> Skontaktuj się z zespołem już teraz! Przejrzyjcie materiały, skonfigurujcie środowisko i przygotujcie wstępną strategię, gdy tylko zadania zostaną odblokowane.
        </p>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 20px;">Materiały do Twojego wyzwania:</h3>

      <div style="margin-bottom: 40px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; font-weight: 800; font-size: 14px; color: #3b82f6; text-transform: uppercase;">1. Smart Infrastructure</p>
          <div>
            <a href="https://res.cloudinary.com/dyux0lw71/image/upload/v1774013122/Smart_Infrastructure_Challenge_Materials_lwxd0z.pdf" style="background: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; display: inline-block; margin-right: 10px; margin-bottom: 10px;">Zestaw Starter Set (PDF)</a>
            <a href="https://krakhack.info/zadania/infrasruktura" style="background: #ffffff; color: #3b82f6; border: 2px solid #3b82f6; padding: 10px 18px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; display: inline-block;">Strona Wyzwania &rarr;</a>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
          <p style="margin: 0 0 12px; font-weight: 800; font-size: 14px; color: #2563eb; text-transform: uppercase;">2. Process-to-Automation Copilot</p>
          <div>
            <a href="https://res.cloudinary.com/dyux0lw71/image/upload/v1774013122/Process_Mining_Preparation_Materials_av7ijw.pdf" style="background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; display: inline-block; margin-right: 10px; margin-bottom: 10px;">Zestaw Starter Set (PDF)</a>
            <a href="https://krakhack.info/zadania/asystent" style="background: #ffffff; color: #2563eb; border: 2px solid #2563eb; padding: 10px 18px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; display: inline-block;">Strona Wyzwania &rarr;</a>
          </div>
        </div>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 20px;">Harmonogram AI Krak Hack 2026:</h3>

      <div style="background: #f1f5f9; border-radius: 20px; padding: 24px; margin-bottom: 40px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 700; color: #0f172a; font-size: 14px;">27.03, 18:00</td><td style="padding: 12px 0; font-size: 14px; color: #475569; text-align: right;">Start hackathonu - Zadania online</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 700; color: #0f172a; font-size: 14px;">28.03, 09:00</td><td style="padding: 12px 0; font-size: 14px; color: #475569; text-align: right;">Praca na uczelni - Mentorzy</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 700; color: #0f172a; font-size: 14px;">28.03, 13:00</td><td style="padding: 12px 0; font-size: 14px; color: #475569; text-align: right;">Przerwa na obiad. PIZZA! 🍕</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 700; color: #0f172a; font-size: 14px;">28.03, 17:30</td><td style="padding: 12px 0; font-size: 14px; color: #475569; text-align: right;">Demo & Finał - Prezentacje</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 700; color: #0f172a; font-size: 14px;">28.03, 20:00</td><td style="padding: 12px 0; font-size: 14px; color: #475569; text-align: right;">Wyniki i Nagrody 🏆</td></tr>
          <tr><td style="padding: 12px 0; font-weight: 700; color: #0f172a; font-size: 14px;">28.03, 21:00</td><td style="padding: 12px 0; font-size: 14px; color: #475569; text-align: right;">Afterparty & Integracja 🚀</td></tr>
        </table>
      </div>

      <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 32px;">
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">
          Do zobaczenia na miejscu!<br>
          <strong>Zespół AI Krak Hack 2026</strong>
        </p>
      </div>
    </div>
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
        <div style="margin-top: 15px;">
          <a href="https://github.com/AI-Lab-WSEI/KrakHack2026-Smart-Infrastructure" style="display: inline-block; background: #16a34a; color: white; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; margin-right: 12px;">Pobierz Arkusz Zadania</a>
          <a href="https://krakhack.info/zadania/infrasruktura" style="display: inline-block; background: white; border: 1px solid #16a34a; color: #16a34a; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Strona wyzwania &rarr;</a>
        </div>
      </div>

      <!-- Challenge 2 -->
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 16px; padding: 20px;">
        <p style="margin: 0 0 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; color: #15803d;">2. Process-to-Automation Copilot</p>
        <div style="margin-top: 15px;">
          <a href="https://github.com/AI-Lab-WSEI/KrakHack2026-Process-Automation-Copilot" style="display: inline-block; background: #15803d; color: white; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; margin-right: 12px;">Pobierz Arkusz Zadania</a>
          <a href="https://krakhack.info/zadania/asystent" style="display: inline-block; background: white; border: 1px solid #15803d; color: #15803d; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px;">Strona wyzwania &rarr;</a>
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
    },
    CLUB_INVITE: {
      subject: 'Dołącz do AI Possibilities Lab! 🚀',
      html: `<div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 40px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">AI POSSIBILITIES LAB</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Zaproszenie do koła / współpracy</p>
    </div>
    <div style="padding: 40px; color: #334155; line-height: 1.6;">
      <p style="font-size: 16px;">Ten template automatycznie wysyła <strong>dwa różne warianty</strong>:</p>
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin: 12px 0;">
        <p style="margin: 0;"><strong>🎓 WSEI-owcy</strong> → oferta akademicka: pomysły na prace dyplomowe, mentoring, bridging do konferencji, dołączenie do koła</p>
      </div>
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 8px; margin: 12px 0;">
        <p style="margin: 0;"><strong>💬 Zewnętrzni</strong> → zaproszenie do community na Discordzie, współpraca z marką, wspólne projekty, networking</p>
      </div>
      <p style="font-size: 14px; color: #64748b; margin-top: 16px;">Kliknij "WYŚLIJ ZAPROSZENIA DO KOŁA" poniżej — system sam podzieli odbiorców na podstawie uczelni.</p>
    </div>
  </div>
</div>`
    }
  };

  // State for club invite sending
  const [isSendingClubInvite, setIsSendingClubInvite] = useState(false);
  const [clubInviteStatus, setClubInviteStatus] = useState<{success: boolean, message: string} | null>(null);

  const sendClubInvite = async () => {
    if (!confirm('Wysłać zaproszenia do koła do WSZYSTKICH uczestników hackathonu? (WSEI-owcy dostaną zaproszenie do koła, zewnętrzni — do współpracy)')) return;
    setIsSendingClubInvite(true);
    setClubInviteStatus(null);
    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const res = await fetch(`${apiBase}/api/admin/mail/club-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setClubInviteStatus({ success: true, message: `Wysłano: ${data.sentWsei} do WSEI, ${data.sentExternal} do zewnętrznych (${data.total} total)` });
      } else {
        throw new Error(data.error || 'Błąd wysyłki');
      }
    } catch (err: any) {
      setClubInviteStatus({ success: false, message: err.message });
    } finally {
      setIsSendingClubInvite(false);
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
        const formatted: Record<string, ChallengeResources> = { ...resourceLinks };
        if (data.geospatial) formatted.geospatial = data.geospatial;
        if (data['process-automation']) formatted['process-automation'] = data['process-automation'];
        if (data.challenge_1) (formatted as any).challenge_1 = data.challenge_1;
        if (data.challenge_2) (formatted as any).challenge_2 = data.challenge_2;
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
    setIsSavingLinks(true);
    setSaveSuccess(false);
    try {
      const challenge_1 = {
        name: 'Smart Infrastructure',
        materials: resourceLinks.geospatial?.materials || '',
        task: resourceLinks.geospatial?.task || ''
      };
      const challenge_2 = {
        name: 'Process-to-Automation Copilot',
        materials: resourceLinks['process-automation']?.materials || '',
        task: resourceLinks['process-automation']?.task || ''
      };

      const res = await fetch('/api/config/challenge_resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          value: {
            geospatial: resourceLinks.geospatial,
            'process-automation': resourceLinks['process-automation'],
            challenge_1,
            challenge_2
          }
        })
      });
      if (!res.ok) throw new Error('API Error');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Błąd zapisu w bazie danych.');
    } finally {
      setIsSavingLinks(false);
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
          target: target === 'single' ? 'single' : mailTarget,
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

  const breadcrumb = getBreadcrumb(activeTab);

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="text-xs font-black uppercase tracking-[0.15em]">
          <span className="text-cyan-400">ADMIN</span>
          <span className="text-white"> PANEL</span>
        </div>
      </div>

      {/* Edition picker */}
      <div className="px-3 py-4 border-b border-white/5 space-y-1.5">
        {EDITIONS_META.filter(e => e.status !== 'placeholder').map(e => (
          <button
            key={e.number}
            onClick={() => setSelectedEdition(e.number)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              selectedEdition === e.number
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            #{e.number} · {e.year}
            {e.status === 'active' && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block ml-auto" />
            )}
          </button>
        ))}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 py-3">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 px-3 py-1 mt-4 mb-1">
              {group.label}
            </p>
            {group.items.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all w-full ${
                  activeTab === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <AdminAuth>
      <div className="flex min-h-screen bg-black text-white">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 min-h-screen bg-gray-950 border-r border-white/5 fixed top-0 left-0 z-40">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-56 h-full bg-gray-950 border-r border-white/5">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col md:ml-56 min-h-screen">
          {/* Top bar */}
          <header className="h-14 border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 bg-black/80 backdrop-blur z-30">
            <button
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="uppercase tracking-widest">{breadcrumb.group}</span>
              {breadcrumb.group && <span className="text-gray-700">›</span>}
              <span className="text-white uppercase tracking-widest">{breadcrumb.page}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                Admin
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_api_token');
                  window.dispatchEvent(new Event('admin-logout'));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Wyloguj
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 md:p-10 space-y-8">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-sm flex items-center justify-center gap-4">
                <AlertCircle className="w-4 h-4" />
                {error}
                <button onClick={fetchData} className="underline font-bold">Odśwież</button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'regs' && (
                <motion.div key="regs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  {/* Stats cards — inside Dashboard tab */}
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
                          disabled={isSavingLinks}
                          className={`group relative px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 flex items-center gap-2 ${saveSuccess ? 'bg-green-600' : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500'} text-white`}
                        >
                          {saveSuccess ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Save className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                          )}
                          {saveSuccess ? 'Zapisano!' : isSavingLinks ? 'Zapisywanie...' : 'Zapisz Linki'}
                        </button>
                      </div>
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
                    <div className="flex flex-wrap gap-3">
                       <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="bg-black/20 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 outline-none focus:ring-1 focus:ring-indigo-500 [&>option]:bg-gray-900"
                       >
                         <option value="all">WSZYSTKIE ROLE</option>
                         <option value="participant">UCZESTNICY</option>
                         <option value="mentor">MENTORZY</option>
                         <option value="company">PARTNERZY / FIRMY</option>
                       </select>
                       <select
                        value={teamFilter}
                        onChange={e => setTeamFilter(e.target.value)}
                        className="bg-black/20 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 outline-none focus:ring-1 focus:ring-indigo-500 [&>option]:bg-gray-900"
                       >
                         <option value="all">WSZYSTKIE ZESPOŁY</option>
                         <option value="no-team">⚠ BEZ ZESPOŁU</option>
                         {Object.keys(teams).sort().map(t => (
                           <option key={t} value={t}>{t}</option>
                         ))}
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
                             {registrations.filter(r => {
                                if (roleFilter !== 'all' && r.type !== roleFilter) return false;
                                if (teamFilter === 'no-team' && r.fullData?.teamName) return false;
                                if (teamFilter === 'no-team' && !r.fullData?.teamName) { /* pass */ }
                                else if (teamFilter !== 'all' && teamFilter !== 'no-team' && r.fullData?.teamName !== teamFilter) return false;
                                if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase()) && !r.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                                return true;
                             }).map(reg => (
                                <tr key={reg.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setEditingParticipant(reg)}>
                                   <td className="px-6 py-4 font-bold text-gray-200">
                                     {reg.name}
                                     {reg.fullData?.teamName
                                       ? <div className="text-[9px] text-cyan-400 mt-0.5">TEAM: {reg.fullData.teamName}</div>
                                       : <div className="text-[9px] text-yellow-400/70 mt-0.5">⚠ Brak zespołu</div>
                                     }
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
                                   <td className="px-6 py-4 flex items-center gap-2">
                                     <button
                                      onClick={(e) => { e.stopPropagation(); updateSubmissionStatus(reg.id, reg.status === 'confirmed' ? 'pending' : 'confirmed'); }}
                                      className={`w-2 h-2 rounded-full cursor-pointer transition-all hover:scale-125 ${reg.status === 'confirmed' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`}
                                     />
                                     <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!confirm(`Usunąć ${reg.name}? Certyfikaty też zostaną usunięte.`)) return;
                                        try {
                                          const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
                                          await fetch(`${apiBase}/api/submissions/${reg.id}`, {
                                            method: 'DELETE',
                                            headers: { 'Authorization': `Bearer ${getAdminToken()}` }
                                          });
                                          fetchData();
                                        } catch { alert('Błąd usuwania'); }
                                      }}
                                      className="text-red-500/50 hover:text-red-400 transition-colors ml-2"
                                      title="Usuń uczestnika"
                                     >
                                       <X className="w-3 h-3" />
                                     </button>
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
                        { id: 'ATTENDANCE', label: 'Potwierdzenie Przychodu', color: 'border-blue-500/30 text-blue-400' },
                        { id: 'PREP', label: 'Zestaw Startowy', color: 'border-orange-500/30 text-orange-400' },
                        { id: 'START', label: 'Start Hackathonu', color: 'border-green-500/30 text-green-400' },
                        { id: 'SURVEY', label: 'Ankieta Końcowa', color: 'border-cyan-500/30 text-cyan-400' },
                        { id: 'CLUB_INVITE', label: 'Zaproszenie do Koła', color: 'border-pink-500/30 text-pink-400' }
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
                        <div className="flex flex-wrap gap-4 items-center flex-1 min-w-[300px]">
                           <div className="flex flex-col gap-1 min-w-[150px]">
                             <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Cel wysyłki</label>
                             <select
                              value={mailTarget}
                              onChange={(e: any) => setMailTarget(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                             >
                                <option value="all">WSZYSCY</option>
                                <option value="attendance">TYLKO UCZESTNICY (PERSONALNIE)</option>
                                <option value="participant">UCZESTNICY (MASOWO)</option>
                                <option value="mentor">MENTORZY</option>
                             </select>
                           </div>
                           <div className="flex-1 flex flex-col gap-1">
                             <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Testuj na adresie</label>
                             <div className="flex gap-2">
                               <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Email..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold" />
                               <button onClick={() => sendMail('single')} disabled={isSendingMail || !testEmail} className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                  {isSendingMail ? '...' : <Send className="w-3 h-3" />}
                               </button>
                             </div>
                           </div>
                        </div>
                        <button onClick={() => sendMail('all')} disabled={isSendingMail || !mailSubject} className="h-fit px-10 py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50">
                           <Mail className="w-4 h-4" /> WYŚLIJ MASOWO
                        </button>
                        <button onClick={() => setShowScheduleForm(!showScheduleForm)} disabled={!mailSubject || !mailHtml} className="h-fit px-6 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 disabled:opacity-50">
                           <Download className="w-4 h-4" /> ZAPLANUJ
                        </button>
                      </div>

                      {mailStatus && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${mailStatus.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                           {mailStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                           {mailStatus.message}
                        </motion.div>
                      )}
                   </div>

                   {/* Scheduled Mailing Form */}
                   {showScheduleForm && (
                     <div className="bg-orange-500/5 border border-orange-500/20 rounded-[2rem] p-8 space-y-4">
                       <h3 className="text-lg font-black uppercase tracking-widest text-orange-400">Zaplanuj wysyłkę</h3>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Data</label>
                           <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                         </div>
                         <div>
                           <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Godzina</label>
                           <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                         </div>
                       </div>
                       <p className="text-xs text-gray-500">
                         Temat: <strong className="text-white">{mailSubject}</strong> | Cel: <strong className="text-white">{mailTarget}</strong>
                         {scheduleDate && scheduleTime && ` | Wysyłka: ${scheduleDate} o ${scheduleTime}`}
                       </p>

                       {scheduleStep === 0 && (
                         <button onClick={() => setScheduleStep(1)} disabled={!scheduleDate || !scheduleTime}
                           className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-xs disabled:opacity-50">
                           Krok 1/3: Potwierdź treść
                         </button>
                       )}
                       {scheduleStep === 1 && (
                         <div className="space-y-2">
                           <p className="text-orange-400 text-sm font-bold">Czy treść wiadomości jest poprawna i przetestowana?</p>
                           <div className="flex gap-2">
                             <button onClick={() => setScheduleStep(2)} className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-xs">
                               Tak, treść OK — Krok 2/3
                             </button>
                             <button onClick={() => setScheduleStep(0)} className="px-4 py-3 bg-white/5 text-gray-400 rounded-xl text-xs">Anuluj</button>
                           </div>
                         </div>
                       )}
                       {scheduleStep === 2 && (
                         <div className="space-y-2">
                           <p className="text-orange-400 text-sm font-bold">Czy na pewno wysłać do WSZYSTKICH ({mailTarget})? To jest mass mailing.</p>
                           <div className="flex gap-2">
                             <button onClick={() => setScheduleStep(3)} className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-xs">
                               Tak, do wszystkich — Krok 3/3
                             </button>
                             <button onClick={() => setScheduleStep(0)} className="px-4 py-3 bg-white/5 text-gray-400 rounded-xl text-xs">Anuluj</button>
                           </div>
                         </div>
                       )}
                       {scheduleStep === 3 && (
                         <div className="space-y-2">
                           <p className="text-red-400 text-sm font-bold">OSTATNIE POTWIERDZENIE: Zaplanować wysyłkę na {scheduleDate} o {scheduleTime}?</p>
                           <div className="flex gap-2">
                             <button onClick={async () => {
                               try {
                                 const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
                                 const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
                                 const res = await fetch(`${apiBase}/api/admin/mail/schedule`, {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAdminToken()}` },
                                   body: JSON.stringify({ subject: mailSubject, html: mailHtml, target: mailTarget, scheduledAt }),
                                 });
                                 const data = await res.json();
                                 if (data.success) {
                                   setMailStatus({ success: true, message: `Zaplanowano wysyłkę na ${scheduleDate} o ${scheduleTime}` });
                                   setShowScheduleForm(false);
                                   setScheduleStep(0);
                                 } else {
                                   setMailStatus({ success: false, message: data.error });
                                 }
                               } catch (err: any) { setMailStatus({ success: false, message: err.message }); }
                             }} className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold text-xs">
                               ZAPLANUJ WYSYŁKĘ
                             </button>
                             <button onClick={() => setScheduleStep(0)} className="px-4 py-3 bg-white/5 text-gray-400 rounded-xl text-xs">Anuluj</button>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {mailHtml && (
                     <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">PODGLĄD WIADOMOŚCI</p>
                        <div className="bg-white rounded-[2rem] p-8 shadow-2xl" dangerouslySetInnerHTML={{ __html: mailHtml }} />
                     </div>
                   )}

                   {/* Club Invite Special Section */}
                   {selectedTemplate === 'CLUB_INVITE' && (
                     <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-[2rem] p-8 space-y-4">
                       <h3 className="text-lg font-black uppercase tracking-widest text-pink-400">Zaproszenie do koła — Automatyczny podział</h3>
                       <p className="text-sm text-gray-400">
                         System automatycznie wyśle <strong className="text-cyan-400">inny wariant maila do WSEI-owców</strong> (zaproszenie do koła) i <strong className="text-purple-400">inny do zewnętrznych</strong> (zaproszenie do współpracy). Podział bazuje na uczelni podanej przy rejestracji.
                       </p>
                       <div className="flex items-center gap-4">
                         <button
                           onClick={sendClubInvite}
                           disabled={isSendingClubInvite}
                           className="px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 shadow-[0_0_30px_rgba(236,72,153,0.3)] disabled:opacity-50"
                         >
                           <Send className="w-4 h-4" /> {isSendingClubInvite ? 'WYSYŁANIE...' : 'WYŚLIJ ZAPROSZENIA DO KOŁA'}
                         </button>
                       </div>
                       {clubInviteStatus && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${clubInviteStatus.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                           {clubInviteStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                           {clubInviteStatus.message}
                         </motion.div>
                       )}
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
                          <div className="flex items-center gap-2">
                            <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/20">{members.length}</span>
                            <button
                              onClick={async () => {
                                if (!confirm(`Usunąć zespół "${name}" i wszystkich ${members.length} członków? Ich certyfikaty też zostaną usunięte.`)) return;
                                if (!confirm(`NA PEWNO usunąć zespół "${name}"? To jest nieodwracalne.`)) return;
                                try {
                                  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
                                  // Delete certs for team
                                  await fetch(`${apiBase}/api/certificates/team/${encodeURIComponent(name)}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${getAdminToken()}` }
                                  });
                                  // Delete all submissions for this team
                                  for (const m of members) {
                                    await fetch(`${apiBase}/api/submissions/${m.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${getAdminToken()}` }
                                    });
                                  }
                                  fetchData();
                                } catch { alert('Błąd usuwania zespołu'); }
                              }}
                              className="p-1.5 text-red-500/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                              title="Usuń zespół"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
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

              {activeTab === 'attendance' && (
                <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AdminAttendance />
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <AdminCertificates />
              )}

              {activeTab === 'applications' && (
                <AdminApplications />
              )}

              {activeTab === 'projekty' && (
                <AdminTeamProjects edition={selectedEdition} />
              )}

              {activeTab === 'wyniki' && (
                <AdminResults edition={selectedEdition} />
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

              {activeTab === 'sms' && (
                <motion.div key="sms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl">
                        <Smartphone className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase italic">Komunikacja SMS</h2>
                        <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">Bramka SMSAPI Integration</p>
                      </div>
                    </div>

                    {smsStatus && (
                      <div className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 font-bold border ${smsStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {smsStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {smsStatus.message}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Treść Wiadomości (SMS)</label>
                        <textarea
                          value={smsMessage}
                          onChange={e => setSmsMessage(e.target.value)}
                          rows={4}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium focus:border-indigo-500/50 transition-colors resize-none mb-2"
                          placeholder="Wpisz treść wiadomości..."
                        />
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] text-muted-foreground font-bold">Limit: 160 znaków = 1 jednostka SMS</p>
                          <p className={`text-[10px] font-black ${smsMessage.length > 160 ? 'text-amber-500' : 'text-indigo-400'}`}>
                            Długość: {smsMessage.length} / {Math.ceil(smsMessage.length / 160) || 1} SMS
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                        <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Tryb Testowy</h3>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Numer telefonu (np. 500100200)"
                              value={testSmsPhone}
                              onChange={e => setTestSmsPhone(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold"
                            />
                            <button
                              disabled={isSendingSms || !testSmsPhone}
                              onClick={async () => {
                                setIsSendingSms(true);
                                try {
                                  const res = await fetch('/api/admin/sms/send', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${getAdminToken()}`
                                    },
                                    body: JSON.stringify({ target: 'single', phone: testSmsPhone, message: smsMessage })
                                  });
                                  const data = await res.json();
                                  if (res.status === 401) throw new Error('Nieautoryzowany - sesja wygasła.');
                                  setSmsStatus({ success: data.success, message: data.success ? 'SMS testowy wysłany!' : `Błąd: ${data.error || 'nieznany błąd'}` });
                                } catch (e: any) {
                                  setSmsStatus({ success: false, message: e.message || 'Błąd sieci.' });
                                } finally {
                                  setIsSendingSms(false);
                                }
                              }}
                              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                              Test
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Wysyłka Masowa</h3>
                          <button
                            disabled={isSendingSms || !smsMessage}
                            onClick={async () => {
                              if (!confirm(`Czy na pewno chcesz wysłać tę wiadomość do wszystkich potwierdzonych uczestników (${registrations.filter(r => r.status === 'confirmed').length} osób)?`)) return;
                              setIsSendingSms(true);
                              try {
                                const res = await fetch('/api/admin/sms/send', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${getAdminToken()}`
                                  },
                                  body: JSON.stringify({ target: 'all', message: smsMessage })
                                });
                                const data = await res.json();
                                setSmsStatus({ success: data.success, message: data.success ? `Wysłano masowo! Odbiorców: ${data.count}` : 'Błąd podczas wysyłki masowej.' });
                              } catch (e) {
                                setSmsStatus({ success: false, message: 'Błąd krytyczny API.' });
                              } finally {
                                setIsSendingSms(false);
                              }
                            }}
                            className="w-full bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Wyślij do wszystkich uczestników
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-widest">
                    <div className="flex gap-4 items-start">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>
                        Wiadomości SMS są wysyłane natychmiastowo. Upewnij się, że treść jest poprawna.
                        System automatycznie formatuje polskie numery do standardu międzynarodowego (+48).
                        Pamiętaj o limicie znaków, aby uniknąć podwójnych kosztów za jedną wiadomość.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center gap-4 pt-4">
              <button onClick={() => exportCSV('all')} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-all">
                Eksportuj Wszystko (.CSV)
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Add Participant Button */}
      <button
        onClick={() => setShowAddParticipant(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:scale-105 z-50"
        title="Dodaj uczestnika ręcznie"
      >
        <UserPlus className="w-6 h-6" />
      </button>

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <AdminAddParticipant
          onClose={() => setShowAddParticipant(false)}
          onAdded={() => fetchData()}
        />
      )}

      {/* Edit Participant Modal */}
      {editingParticipant && (
        <AdminEditParticipant
          participant={editingParticipant}
          existingTeams={Object.keys(teams)}
          onClose={() => setEditingParticipant(null)}
          onSaved={() => fetchData()}
        />
      )}
    </AdminAuth>
  );
}
