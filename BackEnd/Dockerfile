# --- Stage 1: Builder (ใช้ image ที่มี Go compiler เพื่อ Build application) ---
FROM golang:1.24-alpine AS builder

# ตั้งค่า Working Directory ภายใน container
WORKDIR /app/backend

# คัดลอกไฟล์ Go Module (go.mod และ go.sum) เพื่อดึง dependencies ก่อน
COPY go.mod .
COPY go.sum .

# ดึง dependencies (ถ้ามีการเปลี่ยนแปลงใน go.mod/go.sum)
RUN go mod download

# คัดลอกไฟล์ source code ทั้งหมด
COPY . .

# Build application ให้เป็น executable binary ชื่อ 'backend-app'
# CGO_ENABLED=0 เพื่อสร้าง static binary ที่ไม่ขึ้นกับ glibc, เหมาะสำหรับ Alpine
# -o เพื่อกำหนดชื่อ output
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o backend-app .

# --- Stage 2: Final (ใช้ image ที่เล็กที่สุดเพื่อรัน executable binary) ---
FROM alpine:latest

# ตั้งค่า Working Directory
WORKDIR /root/

# คัดลอก executable binary จาก Stage Builder
COPY --from=builder /app/backend/backend-app .

# เปิดเผยพอร์ตที่ Backend ใช้ (สมมติว่าใช้พอร์ต 8080)
# ถ้าคุณใช้พอร์ตอื่น อย่าลืมเปลี่ยนตัวเลข
EXPOSE 8080

# คำสั่งเริ่มต้นเมื่อ container ถูกรัน
# เราใช้ executable binary ที่เรา build มา
CMD ["./backend-app"]