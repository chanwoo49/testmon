import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import './ReadingCalendar.css'

/**
 * ReadingCalendar — 독서 잔디 달력
 * 
 * GitHub 잔디심기 스타일의 월간 독서 기록 달력입니다.
 * 독서한 날은 파란색 셀로 표시됩니다.
 * 
 * Props:
 *   isGuest (boolean) — 게스트 여부
 */

function ReadingCalendar({ isGuest }) {
  const [currentDate] = useState(new Date())
  const [readDates, setReadDates] = useState([])

  // localStorage에서 독서 기록 날짜 추출
  useEffect(() => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      const reviews = guestData.reviews || {}
      const dates = new Set()

      // 모든 책의 리뷰에서 날짜 추출
      Object.values(reviews).forEach(bookReviews => {
        if (Array.isArray(bookReviews)) {
          bookReviews.forEach(review => {
            if (review.date) {
              // '2026.02.10' → '2026-02-10' 형식으로 정규화
              dates.add(review.date.replace(/\./g, '-'))
            }
          })
        }
      })

      setReadDates([...dates])
    }
  }, [isGuest])

  // 주기적으로 업데이트 (서재에서 리뷰 추가 후 반영)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isGuest) {
        const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
        const reviews = guestData.reviews || {}
        const dates = new Set()

        Object.values(reviews).forEach(bookReviews => {
          if (Array.isArray(bookReviews)) {
            bookReviews.forEach(review => {
              if (review.date) {
                dates.add(review.date.replace(/\./g, '-'))
              }
            })
          }
        })

        setReadDates([...dates])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isGuest])

  // 현재 월의 달력 데이터 생성
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()  // 0=일, 1=월, ...
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = currentDate.getDate()

  const monthName = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })

  // 날짜가 독서한 날인지 확인
  const isReadDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return readDates.includes(dateStr)
  }

  // 이번 달 독서 일수
  const readCount = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(day => isReadDate(day)).length

  // 달력 셀 생성
  const cells = []

  // 빈 셀 (첫째 주 앞부분)
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="cal-cell cal-empty" />)
  }

  // 날짜 셀
  for (let day = 1; day <= daysInMonth; day++) {
    const isRead = isReadDate(day)
    const isToday = day === today
    const isPast = day < today

    let cellClass = 'cal-cell'
    if (isRead) cellClass += ' cal-read'
    if (isToday) cellClass += ' cal-today'
    if (!isPast && !isToday) cellClass += ' cal-future'

    cells.push(
      <div key={day} className={cellClass}>
        <span className="cal-day-num">{day}</span>
      </div>
    )
  }

  return (
    <div className="reading-calendar">
      {/* 헤더 */}
      <div className="cal-header">
        <h3 className="cal-title"><Calendar size={16} strokeWidth={2} /> {monthName}</h3>
        <span className="cal-count">{readCount}일 독서</span>
      </div>

      {/* 요일 라벨 */}
      <div className="cal-weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="cal-grid">
        {cells}
      </div>

      {/* 범례 */}
      <div className="cal-legend">
        <div className="legend-item">
          <div className="legend-dot legend-dot-empty" />
          <span>미독서</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-read" />
          <span>독서 완료</span>
        </div>
      </div>
    </div>
  )
}

export default ReadingCalendar
