import { emailService } from './emailService';

export interface TeamsMessage {
  title: string;
  text: string;
  themeColor?: string;
  sections?: Array<{
    activityTitle: string;
    activitySubtitle: string;
    facts: Array<{ name: string; value: string }>;
    markdown: boolean;
  }>;
}

export class NotificationService {
  private static instance: NotificationService;
  private teamsWebhookUrl = import.meta.env.VITE_TEAMS_WEBHOOK_URL;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendToTeams(message: TeamsMessage): Promise<boolean> {
    if (!this.teamsWebhookUrl) {
      console.warn('MS Teams Webhook URL not configured. Skipping notification.');
      return false;
    }

    try {
      const response = await fetch(this.teamsWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "themeColor": message.themeColor || "0076D7",
          "summary": message.title,
          "title": message.title,
          "text": message.text,
          "sections": message.sections
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
      return false;
    }
  }

  async notifyFormSubmission(formData: any, type: 'participant' | 'mentor' | 'company'): Promise<boolean> {
    // 1. Send Email (Existing logic)
    const emailResult = await emailService.sendFormSubmissionNotification(formData, type);

    // 2. Format for Teams
    const typeLabel = {
      participant: 'Uczestnik',
      mentor: 'Mentor',
      company: 'Partner/Sponsor'
    }[type];

    const teamsMessage: TeamsMessage = {
      title: `🚨 Nowe zgłoszenie: ${typeLabel}`,
      text: `Otrzymano nową aplikację od: **${formData.firstName} ${formData.lastName}**`,
      themeColor: type === 'participant' ? '00FFFF' : (type === 'mentor' ? 'FF00FF' : '00FF00'),
      sections: [{
        activityTitle: "Szczegóły zgłoszenia",
        activitySubtitle: new Date().toLocaleString('pl-PL'),
        markdown: true,
        facts: Object.entries(formData)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => ({
            name: this.formatKey(key),
            value: Array.isArray(value) ? value.join(', ') : String(value)
          }))
      }]
    };

    const teamsResult = await this.sendToTeams(teamsMessage);

    return emailResult && teamsResult;
  }

  private formatKey(key: string): string {
    const mapping: Record<string, string> = {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      email: 'Email',
      phone: 'Telefon',
      university: 'Uczelnia',
      studyField: 'Kierunek',
      yearOfStudy: 'Rok studiów',
      experience: 'Doświadczenie',
      motivation: 'Motywacja',
      skills: 'Umiejętności',
      teamPreference: 'Zespół',
      dietaryRestrictions: 'Dieta',
      tshirtSize: 'Koszulka',
      companyName: 'Nazwa firmy',
      position: 'Stanowisko',
      interest: 'Zainteresowanie'
    };
    return mapping[key] || key;
  }
}

export const notificationService = NotificationService.getInstance();
