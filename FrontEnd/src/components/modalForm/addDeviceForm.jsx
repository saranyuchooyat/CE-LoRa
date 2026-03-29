import { useState, useEffect } from "react";
import axios from "axios";
import api from "../api";

function AddDeviceForm({ onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    deviceName: "",
    deviceModel: "เลือก Model",
    features: "เลือก Feature",
  });
  const [nextId, setNextId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MODEL_DEFAULTS = {
    J3: ["GPS", "Heart Rate", "Fall Detection", "SpO2", "SOS Button"],
    X7: ["GPS", "Heart Rate", "Temperature", "SpO2"],
    ED20W: ["Heart Rate", "SOS Button"],
  };
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const res = await api.get("/devices");
        const count = res.data.length;
        const nextIdStr = `D${String(count + 1).padStart(3, "0")}`;
        setNextId(nextIdStr);
      } catch (err) {
        console.error("Failed to fetch device count", err);
      }
    };
    fetchNextId();
  }, []);
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
    const token = sessionStorage.getItem("token");

    const dataToSend = {
      device_id: nextId,
      device_Name: formData.deviceName,
      features: formData.features,
      model: formData.model,
      last_update: new Date().toISOString(),
      status: "unassigned",
      type: formData.type,
      assigned_to: "",
    };

    try {
      // 2. ส่ง request พร้อมแนบ Header Authorization
      await axios.post("${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/devices", dataToSend, {
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
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold text-blue-600">
            ID ที่จะถูกสร้าง:
          </label>
          <input
            type="text"
            value={nextId}
            readOnly
            className="border rounded w-full p-2 bg-blue-50 font"
          />
        </div>
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
            <option value="">-- เลือก Model --</option>
            <option value="J3">J3</option>
            <option value="X7">X7</option>
            <option value="ED20W">ED20W</option>
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
              className="flex items-center space-x-2 cursor-default pointer-events-none"
            >
              <input
                type="checkbox"
                value={item.value}
                checked={formData.features.includes(item.value)}
                readOnly
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
          className="submit-btn"
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cancel-btn"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

export default AddDeviceForm;
