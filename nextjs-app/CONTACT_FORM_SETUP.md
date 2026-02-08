# 🚀 Quick Start: Fix Contact Form

## What You Need to Do Now:

### 1. Sign up to EmailJS (2 minutes)
- Go to: https://dashboard.emailjs.com/admin
- Sign in with: **bluemindfreediving@gmail.com**
- It's FREE (200 emails/month)

### 2. Connect Gmail (1 minute)
- Click "Email Services" → "Add New Service"
- Select "Gmail"
- Click "Connect Account" and authorize
- Copy your **Service ID** (looks like `service_abc123`)

### 3. Create Email Template (2 minutes)
- Click "Email Templates" → "Create New Template"
- **Template Name**: Contact Form
- **Subject**: `New Contact: {{subject}}`
- **To Email**: `info@bluemindfreediving.nl`
- **From Name**: `Blue Mind Website`
- **Reply To**: `{{from_email}}`
- **Content**:
```
Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}
```
- Save and copy your **Template ID** (looks like `template_xyz456`)

### 4. Get Public Key (30 seconds)
- Click "Account" → "General"
- Copy your **Public Key** (looks like `ABcdEFgh123456789`)

### 5. Update .env.local file
Open `/Users/ahakim/work/bluemind/nextjs-app/.env.local` and replace:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123  # Your Service ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz456  # Your Template ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=ABcdEFgh123456789  # Your Public Key
```

### 6. Build & Deploy
```bash
cd /Users/ahakim/work/bluemind/nextjs-app
npm run build
firebase deploy --only hosting
```

## That's it! 🎉

Your contact form will now:
- ✅ Send from bluemindfreediving@gmail.com
- ✅ Arrive at info@bluemindfreediving.nl
- ✅ Allow direct reply to sender
- ✅ Work with 200 free emails/month

## Test It:
1. Visit https://bluemind-landing.web.app/contact
2. Fill the form
3. Check info@bluemindfreediving.nl inbox

---

**No Gmail App Password needed!** EmailJS handles everything securely.
