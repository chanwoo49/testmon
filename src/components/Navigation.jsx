import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">마이룸</span>
      </NavLink>
      <NavLink 
        to="/library" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon">📚</span>
        <span className="nav-label">서재</span>
      </NavLink>
      <NavLink 
        to="/cosmos" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon">🌌</span>
        <span className="nav-label">소우주</span>
      </NavLink>
    </nav>
  )
}

export default Navigation