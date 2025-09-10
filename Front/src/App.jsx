import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Menu from "./components/Menu";
import Contents from "./components/Contents";
import SystemOverviewDashboard from './Screen/SystemAdminMenu/SystemOverviewDashboard';
import ZoneManagement from './Screen/SystemAdminMenu/ZoneManagement';
import UserManagement from './Screen/SystemAdminMenu/UserManagement';
import HealthMonitoring from './Screen/HealthMonitoring';
import NotFoundPage from './Screen/NotFound';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <Menu />
        <div className="mt-4 flex-1 overflow-y-scroll">
          <Routes>
            {/* <Route path="/" element={<Contents/>} /> */}

            {/*System Admin Menu*/}
            <Route path="/system-overview-dashboard" element={<SystemOverviewDashboard/>} />
            <Route path="/zone-management" element={<ZoneManagement/>} />
            <Route path="/user-management" element={<UserManagement/>} />
            
            {/*Zone Admin Menu*/}
            {/* <Route path="/zone-dashboard" element={} />
            <Route path="/device-management" element={} />
            <Route path="/zone-staff-management" element={<} /> */}

            {/*Zone Staff*/}
            {/* <Route path="/eldery-monitoring" element={} />
            <Route path="/alert-management" element={} />
            <Route path="/reports" element={<} />
            <Route path="/zone-map-overview" element={<} />  */}

            <Route path="/health-monitoring" element={<HealthMonitoring/>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;