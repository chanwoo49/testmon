import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import BGMPlayer from './BGMPlayer'
import './TopBar.css'

function TopBar({ user, isGuest, onLogout }) {
  const [stardust, setStardust] = useState(200)

  useEffect(() => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      setStardust(guestData.stardust || 200)
    }
  }, [isGuest])

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <span className="top-bar-title">독서몬</span>
        {isGuest && <span className="guest-badge">게스트</span>}
      </div>
      <div className="top-bar-right">
        <BGMPlayer />
        <div className="stardust">
          <Sparkles size={16} strokeWidth={2} />
          <span>{stardust}</span>
        </div>
        <button className="logout-button" onClick={onLogout}>
          {isGuest ? '나가기' : '로그아웃'}
        </button>
      </div>
    </div>
  )
}

export default TopBar
