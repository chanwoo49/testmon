import { useState, useEffect, useMemo } from 'react'
import { BookOpen, Calendar, BookOpenCheck, X, Search, Plus, Pencil, ImagePlus } from 'lucide-react'
import './Library.css'

// 책 표지 placeholder 경로
const COVER_PLACEHOLDER = '/books/placeholder.svg'

// 샘플 도서 데이터
const INITIAL_BOOKS = [
  { id: 1, title: '클린 코드', author: '로버트 마틴', category: '학습서', color: '#4A90D9', emoji: '📕', totalPages: 464, coverImage: '/books/clean-code.jpg' },
  { id: 2, title: '돈의 심리학', author: '모건 하우절', category: '경영/경제', color: '#50C878', emoji: '📗', totalPages: 336, coverImage: '/books/psychology-of-money.jpg' },
  { id: 3, title: '셜록 홈즈', author: '아서 코난 도일', category: '추리소설', color: '#9B59B6', emoji: '📘', totalPages: 512, coverImage: null },
  { id: 4, title: '원피스 1권', author: '오다 에이치로', category: '만화', color: '#FF6B6B', emoji: '📙', totalPages: 200, coverImage: null },
  { id: 5, title: '나미야 잡화점', author: '히가시노 게이고', category: '소설', color: '#F4D03F', emoji: '📓', totalPages: 424, coverImage: null },
  { id: 6, title: '코스모스', author: '칼 세이건', category: '과학', color: '#5DADE2', emoji: '📔', totalPages: 672, coverImage: null },
]

const INITIAL_REVIEWS = {
  1: [
    { id: 1, date: '2026.02.10', page: 464, content: '드디어 완독! 함수는 작게, 이름은 명확하게. 꼭 기억하자.' },
    { id: 2, date: '2026.01.20', page: 230, content: '리팩토링 챕터가 인상적이다. 실무에 바로 적용해봐야겠다.' },
  ],
  2: [
    { id: 1, date: '2026.02.05', page: 228, content: '돈에 대한 생각이 완전히 바뀌었다. 저축보다 투자!' },
  ],
}

const EMOJI_OPTIONS = ['📕', '📗', '📘', '📙', '📓', '📔', '📒', '📚']
const COLOR_OPTIONS = ['#4A90D9', '#50C878', '#9B59B6', '#FF6B6B', '#F4D03F', '#5DADE2', '#E91E63', '#FF9800']

// 도서 상태 추론
function getBookStatus(book, bookReviews) {
  if (!bookReviews || bookReviews.length === 0) return 'notStarted'
  const maxPage = Math.max(...bookReviews.map(r => r.page || 0))
  if (book.totalPages > 0 && maxPage >= book.totalPages) return 'completed'
  return 'reading'
}

function getCurrentPage(bookReviews) {
  if (!bookReviews || bookReviews.length === 0) return 0
  return Math.max(...bookReviews.map(r => r.page || 0))
}

const STATUS_LABELS = {
  notStarted: '시작 전',
  reading: '읽는 중',
  completed: '완독',
}

