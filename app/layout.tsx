import type { Metadata } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { AuthModalProvider } from '@/components/AuthModal';
import { AuthQueryWatcher } from '@/components/AuthQueryWatcher';
import { SiteAssistant } from '@/components/SiteAssistant';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Free AI Resume Checker & ATS Resume Scanner | CheckMyResume AI',
    template: '%s | CheckMyResume AI',
  },
    icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  description:
    'Use CheckMyResume AI as a free resume checker and ATS resume scanner to improve your resume, boost keyword matching, write better cover letters, and prepare for interviews.',
  keywords: [
    'free resume checker',
    'resume checker',
    'ATS resume checker',
    'resume score',
    'resume analysis',
    'cover letter writer',
    'mock interview prep',
    'job application coach',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Free AI Resume Checker & ATS Resume Scanner | CheckMyResume AI',
    description:
      'Instantly analyze your resume, score your ATS match, and improve your job applications with AI guidance.',
    type: 'website',
    locale: 'en_US',
    siteName: 'CheckMyResume AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Resume Checker & ATS Resume Scanner | CheckMyResume AI',
    description:
      'Instantly analyze your resume, score your ATS match, and improve your job applications with AI guidance.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <AuthProvider>
          <AuthModalProvider>
            {children}
            <AuthQueryWatcher />
            <SiteAssistant />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
