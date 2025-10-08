# --- Stage 1: Builder (ใช้ image Node.js เพื่อ build static assets) ---
FROM node:20-alpine AS builder

# ตั้งค่า Working Directory ภายใน container
WORKDIR /app/frontend

# คัดลอก package files เพื่อติดตั้ง dependencies ก่อน
COPY package.json .
COPY package-lock.json .

# ติดตั้ง dependencies
RUN npm install

# คัดลอก source code ที่เหลือทั้งหมด
COPY . .

# รัน build script ของ Vite (ซึ่งโดยทั่วไปจะสร้างโฟลเดอร์ 'dist')
RUN npm run build

# --- Stage 2: Final (ใช้ image Nginx ที่เล็กที่สุดเพื่อเสิร์ฟ static assets) ---
FROM nginx:alpine

# ลบ default static assets ของ Nginx
RUN rm -rf /usr/share/nginx/html/*

# คัดลอก build output (โฟลเดอร์ 'dist') จาก Stage Builder ไปยัง Nginx webroot
# Vite มักจะ build ไปที่โฟลเดอร์ 'dist'
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# เปิดเผยพอร์ตที่ Web Server (Nginx) ใช้
EXPOSE 80

# คำสั่งเริ่มต้นของ Nginx ถูกกำหนดโดย base image อยู่แล้ว
# (ซึ่งปกติคือการรัน Nginx ใน foreground)
CMD ["nginx", "-g", "daemon off;"]