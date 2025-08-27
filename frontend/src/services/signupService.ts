export type EmailCheckResponse = { role: 'AVAILABLE' | 'DUPLICATE' };

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const signupService = {
  async checkEmailDuplicate(email: string): Promise<EmailCheckResponse> {
    await delay(200);
    // 임시 규칙: test로 시작하면 중복, 그 외 사용 가능
    if (email && email.toLowerCase().startsWith('test')) {
      return { role: 'DUPLICATE' };
    }
    return { role: 'AVAILABLE' };
  },

  async register(payload: {
    name: string;
    birthDate: string;
    gender: string;
    phoneNumber: string;
    email: string;
    password: string;
    emailConsent: '0' | '1';
  }): Promise<{ success: boolean }> {
    await delay(200);
    return { success: true };
  },

  async updateLocation(locationsCsv: string): Promise<{ success: boolean }> {
    await delay(150);
    return { success: true };
  },

  async updateSalary(selected: string): Promise<{ success: boolean }> {
    await delay(150);
    return { success: true };
  },

  async updateCareer(payload: { career: string; careerType: 'freshman' | 'experienced'; careerPeriod?: string }): Promise<{ success: boolean }> {
    await delay(150);
    return { success: true };
  },

  async updateAdditionalInfo(payload: { bio: string; profileImageName?: string }): Promise<{ success: boolean }> {
    await delay(150);
    return { success: true };
  }
};

export default signupService;


