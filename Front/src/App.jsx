import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Menu from "./components/Menu";
import Contents from "./components/Contents";
import SystemAdmin from './Screen/SystemOverviewDashboard';
import ZoneManagement from './Screen/ZoneManagement';
import UserManagement from './Screen/UserManagement';
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
            <Route path="/" element={<Contents/>} />
            <Route path="/system-overview-dashboard" element={<SystemAdmin/>} />
            <Route path="/zone-management" element={<ZoneManagement/>} />
            <Route path="/user-management" element={<UserManagement/>} />
            <Route path="/health-monitoring" element={<HealthMonitoring/>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;