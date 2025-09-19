import { useState } from "react";
import axios from "axios";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });

      console.log("Response:", res.data);

      // เก็บข้อมูล user ไว้ (จริงๆ โปรเจคใหญ่ควรใช้ JWT, แต่ตอนนี้ Go backend มึงยังไม่ generate token)
      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Login success, role: " + res.data.role);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 w-[300px] mx-auto mt-20 border rounded-lg">
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
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}

export default LoginPage;
