import { clearToken } from '../auth/tokenStorage'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <span className="navbar-title">Messenger</span>
      {/* Clearing the token makes RequireAuth redirect to the login page. */}
      <button type="button" className="navbar-logout" onClick={clearToken}>
        Wyloguj się
      </button>
    </header>
  )
}

export default Navbar
