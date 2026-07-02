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
  title: 'CareerForge AI — Your AI Career Coach',
  description:
    'An agentic AI career coach that tailors your resume, writes cover letters, scores your ATS match, and runs mock interviews — watch the AI work, step by step.',
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
