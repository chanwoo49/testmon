import { useState, useEffect, useMemo } from 'react'
import { Image as ImageIcon, Lock, Plus, X, Sparkles } from 'lucide-react'
import bookImg from '../assets/galleryimages/moneyproper.jpg'
import aiImg from '../assets/galleryimages/moneyproper_aft.jpg'
import './Gallery.css'

const COVER_PLACEHOLDER = '/books/placeholder.svg'

const INITIAL_BOOKS = [
  { id: 1, title: '클린 코드', author: '로버트 마틴', emoji: '📕', totalPages: 464, coverImage: '/books/clean-code.jpg', currentPage: 464 },
  { id: 2, title: '돈의 심리학', author: '모건 하우절', emoji: '📗', totalPages: 336, coverImage: '/books/psychology-of-money.jpg', currentPage: 228 },
  { id: 3, title: '셜록 홈즈', author: '아서 코난 도일', emoji: '📘', totalPages: 512, coverImage: null, currentPage: 0 },
  { id: 4, title: '원피스 1권', author: '오다 에이치로', emoji: '📙', totalPages: 200, coverImage: null, currentPage: 0 },
  { id: 5, title: '나미야 잡화점', author: '히가시노 게이고', emoji: '📓', totalPages: 424, coverImage: null, currentPage: 0 },
  { id: 6, title: '코스모스', author: '칼 세이건', emoji: '📔', totalPages: 672, coverImage: null, currentPage: 0 },
]

const INITIAL_REVIEWS = {
  1: [
    { id: 1, date: '2026.02.10', page: 464, content: '드디어 완독!' },
    { id: 2, date: '2026.01.20', page: 230, content: '리팩토링 챕터가 인상적이다.' },
  ],
  2: [
    { id: 1, date: '2026.02.05', page: 228, content: '돈에 대한 생각이 완전히 바뀌었다.' },
  ],
}

// 샘플 갤러리 데이터 — bookId 키로 관리
// before: 읽기 전, after: 읽은 후, comic: 4컷 만화
const INITIAL_GALLERY = {
  2: {
    beforeImage: bookImg,
    afterImage: aiImg,
    comicImage: null,
  },
}

const STATUS_LABELS = {
  notStarted: '시작 전',
  reading: '읽는 중',
  completed: '완독',
}

const SLOT_META = {
  before: { label: '읽기 전', hint: '이 책에 대한 기대감을\n이미지로 남겨보세요' },
  after:  { label: '읽은 후', hint: '이 책이 당신에게 남긴\n인상을 이미지로 남겨보세요' },
  comic:  { label: '4컷 만화', hint: '읽기 전과 후의 변화를\n4컷 만화로 완성해요' },
}

function getBookStatus(currentPage, totalPages) {
  if (!currentPage || currentPage === 0) return 'notStarted'
  if (totalPages > 0 && currentPage >= totalPages) return 'completed'
  return 'reading'
}

