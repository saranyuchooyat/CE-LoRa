import { useState, useEffect } from "react";
import api from "../api";
import { showPopup } from "./popup";

function SetDeviceForm({ deviceId, onClose }) {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyElders, setBusyElders] = useState([]);
  const [initialElderId, setInitialElderId] = useState(null);
  const [initialElderName, setInitialElderName] = useState("");
  const [isLoadingElders, setIsLoadingElders] = useState(false);
  useEffect(() => {
    const fetchCurrentOwner = async () => {
      try {
        const res = await api.get(`/devices/${deviceId}/owner`);
        const owner = res.data;
        console.log("name", owner);
        if (owner) {
          setSelectedZone(owner.zone_id);
          setInitialElderId(owner.elder_id);
          setInitialElderName(`${owner.first_name} ${owner.last_name}`);
        }
      } catch (err) {
        console.log("ยังไม่มีใครใช้เครื่องนี้");
      }
    };

    if (deviceId) fetchCurrentOwner();
  }, [deviceId]);

  useEffect(() => {
    if (elders.length > 0 && initialElderId) {
      setSelectedElder(initialElderId); 
      setInitialElderId(null); 
    }
  }, [elders, initialElderId]);

  useEffect(() => {
    const fetchBusyElders = async () => {
      try {
        const res = await api.get("/devices");
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

  // Fetch Zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await api.get("/zones/my-zones");
        setZones(res.data);
      } catch (err) {
        console.error("Failed to fetch zones", err);
      }
    };
    fetchZones();
  }, []);

  // Fetch Elders when selectedZone changes
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
      const elder = elders.find((e) => e.elder_id === selectedElder);
      const assignedToName = elder
        ? `${elder.first_name} ${elder.last_name}`
        : selectedElder;

      const payload = {
        status: "offline", 
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
