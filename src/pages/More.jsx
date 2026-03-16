import { User, BarChart3, Bell, Palette, HelpCircle, FileText } from 'lucide-react'
import './More.css'

function More({ isGuest, onLogout }) {
  return (
    <div className="page more">
      <div className="more-content">
        <h2 className="more-title">더보기</h2>

        {/* 프로필 카드 */}
        <div className="more-card profile-card">
          <div className="profile-avatar">
            <User size={24} strokeWidth={1.8} />
          </div>
          <div className="profile-info">
            <span className="profile-name">{isGuest ? '게스트' : '사용자'}</span>
            <span className="profile-sub">
              {isGuest ? '게스트 모드로 이용 중' : '환영합니다!'}
            </span>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="more-section">
          <div className="more-card">
            <div className="more-menu-item">
              <span className="menu-icon-sm"><BarChart3 size={18} strokeWidth={1.8} /></span>
              <span className="menu-text">독서 통계</span>
              <span className="menu-arrow">›</span>
            </div>
            <div className="more-divider" />
            <div className="more-menu-item">
              <span className="menu-icon-sm"><Bell size={18} strokeWidth={1.8} /></span>
              <span className="menu-text">알림 설정</span>
              <span className="menu-arrow">›</span>
            </div>
            <div className="more-divider" />
            <div className="more-menu-item">
              <span className="menu-icon-sm"><Palette size={18} strokeWidth={1.8} /></span>
              <span className="menu-text">테마 설정</span>
              <span className="menu-arrow">›</span>
            </div>
          </div>
        </div>

        <div className="more-section">
          <div className="more-card">
            <div className="more-menu-item">
              <span className="menu-icon-sm"><HelpCircle size={18} strokeWidth={1.8} /></span>
              <span className="menu-text">도움말</span>
              <span className="menu-arrow">›</span>
            </div>
            <div className="more-divider" />
            <div className="more-menu-item">
              <span className="menu-icon-sm"><FileText size={18} strokeWidth={1.8} /></span>
              <span className="menu-text">이용약관</span>
              <span className="menu-arrow">›</span>
            </div>
          </div>
        </div>

        {/* 로그아웃 */}
        <button className="more-logout-btn" onClick={onLogout}>
          {isGuest ? '게스트 나가기' : '로그아웃'}
        </button>

        <p className="more-version">독서몬 v1.0</p>
      </div>
    </div>
  )
}

export default More
