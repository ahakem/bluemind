# Email Setup Instructions for Blue Mind Freediving Contact Form

## Prerequisites
1. Gmail account: bluemindfreediving@gmail.com
2. Firebase Functions enabled in Firebase Console
3. Firebase CLI installed

## Setup Steps

### 1. Enable Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Name it "Blue Mind Website"
6. Copy the 16-character password

### 2. Configure Firebase Functions

```bash
cd /Users/ahakim/work/bluemind/nextjs-app/functions
npm install

# Set environment variables
firebase functions:config:set gmail.user="bluemindfreediving@gmail.com"
firebase functions:config:set gmail.password="YOUR_16_CHAR_APP_PASSWORD"
```

### 3. Deploy Firebase Functions

```bash
# From nextjs-app directory
cd /Users/ahakim/work/bluemind/nextjs-app

# Deploy functions
firebase deploy --only functions

# Or deploy everything (hosting + functions)
firebase deploy
```

### 4. Test the Contact Form

1. Visit your website
2. Go to Contact page
3. Fill out the form
4. Submit
5. Check info@bluemindfreediving.nl inbox

## How It Works

1. User fills contact form on website
2. Form data sent to `/api/send-email`
3. Firebase Hosting routes to `sendEmail` Cloud Function
4. Function uses nodemailer to send email via Gmail SMTP
5. Email sent FROM: bluemindfreediving@gmail.com
6. Email sent TO: info@bluemindfreediving.nl
7. Reply-To header set to user's email

## Testing Locally

```bash
# Install Firebase Functions Emulator
firebase init emulators

# Start emulators
cd functions
npm run serve

# Test endpoint
curl -X POST http://localhost:5001/bluemind-landing/us-central1/sendEmail \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
  }'
```

## Troubleshooting

### Gmail Blocking Sign-ins
- Make sure 2-Step Verification is enabled
- Use App Password, not regular password
- Check "Less secure app access" is NOT needed (deprecated)

### Function Not Found
```bash
firebase deploy --only functions:sendEmail
```

### CORS Errors
The function includes CORS headers. If issues persist:
```javascript
// Update functions/index.js
const cors = require('cors')({
  origin: ['https://bluemindfreediving.nl', 'https://bluemind-landing.web.app']
});
```

## Security Notes

- App Password is stored in Firebase Config (encrypted)
- Never commit passwords to git
- Use environment variables for local development
- Rate limiting is handled by Firebase Functions

## Cost Estimate

Firebase Functions Free Tier:
- 2M invocations/month
- 400,000 GB-seconds/month
- 200,000 CPU-seconds/month

Expected usage: ~100-500 form submissions/month = FREE
