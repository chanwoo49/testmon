import { useState, useEffect } from 'react'
import { Egg } from 'lucide-react'
import './MyRoom.css'

// 컴포넌트
import ReadingCalendar from '../components/ReadingCalendar'
import { DokseomonCanvas } from '../dokseomon'

function MyRoom({ isGuest }) {
  // 독서몬 보유 여부
  const [hasDokseomon, setHasDokseomon] = useState(false)
  const [dokseomonInfo, setDokseomonInfo] = useState(null)

  // 최근 읽은 책 정보
  const [recentBook, setRecentBook] = useState(null)

  // 게스트 데이터에서 독서몬 + 최근 책 확인
  useEffect(() => {
    if (isGuest) {
      loadGuestData()
    }
  }, [isGuest])

  // 주기적으로 데이터 확인 (부화/리뷰 후 즉시 반영)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (isGuest) {
        loadGuestData()
      }
    }, 1000)

    return () => clearInterval(checkInterval)
  }, [isGuest])

  function loadGuestData() {
    const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')

    // 독서몬 확인
    if (guestData.dokseomon && guestData.dokseomon.length > 0) {
      setHasDokseomon(true)
      setDokseomonInfo(guestData.dokseomon[0])
    } else {
      setHasDokseomon(false)
      setDokseomonInfo(null)
    }

    // 최근 읽은 책 찾기
    const books = guestData.books || []
    const reviews = guestData.reviews || {}

    if (books.length > 0) {
      // 가장 최근 리뷰가 달린 책 찾기
      let latestBook = null
      let latestReview = null
      let latestDate = ''

      books.forEach(book => {
        const bookReviews = reviews[book.id]
        if (bookReviews && bookReviews.length > 0) {
          const newest = bookReviews[0] // 리뷰는 최신순 정렬
          if (!latestDate || newest.date > latestDate) {
            latestDate = newest.date
            latestBook = book
            latestReview = newest
          }
        }
      })

      if (latestBook) {
        setRecentBook({
          ...latestBook,
          lastPage: latestReview.page || 0,
          lastDate: latestReview.date,
        })
      } else {
        // 리뷰 없으면 첫 번째 책
        setRecentBook(books[0])
      }
    }
  }

  // 독서 진행률 계산
  const getProgress = () => {
    if (!recentBook || !recentBook.totalPages) return 0
    const page = recentBook.lastPage || 0
    return Math.min(Math.round((page / recentBook.totalPages) * 100), 100)
  }

  return (
    <div className="page myroom">
      {/* ── 상단: 독서 잔디 달력 ── */}
      <div className="myroom-scroll">
        <div className="myroom-section">
          <ReadingCalendar isGuest={isGuest} />
        </div>

        {/* ── 하단: 최근 책 카드 + 캐릭터 영역 ── */}
        <div className="myroom-bottom">

          {/* 왼쪽: 최근 읽은 책 */}
          <div className="recent-book-card">
            {recentBook ? (
              <>
                <div className="recent-book-header">
                  <span className="recent-book-emoji">{recentBook.emoji || '📖'}</span>
                  <span className="recent-book-label">최근 읽은 책</span>
                </div>
                <h4 className="recent-book-title">{recentBook.title}</h4>
                <p className="recent-book-author">{recentBook.author}</p>
                {recentBook.totalPages > 0 && (
                  <div className="recent-book-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgress()}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {recentBook.lastPage || 0} / {recentBook.totalPages}p ({getProgress()}%)
                    </span>
                  </div>
                )}
                {recentBook.lastDate && (
                  <span className="recent-book-date">마지막 기록: {recentBook.lastDate}</span>
                )}
              </>
            ) : (
              <div className="recent-book-empty">
                <span className="recent-book-emoji">📚</span>
                <p>서재에서 책을 등록하고<br/>독서를 시작해보세요!</p>
              </div>
            )}
          </div>

          {/* 오른쪽: 캐릭터 영역 */}
          <div className="character-area">
            {hasDokseomon ? (
              <DokseomonCanvas characterData={dokseomonInfo} />
            ) : (
              <div className="character-empty">
                <div className="empty-egg-icon"><Egg size={40} strokeWidth={1.5} /></div>
                <p>소우주에서<br/>알을 부화시켜요!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default MyRoom
