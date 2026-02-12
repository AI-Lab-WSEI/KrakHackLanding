# AI Krak Hack - Admin Panel Guide

## Overview

The admin panel provides a comprehensive interface for managing form submissions from participants, mentors, and companies interested in AI Krak Hack.

## Features

### 1. Form Management
- **Three separate forms**: Participants, Mentors, and Companies
- **Data validation**: Required fields and proper input types
- **Local storage**: Submissions are stored in browser localStorage
- **Email notifications**: Automatic email notifications for both admin and users

### 2. Admin Dashboard
- **Statistics overview**: Count of submissions by type and status
- **Filtering**: Filter by submission type (all, participant, mentor, company)
- **Search functionality**: Search through all submission data
- **Status management**: Mark submissions as new, reviewed, or contacted

### 3. Data Export
- **CSV export**: Export filtered submissions to CSV format
- **Excel compatibility**: CSV files can be opened in Excel or Google Sheets

### 4. Email Integration
- **Automatic notifications**: Sends confirmation emails to users
- **Admin alerts**: Notifies admin of new submissions
- **Email templates**: Customized templates for each form type

## Access

### Forms
- **Main forms page**: `/forms`
- **Direct participant form**: `/forms?type=participant`
- **Direct mentor form**: `/forms?type=mentor`
- **Direct company form**: `/forms?type=company`

### Admin Panel
- **Admin dashboard**: `/admin`
- Access is not restricted but the link is not publicly visible

## Form Types

### Participant Form
Collects information from hackathon participants including:
- Personal information (name, email, phone)
- Education details (university, field of study, year)
- Technical skills and experience
- Motivation and team preferences
- Dietary restrictions and t-shirt size

### Mentor Form
Collects information from potential mentors including:
- Personal and professional information
- Company and position details
- Areas of expertise
- Availability during the hackathon
- Previous mentoring experience
- LinkedIn and portfolio links

### Company Form
Collects information from potential partners/sponsors including:
- Company information and contact details
- Industry and company size
- Partnership type and sponsorship level
- Budget and goals
- Additional services needed
- Timeline preferences

## Data Storage

### Local Storage
- All submissions are stored in browser localStorage
- Key: `hackathon_submissions`
- Format: JSON array of submission objects

### Submission Object Structure
```json
{
  "id": "timestamp_string",
  "type": "participant|mentor|company",
  "timestamp": "ISO_date_string",
  "data": {
    // Form-specific data
  },
  "status": "new|reviewed|contacted"
}
```

## Email Service

### Current Implementation
- Mock email service that logs to console
- Stores notifications for admin review
- Generates confirmation emails for users

### Production Setup
To implement real email functionality, integrate with:
- **SendGrid**: Popular email service with good API
- **Mailgun**: Reliable email delivery service
- **AWS SES**: Cost-effective for high volume
- **Nodemailer**: For custom SMTP setup

### Email Templates
- **Admin notifications**: Include all form data
- **User confirmations**: Personalized confirmation messages
- **Follow-up emails**: Can be sent from admin panel

## Gallery Integration

### Gallery.json Structure
The gallery system uses a cleaned JSON structure:
```json
{
  "gallery": [
    {
      "id": "unique_id",
      "url": "cloudinary_url",
      "alt": "descriptive_text",
      "caption": "display_caption",
      "category": "event_category",
      "year": "2025|2026"
    }
  ]
}
```

### Gallery Features
- **Random selection**: Displays random images from the gallery
- **Category filtering**: Filter by event type
- **Year filtering**: Show images from specific years
- **Responsive display**: Optimized for all screen sizes

## Admin Panel Features

### Dashboard
- **Real-time statistics**: Live count of submissions
- **Status indicators**: Visual status indicators for each submission
- **Quick actions**: Email, view details, delete submissions

### Filtering & Search
- **Type filters**: Show only specific form types
- **Text search**: Search through all submission data
- **Status filtering**: Filter by submission status

### Export Functionality
- **CSV export**: Download submissions as CSV
- **Date-based naming**: Files named with current date
- **All data included**: Exports all visible/filtered data

### Email Management
- **Direct email**: Click to open email client
- **Bulk operations**: Update multiple submission statuses
- **Email history**: View sent notifications (in production)

## Security Considerations

### Current State
- No authentication required
- Data stored locally in browser
- Admin panel accessible via direct URL

### Production Recommendations
- **Authentication**: Implement admin login system
- **Database**: Move from localStorage to proper database
- **HTTPS**: Ensure all communications are encrypted
- **Rate limiting**: Prevent spam submissions
- **Data validation**: Server-side validation of all inputs
- **Backup**: Regular backups of submission data

## Customization

### Adding New Form Fields
1. Update the form component interface
2. Add field to the form JSX
3. Update email templates if needed
4. Test data export functionality

### Styling Changes
- All components use Tailwind CSS
- Color schemes can be modified in component files
- Responsive design is built-in

### Email Templates
- Modify templates in `src/utils/emailService.ts`
- Add new notification types as needed
- Customize confirmation messages

## Troubleshooting

### Common Issues
1. **Forms not submitting**: Check browser console for errors
2. **Data not appearing in admin**: Verify localStorage permissions
3. **Export not working**: Check browser download permissions
4. **Images not loading**: Verify Cloudinary URLs in gallery.json

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- LocalStorage must be available

## Future Enhancements

### Planned Features
- **Real database integration**: PostgreSQL or MongoDB
- **Authentication system**: Admin login with roles
- **Email automation**: Scheduled follow-up emails
- **Analytics dashboard**: Submission trends and statistics
- **File uploads**: Allow participants to upload portfolios
- **Team formation**: Automatic team matching system

### Integration Possibilities
- **CRM integration**: Sync with customer relationship management
- **Calendar integration**: Schedule interviews/meetings
- **Slack/Discord**: Notifications to team channels
- **Google Sheets**: Real-time sync with spreadsheets