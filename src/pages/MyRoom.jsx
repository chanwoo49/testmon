import { useState, useEffect } from 'react'
import './MyRoom.css'

// 이미지 import
import rubyjjiImg from '../assets/mons/rubyjji.png'
import rubyeggImg from '../assets/mons/rubyegg.png'

function MyRoom() {
  // 독서몬 상태
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
  }, [])
  
  // 주기적으로 새 목표 설정
  useEffect(() => {
    const wanderInterval = setInterval(() => {
      if (!dokseomon.isMoving && !dialogue) {
        setNewTarget()
      }
    }, 3000)
    
    return () => clearInterval(wanderInterval)
  }, [dokseomon.isMoving, dialogue])
  
  // 초기 목표 설정
  useEffect(() => {
    setTimeout(() => setNewTarget(), 1000)
  }, [])
  
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
      
      {/* 독서몬 */}
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
          alt="루비" 
          className="dokseomon-sprite"
        />
        
        {/* 말풍선 */}
        {dialogue && (
          <div className="dialogue-bubble" style={{
            transform: `scaleX(${dokseomon.direction})`
          }}>
            {dialogue}
          </div>
        )}
        
        {/* 이름 */}
        <div className="dokseomon-name" style={{
          transform: `scaleX(${dokseomon.direction})`
        }}>
          루비
        </div>
      </div>
      
      {/* 알 (구석에 배치) */}
      <div className="egg-display">
        <img src={rubyeggImg} alt="알" className="egg-sprite" />
        <span className="egg-label">부화 대기중</span>
      </div>
    </div>
  )
}

export default MyRoom