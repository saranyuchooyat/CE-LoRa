import { Routes, Route } from "react-router-dom";
import Header from "../components/header";
import Menu from "../components/menu";
import SystemOverviewDashboard from "./SystemAdminMenu/SystemOverviewDashboard";
import ZoneManagement from "./SystemAdminMenu/ZoneManagement";
import UserManagement from "./SystemAdminMenu/UserManagement";
import ZoneDashboard from "./ZoneAdminMenu/ZoneDashboard";
import ZoneDashboardDetail from "./ZoneAdminMenu/ZoneDashboardDetail";
import DeviceManagement from "./ZoneAdminMenu/DeviceManagement";
import ZoneStaffManagement from "./ZoneAdminMenu/ZoneStaffManagement";
import NotFoundPage from "./NotFound";
import LoginPage from "./Login";
import DeviceDetail from "./DeviceDetail";
import ElderlyMonitoring from "./ZoneStaffMenu/ElderlyMonitoring";
import AlertManagement from "./ZoneStaffMenu/AlertManagement";
import CareGiver from "./ZoneStaffMenu/CareGiver";
import ElderlyProfileView from "../components/card/elderlyProfileView";

function MainLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Menu />
      <div className="mt-4 flex-1 overflow-y-scroll">
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/*System Admin Menu*/}
          <Route path="/system-overview-dashboard" element={<SystemOverviewDashboard />} />
          <Route path="/zone-management" element={<ZoneManagement />} />
          <Route path="/user-management" element={<UserManagement />} />

          {/*Zone Admin Menu*/}
          <Route path="/zone-dashboard" element={<ZoneDashboard />} />
          <Route path="/zone-details/:zoneid" element={<ZoneDashboardDetail />} />
          <Route path="/device-management" element={<DeviceManagement />} />
          <Route path="/zone-staff-management" element={<ZoneStaffManagement />} />
          <Route path="/deivce-details/:device_id" element={<DeviceDetail />} />

          {/* Zone Staff Menu */}
          <Route path="/caregiver" element={<CareGiver />} />
          <Route path="/eldery-monitoring" element={<ElderlyMonitoring />} />
          <Route path="/alert-management" element={<AlertManagement />} />
          <Route path="/eldery-monitoring/:id" element={<ElderlyProfileView />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default MainLayout;
