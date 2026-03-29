import axios from 'axios';

// 1. สร้างตัวแทน (Instance) โดยกำหนดแค่ Base URL 
const api = axios.create({
  // ถ้ามี .env ให้ใช้ ถ้าไม่มีให้ชี้ไปหา Server มหาลัยโดยตรง
  baseURL: import.meta.env.VITE_API_URL || 'http://100.118.210.62:8081', 
});

// 2. 🌟 ใส่เกราะ Interceptor (หัวใจสำคัญ!)
// โค้ดส่วนนี้จะทำงาน "ทุกครั้ง" ก่อนที่คำสั่ง api.get หรือ api.post จะถูกยิงออกไป
api.interceptors.request.use(
  (config) => {
    // ล้วงกระเป๋าหยิบ Token ใหม่ล่าสุดเสมอ!
    const token = sessionStorage.getItem('token'); 
    
    // ถ้ามี Token ให้แปะหน้าผาก (Headers) ไปด้วย
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;