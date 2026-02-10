import { useState, useEffect } from 'react'
import './MyRoom.css'

// 이미지 import
import rubyjjiImg from '../assets/mons/rubyjji.png'
import rubyeggImg from '../assets/mons/rubyegg.png'

function MyRoom({ isGuest }) {
  // 독서몬 보유 여부
  const [hasDokseomon, setHasDokseomon] = useState(false)
  const [dokseomonInfo, setDokseomonInfo] = useState(null)
  
  // 독서몬 위치/상태
  const [dokseomon, setDokseomon] = useState({
    x: 50,
    y: 50,
    targetX: 50,
    targetY: 50,
    direction: 1,
    isMoving: false,
  })
  
  // 말풍선 상태
  const [dialogue, setDialogue] = useState(null)
  
  // 대사 목록
  const dialogues = [
    "반가워! 📚",
    "오늘도 책 읽을 거야?",
    "같이 독서하자!",
    "새로운 책이 기다리고 있어!",
    "힘내! 넌 할 수 있어!",
  ]

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

  // 주기적으로 독서몬 상태 확인 (부화 후 반영)
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
  
  // 랜덤 목표 지점 설정
  const setNewTarget = () => {
    const newTargetX = 15 + Math.random() * 70
    const newTargetY = 30 + Math.random() * 40
    
    setDokseomon(prev => ({
      ...prev,
      targetX: newTargetX,
      targetY: newTargetY,
      direction: newTargetX > prev.x ? 1 : -1,
      isMoving: true,
    }))
  }
  
  // 움직임 애니메이션
  useEffect(() => {
    if (!hasDokseomon) return
    
    const moveInterval = setInterval(() => {
      setDokseomon(prev => {
        const dx = prev.targetX - prev.x
        const dy = prev.targetY - prev.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 1) {
          return { ...prev, isMoving: false }
        }
        
        const speed = 0.3
        const newX = prev.x + (dx / distance) * speed
        const newY = prev.y + (dy / distance) * speed
        
        return {
          ...prev,
          x: newX,
          y: newY,
          direction: dx > 0 ? 1 : -1,
        }
      })
    }, 30)
    
    return () => clearInterval(moveInterval)
  }, [hasDokseomon])
  
  // 주기적으로 새 목표 설정
  useEffect(() => {
    if (!hasDokseomon) return
    
    const wanderInterval = setInterval(() => {
      if (!dokseomon.isMoving && !dialogue) {
        setNewTarget()
      }
    }, 3000)
    
    return () => clearInterval(wanderInterval)
  }, [hasDokseomon, dokseomon.isMoving, dialogue])
  
  // 초기 목표 설정
  useEffect(() => {
    if (hasDokseomon) {
      setTimeout(() => setNewTarget(), 1000)
    }
  }, [hasDokseomon])
  
  // 독서몬 클릭 핸들러
  const handleClick = () => {
    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)]
    setDialogue(randomDialogue)
    
    setTimeout(() => {
      setDialogue(null)
    }, 3000)
  }
  
  return (
    <div className="page myroom">
      {/* 배경 장식 */}
      <div className="decorations">
        <span className="deco deco-1">🕯️</span>
        <span className="deco deco-2">⭐</span>
        <span className="deco deco-3">🌙</span>
      </div>
      
      {/* 독서몬 - 보유한 경우에만 표시 */}
      {hasDokseomon && (
        <div 
          className={`dokseomon ${dokseomon.isMoving ? 'walking' : 'idle'}`}
          style={{
            left: `${dokseomon.x}%`,
            top: `${dokseomon.y}%`,
            transform: `translate(-50%, -50%) scaleX(${dokseomon.direction})`,
          }}
          onClick={handleClick}
        >
          <img 
            src={rubyjjiImg} 
            alt={dokseomonInfo?.name || '독서몬'} 
            className="dokseomon-sprite"
          />
          
          {dialogue && (
            <div className="dialogue-bubble" style={{
              transform: `scaleX(${dokseomon.direction})`
            }}>
              {dialogue}
            </div>
          )}
          
          <div className="dokseomon-name" style={{
            transform: `scaleX(${dokseomon.direction})`
          }}>
            {dokseomonInfo?.name || '루비'}
          </div>
        </div>
      )}
      
      {/* 안내 메시지 - 독서몬이 없는 경우 */}
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