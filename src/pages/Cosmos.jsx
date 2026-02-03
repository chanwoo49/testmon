import { useState } from 'react'
import './Cosmos.css'

// 이미지 import
import rubyeggImg from '../assets/mons/rubyegg.png'

function Cosmos() {
  const [selectedMenu, setSelectedMenu] = useState(null)
  
  // 보유 알 목록
  const eggs = [
    { id: 1, name: '루비 알', image: rubyeggImg, category: '경영/경제' },
  ]
  
  // 메뉴 클릭 핸들러
  const handleMenuClick = (menu) => {
    setSelectedMenu(menu)
    setTimeout(() => setSelectedMenu(null), 3000)
  }
  
  return (
    <div className="page cosmos">
      {/* 타이틀 */}
      <div className="cosmos-header">
        <h2>🌌 소우주</h2>
        <p>새로운 독서몬을 만나는 신비로운 공간</p>
      </div>
      
      {/* 메뉴 박스들 */}
      <div className="cosmos-menu">
        <div 
          className={`menu-box quest ${selectedMenu === 'quest' ? 'selected' : ''}`}
          onClick={() => handleMenuClick('quest')}
        >
          <span className="menu-icon">📜</span>
          <span className="menu-title">퀘스트</span>
          <span className="menu-desc">줄거리를 읽고 알을 받아요</span>
          {selectedMenu === 'quest' && (
            <div className="menu-feedback">준비 중이에요!</div>
          )}
        </div>
        
        <div 
          className={`menu-box hatch ${selectedMenu === 'hatch' ? 'selected' : ''}`}
          onClick={() => handleMenuClick('hatch')}
        >
          <span className="menu-icon">🥚</span>
          <span className="menu-title">알 부화</span>
          <span className="menu-desc">우주먼지로 알을 부화시켜요</span>
          {selectedMenu === 'hatch' && (
            <div className="menu-feedback">부화할 알을 선택하세요!</div>
          )}
        </div>
      </div>
      
      {/* 보유 알 영역 */}
      <div className="eggs-section">
        <div className="section-title">
          <span>보유 알</span>
          <span className="egg-count">{eggs.length}개</span>
        </div>
        
        <div className="eggs-list">
          {eggs.map((egg) => (
            <div key={egg.id} className="egg-card">
              <div className="egg-image-wrapper">
                <img src={egg.image} alt={egg.name} className="egg-image" />
              </div>
              <div className="egg-info">
                <span className="egg-name">{egg.name}</span>
                <span className="egg-category">{egg.category}</span>
              </div>
              <button className="hatch-button">
                부화 150✨
              </button>
            </div>
          ))}
          
          {/* 빈 슬롯 */}
          <div className="egg-card empty">
            <div className="egg-image-wrapper">
              <span className="empty-icon">+</span>
            </div>
            <div className="egg-info">
              <span className="egg-name">빈 슬롯</span>
              <span className="egg-category">퀘스트로 알을 얻어요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cosmos