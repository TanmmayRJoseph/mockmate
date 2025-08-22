# MockMate - AI-Powered Interview Coaching Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44.4-orange)](https://orm.drizzle.team/)

MockMate is an intelligent interview preparation platform that leverages AI to provide personalized interview questions, real-time feedback, and performance tracking. Whether you're preparing for technical interviews, behavioral assessments, or general job interviews, MockMate helps you build confidence and improve your interview skills through AI-powered coaching.

## ✨ Features

### 🤖 AI-Generated Questions
- **Role-Specific Questions**: Generate interview questions tailored to your job role and skills
- **Dynamic Content**: Questions are created using Google's Gemini AI for realistic, up-to-date content
- **Customizable Count**: Choose how many questions you want to practice with

### 🎤 Multi-Modal Responses
- **Text Answers**: Type your responses for detailed analysis
- **Audio Responses**: Record your answers for speech analysis
- **Text-to-Speech**: Listen to questions being read aloud using ElevenLabs integration

### 📊 Intelligent Feedback System
- **Tone Analysis**: Get scored feedback on your communication tone (1-100)
- **Clarity Assessment**: Evaluate how clear and concise your answers are
- **Keyword Matching**: Analyze how well your responses align with expected keywords
- **Actionable Suggestions**: Receive specific improvement recommendations

### 📈 Performance Tracking
- **Progress Monitoring**: Track your improvement over time
- **Performance Analytics**: View average scores across multiple sessions
- **Improvement Notes**: Get insights on areas for growth

### 🔐 User Management
- **Secure Authentication**: JWT-based authentication system
- **Profile Management**: Create and manage multiple job profiles
- **Session Persistence**: Save your progress and return anytime

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - State management
- **Lucide React** - Icon library

### Backend & APIs
- **Next.js API Routes** - Server-side API endpoints
- **Google Gemini AI** - Question generation and feedback analysis
- **ElevenLabs** - Text-to-speech functionality
- **JWT** - Authentication and authorization

### Database
- **PostgreSQL** - Primary database (Neon serverless)
- **Drizzle ORM** - Type-safe database queries and migrations

### Development Tools
- **ESLint** - Code linting
- **Drizzle Kit** - Database migrations and schema management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Google Gemini API key
- ElevenLabs API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mockmate.git
   cd mockmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp envsample .env
   ```
   
   Fill in your environment variables:
   ```env
   DATABASE_URL=your_postgres_neon_url
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_API_KEY=your_google_gemini_api_key
   ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. Create an Account
- Register with your email and password
- Log in to access your dashboard

### 2. Create a Job Profile
- Specify your target job role
- List your relevant skills and experience
- This helps generate personalized interview questions

### 3. Start an Interview Session
- Choose how many questions you want (default: 5)
- Questions are generated based on your profile
- You can listen to questions being read aloud

### 4. Answer Questions
- Type your responses or record audio
- Submit answers for AI analysis
- Receive detailed feedback and scores

### 5. Track Your Progress
- View performance analytics
- Monitor improvement over time
- Review feedback and suggestions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profiles
- `POST /api/profiles/createProfile` - Create job profile
- `GET /api/profiles/getAllProfile/[id]` - Get user profiles
- `DELETE /api/profiles/deleteProfile/[id]` - Delete profile

### Questions
- `POST /api/questions/generate` - Generate AI questions
- `GET /api/questions/getUsersQuestions/[id]` - Get user's questions
- `POST /api/questions/readAloud/[id]` - Text-to-speech for questions

### Answers & Feedback
- `POST /api/answer/submitAnswer` - Submit answer
- `GET /api/answer/ansById/[id]` - Get answer by ID
- `POST /api/feedback/generateFeedback` - Generate AI feedback
- `GET /api/feedback/feedbackForAnswer/[id]` - Get feedback for answer

### Performance
- `GET /api/performence/performencedata/[id]` - Get performance data
- `PUT /api/performence/updatePerformence/[id]` - Update performance

## 🏗️ Project Structure

```
mockmate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── pages/             # Application pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   ├── FeedbackCard.tsx   # Feedback display
│   │   └── QuestionReader.tsx # Question reader
│   ├── db/                   # Database configuration
│   │   ├── drizzle.ts        # Drizzle setup
│   │   └── schema.ts         # Database schema
│   ├── lib/                  # Utility libraries
│   ├── store/                # State management
│   └── utils/                # Helper functions
├── drizzle/                  # Database migrations
├── public/                   # Static assets
└── package.json
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `GOOGLE_API_KEY` | Google Gemini AI API key | Yes |
| `ELEVEN_LABS_API_KEY` | ElevenLabs API key for TTS | Yes |

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Use Railway's PostgreSQL and deployment
- **DigitalOcean**: Deploy to App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for intelligent question generation
- [ElevenLabs](https://elevenlabs.io/) for text-to-speech capabilities
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Built with ❤️ using Next.js, React, and AI**
