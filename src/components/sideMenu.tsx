import { useLocation, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';
import { logo, dashboard, users, reports, feedback, settings, logout } from '../assets';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

function SideMenu() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const navigate = useNavigate(); 
    const handleLogout = async () => {
        try {
          await signOut(auth);
          navigate('/'); 
        } catch (error) {
          console.error('Logout failed:', error);
        }
      };

      return (
        <div className="dashboardMenu">
          <div className="logoWname">
            <img src={logo} alt="Logo" className="logoWname" />
          </div>
          <div className="menuList">
            <Link to="/dashboard" className={`item ${isActive('/dashboard') ? 'active' : ''}`}>
              <img src={dashboard} alt="Dashboard Icon" className='icon'/>
              Dashboard
            </Link>
            <Link to="/users" className={`item ${isActive('/users') ? 'active' : ''}`}>
              <img src={users} alt="Users Icon" className='icon'/>
              Users
            </Link>
            <Link to="/reports" className={`item ${isActive('/reports') ? 'active' : ''}`}>
              <img src={reports} alt="Reports Icon" className='icon'/>
              Reports
            </Link>
            <Link to="/feedback" className={`item ${isActive('/feedback') ? 'active' : ''}`}>
              <img src={feedback} alt="Feedback Icon" className='icon'/>
              Feedback
            </Link>
          </div>
          <div className='bottom'>
            <Link to="/settings" className={`item ${isActive('/settings') ? 'active' : ''}`}>
              <img src={settings} alt="Settings Icon" className='icons'/>
              Settings
            </Link>
            <Link to="/logout" onClick={handleLogout} className={`item ${isActive('/logout') ? 'active' : ''}`}>
              <img src={logout} alt="Logout Icon" className='icons'/>
              Logout
            </Link>
          </div>
        </div>
      );
    }
    
    export default SideMenu;