function Gallery({ isGuest }) {
  const [books, setBooks] = useState(INITIAL_BOOKS)
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [gallery, setGallery] = useState(INITIAL_GALLERY)

  // 상세 뷰 — { bookId, slotType, imageUrl }
  const [detailView, setDetailView] = useState(null)
  // AI 생성 안내 팝업 — { bookId, slotType }
  const [generatePrompt, setGeneratePrompt] = useState(null)

  useEffect(() => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      if (guestData.books?.length) setBooks(guestData.books)
      if (guestData.reviews) setReviews(guestData.reviews)
      // gallery가 객체 형태인 경우만 적용 (구버전 배열 형태 무시)
      if (guestData.gallery && !Array.isArray(guestData.gallery)) {
        setGallery(guestData.gallery)
      }
    }
  }, [isGuest])

  // 책 데이터에 상태 + 갤러리 슬롯 가용성 부착
  const enrichedBooks = useMemo(() => {
    return books.map(book => {
      const bookReviews = reviews[book.id] || []
      const maxReviewPage = bookReviews.length > 0
        ? Math.max(...bookReviews.map(r => r.page || 0))
        : 0
      const currentPage = Math.max(book.currentPage || 0, maxReviewPage)
      const status = getBookStatus(currentPage, book.totalPages)
      const bookGallery = gallery[book.id] || {}

      // 슬롯별 가용성 계산
      const canBefore = true  // 등록 즉시
      const canAfter = bookReviews.length >= 1
      const canComic = status === 'completed'
        && !!bookGallery.beforeImage
        && !!bookGallery.afterImage

      // 완성된 슬롯 수
      const completedCount = [
        bookGallery.beforeImage,
        bookGallery.afterImage,
        bookGallery.comicImage,
      ].filter(Boolean).length

      return {
        ...book,
        status,
        currentPage,
        bookReviews,
        bookGallery,
        canBefore,
        canAfter,
        canComic,
        completedCount,
      }
    })
  }, [books, reviews, gallery])

  const handleSlotClick = (book, slotType) => {
    const img = book.bookGallery[`${slotType}Image`]

    if (img) {
      // 이미지가 있으면 상세 뷰
      setDetailView({
        bookId: book.id,
        bookTitle: book.title,
        bookEmoji: book.emoji,
        slotType,
        imageUrl: img,
      })
      return
    }

    // 잠금 상태
    const locked =
      (slotType === 'after' && !book.canAfter) ||
      (slotType === 'comic' && !book.canComic)

    if (locked) return

    // 생성 가능 → 안내 팝업
    setGeneratePrompt({ bookId: book.id, bookTitle: book.title, bookEmoji: book.emoji, slotType })
  }

  const slotState = (book, slotType) => {
    const img = book.bookGallery[`${slotType}Image`]
    if (img) return 'generated'
    const locked =
      (slotType === 'after' && !book.canAfter) ||
      (slotType === 'comic' && !book.canComic)
    if (locked) return 'locked'
    return 'available'
  }

  // ── 이미지 상세 뷰 ──
  if (detailView) {
    return (
      <div className="page gallery">
        <div className="gallery-content">
          <div className="detail-view-header">
            <div className="detail-view-book">
              <span className="detail-view-emoji">{detailView.bookEmoji}</span>
              <div>
                <div className="detail-view-title">{detailView.bookTitle}</div>
                <div className="detail-view-slot">{SLOT_META[detailView.slotType].label}</div>
              </div>
            </div>
            <button className="gallery-close-btn" onClick={() => setDetailView(null)}>
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="detail-view-image-wrap">
            <img
              src={detailView.imageUrl}
              alt={SLOT_META[detailView.slotType].label}
              className="detail-view-image"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── AI 생성 안내 팝업 ──
  if (generatePrompt) {
    return (
      <div className="page gallery">
        <div className="gallery-content">
          <div className="generate-overlay">
            <div className="generate-modal">
              <button
                className="gallery-close-btn generate-modal-close"
                onClick={() => setGeneratePrompt(null)}
              >
                <X size={18} strokeWidth={2} />
              </button>

              <div className="generate-modal-icon">
                <Sparkles size={28} strokeWidth={1.5} />
              </div>
              <div className="generate-modal-book">
                <span>{generatePrompt.bookEmoji}</span>
                <span>{generatePrompt.bookTitle}</span>
              </div>
              <div className="generate-modal-slot">
                {SLOT_META[generatePrompt.slotType].label}
              </div>
              <p className="generate-modal-hint">
                {SLOT_META[generatePrompt.slotType].hint}
              </p>

              <div className="generate-modal-badge">AI 이미지 생성 준비 중</div>
              <p className="generate-modal-desc">
                곧 업데이트될 AI 이미지 생성 기능으로<br />
                이 순간의 기억을 이미지로 남길 수 있어요.
              </p>

              <button className="generate-modal-close-btn" onClick={() => setGeneratePrompt(null)}>
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 메인: 책 단위 컬렉션 뷰 ──
  return (
    <div className="page gallery">
      <div className="gallery-content">
        <div className="gallery-page-header">
          <h2 className="gallery-title">
            <ImageIcon size={20} strokeWidth={1.8} /> 사진첩
          </h2>
          <p className="gallery-subtitle">책과 함께한 기억들</p>
        </div>

        {enrichedBooks.map(book => (
          <div key={book.id} className="gallery-book-section">
            {/* 책 헤더 */}
            <div className="gallery-book-header">
              <div className="gallery-book-header-left">
                <span className="gallery-book-emoji">{book.emoji}</span>
                <span className="gallery-book-name">{book.title}</span>
                <span className={`gallery-status-badge status-${book.status}`}>
                  {STATUS_LABELS[book.status]}
                </span>
              </div>
              <div className="gallery-book-header-right">
                <div className="gallery-book-header-line" />
                <span className="gallery-completion">
                  {book.completedCount}/3
                </span>
              </div>
            </div>

            {/* 3열 이미지 슬롯 */}
            <div className="gallery-slot-grid">
              {(['before', 'after', 'comic']).map(slotType => {
                const state = slotState(book, slotType)
                const img = book.bookGallery[`${slotType}Image`]

                if (state === 'generated') {
                  return (
                    <div
                      key={slotType}
                      className="gallery-slot slot-generated"
                      onClick={() => handleSlotClick(book, slotType)}
                    >
                      <img
                        src={img}
                        alt={SLOT_META[slotType].label}
                        className="slot-image"
                      />
                      <span className="slot-label-overlay">
                        {SLOT_META[slotType].label}
                      </span>
                    </div>
                  )
                }

                if (state === 'available') {
                  return (
                    <div
                      key={slotType}
                      className="gallery-slot slot-available"
                      onClick={() => handleSlotClick(book, slotType)}
                    >
                      <Plus size={20} strokeWidth={2} className="slot-plus-icon" />
                      <span className="slot-label">{SLOT_META[slotType].label}</span>
                    </div>
                  )
                }

                // locked
                return (
                  <div key={slotType} className="gallery-slot slot-locked">
                    {slotType === 'comic' ? (
                      <>
                        <Lock size={16} strokeWidth={1.5} className="slot-lock-icon" />
                        <span className="slot-label slot-label-locked">
                          {SLOT_META[slotType].label}
                        </span>
                      </>
                    ) : (
                      <span className="slot-label slot-label-locked">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery