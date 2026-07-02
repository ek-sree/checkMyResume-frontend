export type Plan = 'free' | 'starter' | 'pro' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  emailVerified: boolean;
  authProvider: 'local' | 'google';
  role: 'user' | 'admin';
  plan: Plan;
  credits: number;
  subscriptionStatus: string | null;
  createdAt: string;
}

export interface PlanDef {
  id: Plan;
  name: string;
  price: number;
  tagline: string;
  credits: number;
  unlimitedCredits: boolean;
  maxResumes: number;
  chatLimit: number;
  unlimitedChat: boolean;
  features: { compare: boolean; analytics: boolean; interviews: boolean };
  priority: boolean;
  highlights: string[];
}

export interface PlansResponse {
  plans: PlanDef[];
  billingEnabled: boolean;
  devUpgrade: boolean;
}

export interface Payment {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  method: 'card' | 'upi' | 'demo';
  status: string;
  invoiceNumber: string;
  createdAt: string;
}

// ── Admin ────────────────────────────────────────────────────────────────────

export interface AdminOverview {
  totals: {
    users: number;
    blocked: number;
    admins: number;
    resumes: number;
    analyses: number;
    interviews: number;
    comparisons: number;
    payments: number;
  };
  revenue: number;
  mrr: number;
  tokensUsed: number;
  aiRuns: number;
  planDistribution: Record<string, number>;
  contactsUnread: number;
  recentUsers: { id: string; name: string; email: string; plan: string; blocked: boolean; createdAt: string }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: Plan;
  credits: number;
  blocked: boolean;
  emailVerified: boolean;
  authProvider: 'local' | 'google';
  tokensUsed: number;
  aiRuns: number;
  subscriptionStatus: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  counts: { analyses: number; interviews: number; comparisons: number; resumes: number };
  resumes: { id: string; label: string; sourceType: string; createdAt: string }[];
  payments: { id: string; planName: string; amount: number; method: string; invoiceNumber: string; createdAt: string }[];
}

export interface AdminPayment {
  id: string;
  user: { name: string; email: string } | null;
  planName: string;
  amount: number;
  currency: string;
  method: string;
  invoiceNumber: string;
  createdAt: string;
}

export interface ContactMsg {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  at: string;
}

export interface ResumeSummary {
  id: string;
  label: string;
  sourceType: 'pdf' | 'docx' | 'text';
  excerpt: string;
  createdAt: string;
}

export interface SkillGap {
  skill: string;
  importance: 'critical' | 'nice-to-have';
  howToLearn: string;
}

export type StepType = 'thinking' | 'tool_call' | 'tool_result' | 'final';

export interface AgentStep {
  type: StepType;
  tool?: string;
  input?: unknown;
  output?: unknown;
  text?: string;
  at: string;
}

export interface Analysis {
  _id: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  matchScore: number | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
  tailoredResume: string;
  coverLetter: string;
  skillGaps: SkillGap[];
  steps: AgentStep[];
  chat: ChatTurn[];
  status: 'pending' | 'complete' | 'failed';
  createdAt: string;
}

export interface AnalysisSummary {
  _id: string;
  jobTitle: string;
  company: string;
  matchScore: number | null;
  status: string;
  createdAt: string;
}

export interface InterviewTurn {
  _id: string;
  question: string;
  category: string;
  answer: string;
  score: number | null;
  feedback: string;
}

export interface InterviewSession {
  _id: string;
  jobTitle: string;
  jobDescription: string;
  turns: InterviewTurn[];
  overallScore: number | null;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface InterviewSummary {
  id: string;
  jobTitle: string;
  status: string;
  overallScore: number | null;
  questionCount: number;
  createdAt: string;
}

export interface BillingStatus {
  plan: Plan;
  planName: string;
  credits: number;
  unlimitedCredits: boolean;
  subscriptionStatus: string | null;
  billingEnabled: boolean;
  devUpgrade: boolean;
}

export interface CompareRanking {
  resume: string;
  label: string;
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Comparison {
  _id: string;
  jobTitle: string;
  jobDescription: string;
  rankings: CompareRanking[];
  bestResume: string | null;
  bestLabel: string;
  rationale: string;
  steps: AgentStep[];
  status: 'pending' | 'complete' | 'failed';
  createdAt: string;
}

export interface ComparisonSummary {
  id: string;
  jobTitle: string;
  bestLabel: string;
  resumeCount: number;
  status: string;
  createdAt: string;
}

export interface Analytics {
  totals: { analyses: number; interviews: number; resumes: number; comparisons: number };
  avgMatch: number | null;
  bestMatch: number | null;
  avgInterview: number | null;
  scoreHistory: { date: string; score: number | null; label: string }[];
  topMissing: { keyword: string; count: number }[];
}
