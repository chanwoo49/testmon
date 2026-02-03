import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import TopBar from './components/TopBar'
import MyRoom from './pages/MyRoom'
import Library from './pages/Library'
import Cosmos from './pages/Cosmos'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <TopBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MyRoom />} />
          <Route path="/library" element={<Library />} />
          <Route path="/cosmos" element={<Cosmos />} />
        </Routes>
      </main>
      <Navigation />
    </div>
  )
}

export default App