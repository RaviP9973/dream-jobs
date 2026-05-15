# Dream Jobs 🚀

A modern, full-stack job board platform built with Next.js 16, allowing companies to post jobs and job seekers to find and apply for their dream positions.

## 📋 Features

### For Companies
- 🏢 Company profile management
- 📝 Create and manage job postings
- 💳 Stripe-powered payment system for job listings
- 📊 View and manage job applications
- ⏰ Flexible listing duration options
- 📧 Email notifications for new applications

### For Job Seekers
- 👤 User profile with resume upload
- 🔍 Browse and filter job listings
- ⭐ Save favorite jobs
- 📄 Apply to jobs with resume
- 📱 Responsive design for all devices

### General Features
- 🔐 Secure authentication with NextAuth (GitHub & Google OAuth)
- 🎨 Dark/Light theme support
- 🛡️ Bot protection with Arcjet
- ⚡ Real-time job processing with Inngest
- 📧 Email notifications via Resend
- 📁 File uploads with UploadThing
- 💾 MongoDB database with Prisma ORM
- 🎯 Rich text editor for job descriptions

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB
- **ORM:** Prisma
- **Authentication:** NextAuth v5
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI & shadcn/ui
- **File Uploads:** UploadThing
- **Email:** Resend
- **Background Jobs:** Inngest
- **Security:** Arcjet
- **Forms:** React Hook Form + Zod
- **Rich Text:** Tiptap

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- pnpm (recommended) or npm
- MongoDB database
- Accounts for external services (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dream-jobs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   
   ```env
   # Database
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dream-jobs"
   
   # NextAuth
   AUTH_SECRET="your-auth-secret-generate-with-openssl-rand-base64-32"
   AUTH_GITHUB_ID="your-github-oauth-client-id"
   AUTH_GITHUB_SECRET="your-github-oauth-client-secret"
   AUTH_GOOGLE_ID="your-google-oauth-client-id"
   AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"
   
   # Stripe
   SECRET_STRIPE_KEY="sk_test_your-stripe-secret-key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
   
   # UploadThing
   UPLOADTHING_TOKEN="your-uploadthing-token"
   
   # Resend (Email)
   RESEND_API_KEY="re_your-resend-api-key"
   
   # Inngest
   INNGEST_EVENT_KEY="your-inngest-event-key"
   INNGEST_SIGNING_KEY="your-inngest-signing-key"
   
   # Arcjet (Security)
   ARCJET_KEY="your-arcjet-key"
   
   # App URL
   NEXT_PUBLIC_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables Setup Guide

### MongoDB Database
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and add it to `DATABASE_URL`

### NextAuth (Authentication)
1. **GitHub OAuth:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Set Homepage URL: `http://localhost:3000`
   - Set Callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Secret

2. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

3. **Generate AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

### Stripe (Payments)
1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard → Developers → API keys
3. Set up webhook endpoint at `/api/webhook/stripe`
4. Add webhook events: `checkout.session.completed`, `payment_intent.succeeded`

### UploadThing (File Uploads)
1. Sign up at [UploadThing](https://uploadthing.com)
2. Create a new app
3. Copy your token

### Resend (Email)
1. Create account at [Resend](https://resend.com)
2. Verify your domain (or use onboarding@resend.dev for testing)
3. Generate API key

### Inngest (Background Jobs)
1. Sign up at [Inngest](https://www.inngest.com)
2. Create a new app
3. Get your Event Key and Signing Key

### Arcjet (Security)
1. Create account at [Arcjet](https://arcjet.com)
2. Create a new site
3. Copy your API key

## 📂 Project Structure

```
dream-jobs/
├── app/                          # Next.js app directory
│   ├── (mainLayout)/            # Main layout routes
│   │   ├── page.tsx            # Home page with job listings
│   │   ├── favorites/          # Saved jobs
│   │   ├── job/[jobId]/        # Job details
│   │   ├── my-jobs/            # Company job management
│   │   ├── post-job/           # Create new job posting
│   │   └── resume/             # View applicant resumes
│   ├── api/                     # API routes
│   │   ├── auth/               # NextAuth handlers
│   │   ├── inngest/            # Background job functions
│   │   ├── uploadthing/        # File upload handlers
│   │   └── webhook/stripe/     # Stripe webhook
│   ├── actions.ts              # Server actions
│   ├── utils/                  # Utility functions
│   ├── login/                  # Authentication pages
│   ├── onboarding/             # User setup flow
│   └── payment/                # Payment success/cancel pages
├── components/                  # React components
│   ├── auth/                   # Auth components
│   ├── forms/                  # Form components
│   ├── general/                # Shared components
│   ├── richTextEditor/         # Job description editor
│   └── ui/                     # UI primitives (shadcn/ui)
├── prisma/
│   └── schema.prisma           # Database schema
└── hooks/                       # Custom React hooks
```

## 🎯 Key Pages

- `/` - Browse all active job listings
- `/login` - User authentication
- `/onboarding` - First-time user setup
- `/post-job` - Create new job posting (companies)
- `/my-jobs` - Manage your job posts (companies)
- `/job/[jobId]` - View job details and apply
- `/favorites` - Saved jobs (job seekers)
- `/resume/[applicationId]` - View applicant resume (companies)

## 🔒 User Roles

The application supports two user types:

1. **Company** - Can post jobs, manage listings, and review applications
2. **Job Seeker** - Can browse jobs, save favorites, and apply to positions

Users select their role during onboarding.

## 💳 Payment System

Companies must purchase listing durations to activate job posts:
- Different duration options (7, 14, 30 days, etc.)
- Stripe Checkout integration
- Automatic job expiration handling
- Email notifications

## 📧 Email Notifications

The application sends emails for:
- New job applications (to companies)
- Job post expiration warnings (to companies)
- Application status updates

## 🔐 Security Features

- OAuth authentication (GitHub, Google)
- Bot detection and protection (Arcjet)
- Rate limiting
- Shield protection for sensitive routes
- Secure webhook handling
- Environment variable validation

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Important Deployment Notes

- Update `NEXT_PUBLIC_URL` to your production URL
- Set up production webhook URLs for Stripe and Inngest
- Use production credentials for all services
- Ensure MongoDB Atlas allows connections from Vercel IPs

## 📜 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:push      # Push schema to database
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🆘 Support

For questions or issues, please open an issue in the repository.

---

Built with ❤️ using Next.js
