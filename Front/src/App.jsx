import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './Screen/Login.jsx';
import MainLayout from './Screen/MainLayout.jsx';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Route สำหรับหน้า Login ที่เป็นหน้าแรก */}
        <Route path="/" element={<LoginPage />} />

        {/* Route สำหรับหน้าอื่นๆ ที่ใช้โครงสร้างหลัก (Header, Menu, Contents) */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;