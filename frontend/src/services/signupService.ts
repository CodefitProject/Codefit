export type EmailCheckResponse = { role: 'AVAILABLE' | 'DUPLICATE' };

const BASE = '/codefit/signup';

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

const signupService = {
  async checkEmailDuplicate(email: string): Promise<EmailCheckResponse> {
    return json<EmailCheckResponse>(`${BASE}/check-email?email=${encodeURIComponent(email)}`);
  },

  async register(payload: {
    name: string;
    birthDate: string;
    gender: string;
    phoneNumber: string;
    email: string;
    password: string;
    emailConsent: '0' | '1';
  }): Promise<{ success: boolean; baseUserId: number }>
  {
    return json(`${BASE}/register`, { method: 'POST', body: JSON.stringify(payload) });
  },

  async updateLocation(locationsCsv: string): Promise<{ success: boolean } & { baseUserId?: number }> {
    // baseUserId는 현재 로그인/세션 없으므로 프론트 저장값에서 사용하도록 확장 여지
    const baseUserId = Number(localStorage.getItem('signup_base_user_id') || '0');
    return json(`${BASE}/location`, { method: 'POST', body: JSON.stringify({ baseUserId, locationsCsv }) });
  },

  async updateSalary(selected: string): Promise<{ success: boolean }> {
    const baseUserId = Number(localStorage.getItem('signup_base_user_id') || '0');
    return json(`${BASE}/salary`, { method: 'POST', body: JSON.stringify({ baseUserId, selectedSalary: selected }) });
  },

  async updateCareer(payload: { career: string; careerType: 'freshman' | 'experienced'; careerPeriod?: string }): Promise<{ success: boolean }> {
    const baseUserId = Number(localStorage.getItem('signup_base_user_id') || '0');
    return json(`${BASE}/career`, { method: 'POST', body: JSON.stringify({ baseUserId, career: payload.career }) });
  },

  async updateAdditionalInfo(payload: { bio: string; profileImageName?: string }): Promise<{ success: boolean }> {
    const baseUserId = Number(localStorage.getItem('signup_base_user_id') || '0');
    return json(`${BASE}/additional`, { method: 'POST', body: JSON.stringify({ baseUserId, ...payload }) });
  }
};

export default signupService;


