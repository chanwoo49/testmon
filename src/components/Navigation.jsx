import { NavLink } from 'react-router-dom'
import { BookOpen, Image, Home, Orbit, Menu } from 'lucide-react'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <NavLink 
        to="/library" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <BookOpen className="nav-icon" size={22} strokeWidth={1.8} />
        <span className="nav-label">서재</span>
      </NavLink>

      <NavLink 
        to="/gallery" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <Image className="nav-icon" size={22} strokeWidth={1.8} />
        <span className="nav-label">사진첩</span>
      </NavLink>

      {/* 중앙 FAB — 마이룸 (방) */}
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? 'nav-item nav-fab active' : 'nav-item nav-fab'}
      >
        <div className="fab-circle">
          <Home className="fab-icon" size={24} strokeWidth={2} />
        </div>
        <span className="nav-label">방</span>
      </NavLink>

      <NavLink 
        to="/cosmos" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <Orbit className="nav-icon" size={22} strokeWidth={1.8} />
        <span className="nav-label">소우주</span>
      </NavLink>

      <NavLink 
        to="/more" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <Menu className="nav-icon" size={22} strokeWidth={1.8} />
        <span className="nav-label">더보기</span>
      </NavLink>
    </nav>
  )
}

export default Navigation
