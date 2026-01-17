import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminMe, logout } from '../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getAdminMe();
        setUser(response.data.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setShowMobileMenu(false);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        {user && (
          <div className="user-info">
            <div className="user-email">{user.email}</div>
            <button onClick={handleLogout} className="logout-button">
              Выход
            </button>
          </div>
        )}
        {/* Hamburger menu для mobile */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          {showMobileMenu ? '✕' : '☰'}
        </button>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/categories"
          className={location.pathname === '/categories' ? 'active' : ''}
        >
          Categories
        </Link>
        <Link
          to="/video-references"
          className={location.pathname === '/video-references' ? 'active' : ''}
        >
          Video References
        </Link>
      </nav>
      {/* Mobile dropdown menu */}
      {showMobileMenu && (
        <div className="mobile-nav-menu" ref={menuRef}>
          <Link
            to="/categories"
            className={location.pathname === '/categories' ? 'active' : ''}
            onClick={handleNavClick}
          >
            Categories
          </Link>
          <Link
            to="/video-references"
            className={location.pathname === '/video-references' ? 'active' : ''}
            onClick={handleNavClick}
          >
            Video References
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

