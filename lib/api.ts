import type {
  Analysis,
  AnalysisSummary,
  AgentStep,
  Analytics,
  BillingStatus,
  Comparison,
  ComparisonSummary,
  InterviewSession,
  InterviewSummary,
  InterviewTurn,
  Payment,
  Plan,
  PlansResponse,
  ResumeSummary,
  User,
  AdminOverview,
  AdminUser,
  AdminUserDetail,
  AdminPayment,
  ContactMsg,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const NO_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/google', '/auth/logout'];

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401 && retry && !NO_REFRESH.includes(path)) {
    if (await tryRefresh()) return request<T>(path, options, false);
  }

  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ needsVerification: boolean; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  google: (idToken: string) =>
    request<{ user: User }>('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
  verifyOtp: (email: string, code: string) =>
    request<{ user: User }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, code }) }),
  resendOtp: (email: string) =>
    request<{ ok: true }>('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  forgotPassword: (email: string) =>
    request<{ ok: true }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email: string, code: string, password: string) =>
    request<{ ok: true }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    }),
  updateProfile: (name: string) =>
    request<{ user: User }>('/auth/profile', { method: 'PATCH', body: JSON.stringify({ name }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  requestEmailChange: (newEmail: string, password: string) =>
    request<{ ok: true; newEmail: string }>('/auth/change-email/request', {
      method: 'POST',
      body: JSON.stringify({ newEmail, password }),
    }),
  verifyEmailChange: (code: string) =>
    request<{ user: User }>('/auth/change-email/verify', { method: 'POST', body: JSON.stringify({ code }) }),
  me: () => request<{ user: User }>('/auth/me'),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),

  // Resumes
  listResumes: () => request<{ resumes: ResumeSummary[] }>('/resumes'),
  getResume: (id: string) =>
    request<{ resume: { _id: string; label: string; rawText: string; sourceType: string } }>(`/resumes/${id}`),
  createResumeText: (body: { label?: string; text: string }) =>
    request<{ resume: ResumeSummary }>('/resumes', { method: 'POST', body: JSON.stringify(body) }),
  uploadResume: (file: File, label?: string) => {
    const form = new FormData();
    form.append('resume', file);
    if (label) form.append('label', label);
    return request<{ resume: ResumeSummary }>('/resumes/upload', { method: 'POST', body: form });
  },
  deleteResume: (id: string) => request<{ ok: true }>(`/resumes/${id}`, { method: 'DELETE' }),

  // Analyses
  listAnalyses: () => request<{ analyses: AnalysisSummary[] }>('/analyses'),
  getAnalysis: (id: string) => request<{ analysis: Analysis }>(`/analyses/${id}`),

  // Comparisons
  listComparisons: () => request<{ comparisons: ComparisonSummary[] }>('/comparisons'),
  getComparison: (id: string) => request<{ comparison: Comparison }>(`/comparisons/${id}`),

  // Interviews
  startInterview: (body: { jobTitle?: string; jobDescription?: string; resumeId?: string; count?: number }) =>
    request<{ session: InterviewSession; credits: number; plan: string }>('/interviews', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  answerQuestion: (sessionId: string, turnId: string, answer: string) =>
    request<{ turn: InterviewTurn; session: InterviewSession }>(
      `/interviews/${sessionId}/turns/${turnId}/answer`,
      { method: 'POST', body: JSON.stringify({ answer }) }
    ),
  listInterviews: () => request<{ sessions: InterviewSummary[] }>('/interviews'),
  getInterview: (id: string) => request<{ session: InterviewSession }>(`/interviews/${id}`),

  // Analytics & billing
  analytics: () => request<Analytics>('/analytics'),
  plans: () => request<PlansResponse>('/billing/plans'),
  billingStatus: () => request<BillingStatus>('/billing/status'),
  createCheckout: (plan: Plan) =>
    request<{ url: string }>('/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
  confirmPayment: (paymentId: string) =>
    request<{ ok: true; plan: string; status: string }>('/billing/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),
  devUpgrade: (plan: Plan) =>
    request<{ user: User }>('/billing/dev-upgrade', { method: 'POST', body: JSON.stringify({ plan }) }),
  cancelSubscription: () =>
    request<{ ok: true; subscriptionStatus: string | null }>('/billing/cancel', { method: 'POST' }),
  payments: () => request<{ payments: Payment[] }>('/billing/payments'),

  // Public
  contact: (body: { name: string; email: string; message: string }) =>
    request<{ ok: true }>('/contact', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  adminOverview: () => request<AdminOverview>('/admin/overview'),
  adminUsers: (q?: string) =>
    request<{ users: AdminUser[] }>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  adminUser: (id: string) => request<AdminUserDetail>(`/admin/users/${id}`),
  adminBlock: (id: string, blocked: boolean) =>
    request<{ user: AdminUser }>(`/admin/users/${id}/block`, { method: 'POST', body: JSON.stringify({ blocked }) }),
  adminSetPlan: (id: string, plan: Plan) =>
    request<{ user: AdminUser }>(`/admin/users/${id}/plan`, { method: 'POST', body: JSON.stringify({ plan }) }),
  adminPayments: () => request<{ payments: AdminPayment[] }>('/admin/payments'),
  adminContacts: () => request<{ messages: ContactMsg[] }>('/admin/contacts'),
  adminMarkContact: (id: string) =>
    request<{ ok: true }>(`/admin/contacts/${id}/read`, { method: 'POST' }),
  adminNotify: (body: { subject: string; message: string; audience: 'all' | 'selected'; userIds?: string[] }) =>
    request<{ queued: number }>('/admin/notify', { method: 'POST', body: JSON.stringify(body) }),
};


async function sseFetch(path: string, body: unknown): Promise<Response> {
  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

  let res = await doFetch();
  if (res.status === 401 && (await tryRefresh())) res = await doFetch();

  if (!res.ok || !res.body) throw new ApiError(res.status, await parseError(res));
  return res;
}

async function consumeSSE<T>(res: Response, onEvent: (event: T) => void): Promise<void> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data:'));
      if (!line) continue;
      try {
        onEvent(JSON.parse(line.slice(5).trim()) as T);
      } catch {
        /* ignore malformed frame */
      }
    }
  }
}

export interface AnalysisStreamEvent {
  type: 'start' | 'step' | 'done' | 'error';
  analysisId?: string;
  step?: AgentStep;
  analysis?: Analysis;
  credits?: number;
  plan?: string;
  message?: string;
}

export async function streamAnalysis(
  body: { resumeId: string; jobTitle?: string; company?: string; jobDescription: string },
  onEvent: (event: AnalysisStreamEvent) => void
): Promise<void> {
  const res = await sseFetch('/analyses', body);
  await consumeSSE(res, onEvent);
}

export interface ComparisonStreamEvent {
  type: 'start' | 'step' | 'done' | 'error';
  comparisonId?: string;
  step?: AgentStep;
  comparison?: Comparison;
  credits?: number;
  plan?: string;
  message?: string;
}

export async function streamComparison(
  body: { resumeIds: string[]; jobTitle?: string; jobDescription: string },
  onEvent: (event: ComparisonStreamEvent) => void
): Promise<void> {
  const res = await sseFetch('/comparisons', body);
  await consumeSSE(res, onEvent);
}

export interface ChatStreamEvent {
  type: 'delta' | 'done' | 'error';
  text?: string;
  remaining?: number | null;
  message?: string;
}

export async function streamChat(
  analysisId: string,
  message: string,
  onEvent: (event: ChatStreamEvent) => void
): Promise<void> {
  const res = await sseFetch(`/analyses/${analysisId}/chat`, { message });
  await consumeSSE(res, onEvent);
}

export interface AssistantStreamEvent {
  type: 'delta' | 'done' | 'error';
  text?: string;
  message?: string;
}

export async function downloadInvoice(paymentId: string): Promise<Blob> {
  const doFetch = () =>
    fetch(`${API_BASE}/billing/payments/${paymentId}/invoice`, { credentials: 'include' });
  let res = await doFetch();
  if (res.status === 401 && (await tryRefresh())) res = await doFetch();
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  return res.blob();
}

/** Streams an answer from the public site assistant. */
export async function streamAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  onEvent: (event: AssistantStreamEvent) => void
): Promise<void> {
  const res = await sseFetch('/assistant/chat', { messages });
  await consumeSSE(res, onEvent);
}
