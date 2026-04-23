# Emaile — sender split per context + templates

## Dwie domeny wysyłające

System używa **dwóch zweryfikowanych domen Resend**:

| Domena | Verified | Użycie |
|---|---|---|
| `krakhack.info` | ✅ | Emaile związane z hackathonem |
| `possibilitieslab.org` | ✅ | Emaile związane z kołem / ogólne Lab |

## Jak wybieramy sendera

`server.js` ma helper `resolveEmailFrom(context)`:

```js
function resolveEmailFrom(context) {
  const labFrom      = process.env.EMAIL_FROM_LAB;       // possibilitieslab.org
  const krakhackFrom = process.env.EMAIL_FROM_KRAKHACK;  // krakhack.info
  const globalFrom   = process.env.EMAIL_FROM;           // fallback
  const testFallback = 'AI Krak Hack Team <onboarding@resend.dev>';

  if (context === 'krakhack') return krakhackFrom || globalFrom || testFallback;
  if (context === 'lab')      return labFrom      || globalFrom || testFallback;
  return labFrom || globalFrom || testFallback;  // default 'lab'
}
```

Każde wywołanie `sendResendEmail(to, subject, html, context)` przekazuje 4ty argument:
- `'krakhack'` — hackathon-related emails
- `'lab'` — koło / membership / Lab-related emails
- `'auto'` — auto-detect: używa `contextForRole(role)` → hackathon-participant/jury → krakhack, inne → lab

## Mapowanie template → context

| Template | Kiedy | Context |
|---|---|---|
| `buildInviteEmail` | `/api/invite/send` (legacy invite token flow) | `krakhack` |
| `buildMembershipConfirmationEmail` | Submit `/dolacz` → confirmation | `lab` |
| `buildWelcomeEmail` | Membership app status → `przyjęty` | `lab` |
| `buildInterviewInviteEmail` | `/api/membership-applications/:id/invite` | `lab` |
| `buildSurveyInviteEmail` | `/api/admin/surveys/...invite` | `lab` |
| `buildBulkInviteEmail` | `/api/invite/bulk` + create-profile | `auto` (z role: hackathon-p → krakhack, scienceclub-p → lab) |
| `buildResetPasswordEmail` | `/api/panel/users/:id/resend-invite`, `/api/auth/forgot-password` | `auto` (z user.role) |
| `buildRequestFillEmail` | `/api/admin/integrations/request-fill` | `lab` |
| Certyfikaty | `/api/certificates/:id/send-email` | `krakhack` |
| Team edit link | `/api/admin/team-projects/:id/send-edit-link` | `krakhack` |
| Event notification | `/api/events/:id/notify` | `lab` (bo events są Lab-level) |
| Admin mailing | `/api/admin/mail/send` target=participant/mentor/company | `krakhack` |
| Submission confirmation | POST `/api/submissions` | `krakhack` |
| Platform contact form | POST `/api/platform-contact` | `krakhack` |

## Env vars na Railway

```
EMAIL_FROM=AI Krak Hack <no-reply@krakhack.info>                   # generic fallback
EMAIL_FROM_KRAKHACK=AI Krak Hack <no-reply@krakhack.info>
EMAIL_FROM_LAB=AI Possibilities Lab <no-reply@possibilitieslab.org>
RESEND_API_KEY=re_MSd...ajju
```

## DNS records (Cloudflare)

Obie domeny są hostowane w Cloudflare. Dla każdej Resend wymaga 3 records:

### krakhack.info
- TXT `resend._domainkey.krakhack.info` → p=... (DKIM public key)
- MX `send.krakhack.info` priority 10 → `feedback-smtp.eu-west-1.amazonses.com`
- TXT `send.krakhack.info` → `v=spf1 include:amazonses.com ~all`

### possibilitieslab.org
Analogicznie jak wyżej, z własnym DKIM public key z Resend dashboard.

**Uwaga historyczna:** przy pierwszym dodawaniu `possibilitieslab.org` user skopiował em-dash z instrukcji (kolumna "Priority" zawierała `—` dla TXT records). Skutek: DKIM TXT miał trailing `"   —"` i Resend odmawiał weryfikacji. Fix: edytować record, zostawić tylko `p=...AQAB`.

## Rate limits

- Resend free tier: 100 email/day, 3000/month
- Per adresat: 3 próby `/forgot-password` per godzinę (`forgotRateMap` w server.js)

## Delivery status

Resend zwraca status per wysyłkę. `sendResendEmail` obecnie:
- **returns** `true` gdy Resend accepted (200), `false` gdy odrzucił (400/422)
- Callers checkują return value i propagate `emailSent: boolean` + `emailError: string | null` do UI
- UI pokazuje **prawdziwy status** — wcześniej było `emailSent: true` hardcoded → mylące

## Troubleshooting

| Problem | Co sprawdzić |
|---|---|
| Email się nie wysłał, UI mówi "Resend odrzucił" | Resend dashboard → logi → czy domena verified |
| 422 Domain not verified | DNS records w Cloudflare + trigger verify via API |
| Email w spamie | Weryfikacja domain DKIM+SPF w Resend, może dodać DMARC record |
| User zgłasza "nie dostał maila" | Resend → search email → log per-ID → check status (delivered/bounced/delayed) |
| Bulk operation część się wysłała, część nie | UI modal pokazuje per-user `emailSent` + `emailError`; admin może przekazać temp hasło offline |
