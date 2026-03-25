import { useState, useEffect } from "react";
import api from "../API";
import { showPopup } from "../Popup";

function SetDeviceForm({ deviceId, onClose }) {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyElders, setBusyElders] = useState([]);
  // --- 1. เพิ่ม State ตัวนี้ไว้พัก ID คนเจ้าของเดิม ---
  const [initialElderId, setInitialElderId] = useState(null);
  const [initialElderName, setInitialElderName] = useState("");
  const [isLoadingElders, setIsLoadingElders] = useState(false);
  // --- 2. ดึงข้อมูลเจ้าของเครื่อง (ยิงเข้าหา Elder โดยตรงตามที่พี่บอก) ---
  useEffect(() => {
    const fetchCurrentOwner = async () => {
      try {
        // ยิงไป API ที่พี่สร้างใหม่ (ที่เอา DeviceID ไปหาใน Elder)
        const res = await api.get(`/devices/${deviceId}/owner`);
        const owner = res.data;
        console.log("name", owner);
        if (owner) {
          // พอเจอแล้ว ก็สั่งเซ็ต Zone เลย
          setSelectedZone(owner.zone_id);
          // พัก ID ผู้สูงอายุไว้ก่อน เพราะ Dropdown รายชื่อคนยังโหลดไม่เสร็จ
          setInitialElderId(owner.elder_id);
          setInitialElderName(`${owner.first_name} ${owner.last_name}`);
        }
      } catch (err) {
        console.log("ยังไม่มีใครใช้เครื่องนี้");
      }
    };

    if (deviceId) fetchCurrentOwner();
  }, [deviceId]);

  // --- 3. รอจังหวะที่รายชื่อคน (elders) โหลดเสร็จ แล้วค่อยยัด ID ลงไป ---
  useEffect(() => {
    if (elders.length > 0 && initialElderId) {
      setSelectedElder(initialElderId); // ยัด ID ลง Dropdown คน
      setInitialElderId(null); // ล้างค่าทิ้ง จะได้ไม่กวนตอนเรากดเปลี่ยนคนเอง
    }
  }, [elders, initialElderId]);

  useEffect(() => {
    const fetchBusyElders = async () => {
      try {
        const res = await api.get("/devices"); // ดึงอุปกรณ์ทั้งหมด
        const assignedNames = res.data
          .map((d) => d.assigned_to)
          .filter((name) => name && name !== "None");
        setBusyElders(assignedNames);
      } catch (err) {
        console.error("Failed to fetch devices for filtering", err);
      }
    };
    fetchBusyElders();
  }, []);

  // 1. Fetch Zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        // สมมติว่าดึง zone ที่ตัวเองดูแล ถ้ามี role admin อาจจะ get('/zones') ก็ได้
        // แต่โจทย์คือ "zone ที่ตัวเองดูแล" ดังนั้นลอง my-zones ก่อน
        const res = await api.get("/zones/my-zones");
        setZones(res.data);
      } catch (err) {
        console.error("Failed to fetch zones", err);
      }
    };
    fetchZones();
  }, []);

  // 2. Fetch Elders when selectedZone changes
  useEffect(() => {
    if (!selectedZone) {
      setElders([]);
      return;
    }
    const fetchElders = async () => {
      setIsLoadingElders(true);
      try {
        const res = await api.get(`/zones/${selectedZone}/elder`);
        setElders(res.data);
      } catch (err) {
        console.error("Failed to fetch elders", err);
      } finally {
        setIsLoadingElders(false);
      }
    };
    fetchElders();
  }, [selectedZone]);

  //เมื่อข้อมูลคนในโซนโหลดมาแล้ว ให้เซ็ตคนปัจจุบันอัตโนมัติ
  useEffect(() => {
    if (elders.length > 0 && initialElderId) {
      setSelectedElder(initialElderId);
    }
  }, [elders, initialElderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElder) {
      showPopup("แจ้งเตือน", "กรุณาเลือกผู้สูงอายุ", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // หาข้อมูลผู้สูงอายุที่ถูกเลือก เพื่อจัดเป็นชื่อ AssignedTo
      const elder = elders.find((e) => e.elder_id === selectedElder);
      const assignedToName = elder
        ? `${elder.first_name} ${elder.last_name}`
        : selectedElder;

      const payload = {
        status: "offline", // ให้สถานะตั้งต้นเมื่อพึ่งผูกอุปกรณ์เป็น offline รออัปเดตจากอุปกรณ์จริง
        assigned_to: assignedToName,
      };

      await api.put(`/devices/${deviceId}`, payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      showPopup("สำเร็จ", "บันทึกสำเร็จ", "success").then(() => {
        if (onClose) onClose();
      });
    } catch (error) {
      console.error("Failed to set device:", error);
      showPopup("ข้อผิดพลาด", "ไม่สามารถบันทึกการตั้งค่าได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="device_id" className="text-gray-700 text-sm">
            Device ID:
          </label>
          <input
            type="text"
            id="device_id"
            value={deviceId || ""}
            readOnly
            className="border rounded p-2 bg-gray-100 w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="zone_id" className="text-gray-700 text-sm">
            เลือกโซน (ที่ดูแล):
          </label>
          <select
            id="zone_id"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="border rounded p-2 bg-white w-full"
            required
          >
            <option value="">-- กรุณาเลือกโซน --</option>
            {zones.map((z, idx) => (
              <option key={idx} value={z.zone_id}>
                {z.zone_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="elder_id" className="text-gray-700 text-sm">
            เลือกผู้สูงอายุ:
          </label>
          <select
            id="elder_id"
            value={selectedElder}
            onChange={(e) => setSelectedElder(e.target.value)}
            className="border rounded p-2 bg-white w-full"
            disabled={!selectedZone || elders.length === 0}
            required
          >
            <option value="">-- กรุณาเลือกผู้สูงอายุ --</option>
            {elders.map((e) => {
              const fullName = `${e.first_name} ${e.last_name}`;
              const isBusy =
                busyElders.includes(fullName) && fullName !== initialElderName;

              return (
                <option
                  key={e.elder_id}
                  value={e.elder_id}
                  disabled={isBusy}
                  className={isBusy ? "text-gray-400" : "text-black"}
                >
                  {fullName} {isBusy ? "(ผูกแล้ว)" : ""}
                  {fullName === initialElderName ? " (เจ้าของปัจจุบัน)" : ""}
                </option>
              );
            })}
          </select>
          {selectedZone && !isLoadingElders && elders.length === 0 && (
            <p className="text-sm text-red-500">ไม่มีผู้สูงอายุในโซนนี้</p>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="pt-6 mt-4 border-t flex justify-end gap-3">
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

export default SetDeviceForm;
