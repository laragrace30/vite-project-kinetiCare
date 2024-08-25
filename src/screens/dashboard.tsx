import '../styles/dashboard.css';
import SideMenu from '../components/sideMenu';
import Content from '../components/content';

function Dashboard() {

  return (
    <div className='dashboard'>
      <SideMenu />
      <div className="dashboard--content">
        <Content />
      </div>
    </div>
  );
}

export default Dashboard;
