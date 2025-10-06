import axios from 'axios';

console.log(localStorage)
const api = axios.create({
  // กำหนด Base URL
  baseURL: 'http://localhost:8080', 
  timeout: 50000, // กำหนด Timeout
});

// 💡 Interceptor: จะทำงานก่อนที่ Request จะถูกส่งออกไป
api.interceptors.request.use(
  (config) => {
    // 💡 แก้ไข: ดึง Token จาก localStorage แทน location.state
    const token = localStorage.getItem('token'); 
    console.log("token",token)
    
    // ถ้ามี Token อยู่ใน Local Storage ให้แนบ Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.method === 'get') {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    // จัดการ Error ก่อนส่ง Request
    return Promise.reject(error);
  }
);

// 💡 Interceptor สำหรับ Response: จัดการ Error 401/403 (โค้ดนี้ใช้ได้แล้ว)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Authentication failed or token expired. Redirecting...");
            // ... (โค้ดจัดการ Redirect)
        }
        return Promise.reject(error);
    }
);


export default api; // ส่งออก Instance ที่กำหนดค่าแล้ว