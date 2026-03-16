import { useState } from 'react'
import { BookOpen, Play } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './Login.css'

function Login({ onLogin, onGuestLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            nickname: email.split('@')[0],
            stardust: 200,
          })
        }
        
        setMessage('회원가입 완료! 이메일을 확인해주세요.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        onLogin(data.user)
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestStart = () => {
    onGuestLogin()
  }

  // 메인 화면 (게스트/로그인 선택)
  if (!showAuthForm) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1><BookOpen size={28} strokeWidth={1.8} className="login-logo-icon" /> 독서몬</h1>
          <p className="login-subtitle">책을 읽으면 독서몬이 태어나요</p>
          
          <button 
            className="guest-button"
            onClick={handleGuestStart}
          >
            <Play size={16} strokeWidth={2} /> 게스트로 시작하기
          </button>
          
          <p className="guest-notice">
            * 게스트 데이터는 로그아웃 시 삭제됩니다
          </p>
          
          <div className="divider">
            <span>또는</span>
          </div>
          
          <button 
            className="auth-button"
            onClick={() => setShowAuthForm(true)}
          >
            로그인 / 회원가입
          </button>
        </div>
      </div>
    )
  }

  // 로그인/회원가입 폼
  return (
    <div className="login-container">
      <div className="login-box">
        <button 
          className="back-button"
          onClick={() => setShowAuthForm(false)}
        >
          ← 뒤로
        </button>
        
        <h1><BookOpen size={28} strokeWidth={1.8} className="login-logo-icon" /> 독서몬</h1>
        <p className="login-subtitle">
          {isSignUp ? '새 계정 만들기' : '다시 오셨군요!'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          
          <button type="submit" disabled={loading}>
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
          </button>
        </form>
        
        {message && <p className="message">{message}</p>}
        
        <p className="toggle-text">
          {isSignUp ? '이미 계정이 있나요?' : '계정이 없나요?'}
          <button 
            type="button" 
            className="toggle-button"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? '로그인' : '회원가입'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login