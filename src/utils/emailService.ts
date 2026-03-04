// Email service for handling form submissions
// In a real application, this would integrate with services like:
// - SendGrid
// - Mailgun  
// - AWS SES
// - Nodemailer with SMTP

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: 'participant' | 'mentor' | 'company';
}

export class EmailService {
  private static instance: EmailService;
  private notifications: EmailNotification[] = [];

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendNotification(notification: EmailNotification): Promise<boolean> {
    try {
      // Store notification for admin review
      this.notifications.push({
        ...notification,
        body: `${notification.body}\n\nTimestamp: ${new Date().toISOString()}`
      });

      // In a real app, send actual email here
      console.log('Email notification queued:', notification);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  async sendFormSubmissionNotification(formData: any, type: 'participant' | 'mentor' | 'company'): Promise<boolean> {
    const templates = {
      participant: {
        subject: 'AI Krak Hack - Nowe zgłoszenie uczestnika',
        adminSubject: 'Nowe zgłoszenie uczestnika - AI Krak Hack',
        userSubject: 'Potwierdzenie zgłoszenia - AI Krak Hack 2026'
      },
      mentor: {
        subject: 'AI Krak Hack - Nowe zgłoszenie mentora',
        adminSubject: 'Nowe zgłoszenie mentora - AI Krak Hack',
        userSubject: 'Potwierdzenie zgłoszenia mentora - AI Krak Hack 2026'
      },
      company: {
        subject: 'AI Krak Hack - Nowe zgłoszenie partnera',
        adminSubject: 'Nowe zgłoszenie partnera - AI Krak Hack',
        userSubject: 'Potwierdzenie zgłoszenia partnera - AI Krak Hack 2026'
      }
    };

    const template = templates[type];
    
    // Send notification to admin
    const adminNotification: EmailNotification = {
      to: 'admin@aikrakhack.pl', // Replace with actual admin email
      subject: template.adminSubject,
      body: `Nowe zgłoszenie typu: ${type}\n\nDane:\n${JSON.stringify(formData, null, 2)}`,
      type
    };

    // Send confirmation to user
    const userNotification: EmailNotification = {
      to: formData.email,
      subject: template.userSubject,
      body: this.generateUserConfirmationEmail(formData, type),
      type
    };

    const adminResult = await this.sendNotification(adminNotification);
    const userResult = await this.sendNotification(userNotification);

    return adminResult && userResult;
  }

  private generateUserConfirmationEmail(formData: any, type: string): string {
    const typeNames = {
      participant: 'uczestnika',
      mentor: 'mentora',
      company: 'partnera'
    };

    return `
Dziękujemy za zgłoszenie się jako ${typeNames[type as keyof typeof typeNames]} AI Krak Hack 2026!

Twoje zgłoszenie zostało otrzymane i będzie rozpatrzone przez nasz zespół organizacyjny.

Szczegóły zgłoszenia:
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Skontaktujemy się z Tobą w ciągu 3-5 dni roboczych z dalszymi informacjami.

Jeśli masz pytania, napisz do nas na: knai@wsei.edu.pl

Pozdrawiamy,
Zespół AI Krak Hack
AI Possibilities Lab
    `.trim();
  }

  getNotifications(): EmailNotification[] {
    return [...this.notifications];
  }

  clearNotifications(): void {
    this.notifications = [];
  }
}

export const emailService = EmailService.getInstance();