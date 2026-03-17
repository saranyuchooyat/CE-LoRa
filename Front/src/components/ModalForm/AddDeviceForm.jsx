import { useState } from "react";
import axios from "axios";

function AddDeviceForm({ onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    deviceName: "",
    deviceModel: "เลือก Model",
    type: "เลือก Type",
    features: "เลือก Feature",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const MODEL_DEFAULTS = {
    J3: ["GPS", "Heart Rate", "Fall Detection", "SpO2", "SOS Button"],
    X7: ["GPS", "Heart Rate", "Temperature", "SpO2"],
    ED20W: ["Heart Rate", "SOS Button"],
    Dragino: [],
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "model" && MODEL_DEFAULTS[value]) {
        newData.features = MODEL_DEFAULTS[value];
      }

      return newData;
    });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const { features } = formData;

    if (checked) {
      // ถ้าติ๊กถูก ให้เพิ่ม value เข้าไปใน Array
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, value],
      }));
    } else {
      // ถ้าเอาติ๊กออก ให้กรองเอา value นั้นออก
      setFormData((prev) => ({
        ...prev,
        features: features.filter((item) => item !== value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // 1. ดึง Token จาก localStorage (เปลี่ยนชื่อ Key ตามที่คุณตั้งไว้ตอน Login)
    const token = localStorage.getItem("token");

    const dataToSend = {
      device_Name: formData.deviceName,
      features: formData.features,
      model: formData.model,
      last_update: new Date().toISOString(),
      status: "unassigned",
      type: formData.type,
    };

    try {
      // 2. ส่ง request พร้อมแนบ Header Authorization
      await axios.post("http://localhost:8080/devices", dataToSend, {
        headers: {
          // รูปแบบมาตรฐานคือ 'Bearer [TOKEN]'
          Authorization: `Bearer ${token}`,
        },
      });

      if (typeof onSaveSuccess === "function") {
        onSaveSuccess();
      }
      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      if (error.response) {
        // จะเห็น Error "Missing or malformed JWT" ที่นี่ถ้า Token ไม่ถูกต้อง
        console.error("Server Error Detail:", error.response.data);
      }
      console.error("Error adding device:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/*Device ID*/}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Device Name:</label>
          <input
            name="deviceName"
            type="text"
            value={formData.deviceName}
            onChange={handleChange}
            className="border rounded w-full p-2 bg-white"
            required
          />
        </div>

        {/* Dropdown Type */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border rounded w-full p-2 bg-white"
            required
          >
            <option value="เลือก Type">เลือก Type</option>
            <option value="Smartwatch">Smartwatch</option>
            <option value="Gateway">Gateway</option>
          </select>
        </div>

        {/* deviceName */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Model:</label>
          <select
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="border rounded w-full p-2 bg-white"
            required
          >
            <option value="เลือก Type">เลือก Model</option>
            <option value="J3">J3</option>
            <option value="X7">X7</option>
            <option value="ED20W">ED20W</option>
            <option value="Dragino">Dragino</option>
          </select>
        </div>
        {/* Dropdown Feature*/}
      </div>
      <div className="col-span-2 mb-4">
        <label className="block text-gray-700 text-sm mb-2">Features:</label>
        <div className="grid grid-cols-2 gap-2 p-3 border rounded bg-gray-50">
          {[
            { label: "📍 GPS", value: "GPS" },
            { label: "❤️ Heart Rate", value: "Heart Rate" },
            { label: "🧘‍♂️ Fall Detection", value: "Fall Detection" },
            { label: "🩸 SpO2", value: "SpO2" },
            { label: "🌡️ Temperature", value: "Temperature" },
            { label: "🆘 SOS Button", value: "SOS Button" },
            { label: "📲 Calling", value: "Calling" },
          ].map((item) => (
            <label
              key={item.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                value={item.value}
                checked={formData.features.includes(item.value)}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ปุ่มกด (Footer) */}
      <div className="pt-4 border-t flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

export default AddDeviceForm;
