import { Routes, Route } from 'react-router-dom';
import Header from "../components/Header";
import Menu from "../components/Menu";
import SystemOverviewDashboard from './SystemAdminMenu/SystemOverviewDashboard';
import ZoneManagement from './SystemAdminMenu/ZoneManagement';
import UserManagement from './SystemAdminMenu/UserManagement';
import HealthMonitoring from './HealthMonitoring';
import ZoneDashboard from './ZoneAdminMenu/ZoneDashboard';
import DeviceManagement from './ZoneAdminMenu/DeviceManagement';
import ZoneStaffManagement from './ZoneAdminMenu/ZoneStaffManagement';
import NotFoundPage from './NotFound';
import LoginPage from './Login';

function MainLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Menu />
      <div className="mt-4 flex-1 overflow-y-scroll">
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          
          {/*System Admin Menu*/}
          <Route path="/system-overview-dashboard" element={<SystemOverviewDashboard/>} />
          <Route path="/zone-management" element={<ZoneManagement/>} />
          <Route path="/user-management" element={<UserManagement/>} />

          {/*Zone Staff Menu*/}
          <Route path="/zone-dashboard" element={<ZoneDashboard/>}/>
          <Route path="/device-management" element={<DeviceManagement/>}/>
          <Route path="/zone-staff-management" element={<ZoneStaffManagement/>}/>
          
          {/* ... ส่วนที่เหลือ ... */}

          <Route path="/health-monitoring" element={<HealthMonitoring/>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default MainLayout;