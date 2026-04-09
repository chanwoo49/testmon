import { useState, useEffect, useMemo } from 'react'
import { BookOpen, X, Search, Plus, ChevronLeft } from 'lucide-react'
import './Library.css'

const COVER_PLACEHOLDER = '/books/placeholder.svg'

const INITIAL_BOOKS = [
  { id: 1, title: '클린 코드', author: '로버트 마틴', category: '학습서', color: '#4A90D9', emoji: '📕', totalPages: 464, coverImage: '/books/clean-code.jpg', currentPage: 464, isbn: null },
  { id: 2, title: '돈의 심리학', author: '모건 하우절', category: '경영/경제', color: '#50C878', emoji: '📗', totalPages: 336, coverImage: '/books/psychology-of-money.jpg', currentPage: 228, isbn: null },
  { id: 3, title: '셜록 홈즈', author: '아서 코난 도일', category: '추리소설', color: '#9B59B6', emoji: '📘', totalPages: 512, coverImage: null, currentPage: 0, isbn: null },
  { id: 4, title: '원피스 1권', author: '오다 에이치로', category: '만화', color: '#FF6B6B', emoji: '📙', totalPages: 200, coverImage: null, currentPage: 0, isbn: null },
  { id: 5, title: '나미야 잡화점', author: '히가시노 게이고', category: '소설', color: '#F4D03F', emoji: '📓', totalPages: 424, coverImage: null, currentPage: 0, isbn: null },
  { id: 6, title: '코스모스', author: '칼 세이건', category: '과학', color: '#5DADE2', emoji: '📔', totalPages: 672, coverImage: null, currentPage: 0, isbn: null },
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

const STATUS_LABELS = {
  notStarted: '시작 전',
  reading: '읽는 중',
  completed: '완독',
}

function getBookStatus(currentPage, totalPages) {
  if (!currentPage || currentPage === 0) return 'notStarted'
  if (totalPages > 0 && currentPage >= totalPages) return 'completed'
  return 'reading'
}

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function Library({ isGuest }) {
  const [books, setBooks] = useState(INITIAL_BOOKS)
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [selectedBook, setSelectedBook] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'detail' | 'addReview' | 'addBook'
  const [sliderPage, setSliderPage] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [newBook, setNewBook] = useState({ title: '', author: '', emoji: '📕', color: '#4A90D9', totalPages: '', coverImage: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [progressSaved, setProgressSaved] = useState(false)

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

  // 책 데이터에 상태/진행률 자동 부착
  const enrichedBooks = useMemo(() => {
    return books.map(book => {
      const bookReviews = reviews[book.id] || []
      const maxReviewPage = bookReviews.length > 0
        ? Math.max(...bookReviews.map(r => r.page || 0))
        : 0
      const currentPage = Math.max(book.currentPage || 0, maxReviewPage)
      const status = getBookStatus(currentPage, book.totalPages)
      const progress = book.totalPages > 0
        ? Math.min(Math.round((currentPage / book.totalPages) * 100), 100)
        : 0
      const lastReviewAt = bookReviews.length > 0 ? bookReviews[0].date : null
      return { ...book, status, currentPage, progress, lastReviewAt, reviewCount: bookReviews.length }
    })
  }, [books, reviews])

  // 최근 읽은 책: 읽는 중 우선 → 완독 순, 시작 전 제외
  const recentBooks = useMemo(() => {
    return enrichedBooks
      .filter(b => b.status !== 'notStarted')
      .sort((a, b) => {
        if (a.status === 'reading' && b.status !== 'reading') return -1
        if (a.status !== 'reading' && b.status === 'reading') return 1
        return (b.lastReviewAt || '').localeCompare(a.lastReviewAt || '')
      })
  }, [enrichedBooks])

  // 필터 + 검색 적용
  const filteredBooks = useMemo(() => {
    let result = enrichedBooks
    if (activeFilter !== 'all') result = result.filter(b => b.status === activeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }
    return result
  }, [enrichedBooks, activeFilter, searchQuery])

  const enrichedSelectedBook = useMemo(() => {
    if (!selectedBook) return null
    return enrichedBooks.find(b => b.id === selectedBook.id) || null
  }, [selectedBook, enrichedBooks])

  const handleBookClick = (book) => {
    const enriched = enrichedBooks.find(b => b.id === book.id) || book
    setSelectedBook(enriched)
    setSliderPage(enriched.currentPage || 0)
    setProgressSaved(false)
    setViewMode('detail')
  }

  const handleClose = () => {
    setSelectedBook(null)
    setViewMode('list')
  }

  // 진척도 저장
  const handleSaveProgress = () => {
    if (!selectedBook) return
    const updatedBooks = books.map(b =>
      b.id === selectedBook.id ? { ...b, currentPage: sliderPage } : b
    )
    setBooks(updatedBooks)
    saveToStorage(updatedBooks, reviews)
    setProgressSaved(true)
    setTimeout(() => setProgressSaved(false), 2000)
  }

  // 리뷰 저장
  const handleSubmitReview = () => {
    if (!reviewContent.trim() || !selectedBook) return
    const currentPage = sliderPage || enrichedSelectedBook?.currentPage || 0
    const reviewEntry = {
      id: Date.now(),
      date: getTodayString(),
      page: currentPage,
      content: reviewContent,
    }
    const bookReviews = reviews[selectedBook.id] || []
    const updatedReviews = { ...reviews, [selectedBook.id]: [reviewEntry, ...bookReviews] }
    setReviews(updatedReviews)
    saveToStorage(books, updatedReviews)
    setReviewContent('')
    setViewMode('detail')
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
      currentPage: 0,
      isbn: null,
    }
    const updatedBooks = [...books, addedBook]
    setBooks(updatedBooks)
    saveToStorage(updatedBooks, reviews)
    setViewMode('list')
  }

  // ========== 리뷰 작성 화면 ==========
  if (viewMode === 'addReview' && selectedBook) {
    const currentPage = sliderPage || enrichedSelectedBook?.currentPage || 0
    const today = getTodayString()
    return (
      <div className="page library">
        <div className="detail-header">
          <button className="back-btn" onClick={() => setViewMode('detail')}>
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <span className="detail-header-title">독서 기록 남기기</span>
          <div style={{ width: 32 }} />
        </div>

        <div className="review-write-container">
          <div className="review-context-banner">
            <div className="review-context-book">
              <span className="review-context-emoji">{selectedBook.emoji}</span>
              <div>
                <div className="review-context-title">{selectedBook.title}</div>
                <div className="review-context-sub">{selectedBook.author}</div>
              </div>
            </div>
            <div className="review-context-meta">
              <span className="review-context-page">{currentPage}p 시점</span>
              <span className="review-context-date">{today}</span>
            </div>
          </div>

          <textarea
            className="review-write-textarea"
            placeholder={`이 책을 읽으며 느낀 것들을 자유롭게 남겨보세요.\n\n어떤 문장이 기억에 남았나요?\n지금 내 삶과 어떻게 연결됐나요?`}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          />

          <div className="review-save-hint">
            저장하면 <strong>{currentPage}p 시점 · {today}</strong>의 기록으로 남아요
          </div>

          <div className="review-write-btns">
            <button className="cancel-btn" onClick={() => setViewMode('detail')}>취소</button>
            <button
              className="confirm-btn"
              onClick={handleSubmitReview}
              disabled={!reviewContent.trim()}
            >
              기록 저장
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ========== 책 상세 화면 ==========
  if (viewMode === 'detail' && selectedBook) {
    const bookReviews = reviews[selectedBook.id] || []
    const totalPages = selectedBook.totalPages || 0
    const progress = totalPages > 0
      ? Math.min(Math.round((sliderPage / totalPages) * 100), 100)
      : 0
    const derivedStatus = totalPages > 0 && sliderPage >= totalPages
      ? 'completed'
      : getBookStatus(sliderPage, totalPages)

    return (
      <div className="page library">
        <div className="detail-header">
          <button className="back-btn" onClick={handleClose}>
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <span className="detail-header-title">{selectedBook.title}</span>
          <div style={{ width: 32 }} />
        </div>

        <div className="detail-body">
          {/* ── 통합 카드: 책 정보 + 진척도 ── */}
          <div className="detail-top-card">
            <div className="detail-title-row">
              <div className="detail-title-info">
                <div className="detail-book-title">{selectedBook.title}</div>
                <div className="detail-book-author">
                  {selectedBook.author}
                  {totalPages > 0 ? ` · ${totalPages}p` : ''}
                </div>
              </div>
              <span className={`status-badge status-${derivedStatus}`}>
                {STATUS_LABELS[derivedStatus]}
              </span>
            </div>

            {totalPages > 0 ? (
              <>
                <div className="progress-display-row">
                  <span className="progress-cur-page">
                    <strong>{sliderPage}</strong>p{' '}
                    {derivedStatus === 'completed' ? '· 완독 🎉' : '읽는 중'}
                  </span>
                  <span className={`progress-pct${derivedStatus === 'completed' ? ' pct-done' : ''}`}>
                    {progress}%
                  </span>
                </div>

                <input
                  type="range"
                  className="progress-slider"
                  min={0}
                  max={totalPages}
                  value={sliderPage}
                  onChange={(e) => {
                    setSliderPage(Number(e.target.value))
                    setProgressSaved(false)
                  }}
                />
                <div className="progress-slider-labels">
                  <span>0p</span>
                  <span>{totalPages}p</span>
                </div>

                <div className="progress-divider" />

                <div className="progress-direct-row">
                  <span className="progress-direct-label">직접 입력</span>
                  <input
                    className="progress-direct-input"
                    type="number"
                    min={0}
                    max={totalPages}
                    value={sliderPage}
                    onChange={(e) => {
                      const v = Math.min(totalPages, Math.max(0, Number(e.target.value) || 0))
                      setSliderPage(v)
                      setProgressSaved(false)
                    }}
                  />
                  <span className="progress-of">/ {totalPages}p</span>
                  <button
                    className={`progress-save-btn${progressSaved ? ' saved' : ''}`}
                    onClick={handleSaveProgress}
                  >
                    {progressSaved ? '저장됨 ✓' : '저장'}
                  </button>
                </div>
              </>
            ) : (
              <p className="no-pages-hint">총 페이지 수가 입력되지 않았어요</p>
            )}
          </div>

          {/* ── 독서 기록 ── */}
          <div className="detail-reviews-section">
            <div className="detail-reviews-header">
              <span className="detail-reviews-label">독서 기록</span>
              <span className="detail-reviews-count">{bookReviews.length}개</span>
            </div>

            {bookReviews.length > 0 && (
              <div className="reviews-list">
                {bookReviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-card-header">
                      <span className="review-date">{review.date}</span>
                      {review.page > 0 && (
                        <span className="review-page">{review.page}p 시점</span>
                      )}
                    </div>
                    <p className="review-content">{review.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="add-review-btn" onClick={() => setViewMode('addReview')}>
              <span className="add-review-icon">
                <Plus size={20} strokeWidth={2} />
              </span>
              <span className="add-review-label">새 독서 기록 남기기</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== 책 추가 화면 ==========
  if (viewMode === 'addBook') {
    return (
      <div className="page library">
        <div className="detail-header">
          <button className="back-btn" onClick={() => setViewMode('list')}>
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <span className="detail-header-title">새 책 등록</span>
          <div style={{ width: 32 }} />
        </div>

        <div className="add-book-body">
          <div className="input-group">
            <label>책 제목 <span className="required">*</span></label>
            <input
              type="text"
              placeholder="책 제목을 입력하세요"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>저자</label>
            <input
              type="text"
              placeholder="저자를 입력하세요"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>총 페이지 수</label>
            <input
              type="number"
              placeholder="페이지 수를 입력하세요"
              value={newBook.totalPages}
              onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>표지 이미지 경로</label>
            <input
              type="text"
              placeholder="/books/파일명.jpg"
              value={newBook.coverImage}
              onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
            />
            <span className="input-hint">public/books/ 폴더에 이미지를 넣고 경로를 입력하세요</span>
          </div>
          <div className="input-group">
            <label>아이콘 (표지 없을 때 사용)</label>
            <div className="emoji-options">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  className={`emoji-btn ${newBook.emoji === emoji ? 'selected' : ''}`}
                  onClick={() => setNewBook({ ...newBook, emoji })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="input-group">
            <label>색상</label>
            <div className="color-options">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  className={`color-btn ${newBook.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewBook({ ...newBook, color })}
                />
              ))}
            </div>
          </div>
          <div className="input-group">
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
    )
  }

  // ========== 도서 리스트 화면 ==========
  return (
    <div className="page library">
      <div className="library-content">
        <h2 className="library-title">
          <BookOpen size={20} strokeWidth={1.8} /> 내 서재
        </h2>

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
                <div key={book.id} className="recent-card" onClick={() => handleBookClick(book)}>
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

        {/* 전체 도서 그리드 */}
        <div className="section-label-row">
          <h3 className="section-label">
            {activeFilter === 'all' ? '전체 도서' : STATUS_LABELS[activeFilter]}
          </h3>
          <span className="section-count">{filteredBooks.length}권</span>
        </div>

        <div className="book-grid-v2">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className={`book-card-v2${book.status === 'completed' ? ' card-completed' : ''}`}
              onClick={() => handleBookClick(book)}
            >
              <span className={`status-badge status-${book.status}`}>
                {STATUS_LABELS[book.status]}
              </span>
              <div className="book-cover">
                <img
                  src={book.coverImage || COVER_PLACEHOLDER}
                  alt={book.title}
                  className="book-cover-img"
                  onError={(e) => { e.target.src = COVER_PLACEHOLDER }}
                />
              </div>
              <div className="book-info">
                <span className="book-info-title">{book.title}</span>
                <span className="book-info-author">{book.author}</span>
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
                {book.reviewCount > 0 && (
                  <span className="book-review-count">기록 {book.reviewCount}개</span>
                )}
              </div>
            </div>
          ))}

          <div className="book-card-v2 add-card-v2" onClick={() => setViewMode('addBook')}>
            <Plus size={28} strokeWidth={1.5} className="add-card-icon" />
            <span className="add-card-label">책 추가</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library