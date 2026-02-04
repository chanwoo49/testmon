import { useState, useEffect } from 'react'
import './Library.css'

// 배경 이미지
import bookroomBg from '../assets/backgrounds/bookroom.png'

// 샘플 도서 데이터 (하드코딩)
const SAMPLE_BOOKS = [
  { id: 1, title: '클린 코드', author: '로버트 마틴', category: '학습서', color: '#4A90D9', emoji: '📕' },
  { id: 2, title: '돈의 심리학', author: '모건 하우절', category: '경영/경제', color: '#50C878', emoji: '📗' },
  { id: 3, title: '셜록 홈즈', author: '아서 코난 도일', category: '추리소설', color: '#9B59B6', emoji: '📘' },
  { id: 4, title: '원피스 1권', author: '오다 에이치로', category: '만화', color: '#FF6B6B', emoji: '📙' },
  { id: 5, title: '나미야 잡화점', author: '히가시노 게이고', category: '소설', color: '#F4D03F', emoji: '📓' },
  { id: 6, title: '코스모스', author: '칼 세이건', category: '과학', color: '#5DADE2', emoji: '📔' },
]

function Library({ isGuest }) {
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [noteContent, setNoteContent] = useState('')
  const [savedNotes, setSavedNotes] = useState({})

  // 저장된 노트 불러오기
  useEffect(() => {
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      setSavedNotes(guestData.reading_logs || {})
    }
  }, [isGuest])

  // 책 선택
  const handleBookClick = (book, index) => {
    setSelectedBook(book)
    setSelectedIndex(index)
    setNoteContent(savedNotes[book.id]?.content || '')
  }

  // 나가기 (리스트로 돌아가기)
  const handleClose = () => {
    setSelectedBook(null)
  }

  // 이전 책
  const handlePrev = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : SAMPLE_BOOKS.length - 1
    setSelectedIndex(newIndex)
    setSelectedBook(SAMPLE_BOOKS[newIndex])
    setNoteContent(savedNotes[SAMPLE_BOOKS[newIndex].id]?.content || '')
  }

  // 다음 책
  const handleNext = () => {
    const newIndex = selectedIndex < SAMPLE_BOOKS.length - 1 ? selectedIndex + 1 : 0
    setSelectedIndex(newIndex)
    setSelectedBook(SAMPLE_BOOKS[newIndex])
    setNoteContent(savedNotes[SAMPLE_BOOKS[newIndex].id]?.content || '')
  }

  // 노트 저장
  const handleSaveNote = () => {
    if (!noteContent.trim() || !selectedBook) return

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').slice(0, -1)

    const newNote = {
      content: noteContent,
      date: today,
      book_title: selectedBook.title,
    }

    const updatedNotes = {
      ...savedNotes,
      [selectedBook.id]: newNote,
    }

    setSavedNotes(updatedNotes)

    // 게스트 데이터에 저장
    if (isGuest) {
      const guestData = JSON.parse(localStorage.getItem('dokseomon_guest_data') || '{}')
      guestData.reading_logs = updatedNotes
      localStorage.setItem('dokseomon_guest_data', JSON.stringify(guestData))
    }
  }

  // 리뷰 노트 화면
  if (selectedBook) {
    return (
      <div className="page library">
        <div 
          className="library-background"
          style={{ backgroundImage: `url(${bookroomBg})` }}
        />
        <div className="library-overlay" />

        {/* 상단 네비게이션 */}
        <div className="note-nav">
          <div className="note-nav-left">
            <button className="nav-btn" onClick={handlePrev}>← 뒤로</button>
            <button className="nav-btn" onClick={handleNext}>앞으로 →</button>
          </div>
          <button className="nav-btn close-btn" onClick={handleClose}>나가기</button>
        </div>

        {/* 책 제목 */}
        <div className="book-title-bar">
          <span className="book-emoji">{selectedBook.emoji}</span>
          <span className="book-title">{selectedBook.title}</span>
        </div>

        {/* 노트 영역 */}
        <div className="note-container">
          <div className="note">
            <div className="note-header">
              <h3>📔 독서 일지</h3>
              {savedNotes[selectedBook.id] && (
                <span className="note-date">{savedNotes[selectedBook.id].date}</span>
              )}
            </div>

            <div className="note-input-area">
              <textarea
                className="note-textarea"
                placeholder="이 책을 읽고 느낀 점을 적어보세요..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
              />
              <button 
                className="save-button"
                onClick={handleSaveNote}
                disabled={!noteContent.trim()}
              >
                {savedNotes[selectedBook.id] ? '수정하기' : '기록하기'}
              </button>
            </div>

            {savedNotes[selectedBook.id] && (
              <>
                <div className="note-divider" />
                <div className="saved-note">
                  <p className="saved-note-label">저장된 기록</p>
                  <p className="saved-note-content">{savedNotes[selectedBook.id].content}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 도서 리스트 화면
  return (
    <div className="page library">
      <div 
        className="library-background"
        style={{ backgroundImage: `url(${bookroomBg})` }}
      />
      <div className="library-overlay" />

      <div className="library-content">
        <h2 className="library-title">📚 내 서재</h2>
        
        <div className="book-grid">
          {SAMPLE_BOOKS.map((book, index) => (
            <div 
              key={book.id}
              className="book-card"
              style={{ backgroundColor: book.color }}
              onClick={() => handleBookClick(book, index)}
            >
              <span className="book-card-emoji">{book.emoji}</span>
              <span className="book-card-title">{book.title}</span>
              <span className="book-card-author">{book.author}</span>
              {savedNotes[book.id] && (
                <span className="book-card-badge">✍️</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Library