import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-6 w-[300px] bg-white shadow rounded-lg"
      >
        <h1 className="text-xl font-bold">Login</h1>

        <input
          type="text"
          placeholder="Username"
          className="border p-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;