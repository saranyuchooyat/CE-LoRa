import { Routes, Route } from 'react-router-dom';
import LoginPage from './Screen/Login.jsx';
import MainLayout from './Screen/MainLayout.jsx';

function App() {
  return (
    <Routes>
      {/* Route สำหรับหน้า Login ที่เป็นหน้าแรก */}
      <Route path="/" element={<LoginPage />} />

      {/* Route สำหรับหน้าอื่นๆ ที่ใช้โครงสร้างหลัก (Header, Menu, Contents) */}
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}

export default App;