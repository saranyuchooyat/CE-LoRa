import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginPic from "../assets/picture/LoginPic.png";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });

      console.log("Response:", res.data);

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      setError("");

      const userRole = res.data.user.role;
      const userData = res.data.user;
      const token = res.data.token;

      console.log("User Role found:", userRole);

      if (userRole === "System Admin") {
        navigate('/system-overview-dashboard', { state: { user: userData.username, role: userRole, token: token } });
      } 
      else if (userRole === "Zone Admin") {
        navigate('/zone-dashboard', { state: { user: userData.username, role: userRole, token: token } });
      } 
      else if (userRole === "Zone Staff") {
        if (userData.is_caregiver) {
          navigate('/caregiver', { state: { user: userData.username, role: "Elderly Caregiver", token: token } });
        } else {
          navigate('/eldery-monitoring', { state: { user: userData.username, role: userRole, token: token } });
        }
      } else {
        setError("User role not recognized!");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed. Please check username/password.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f2f8f5] overflow-hidden font-kanit">
      {/* Left Area - Image (Rectangle) */}
      <div className="hidden lg:flex w-1/2 h-full relative">
        <img 
          src={LoginPic} 
          alt="Login Background" 
          className="w-full h-full object-cover shadow-[10px_0_30px_rgba(0,0,0,0.1)] z-20"
        />
      </div>

      {/* Right Area - Form */}
      <div className="flex flex-1 justify-center items-center relative h-full">
        <div className="w-full h-full max-w-md relative flex flex-col justify-center items-center">
          
          {/* Header Pill */}
          <div className="absolute top-0 left-0 w-full bg-[#4a8a68] text-white text-2xl md:text-3xl font-medium pt-[8px] pb-[10px] rounded-b-[20px] text-center shadow-sm">
            หน้าเข้าสู่ระบบ
          </div>

          <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col justify-center gap-8 px-4 md:px-0">
            {/* Username Input */}
            <div className="flex flex-col">
              <label className="text-gray-800 text-lg mb-2 ml-1">Username</label>
              <input
                type="text"
                className="w-full h-12 bg-[#dcdcdc] rounded-[1rem] px-5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4a8a68] transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col">
              <label className="text-gray-800 text-lg mb-2 ml-1">Password</label>
              <input
                type="password"
                className="w-full h-12 bg-[#dcdcdc] rounded-[1rem] px-5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4a8a68] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm ml-1 -mt-4">{error}</p>}

            {/* Submit Button */}
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="bg-[#fbfcfa] text-[#4a8a68] font-bold text-xl py-3 px-12 rounded-[1.25rem] shadow-[0_4px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] active:scale-95 transition-all"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;