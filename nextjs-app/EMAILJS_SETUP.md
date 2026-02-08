# EmailJS Setup for Contact Form

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up with your Google account: **bluemindfreediving@gmail.com**
3. Verify your email

## Step 2: Add Email Service (Gmail)

1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Select **Gmail**
4. Click **Connect Account**
5. Sign in with **bluemindfreediving@gmail.com**
6. Grant permissions
7. Note down the **Service ID** (e.g., `service_xyz123`)

## Step 3: Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template:

```
Subject: New Contact Form: {{subject}}

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
Sent from Blue Mind Freediving website
```

4. **To Email**: Set to `info@bluemindfreediving.nl`
5. **From Name**: `Blue Mind Freediving`
6. **From Email**: `bluemindfreediving@gmail.com`
7. **Reply To**: `{{from_email}}`
8. Save and note the **Template ID** (e.g., `template_abc456`)

## Step 4: Get Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `your_public_key_here`)

## Step 5: Configure Environment Variables

Create `.env.local` in nextjs-app directory:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xyz123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_abc456
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## Step 6: Add to GitHub Secrets

For production deployment, add these to GitHub Secrets:

1. Go to GitHub repo → Settings → Secrets → Actions
2. Add secrets:
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`

## Step 7: Update GitHub Action

The workflow will inject these during build.

## Step 8: Test Locally

```bash
cd /Users/ahakim/work/bluemind/nextjs-app
npm run dev
# Go to http://localhost:3000/contact
# Fill and submit form
```

## Step 9: Build & Deploy

```bash
npm run build
firebase deploy --only hosting
```

## EmailJS Free Tier

- 200 emails/month FREE
- No credit card required
- Perfect for contact forms

## Troubleshooting

### "EmailJS is not defined"
- Make sure you installed: `npm install @emailjs/browser`
- Rebuild: `npm run build`

### "Failed to send"
- Check Service ID, Template ID, and Public Key are correct
- Check .env.local file exists
- Verify Gmail is connected in EmailJS dashboard

### Emails not arriving
- Check EmailJS dashboard for sent emails
- Check spam folder in info@bluemindfreediving.nl
- Verify Reply-To is set to {{from_email}} in template
