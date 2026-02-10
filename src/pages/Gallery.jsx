import { useState } from 'react'
import './Gallery.css'

// 샘플 이미지
import bookImg from '../assets/galleryimages/moneyproper.jpg'
import aiImg from '../assets/galleryimages/moneyproper_aft.jpg'

// 샘플 데이터 (하드코딩)
const SAMPLE_GALLERY = [
  {
    id: 1,
    bookImage: bookImg,
    aiImage: aiImg,
    title: '돈의 속성',
    author: '김승호',
    purchaseDate: '2026.01.01',
    completeDate: '2026.02.10',
    comment: '돈에 대한 생각이 완전히 바뀌었다. 저축보다 투자!',
  },
]

function Gallery({ isGuest }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [galleryItems, setGalleryItems] = useState(SAMPLE_GALLERY)

  // 카드 클릭
  const handleCardClick = (item) => {
    setSelectedCard(item)
  }

  // 닫기
  const handleClose = () => {
    setSelectedCard(null)
  }

  // + 버튼 클릭 (추후 구현)
  const handleAddClick = () => {
    alert('추후 구현 예정입니다!')
  }

  // 상세 카드 화면
  if (selectedCard) {
    return (
      <div className="page gallery">
        <div className="gallery-overlay" />
        
        {/* 상단 닫기 버튼 */}
        <div className="gallery-detail-header">
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* 그래픽 카드 */}
        <div className="graphic-card">
          {/* 상단: 책 이미지 + 정보 */}
          <div className="card-top">
            <div className="card-book-image">
              <img src={selectedCard.bookImage} alt={selectedCard.title} />
            </div>
            <div className="card-book-info">
              <h3 className="card-book-title">{selectedCard.title}</h3>
              <p className="card-book-author">{selectedCard.author}</p>
              <div className="card-dates">
                <p><span>구매일자</span> {selectedCard.purchaseDate}</p>
                <p><span>완독일자</span> {selectedCard.completeDate}</p>
              </div>
            </div>
          </div>

          {/* 중단: AI 생성 이미지 */}
          <div className="card-ai-image">
            <img src={selectedCard.aiImage} alt="AI 생성 이미지" />
          </div>

          {/* 하단: 한줄 소감 */}
          <div className="card-comment">
            <p className="comment-label">한줄 소감</p>
            <p className="comment-text">{selectedCard.comment}</p>
          </div>
        </div>
      </div>
    )
  }

  // 그리드 화면
  return (
    <div className="page gallery">
      <div className="gallery-overlay" />
      
      <div className="gallery-content">
        <h2 className="gallery-title">🖼️ 사진첩</h2>
        
        <div className="gallery-grid">
          {/* 기존 이미지들 */}
          {galleryItems.map((item) => (
            <div 
              key={item.id}
              className="gallery-item"
              onClick={() => handleCardClick(item)}
            >
              <img src={item.aiImage} alt={item.title} />
            </div>
          ))}
          
          {/* 빈 슬롯 (+ 버튼) */}
          {[...Array(8 - galleryItems.length)].map((_, index) => (
            <div 
              key={`empty-${index}`}
              className="gallery-item empty"
              onClick={handleAddClick}
            >
              <span className="add-icon">+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Gallery