# Speekly - AI Speech Therapist

A modern AI-powered speech therapy application built with Expo/React Native.

## 🚀 Features

- **AI Speech Analysis** - Real-time speech recognition with AI feedback
- **Relaxation Techniques** - Guided breathing and muscle relaxation exercises
- **SOS Panic Mode** - Emergency calming for unexpected speaking situations
- **Multiple Scenarios** - Job interviews, ordering coffee, small talk, and custom scenarios
- **Streak Tracking** - Gamified progress with daily streaks
- **Bilingual** - English and Czech language support

## 🛠️ Tech Stack

- **Frontend**: Expo / React Native Web
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout
- **AI**: OpenAI GPT-3.5




## 🏃 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run web

# Build for production
npm run build
```

## 📦 Deployment

The app auto-deploys to Vercel when you push to the `main` branch.

### Manual Deployment
```bash
vercel --prod
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/diagnose` | GET | System status with service checks |
| `/api/chat` | POST | OpenAI proxy for chat |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhook` | POST | Stripe webhook handler |

## 📁 Project Structure

```
speekly/
├── App.js              # Main application
├── api/                # Serverless functions
│   ├── chat.js        # OpenAI proxy
│   ├── checkout.js    # Stripe checkout
│   ├── diagnose.js    # Health/status check
│   ├── health.js      # Simple health check
│   └── webhook.js     # Stripe webhook
├── components/
│   └── AuthScreen.js  # Authentication UI
├── lib/
│   └── supabase.js    # Supabase client
├── database/
│   └── schema.sql     # Database schema
├── public/
│   ├── icon.png       # App icon
│   └── manifest.json  # PWA manifest
└── vercel.json        # Vercel configuration
```

## 📄 License

Private - All rights reserved.
