import React, { useEffect, useMemo, useState } from 'react';
import SignupHeader from '../../components/SignupHeader/SignupHeader.tsx';
import './Signup.css';
import signupService from '../../services/signupService.ts';

type SignupKoreanMap = {
  이름: string;
  생일: string;
  성별: string;
  휴대폰번호: string;
  이메일: string;
  비밀번호: string;
  비밀번호확인: string;
  이메일수신동의: string;
  이메일인증여부: string; // "true" | "false"
};

const emptyMap: SignupKoreanMap = {
  이름: '',
  생일: '',
  성별: '',
  휴대폰번호: '',
  이메일: '',
  비밀번호: '',
  비밀번호확인: '',
  이메일수신동의: 'false',
  이메일인증여부: 'false'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup: React.FC = () => {
  const [dma_signup, setSignup] = useState<SignupKoreanMap>(() => {
    try {
      const saved = localStorage.getItem('signup_dma_signup');
      return saved ? JSON.parse(saved) : emptyMap;
    } catch {
      return emptyMap;
    }
  });

  const [passwordMatch, setPasswordMatch] = useState<'none' | 'ok' | 'fail'>('none');

  useEffect(() => {
    localStorage.setItem('signup_dma_signup', JSON.stringify(dma_signup));
  }, [dma_signup]);

  useEffect(() => {
    if (!dma_signup.비밀번호 || !dma_signup.비밀번호확인) {
      setPasswordMatch('none');
    } else if (dma_signup.비밀번호 === dma_signup.비밀번호확인) {
      setPasswordMatch('ok');
    } else {
      setPasswordMatch('fail');
    }
  }, [dma_signup.비밀번호, dma_signup.비밀번호확인]);

  const progress = useMemo(() => 0, []);

  const setField = (key: keyof SignupKoreanMap, value: string) =>
    setSignup(prev => ({ ...prev, [key]: value }));

  const validateEmail = (email: string) => EMAIL_REGEX.test(email);

  const handleEmailVerify = async () => {
    const email = dma_signup.이메일;
    if (!email || email.trim() === '') {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!validateEmail(email)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    try {
      const { role } = await signupService.checkEmailDuplicate(email);
      if (role === 'AVAILABLE') {
        alert('사용 가능한 이메일입니다.');
        setField('이메일인증여부', 'true');
      } else if (role === 'DUPLICATE') {
        alert('이미 사용 중인 이메일입니다.');
        setField('이메일인증여부', 'false');
      } else {
        alert('이메일 확인 중 오류가 발생했습니다.');
        setField('이메일인증여부', 'false');
      }
    } catch (e) {
      alert('이미 사용 중인 이메일입니다.');
      setField('이메일인증여부', 'false');
    }
  };

  const handleSignup = async () => {
    const name = dma_signup.이름;
    const birthDate = dma_signup.생일;
    const gender = dma_signup.성별;
    const phoneNumber = dma_signup.휴대폰번호;
    const email = dma_signup.이메일;
    const password = dma_signup.비밀번호;
    const emailConsent = dma_signup.이메일수신동의;
    const passwordConfirm = dma_signup.비밀번호확인;
    const emailVerified = dma_signup.이메일인증여부;

    if (!name || name.trim() === '') return alert('이름을 입력해주세요.');
    if (!birthDate || birthDate.trim() === '') return alert('생년월일을 입력해주세요.');
    if (!gender || gender.trim() === '') return alert('성별을 선택해주세요.');
    if (!phoneNumber || phoneNumber.trim() === '') return alert('휴대폰번호를 입력해주세요.');
    if (!email || email.trim() === '') return alert('이메일을 입력해주세요.');
    if (!password || password.trim() === '') return alert('비밀번호를 입력해주세요.');
    if (!passwordConfirm || passwordConfirm.trim() === '') return alert('비밀번호를 재확인해주세요.');
    if (password !== passwordConfirm) return alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
    if (emailVerified !== 'true') return alert('이메일 중복 확인을 해주세요.');

    // 원본 구조 유지: dma_register_request
    const dma_register_request = {
      name,
      birthDate,
      gender,
      phoneNumber,
      email,
      password,
      emailConsent: emailConsent === 'true' ? '1' : '0'
    };

    console.log('회원가입 요청 정보:', dma_register_request);
    try {
      const res = await signupService.register({
        ...dma_register_request,
        emailConsent: dma_register_request.emailConsent as '0' | '1'
      });
      if (res.success) {
        try {
          if (res.baseUserId) {
            localStorage.setItem('signup_base_user_id', String(res.baseUserId));
          }
        } catch {}
        window.location.href = '/signup/complete';
      } else {
        alert('회원가입 처리 중 오류가 발생했습니다.');
      }
    } catch {
      alert('회원가입 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <SignupHeader showProgress={false} progressPercent={progress} />
      <div className="signup-main-container">
        <div className="content-area">
          <h1 className="main-title">환영합니다!</h1>
          <p className="sub-title">당신의 취업을 진심으로 응원해요</p>

          <div className="signup-form">
            <div className="form-group">
              <label className="form-label required">이름</label>
              <input className="form-input" placeholder="이름을 입력하세요" value={dma_signup.이름} onChange={(e) => setField('이름', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label required">생년월일 (예시: 20010508)</label>
              <input className="form-input" placeholder="생년월일 8자리 (예: 20010508)" value={dma_signup.생일} onChange={(e) => setField('생일', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label required">성별</label>
              <div className="gender-options">
                <button type="button" className={`gender-option ${dma_signup.성별 === '남자' ? 'selected' : ''}`} onClick={() => setField('성별', '남자')}>남자</button>
                <button type="button" className={`gender-option ${dma_signup.성별 === '여자' ? 'selected' : ''}`} onClick={() => setField('성별', '여자')}>여자</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">휴대폰번호</label>
              <div className="phone-input-group">
                <div className="phone-prefix">+82</div>
                <input className="form-input" placeholder="휴대폰 번호 입력" value={dma_signup.휴대폰번호} onChange={(e) => setField('휴대폰번호', e.target.value)} />
              </div>
              <div className="info-text">* 입사지원, 채용담당자 등과 연락을 위해 사용됩니다.</div>
            </div>

            <div className="form-group">
              <label className="form-label required">이메일</label>
              <div className="email-input-group">
                <input className="form-input" placeholder="이메일 입력" value={dma_signup.이메일} onChange={(e) => setSignup(prev => ({ ...prev, 이메일: e.target.value, 이메일인증여부: 'false' }))} />
                <button type="button" className="btn-verify" onClick={handleEmailVerify}>중복확인</button>
              </div>
              {dma_signup.이메일인증여부 === 'true' && (
                <div className="verify-success" id="verify_success">✓ 이메일 중복 확인이 완료되었습니다.</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">비밀번호</label>
              <input type="password" className="form-input" placeholder="비밀번호 입력" value={dma_signup.비밀번호} onChange={(e) => setField('비밀번호', e.target.value)} />
              <div className="info-text">8-16자, 영문 대/소문자, 숫자, 특수문자 중 3개 이상 사용</div>
            </div>

            <div className="form-group">
              <label className="form-label required">비밀번호 재확인</label>
              <input type="password" className="form-input" placeholder="비밀번호를 다시 입력하세요" value={dma_signup.비밀번호확인} onChange={(e) => setField('비밀번호확인', e.target.value)} />
              <div className="password-match-status" style={{ display: passwordMatch === 'none' ? 'none' : 'block' }}>
                <div className="match-success" style={{ display: passwordMatch === 'ok' ? 'block' : 'none' }}>✓ 비밀번호가 일치합니다.</div>
                <div className="match-error" style={{ display: passwordMatch === 'fail' ? 'block' : 'none' }}>✗ 비밀번호가 일치하지 않습니다.</div>
              </div>
            </div>

            <button type="button" className="btn-signup" onClick={handleSignup}>가입 완료</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;


