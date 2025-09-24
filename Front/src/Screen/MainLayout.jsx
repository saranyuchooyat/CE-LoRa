import { Routes, Route } from 'react-router-dom'; // เพิ่ม Routes, Route กลับเข้ามา
import Header from "../components/Header";
import Menu from "../components/Menu";
import Contents from "../components/Contents";
import SystemOverviewDashboard from './SystemAdminMenu/SystemOverviewDashboard';
import ZoneManagement from './SystemAdminMenu/ZoneManagement';
import UserManagement from './SystemAdminMenu/UserManagement';
import HealthMonitoring from './HealthMonitoring';
import NotFoundPage from './NotFound';

function MainLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Menu />
      <div className="mt-4 flex-1 overflow-y-scroll">
        <Routes>
          <Route path="/" element={<Contents/>} />
          
          {/*System Admin Menu*/}
          <Route path="/system-overview-dashboard" element={<SystemOverviewDashboard/>} />
          <Route path="/zone-management" element={<ZoneManagement/>} />
          <Route path="/user-management" element={<UserManagement/>} />
          
          {/* ... ส่วนที่เหลือ ... */}

          <Route path="/health-monitoring" element={<HealthMonitoring/>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default MainLayout;