# AI Resume Maker

A modern web application that helps users create and optimize professional resumes using AI. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **AI-Powered Optimization**: Automatically enhance resume content using advanced AI
- **Multiple Templates**: Choose from modern, minimal, and professional resume templates
- **Real-time Preview**: See changes instantly as you edit your resume
- **Smart Content Generation**: AI-generated suggestions for summaries, job descriptions, and skills
- **PDF Export**: Download your resume in PDF format
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User Authentication**: Secure user accounts and resume storage

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **AI Integration**: Claude AI (Anthropic)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Form Handling**: React Hook Form, Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-resume-maker.git
cd ai-resume-maker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your credentials:
```env
DATABASE_URL="your-mongodb-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
ANTHROPIC_API_KEY="your-api-key"
```

5. Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── resume/         # Resume-related pages
│   └── ...            # Other pages
├── components/         # React components
│   ├── templates/     # Resume templates
│   └── ui/           # UI components
├── lib/               # Utility functions and configurations
└── types/            # TypeScript type definitions
```

## Features in Detail

### AI Resume Optimization

The application uses Claude AI to:
- Generate compelling professional summaries
- Enhance job descriptions with action verbs and metrics
- Suggest relevant skills based on experience
- Create achievement-focused bullet points
- Generate missing content automatically

### Resume Templates

Three professionally designed templates:
- **Modern**: Clean and contemporary design
- **Minimal**: Simple and elegant layout
- **Professional**: Traditional business style

### User Dashboard

- View all created resumes
- Edit existing resumes
- Download resumes as PDF
- Real-time preview of changes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Anthropic](https://www.anthropic.com/)
- [MongoDB](https://www.mongodb.com/) 