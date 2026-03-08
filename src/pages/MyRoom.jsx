import { useState, useEffect } from 'react'
import './MyRoom.css'

// ── 기존 img 직접 렌더링 대신 Pixi 캔버스 모듈 사용 ──
import { DokseomonCanvas } from '../dokseomon'

function MyRoom({ isGuest }) {
  // 독서몬 보유 여부
  const [hasDokseomon, setHasDokseomon] = useState(false)
  const [dokseomonInfo, setDokseomonInfo] = useState(null)

  // 게스트 데이터에서 독서몬 확인
  useEffect(() => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      if (guestData.dokseomon && guestData.dokseomon.length > 0) {
        setHasDokseomon(true)
        setDokseomonInfo(guestData.dokseomon[0])
      } else {
        setHasDokseomon(false)
        setDokseomonInfo(null)
      }
    }
  }, [isGuest])

  // 주기적으로 독서몬 상태 확인 (소우주에서 부화 후 즉시 반영)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (isGuest) {
        const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
        if (guestData.dokseomon && guestData.dokseomon.length > 0) {
          setHasDokseomon(true)
          setDokseomonInfo(guestData.dokseomon[0])
        }
      }
    }, 1000)
    
    return () => clearInterval(checkInterval)
  }, [isGuest])

  return (
    <div className="page myroom">
      {/* 배경 장식 — 기존 그대로 유지 */}
      <div className="decorations">
        <span className="deco deco-1">🕯️</span>
        <span className="deco deco-2">⭐</span>
        <span className="deco deco-3">🌙</span>
      </div>

      {/* ── 독서몬 Pixi 캔버스 ── */}
      {hasDokseomon && (
        <DokseomonCanvas characterData={dokseomonInfo} />
      )}

      {/* 안내 메시지 — 독서몬이 없는 경우 (기존 그대로) */}
      {!hasDokseomon && (
        <div className="empty-room-message">
          <div className="empty-icon">🥚</div>
          <p>아직 독서몬이 없어요</p>
          <p className="sub-message">소우주에서 알을 부화시켜보세요!</p>
        </div>
      )}
    </div>
  )
}

export default MyRoom
