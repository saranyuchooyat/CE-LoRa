import J3 from "../../assets/picture/J3-Smartwatch.png";
import { Link, useNavigate } from "react-router-dom";
import ApiDelete from "../API-Delete";

function DeviceCard({ data, onSetting, onEdit }) {
  console.log("device", data);
  const navigate = useNavigate();

  const handleRowClick = (deviceId) => {
    navigate(`/deivce-details/${deviceId}`);
  };

  const statusCheck = (status) => {
    console.log("status", status);
    switch (status) {
      case "offline":
        return "text-gray-800 bg-gray-300";
      case "online":
        return "text-green-700 bg-green-200";
      default:
        return "text-gray-700 bg-gray-200";
    }
  };

  const CardstatusCheck = (status) => {
    console.log("status", status);
    switch (status) {
      case "offline":
        return "bg-gray-200 border-gray-500";
      case "online":
        return "bg-test-color border-main-green";
      default:
        return "bg-test-color border-main-green";
    }
  };

  const handleSettingClick = (deviceId, event) => {
    event.stopPropagation();
    onSetting(deviceId); // 💡 ส่ง ID กลับไปที่ Component แม่
  };

  const handleEditClick = (cardData, event) => {
    event.stopPropagation();
    onEdit(cardData);
  };

  // Delete Button
  const { mutate: deleteDevice, isPending } = ApiDelete("device");

  const handleDeleteClick = (deviceId, event) => {
    event.stopPropagation();
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Device ID: ${deviceId}?`)) {
      deleteDevice(deviceId);
    }
  };
  // Delete Button

  return (
    <>
      {data.map((card, index) => {
        const status = card.status || "unassigned";
        const type = card.type || "Unknown";
        const assigned_to = card.assigned_to || "None";
        const model = card.model || card.device_name || "Unknown Model";
        const batteryLevel =
          card.battery !== undefined && card.battery !== null
            ? card.battery
            : null;
        const batteryDisplay =
          batteryLevel !== null ? `${batteryLevel}%` : "None";
        const last_update = card.last_update
          ? new Date(card.last_update).toLocaleString()
          : "-";

        return (
          <button
            key={index}
            className={`flex flex-col items-center  border-l-0 border-y-5 ${CardstatusCheck(status)} rounded-[15px] gap-4 p-3 drop-shadow-lg hover:bg-main-card/30 cursor-pointer transition-colors duration-150`}
            onClick={() => handleRowClick(card.device_id)}
          >
            <div
              className={`font-semibold rounded-full py-1 px-10 w-fit ${statusCheck(status)}`}
            >
              <p>{status}</p>
            </div>

            <div className="grid grid-cols-2 text-start gap-4 w-full">
              <div className="text-start">
                <img src={J3} alt="J3-ismarch" />
                <div>
                  <p className="text-gray-400">ประเภท</p>
                  <p>{type}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="">
                  <p className="text-gray-400">รหัสอุปกรณ์</p>
                  <p>{card.device_id}</p>
                </div>

                <div className="">
                  <p className="text-gray-400">ผู้ใช้งาน</p>
                  <p>{assigned_to}</p>
                </div>

                <div className="">
                  <p className="text-gray-400">รุ่นอุปกรณ์</p>
                  <p>{model}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 text-start gap-4 w-full">
                <div className="">
                  <p className="text-gray-400">แบตเตอรี่</p>
                  <p
                    className={`font-bold ${batteryLevel !== null && batteryLevel < 20 ? "text-red-500" : "text-slate-800"}`}
                  >
                    {batteryDisplay}
                  </p>
                </div>
              </div>
              <div className="">
                <p className="text-gray-400">อัพเดตล่าสุด</p>
                <p>{last_update}</p>
              </div>
            </div>

            <div className="text-start w-full">
              <p className="text-gray-400">เซนเซอร์/ฟีเจอร์</p>
              <div className="flex gap-2 w-full">
                {(card.features || []).map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-main-green font-xs text-white rounded-lg px-2 w-fit"
                    >
                      {data}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex w-full gap-4">
              <button
                className="table-btn hover:bg-main-yellow hover:text-white"
                onClick={(event) => handleEditClick(card, event)}
              >
                แก้ไข
              </button>
              <button
                className="table-btn hover:bg-green-500 hover:text-white"
                onClick={(event) => handleSettingClick(card.device_id, event)}
              >
                ตั้งค่า
              </button>
              <button
                className="table-btn hover:bg-main-red hover:text-white"
                onClick={(event) => handleDeleteClick(card.device_id, event)}
                disabled={isPending}
              >
                {isPending ? "ลบ..." : "ลบ"}
              </button>
            </div>
          </button>
        );
      })}
    </>
  );
}

export default DeviceCard;
