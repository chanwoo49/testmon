import { useState, useEffect } from 'react'
import './Library.css'

// 배경 이미지
import bookroomBg from '../assets/backgrounds/bookroom.png'

// 샘플 도서 데이터
const INITIAL_BOOKS = [
  { id: 1, title: '클린 코드', author: '로버트 마틴', category: '학습서', color: '#4A90D9', emoji: '📕', totalPages: 464 },
  { id: 2, title: '돈의 심리학', author: '모건 하우절', category: '경영/경제', color: '#50C878', emoji: '📗', totalPages: 336 },
  { id: 3, title: '셜록 홈즈', author: '아서 코난 도일', category: '추리소설', color: '#9B59B6', emoji: '📘', totalPages: 512 },
  { id: 4, title: '원피스 1권', author: '오다 에이치로', category: '만화', color: '#FF6B6B', emoji: '📙', totalPages: 200 },
  { id: 5, title: '나미야 잡화점', author: '히가시노 게이고', category: '소설', color: '#F4D03F', emoji: '📓', totalPages: 424 },
  { id: 6, title: '코스모스', author: '칼 세이건', category: '과학', color: '#5DADE2', emoji: '📔', totalPages: 672 },
]

// 샘플 리뷰 데이터
const INITIAL_REVIEWS = {
  1: [
    { id: 1, date: '2026.02.10', page: 464, content: '드디어 완독! 함수는 작게, 이름은 명확하게. 꼭 기억하자.' },
    { id: 2, date: '2026.01.20', page: 230, content: '리팩토링 챕터가 인상적이다. 실무에 바로 적용해봐야겠다.' },
  ],
  2: [
    { id: 1, date: '2026.02.05', page: 336, content: '돈에 대한 생각이 완전히 바뀌었다. 저축보다 투자!' },
  ],
}

const EMOJI_OPTIONS = ['📕', '📗', '📘', '📙', '📓', '📔', '📒', '📚']
const COLOR_OPTIONS = ['#4A90D9', '#50C878', '#9B59B6', '#FF6B6B', '#F4D03F', '#5DADE2', '#E91E63', '#FF9800']

