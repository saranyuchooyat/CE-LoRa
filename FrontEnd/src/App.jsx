import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./Screen/Login.jsx";
import MainLayout from "./Screen/MainLayout.jsx";
import { GlobalPopup } from "./components/modalForm/popup.jsx";
import EmergencyPopup from "./components/modalForm/EmergencyPopup.jsx"; 

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPopup />
      
      <EmergencyPopup />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;