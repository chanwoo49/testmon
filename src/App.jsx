import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Navigation from './components/Navigation'
import TopBar from './components/TopBar'
import Login from './pages/Login'
import MyRoom from './pages/MyRoom'
import Library from './pages/Library'
import Gallery from './pages/Gallery'
import Cosmos from './pages/Cosmos'
import More from './pages/More'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleGuestLogin = () => {
    const guestData = {
      id: 'guest',
      nickname: '게스트',
      stardust: 200,
      tutorial_completed: false,
      eggs: [{ id: 1, name: '루비 알', category: '경영/경제' }],
      dokseomon: [],
      reading_logs: {},
      gallery: [],
    }
    localStorage.setItem('dokseomon_guest_data', JSON.stringify(guestData))
    setIsGuest(true)
  }

  const handleLogout = async () => {
    if (isGuest) {
      localStorage.removeItem('dokseomon_guest_data')
      setIsGuest(false)
    } else {
      await supabase.auth.signOut()
      setUser(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>로딩 중...</p>
      </div>
    )
  }

  if (!user && !isGuest) {
    return (
      <Login 
        onLogin={setUser} 
        onGuestLogin={handleGuestLogin}
      />
    )
  }

  return (
    <div className="app-container">
      <TopBar 
        user={user} 
        isGuest={isGuest}
        onLogout={handleLogout} 
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MyRoom isGuest={isGuest} />} />
          <Route path="/library" element={<Library isGuest={isGuest} />} />
          <Route path="/gallery" element={<Gallery isGuest={isGuest} />} />
          <Route path="/cosmos" element={<Cosmos isGuest={isGuest} />} />
          <Route path="/more" element={<More isGuest={isGuest} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Navigation />
    </div>
  )
}

export default App
