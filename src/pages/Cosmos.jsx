import { useState, useEffect } from 'react'
import { Sparkles, Orbit, Scroll, X, Egg } from 'lucide-react'
import './Cosmos.css'

// 이미지 import
import rubyeggImg from '../assets/mons/rubyegg.png'
import rubyjjiImg from '../assets/mons/rubyjji.png'

// 이미지 매핑
const EGG_IMAGES = {
  '루비 알': rubyeggImg,
  '신비의 알': rubyeggImg,
}

// 샘플 퀘스트 데이터
const QUEST_DATA = {
  title: '별빛 도서관의 비밀',
  category: '판타지 소설',
  summary: `당신은 잊혀진 별빛 도서관의 문 앞에 서 있습니다. 
  
은빛 달빛이 쏟아지는 밤, 고대의 문이 천천히 열리며 수천 권의 책들이 하늘을 날아다니는 환상적인 광경이 펼쳐집니다. 

각각의 책에서는 작은 별가루가 흩날리고, 책장 사이로 마법의 속삭임이 들려옵니다. 이곳의 수호자인 현자 '루미나스'가 당신을 맞이하며 말합니다.

"오래 기다렸습니다, 여행자여. 이 도서관에는 잊혀진 이야기들이 새로운 주인을 기다리고 있지요. 당신이 선택한 책은 당신의 영혼과 공명하여 특별한 친구를 깨울 것입니다."

당신은 빛나는 책장 사이를 거닐며, 마음이 이끄는 책을 찾아 모험을 시작합니다...`,
  rewardEgg: { name: '신비의 알', category: '판타지' },
}

const INITIAL_DOKSEOMON = []

