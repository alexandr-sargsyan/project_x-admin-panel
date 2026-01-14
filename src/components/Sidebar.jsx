import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminMe, logout } from '../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    </div>
  );
};

export default Sidebar;