function Library({ isGuest }) {
  const [books, setBooks] = useState(INITIAL_BOOKS)
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewMode, setViewMode] = useState('list')
  const [newReview, setNewReview] = useState({ date: '', page: '', content: '' })
  const [newBook, setNewBook] = useState({ title: '', author: '', emoji: '📕', color: '#4A90D9', totalPages: '', coverImage: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      if (guestData.books) setBooks(guestData.books)
      if (guestData.reviews) setReviews(guestData.reviews)
    }
  }, [isGuest])

  const saveToStorage = (updatedBooks, updatedReviews) => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      guestData.books = updatedBooks
      guestData.reviews = updatedReviews
      localStorage.setItem('dokseomon_guest_data', JSON.stringify(guestData))
    }
  }

  // 책 데이터에 상태/진행률 부착
  const enrichedBooks = useMemo(() => {
    return books.map(book => {
      const bookReviews = reviews[book.id] || []
      const status = getBookStatus(book, bookReviews)
      const currentPage = getCurrentPage(bookReviews)
      const progress = book.totalPages > 0 ? Math.min(Math.round((currentPage / book.totalPages) * 100), 100) : 0
      const lastReviewAt = bookReviews.length > 0 ? bookReviews[0].date : null
      return { ...book, status, currentPage, progress, lastReviewAt, reviewCount: bookReviews.length }
    })
  }, [books, reviews])

  // 최근 읽은 책 (읽는 중 우선 → 완독 순, 시작 전 제외)
  const recentBooks = useMemo(() => {
    return enrichedBooks
      .filter(b => b.status !== 'notStarted')
      .sort((a, b) => {
        if (a.status === 'reading' && b.status !== 'reading') return -1
        if (a.status !== 'reading' && b.status === 'reading') return 1
        return (b.lastReviewAt || '').localeCompare(a.lastReviewAt || '')
      })
  }, [enrichedBooks])

  // 필터 + 검색 적용된 리스트
  const filteredBooks = useMemo(() => {
    let result = enrichedBooks
    if (activeFilter !== 'all') {
      result = result.filter(b => b.status === activeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }
    return result
  }, [enrichedBooks, activeFilter, searchQuery])

  const handleBookClick = (book, index) => {
    const originalIndex = books.findIndex(b => b.id === book.id)
    setSelectedBook(books[originalIndex])
    setSelectedIndex(originalIndex)
    setViewMode('reviews')
  }

  const handleClose = () => {
    setSelectedBook(null)
    setViewMode('list')
  }

  const handlePrev = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : books.length - 1
    setSelectedIndex(newIndex)
    setSelectedBook(books[newIndex])
  }

  const handleNext = () => {
    const newIndex = selectedIndex < books.length - 1 ? selectedIndex + 1 : 0
    setSelectedIndex(newIndex)
    setSelectedBook(books[newIndex])
  }

  const handleAddReviewClick = () => {
    const today = new Date().toISOString().split('T')[0]
    setNewReview({ date: today, page: '', content: '' })
    setViewMode('addReview')
  }

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
    const updatedReviews = { ...reviews, [selectedBook.id]: [reviewEntry, ...bookReviews] }
    setReviews(updatedReviews)
    saveToStorage(books, updatedReviews)
    setViewMode('reviews')
  }

  const handleAddBookClick = () => {
    setNewBook({ title: '', author: '', emoji: '📕', color: '#4A90D9', totalPages: '', coverImage: '' })
    setViewMode('addBook')
  }

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
      coverImage: newBook.coverImage.trim() || null,
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
        <div className="review-form-container">
          <div className="form-header">
            <h3>{selectedBook.emoji} {selectedBook.title}</h3>
            <button className="close-btn-x" onClick={() => setViewMode('reviews')}><X size={18} strokeWidth={2} /></button>
          </div>
          <div className="review-form">
            <div className="form-group">
              <label><Calendar size={14} strokeWidth={2} /> 날짜 선택</label>
              <input type="date" value={newReview.date} onChange={(e) => setNewReview({...newReview, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label><BookOpenCheck size={14} strokeWidth={2} /> 읽은 페이지</label>
              <div className="page-input-row">
                <input type="number" placeholder="0" value={newReview.page} onChange={(e) => setNewReview({...newReview, page: e.target.value})} />
                <span className="page-total">/ {selectedBook.totalPages || '???'} 페이지</span>
              </div>
            </div>
            <div className="form-group">
              <label><Pencil size={14} strokeWidth={2} /> 내용</label>
              <textarea placeholder="이 책을 읽으며 느낀 점을 적어보세요..." value={newReview.content} onChange={(e) => setNewReview({...newReview, content: e.target.value})} rows={6} />
            </div>
            <button className="submit-btn" onClick={handleSubmitReview} disabled={!newReview.content.trim()}>등록하기</button>
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
        <div className="note-nav">
          <div className="note-nav-left">
            <button className="nav-btn" onClick={handlePrev}>← 뒤로</button>
            <button className="nav-btn" onClick={handleNext}>앞으로 →</button>
          </div>
          <button className="close-btn-x" onClick={handleClose}><X size={18} strokeWidth={2} /></button>
        </div>
        <div className="book-title-bar">
          <span className="book-emoji">{selectedBook.emoji}</span>
          <span className="book-title">{selectedBook.title}</span>
        </div>
        <div className="reviews-container">
          {bookReviews.length > 0 ? (
            <div className="reviews-list">
              {bookReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <span className="review-date">{review.date}</span>
                    {review.page > 0 && <span className="review-page">{review.page}p</span>}
                  </div>
                  <p className="review-content">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-reviews">
              <p>아직 작성된 리뷰가 없어요</p>
              <p>첫 독서 기록을 남겨보세요!</p>
            </div>
          )}
          <div className="add-review-btn" onClick={handleAddReviewClick}>
            <span className="add-icon"><Plus size={24} strokeWidth={1.5} /></span>
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
        <div className="add-modal-container">
          <div className="add-modal">
            <div className="add-modal-header">
              <h3><BookOpen size={18} strokeWidth={1.8} /> 새 책 등록</h3>
              <button className="close-btn-x" onClick={() => setViewMode('list')}><X size={18} strokeWidth={2} /></button>
            </div>
            <div className="add-modal-body">
              <div className="input-group">
                <label>책 제목</label>
                <input type="text" placeholder="책 제목을 입력하세요" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>저자</label>
                <input type="text" placeholder="저자를 입력하세요" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} />
              </div>
              <div className="input-group">
                <label>총 페이지 수</label>
                <input type="number" placeholder="페이지 수를 입력하세요" value={newBook.totalPages} onChange={(e) => setNewBook({...newBook, totalPages: e.target.value})} />
              </div>
              <div className="input-group">
                <label><ImagePlus size={14} strokeWidth={2} /> 표지 이미지 경로</label>
                <input type="text" placeholder="/books/파일명.jpg" value={newBook.coverImage} onChange={(e) => setNewBook({...newBook, coverImage: e.target.value})} />
                <span className="input-hint">public/books/ 폴더에 이미지를 넣고 경로를 입력하세요</span>
              </div>
              <div className="input-group">
                <label>아이콘 (표지 없을 때 사용)</label>
                <div className="emoji-options">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button key={emoji} className={`emoji-btn ${newBook.emoji === emoji ? 'selected' : ''}`} onClick={() => setNewBook({...newBook, emoji})}>{emoji}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>색상</label>
                <div className="color-options">
                  {COLOR_OPTIONS.map((color) => (
                    <button key={color} className={`color-btn ${newBook.color === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setNewBook({...newBook, color})} />
                  ))}
                </div>
              </div>
              <div className="preview-section">
                <label>미리보기</label>
                <div className="book-preview-v2">
                  {newBook.coverImage ? (
                    <img
                      src={newBook.coverImage}
                      alt="표지 미리보기"
                      className="preview-cover-img"
                      onError={(e) => { e.target.src = COVER_PLACEHOLDER }}
                    />
                  ) : (
                    <div className="book-preview" style={{ backgroundColor: newBook.color }}>
                      <span className="preview-emoji">{newBook.emoji}</span>
                      <span className="preview-title">{newBook.title || '책 제목'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="add-modal-footer">
              <button className="cancel-btn" onClick={() => setViewMode('list')}>취소</button>
              <button className="confirm-btn" onClick={handleSubmitBook} disabled={!newBook.title.trim()}>등록하기</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== 도서 리스트 화면 (v2.1 개편) ==========
  return (
    <div className="page library">
      <div className="library-content">
        {/* 페이지 타이틀 */}
        <h2 className="library-title"><BookOpen size={20} strokeWidth={1.8} /> 내 서재</h2>

        {/* 검색바 */}
        <div className="search-bar">
          <Search size={16} strokeWidth={2} className="search-icon" />
          <input
            type="text"
            placeholder="책 제목 또는 저자 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 필터 탭 */}
        <div className="filter-tabs">
          {[
            { key: 'all', label: '전체', count: enrichedBooks.length },
            { key: 'reading', label: '읽는 중', count: enrichedBooks.filter(b => b.status === 'reading').length },
            { key: 'completed', label: '완독', count: enrichedBooks.filter(b => b.status === 'completed').length },
            { key: 'notStarted', label: '시작 전', count: enrichedBooks.filter(b => b.status === 'notStarted').length },
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
              <span className="filter-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* 최근 읽은 책 가로 스크롤 */}
        {recentBooks.length > 0 && activeFilter === 'all' && !searchQuery && (
          <div className="recent-section">
            <h3 className="section-label">최근 읽은 책</h3>
            <div className="recent-scroll">
              {recentBooks.map(book => (
                <div
                  key={book.id}
                  className="recent-card"
                  onClick={() => handleBookClick(book)}
                >
                  <div className="recent-card-cover">
                    <img
                      src={book.coverImage || COVER_PLACEHOLDER}
                      alt={book.title}
                      className="recent-cover-img"
                      onError={(e) => { e.target.src = COVER_PLACEHOLDER }}
                    />
                  </div>
                  <div className="recent-card-info">
                    <span className="recent-card-title">{book.title}</span>
                    <div className="recent-card-progress">
                      <div className="recent-progress-bar">
                        <div className="recent-progress-fill" style={{ width: `${book.progress}%` }} />
                      </div>
                      <span className="recent-progress-text">{book.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 도서 2열 그리드 */}
        <div className="section-label-row">
          <h3 className="section-label">
            {activeFilter === 'all' ? '전체 도서' : STATUS_LABELS[activeFilter] || '전체 도서'}
          </h3>
          <span className="section-count">{filteredBooks.length}권</span>
        </div>

        <div className="book-grid-v2">
          {filteredBooks.map((book, index) => (
            <div
              key={book.id}
              className="book-card-v2"
              onClick={() => handleBookClick(book, index)}
            >
              {/* 상태 뱃지 */}
              <span className={`status-badge status-${book.status}`}>
                {STATUS_LABELS[book.status]}
              </span>

              {/* 책 표지 영역 */}
              <div className="book-cover">
                <img
                  src={book.coverImage || COVER_PLACEHOLDER}
                  alt={book.title}
                  className="book-cover-img"
                  onError={(e) => { e.target.src = COVER_PLACEHOLDER }}
                />
              </div>

              {/* 책 정보 */}
              <div className="book-info">
                <span className="book-info-title">{book.title}</span>
                <span className="book-info-author">{book.author}</span>

                {/* 진행률 */}
                {book.totalPages > 0 && (
                  <div className="book-progress">
                    <div className="book-progress-bar">
                      <div
                        className="book-progress-fill"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                    <span className="book-progress-text">
                      {book.currentPage}/{book.totalPages}p
                    </span>
                  </div>
                )}

                {/* 리뷰 수 */}
                {book.reviewCount > 0 && (
                  <span className="book-review-count">기록 {book.reviewCount}개</span>
                )}
              </div>
            </div>
          ))}

          {/* 책 추가 카드 */}
          <div className="book-card-v2 add-card-v2" onClick={handleAddBookClick}>
            <Plus size={28} strokeWidth={1.5} className="add-card-icon" />
            <span className="add-card-label">책 추가</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library