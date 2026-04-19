import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { showPopup } from "./popup";

function SetElderlyDeviceForm({ isOpen, onClose, elderData, onSuccess }) {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: devices = [], isLoading: isDevicesLoading } = useQuery({
    queryKey: ["allDevices"],
    queryFn: async () => {
      const res = await api.get("/devices");
      return res.data;
    },
    enabled: isOpen,
  });

  const availableDevices = devices.filter((device) => {
    return (
      !device.assigned_to ||
      device.assigned_to === "None" ||
      device.assigned_to === "" ||
      device.status === "unassigned" ||
      device.device_id === elderData?.device_id
    );
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedDevice(elderData?.device_id || "");
    }
  }, [isOpen, elderData]);

  if (!isOpen || !elderData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDevice) {
      showPopup("แจ้งเตือน", "กรุณาเลือกอุปกรณ์ที่ว่างเพื่อเชื่อมต่อ", "error");
      return;
    }

    if (selectedDevice === elderData?.device_id) {
       if (onClose) onClose();
       return;
    }

    setIsSubmitting(true);
    try {
      if (elderData.device_id) {
        await api.put(`/devices/${elderData.device_id}`, {
          assigned_to: "None",
          status: "unassigned",
        }, {
           headers: {
             Authorization: `Bearer ${sessionStorage.getItem("token")}`,
           },
        });
      }

      await api.put(`/devices/${selectedDevice}`, {
        assigned_to: `${elderData.first_name} ${elderData.last_name}`,
        status: "online",
      }, {
         headers: {
           Authorization: `Bearer ${sessionStorage.getItem("token")}`,
         },
      });

      showPopup("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว", "success").then(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      });
    } catch (error) {
      console.error("Error setting new device for elder:", error);
      showPopup("ข้อผิดพลาด", "ไม่สามารถอัปเดตอุปกรณ์ได้ โปรดลองอีกครั้ง", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 text-sm">
            ชื่อผู้สูงอายุ:
          </label>
          <input
            type="text"
            value={`${elderData.first_name} ${elderData.last_name}`}
            readOnly
            className="border rounded p-2 bg-gray-100 w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="device_id" className="text-gray-700 text-sm">
            เลือกอุปกรณ์ Smartwatch:
          </label>
          <select
            id="device_id"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="border rounded p-2 bg-white w-full"
            disabled={isDevicesLoading || isSubmitting}
            required
          >
          
            <option value="">-- กรุณาเลือกอุปกรณ์ --</option>
            {isDevicesLoading ? (
              <option value="" disabled>กำลังโหลดอุปกรณ์...</option>
            ) : availableDevices.length > 0 ? (
              availableDevices.map((dev) => (
                <option key={dev.device_id} value={dev.device_id}>
                  {dev.device_name} (ID: {dev.device_id})
                  {dev.device_id === elderData?.device_id ? " (อุปกรณ์ปัจจุบัน)" : ""}
                </option>
              ))
            ) : (
              <option value="" disabled>ไม่มีอุปกรณ์ว่างในระบบ</option>
            )}
          </select>
          {!isDevicesLoading && availableDevices.length === 0 && (
             <p className="text-sm text-red-500">ไม่มีอุปกรณ์ในระบบ</p>
          )}
        </div>
      </div>

      <div className="pt-6 mt-4 border-t flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !selectedDevice}
          className="submit-btn"
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="cancel-btn"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

export default SetElderlyDeviceForm;
