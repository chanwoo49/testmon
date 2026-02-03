import { useState } from 'react'
import './Library.css'

// 배경 이미지
import bookroomBg from '../assets/backgrounds/bookroom.png'

function Library() {
  const [isNoteOpen, setIsNoteOpen] = useState(true)  // 처음부터 열려있게
  const [noteContent, setNoteContent] = useState('')
  const [savedEntries, setSavedEntries] = useState([
    {
      id: 1,
      date: '2025.01.15',
      book: '클린 코드',
      content: '처음엔 어려웠는데, 읽을수록 이해가 됐다. 함수는 작게, 이름은 명확하게!'
    }
  ])
  
  // 새 기록 저장
  const handleSave = () => {
    if (noteContent.trim()) {
      const today = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace('.', '')
      
      setSavedEntries([
        {
          id: Date.now(),
          date: today,
          book: '새로운 책',
          content: noteContent
        },
        ...savedEntries
      ])
      setNoteContent('')
    }
  }
  
  return (
    <div className="page library">
      {/* 배경 이미지 */}
      <div 
        className="library-background"
        style={{ backgroundImage: `url(${bookroomBg})` }}
      />
      
      {/* 어두운 오버레이 */}
      <div className="library-overlay" />
      
      {/* 노트 */}
      <div className="note-container">
        <div className="note">
          {/* 노트 헤더 */}
          <div className="note-header">
            <h3>📔 독서 일지</h3>
          </div>
          
          {/* 새 기록 작성 */}
          <div className="note-input-area">
            <textarea
              className="note-textarea"
              placeholder="오늘 읽은 책에서 느낀 점을 적어보세요..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
            />
            <button 
              className="save-button"
              onClick={handleSave}
              disabled={!noteContent.trim()}
            >
              기록하기
            </button>
          </div>
          
          {/* 구분선 */}
          <div className="note-divider" />
          
          {/* 저장된 기록들 */}
          <div className="entries-list">
            {savedEntries.map((entry) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <span className="entry-book">📖 {entry.book}</span>
                  <span className="entry-date">{entry.date}</span>
                </div>
                <p className="entry-content">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library