function Library({ isGuest }) {
  const [books, setBooks] = useState(INITIAL_BOOKS)
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // 화면 상태: 'list' | 'reviews' | 'addReview' | 'addBook'
  const [viewMode, setViewMode] = useState('list')
  
  // 새 리뷰 입력 상태
  const [newReview, setNewReview] = useState({
    date: '',
    page: '',
    content: '',
  })
  
  // 새 책 입력 상태
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    emoji: '📕',
    color: '#4A90D9',
    totalPages: '',
  })

  // 저장된 데이터 불러오기
  useEffect(() => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      if (guestData.books) setBooks(guestData.books)
      if (guestData.reviews) setReviews(guestData.reviews)
    }
  }, [isGuest])

  // 데이터 저장 함수
  const saveToStorage = (updatedBooks, updatedReviews) => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      guestData.books = updatedBooks
      guestData.reviews = updatedReviews
      localStorage.setItem('dokseomon_guest_data', JSON.stringify(guestData))
    }
  }

  // 책 선택 → 리뷰 목록으로
  const handleBookClick = (book, index) => {
    setSelectedBook(book)
    setSelectedIndex(index)
    setViewMode('reviews')
  }

  // 나가기 (리스트로)
  const handleClose = () => {
    setSelectedBook(null)
    setViewMode('list')
  }

  // 이전 책
  const handlePrev = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : books.length - 1
    setSelectedIndex(newIndex)
    setSelectedBook(books[newIndex])
  }

  // 다음 책
  const handleNext = () => {
    const newIndex = selectedIndex < books.length - 1 ? selectedIndex + 1 : 0
    setSelectedIndex(newIndex)
    setSelectedBook(books[newIndex])
  }

  // 새 리뷰 추가 화면으로
  const handleAddReviewClick = () => {
    const today = new Date().toISOString().split('T')[0]
    setNewReview({
      date: today,
      page: '',
      content: '',
    })
    setViewMode('addReview')
  }

  // 리뷰 등록
  const handleSubmitReview = () => {
    if (!newReview.content.trim() || !newReview.date) return

    const formattedDate = newReview.date.replace(/-/g, '.')
    const reviewEntry = {
      id: Date.now(),
      date: formattedDate,
      page: parseInt(newReview.page) || 0,
      content: newReview.content,
    }

    const bookReviews = reviews[selectedBook.id] || []
    const updatedReviews = {
      ...reviews,
      [selectedBook.id]: [reviewEntry, ...bookReviews],
    }

    setReviews(updatedReviews)
    saveToStorage(books, updatedReviews)
    setViewMode('reviews')
  }

  // 책 추가 모달
  const handleAddBookClick = () => {
    setNewBook({
      title: '',
      author: '',
      emoji: '📕',
      color: '#4A90D9',
      totalPages: '',
    })
    setViewMode('addBook')
  }

  // 책 등록
  const handleSubmitBook = () => {
    if (!newBook.title.trim()) return

    const addedBook = {
      id: Date.now(),
      title: newBook.title,
      author: newBook.author || '작자 미상',
      category: '직접 등록',
      emoji: newBook.emoji,
      color: newBook.color,
      totalPages: parseInt(newBook.totalPages) || 0,
    }

    const updatedBooks = [...books, addedBook]
    setBooks(updatedBooks)
    saveToStorage(updatedBooks, reviews)
    setViewMode('list')
  }

  // ========== 리뷰 등록 화면 ==========
  if (viewMode === 'addReview' && selectedBook) {
    return (
      <div className="page library">
        <div className="library-background" style={{ backgroundImage: `url(${bookroomBg})` }} />
        <div className="library-overlay" />

        <div className="review-form-container">
          {/* 상단 닫기 */}
          <div className="form-header">
            <h3>{selectedBook.emoji} {selectedBook.title}</h3>
            <button className="close-btn-x" onClick={() => setViewMode('reviews')}>✕</button>
          </div>

          <div className="review-form">
            {/* 날짜 선택 */}
            <div className="form-group">
              <label>📅 날짜 선택</label>
              <input
                type="date"
                value={newReview.date}
                onChange={(e) => setNewReview({...newReview, date: e.target.value})}
              />
            </div>

            {/* 읽은 페이지 */}
            <div className="form-group">
              <label>📖 읽은 페이지</label>
              <div className="page-input-row">
                <input
                  type="number"
                  placeholder="0"
                  value={newReview.page}
                  onChange={(e) => setNewReview({...newReview, page: e.target.value})}
                />
                <span className="page-total">/ {selectedBook.totalPages || '???'} 페이지</span>
              </div>
            </div>

            {/* 내용 */}
            <div className="form-group">
              <label>✏️ 내용</label>
              <textarea
                placeholder="이 책을 읽으며 느낀 점을 적어보세요..."
                value={newReview.content}
                onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                rows={6}
              />
            </div>

            {/* 등록 버튼 */}
            <button 
              className="submit-btn"
              onClick={handleSubmitReview}
              disabled={!newReview.content.trim()}
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ========== 리뷰 목록 화면 ==========
  if (viewMode === 'reviews' && selectedBook) {
    const bookReviews = reviews[selectedBook.id] || []

    return (
      <div className="page library">
        <div className="library-background" style={{ backgroundImage: `url(${bookroomBg})` }} />
        <div className="library-overlay" />

        {/* 상단 네비게이션 */}
        <div className="note-nav">
          <div className="note-nav-left">
            <button className="nav-btn" onClick={handlePrev}>← 뒤로</button>
            <button className="nav-btn" onClick={handleNext}>앞으로 →</button>
          </div>
          <button className="close-btn-x" onClick={handleClose}>✕</button>
        </div>

        {/* 책 제목 */}
        <div className="book-title-bar">
          <span className="book-emoji">{selectedBook.emoji}</span>
          <span className="book-title">{selectedBook.title}</span>
        </div>

        {/* 리뷰 목록 */}
        <div className="reviews-container">
          {/* 과거 리뷰들 */}
          {bookReviews.length > 0 ? (
            <div className="reviews-list">
              {bookReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <span className="review-date">{review.date}</span>
                    {review.page > 0 && (
                      <span className="review-page">{review.page}p</span>
                    )}
                  </div>
                  <p className="review-content">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-reviews">
              <p>아직 작성된 리뷰가 없어요</p>
              <p>첫 독서 기록을 남겨보세요! ✨</p>
            </div>
          )}

          {/* + 새 리뷰 추가 버튼 */}
          <div className="add-review-btn" onClick={handleAddReviewClick}>
            <span className="add-icon">+</span>
            <span className="add-label">새 리뷰 추가</span>
          </div>
        </div>
      </div>
    )
  }

  // ========== 책 추가 모달 ==========
  if (viewMode === 'addBook') {
    return (
      <div className="page library">
        <div className="library-background" style={{ backgroundImage: `url(${bookroomBg})` }} />
        <div className="library-overlay" />

        <div className="add-modal-container">
          <div className="add-modal">
            <div className="add-modal-header">
              <h3>📚 새 책 등록</h3>
              <button className="close-btn-x" onClick={() => setViewMode('list')}>✕</button>
            </div>

            <div className="add-modal-body">
              <div className="input-group">
                <label>책 제목</label>
                <input
                  type="text"
                  placeholder="책 제목을 입력하세요"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>저자</label>
                <input
                  type="text"
                  placeholder="저자를 입력하세요"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>총 페이지 수</label>
                <input
                  type="number"
                  placeholder="페이지 수를 입력하세요"
                  value={newBook.totalPages}
                  onChange={(e) => setNewBook({...newBook, totalPages: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>아이콘</label>
                <div className="emoji-options">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      className={`emoji-btn ${newBook.emoji === emoji ? 'selected' : ''}`}
                      onClick={() => setNewBook({...newBook, emoji})}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>색상</label>
                <div className="color-options">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      className={`color-btn ${newBook.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewBook({...newBook, color})}
                    />
                  ))}
                </div>
              </div>

              {/* 미리보기 */}
              <div className="preview-section">
                <label>미리보기</label>
                <div className="book-preview" style={{ backgroundColor: newBook.color }}>
                  <span className="preview-emoji">{newBook.emoji}</span>
                  <span className="preview-title">{newBook.title || '책 제목'}</span>
                </div>
              </div>
            </div>

            <div className="add-modal-footer">
              <button className="cancel-btn" onClick={() => setViewMode('list')}>취소</button>
              <button 
                className="confirm-btn"
                onClick={handleSubmitBook}
                disabled={!newBook.title.trim()}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== 도서 리스트 화면 ==========
  return (
    <div className="page library">
      <div className="library-background" style={{ backgroundImage: `url(${bookroomBg})` }} />
      <div className="library-overlay" />

      <div className="library-content">
        <h2 className="library-title">📚 내 서재</h2>
        
        <div className="book-grid">
          {books.map((book, index) => (
            <div 
              key={book.id}
              className="book-card"
              style={{ backgroundColor: book.color }}
              onClick={() => handleBookClick(book, index)}
            >
              <span className="book-card-emoji">{book.emoji}</span>
              <span className="book-card-title">{book.title}</span>
              <span className="book-card-author">{book.author}</span>
              {reviews[book.id]?.length > 0 && (
                <span className="book-card-badge">{reviews[book.id].length}</span>
              )}
            </div>
          ))}

          <div className="book-card add-card" onClick={handleAddBookClick}>
            <span className="add-icon">+</span>
            <span className="add-label">책 추가</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library