function Cosmos({ isGuest }) {
  const [viewMode, setViewMode] = useState('main')
  const [stardust, setStardust] = useState(200)
  const [eggs, setEggs] = useState([])
  const [dokseomon, setDokseomon] = useState(INITIAL_DOKSEOMON)
  const [questTimer, setQuestTimer] = useState(30)
  const [questCompleted, setQuestCompleted] = useState(false)
  const [questClaimed, setQuestClaimed] = useState(false)

  // 초기화 및 데이터 불러오기
  useEffect(() => {
    const initialEggs = [
      { id: 1, name: '루비 알', category: '경영/경제', cost: 150 },
    ]
    
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      setStardust(guestData.stardust || 200)
      
      if (guestData.eggs !== undefined && guestData.eggs.length >= 0) {
        setEggs(guestData.eggs)
      } else {
        setEggs(initialEggs)
      }
      
      if (guestData.dokseomon) setDokseomon(guestData.dokseomon)
      if (guestData.questClaimed) setQuestClaimed(guestData.questClaimed)
    } else {
      setEggs(initialEggs)
    }
  }, [isGuest])

  // 데이터 저장
  const saveToStorage = (data) => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      Object.assign(guestData, data)
      localStorage.setItem('dokseomon_guest_data', JSON.stringify(guestData))
    }
  }

  // 퀘스트 타이머 시작
  useEffect(() => {
    if (viewMode === 'quest' && questTimer > 0 && !questCompleted) {
      const timer = setInterval(() => {
        setQuestTimer(prev => {
          if (prev <= 1) {
            setQuestCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [viewMode, questTimer, questCompleted])

  // 퀘스트 보상 받기
  const handleClaimReward = () => {
    const newEgg = {
      id: Date.now(),
      name: QUEST_DATA.rewardEgg.name,
      category: QUEST_DATA.rewardEgg.category,
      cost: 150,
    }
    const updatedEggs = [...eggs, newEgg]
    setEggs(updatedEggs)
    setQuestClaimed(true)
    saveToStorage({ eggs: updatedEggs, questClaimed: true })
    setViewMode('main')
  }

  // 알 부화
  const handleHatch = (egg) => {
    if (stardust < egg.cost) {
      alert('우주먼지가 부족합니다!')
      return
    }

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').slice(0, -1)

    const newDokseomon = {
      id: Date.now(),
      name: egg.name.replace(' 알', ''),
      image: rubyjjiImg,
      startDate: today,
    }

    const updatedStardust = stardust - egg.cost
    const updatedEggs = eggs.filter(e => e.id !== egg.id)
    const updatedDokseomon = [...dokseomon, newDokseomon]

    setStardust(updatedStardust)
    setEggs(updatedEggs)
    setDokseomon(updatedDokseomon)

    saveToStorage({
      stardust: updatedStardust,
      eggs: updatedEggs,
      dokseomon: updatedDokseomon,
    })

    alert(`🎉 ${newDokseomon.name}가 태어났습니다!`)
  }

  // 퀘스트 화면
  if (viewMode === 'quest') {
    return (
      <div className="page cosmos">
        <div className="cosmos-overlay" />
        <div className="quest-timer-bar">
          {questCompleted ? (
            <span className="timer-complete"><Sparkles size={16} strokeWidth={2} /> 읽기 완료! 보상을 받으세요</span>
          ) : (
            <>
              <span className="timer-text">{questTimer}초</span>
              <span className="timer-label">타이머 및 {questTimer}초 지난 후 보상받기</span>
            </>
          )}
        </div>
        <div className="quest-content">
          <div className="quest-book-info">
            <span className="quest-category">{QUEST_DATA.category}</span>
            <h2 className="quest-title">{QUEST_DATA.title}</h2>
          </div>
          <div className="quest-summary">
            <p>{QUEST_DATA.summary}</p>
          </div>
        </div>
        <div className="quest-footer">
          {questCompleted ? (
            <button className="claim-btn" onClick={handleClaimReward}><Egg size={16} strokeWidth={2} /> 알 받기</button>
          ) : (
            <button className="back-btn" onClick={() => setViewMode('main')}>돌아가기</button>
          )}
        </div>
      </div>
    )
  }

  // 독서몬 목록 화면
  if (viewMode === 'dokseomon') {
    return (
      <div className="page cosmos">
        <div className="cosmos-overlay" />
        <div className="dokseomon-list-container">
          <div className="section-header">
            <h2>나의 독서몬</h2>
            <button className="close-btn-x" onClick={() => setViewMode('main')}><X size={18} strokeWidth={2} /></button>
          </div>
          <div className="dokseomon-grid">
            {dokseomon.length > 0 ? (
              dokseomon.map((mon) => (
                <div key={mon.id} className="dokseomon-card">
                  <div className="dokseomon-image">
                    <img src={rubyjjiImg} alt={mon.name} />
                  </div>
                  <div className="dokseomon-info">
                    <span className="dokseomon-name">{mon.name}</span>
                    <span className="dokseomon-date">함께한 날: {mon.startDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-dokseomon">
                <p>아직 독서몬이 없어요</p>
                <p>알을 부화시켜보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 메인 화면
  return (
    <div className="page cosmos">
      <div className="cosmos-overlay" />
      <div className="cosmos-content">
        {/* 헤더 */}
        <div className="cosmos-header">
          <h2><Orbit size={20} strokeWidth={2} className="cosmos-title-icon" /> 소우주</h2>
          <div className="stardust-display"><Sparkles size={16} strokeWidth={2} /> <span>{stardust}</span></div>
        </div>

        {/* 퀘스트 박스 */}
        <button 
          className={`menu-box quest ${questClaimed ? 'disabled' : ''}`}
          onClick={() => !questClaimed && setViewMode('quest')}
          disabled={questClaimed}
        >
          <span className="menu-icon"><Scroll size={24} strokeWidth={1.8} /></span>
          <div className="menu-text">
            <span className="menu-title">퀘스트</span>
            <span className="menu-desc">
              {questClaimed ? '오늘의 퀘스트 완료!' : '줄거리를 읽고 알을 받아요'}
            </span>
          </div>
        </button>

        {/* 독서몬 박스 */}
        <button 
          className="menu-box dokseomon-box"
          onClick={() => setViewMode('dokseomon')}
        >
          <span className="menu-icon"><Egg size={24} strokeWidth={1.8} /></span>
          <div className="menu-text">
            <span className="menu-title">독서몬</span>
            <span className="menu-desc">보유 독서몬 {dokseomon.length}마리</span>
          </div>
        </button>

        {/* 보유 알 섹션 */}
        <div className="eggs-section">
          <div className="section-title-box">
            <h3 className="section-title"><Egg size={16} strokeWidth={2} /> 보유 알</h3>
            <span className="egg-count">{eggs.length}개</span>
          </div>

          {eggs.length > 0 ? (
            <div className="eggs-list">
              {eggs.map((egg) => (
                <div key={egg.id} className="egg-card">
                  <div className="egg-left">
                    <div className="egg-image">
                      <img src={EGG_IMAGES[egg.name] || rubyeggImg} alt={egg.name} />
                    </div>
                    <div className="egg-info">
                      <span className="egg-name">{egg.name}</span>
                      <span className="egg-category">{egg.category}</span>
                    </div>
                  </div>
                  <button className="hatch-btn" onClick={() => handleHatch(egg)}>
                    <span className="hatch-label">부화</span>
                    <span className="hatch-cost"><Sparkles size={12} strokeWidth={2} /> {egg.cost}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-eggs">
              <p>보유 중인 알이 없어요</p>
              <p>퀘스트를 완료해서 알을 받아보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cosmos