import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Logo } from '@/components/Logo';
import { OpenAuth } from '@/components/OpenAuth';
import { LandingDemo } from '@/components/LandingDemo';
import { Pricing } from '@/components/Pricing';
import { Reveal } from '@/components/Reveal';
import { Target, FileText, Mail, MessageSquare, Compass, ArrowRight, Brain, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Target, title: 'ATS match scoring', body: 'See exactly how your resume scores against a job — with the keywords you have and the ones you’re missing.' },
  { icon: FileText, title: 'Resume tailoring', body: 'The agent rewrites your bullets to target the role, quantified and ATS-friendly — without inventing anything.' },
  { icon: Mail, title: 'Cover letters', body: 'A tailored, specific cover letter for each application, grounded in your real experience.' },
  { icon: MessageSquare, title: 'Mock interviews', body: 'Role-specific questions, your answers scored 0–10 with concrete, actionable feedback.' },
  { icon: Compass, title: 'Best-fit picker', body: 'Compare up to 5 resumes against a job and let the agent name your strongest one.' },
  { icon: Brain, title: 'Ask follow-ups', body: 'Chat with your coach about any result — like ChatGPT, but grounded in your actual analysis.' },
];

const STEPS = [
  { n: '01', title: 'Add your resume', body: 'Upload a PDF/DOCX or paste it in. The agent extracts and understands your real experience.' },
  { n: '02', title: 'Paste a job', body: 'Drop in any job description. The agent screens you against it like a recruiter would.' },
  { n: '03', title: 'Get coached', body: 'Watch the agent work, then get your score, tailored resume, cover letter, and interview prep.' },
];

const seoSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CheckMyResume AI',
  applicationCategory: 'CareerApplication',
  operatingSystem: 'All',
  url: '/',
  description:
    'AI-powered free resume checker and ATS resume scanner for job seekers who want better keyword matching, cover letters, and interview prep.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Free resume checker',
    'ATS resume scoring',
    'Resume tailoring',
    'Cover letter generation',
    'Mock interview prep',
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }}
      />
      <Navbar />

      <section className="container-page relative overflow-hidden pt-16 pb-20 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-60px] -z-10 h-[460px] w-[min(880px,95vw)] -translate-x-1/2 rounded-full bg-brand-300/25 blur-[130px]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge mx-auto mb-6 animate-fade-up border border-line bg-surface text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Agentic AI · powered by tool-calling
          </span>
          <h1
            className="animate-fade-up font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-6xl"
            style={{ animationDelay: '80ms' }}
          >
            The best free
            <span className="text-brand-600"> resume checker</span>
            for ATS-ready applications.
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-ink-soft"
            style={{ animationDelay: '160ms' }}
          >
            CheckMyResume AI is a free resume checker and ATS resume scanner that helps you improve keyword match,
            tailor your resume, generate a cover letter, and practice mock interviews with real-time AI coaching.
          </p>
          <div
            className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '240ms' }}
          >
            <OpenAuth mode="signup" className="btn-brand px-6 py-3 text-base">
              Start free — 5 runs
              <ArrowRight className="h-4 w-4" />
            </OpenAuth>
            <a href="#pricing" className="btn-outline px-6 py-3 text-base">
              View pricing
            </a>
          </div>
          <p className="mt-4 animate-fade-up text-sm text-ink-muted" style={{ animationDelay: '300ms' }}>
            No credit card needed · Free tier included
          </p>
        </div>

        <div className="mt-16 animate-fade-up" style={{ animationDelay: '360ms' }}>
          <LandingDemo />
        </div>
      </section>

      <section className="border-t border-line bg-surface/50">
        <div className="container-page py-20">
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">Everything you need to land the role</h2>
            <p className="mt-3 text-lg text-ink-soft">
              Capabilities that work together — each one a tool the agent decides when to use.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 3) * 80}>
                <div className="card h-full p-6 transition-shadow duration-200 hover:shadow-lift">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">Why job seekers use CheckMyResume AI</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                Whether you need a free resume checker, an ATS resume checker, or a fast way to understand your
                resume score, CheckMyResume AI makes your application stronger with clear, actionable feedback.
              </p>
              <ul className="mt-6 space-y-3 text-ink-soft">
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 text-brand-600" />
                  <span>Find the missing keywords that help your resume pass ATS screening.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 text-brand-600" />
                  <span>See a practical resume score and get tailored suggestions for each role.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 text-brand-600" />
                  <span>Build a better application with cover letters, interview prep, and coaching in one place.</span>
                </li>
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-ink">Popular searches this app helps with</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {['free resume checker', 'ats resume checker', 'resume score', 'resume analysis', 'cover letter AI', 'mock interview'].map((item) => (
                  <span key={item} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-soft">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-page py-20">
        <Reveal>
          <h2 className="text-center text-3xl font-bold text-ink sm:text-4xl">Three steps to a stronger application</h2>
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {STEPS.map(({ n, title, body }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="text-center sm:text-left">
                <span className="font-display text-4xl font-bold text-brand-200">{n}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 border-t border-line bg-surface/50">
        <div className="container-page py-20">
          <Reveal>
            <Pricing />
          </Reveal>
        </div>
      </section>

      <section className="container-page py-20 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">Ready to forge your application?</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-ink-soft">Join free and run your first AI analysis in under a minute.</p>
          <div className="mt-8">
            <OpenAuth mode="signup" className="btn-brand px-6 py-3 text-base">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </OpenAuth>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
          <Logo />
          <nav className="flex items-center gap-5 text-sm text-ink-soft">
            <a href="#pricing" className="transition-colors hover:text-ink">Pricing</a>
            <Link href="/contact" className="transition-colors hover:text-ink">Contact</Link>
          </nav>
          <p className="text-sm text-ink-muted">
            Built with Next.js, Express, MongoDB, Redis & Groq · by Sreehari
          </p>
        </div>
      </footer>
    </div>
  );
}
