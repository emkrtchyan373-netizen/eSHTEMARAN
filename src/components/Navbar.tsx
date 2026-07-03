import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand">
          <img src="/assets/logo.png" alt="eSHTEMARAN" className="navbar__logo" />
        </Link>

        <nav className="navbar__links armenian">
          <Link to="/" className="navbar__link navbar__link--active">
            Գլխավոր
          </Link>
        </nav>

        <div className="navbar__actions">
          <Link to="/signup" className="navbar__btn navbar__btn--signup">
            Sing up
          </Link>
          <Link to="/login" className="navbar__btn navbar__btn--signin">
            Sing in
          </Link>
        </div>
      </div>
    </header>
  )
}
