import { useState, useEffect } from "react";
import api from "../API";
import { showPopup } from "../Popup";

function EditDeviceForm({ onClose, onSaveSuccess, deviceData }) {
  const [formData, setFormData] = useState({
    deviceId: deviceData?.device_id || "",
    deviceName: deviceData?.device_name || "",
    type: deviceData?.type || "",
    model: deviceData?.model || "",
    description: deviceData?.description || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deviceData) {
      setFormData({
        deviceId: deviceData.device_id || "",
        deviceName: deviceData.device_name || "",
        type: deviceData.type || "",
        model: deviceData.model || "",
        description: deviceData.description || "",
      });
    }
  }, [deviceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      device_name: formData.deviceName,
      type: formData.type,
      model: formData.model,
      description: formData.description,
    };

    try {
      await api.put(`/devices/${formData.deviceId}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      showPopup("สำเร็จ", "บันทึกการแก้ไขสำเร็จ", "success");
      if (onSaveSuccess) onSaveSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to update device:", error);
      showPopup("ข้อผิดพลาด", "ไม่สามารถบันทึกการแก้ไขได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!deviceData) return null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/*Device ID (ไม่ควรให้แก้)*/}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Device ID:</label>
          <input
            type="text"
            value={formData.deviceId}
            className="border rounded w-full p-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Device Name */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">
            ชื่ออุปกรณ์ (Device Name):
          </label>
          <input
            type="text"
            name="deviceName"
            value={formData.deviceName}
            onChange={handleChange}
            className="border rounded w-full p-2 bg-white outline-none focus:border-blue-500"
            placeholder="กรุณาระบุชื่อเรียกอุปกรณ์"
          />
        </div>

        {/* โมเดลอุปกรณ์ (Model) */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">
            รุ่นอุปกรณ์ (Model):
          </label>
          <select
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="border rounded w-full p-2 bg-white outline-none focus:border-blue-500"
            placeholder="เช่น W-D3200"
          >
            <option value="J3">J3</option>
            <option value="X7">X7</option>
            <option value="ED20W">ED20W</option>
          </select>
        </div>
      </div>

      {/* ปุ่มกด (Footer) */}
      <div className="pt-4 mt-2 border-t flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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

export default EditDeviceForm;
