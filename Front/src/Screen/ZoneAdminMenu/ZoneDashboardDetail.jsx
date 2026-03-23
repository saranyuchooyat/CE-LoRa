import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import MenuNameCard2 from "../../components/MainCardOption/MenuNameCard2";
import Cardno2 from "../../components/Card/Cardno2";
import CardFull from "../../components/Card/Cardno5";
import Modal from "../../components/ModalForm/Modal";
import AddElderlyform from "../../components/ModalForm/AddElderly";
import EditElderlyForm from "../../components/ModalForm/EditElderlyForm";
import ElderlyProfileView from "../../components/Card/ElderlyProfileView";
import ZoneSummaryReportView from "../../components/Card/ZoneSummaryReportView"; 
import SetElderlyDeviceForm from "../../components/ModalForm/SetElderlyDeviceForm";

function ZoneDashboardDetail() {
  const { zoneid } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const [isModalOpenStaff, setIsModalOpenStaff] = useState(false);
  const handleOpenModalStaff = () => setIsModalOpenStaff(true);
  const handleCloseModalStaff = () => setIsModalOpenStaff(false);

  const [isEditElderlyModalOpen, setIsEditElderlyModalOpen] = useState(false);
  const [selectedElderly, setSelectedElderly] = useState(null);
  const handleOpenEditElderlyModal = (elderData) => {
    setSelectedElderly(elderData);
    setIsEditElderlyModalOpen(true);
  };
  const handleCloseEditElderlyModal = () => {
    setSelectedElderly(null);
    setIsEditElderlyModalOpen(false);
  };

  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedElderForDevice, setSelectedElderForDevice] = useState(null);

  const handleOpenDeviceModal = (elderId) => {
    // ใช้ zoneDashboardQueries ตรงๆ ไม่ได้เพราะ data อยู่ใน allEldery ตัวแปรข้างล่าง
    // งั้นเราหาจาก elders ใน this scope
  };

  const [viewingProfile, setViewingProfile] = useState(null);
  
  // ✅ 2. สร้าง State ควบคุมการสลับไปหน้า Report
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  //ดึงข้อมูลหลังบ้าน
  const zoneDashboardQueries = useQueries({
    queries: [
      {
        queryKey: ["zoneDashboard", zoneid],
        queryFn: () =>
          api.get(`/zones/${zoneid}/dashboard`).then((res) => res.data),
        retry: false,
      },
      {
        queryKey: ["zoneStaffData", zoneid],
        queryFn: () =>
          api.get(`/zones/${zoneid}/staff`).then((res) => res.data),
        retry: false,
      },
    ],
  });

  const isDashboardLoading = zoneDashboardQueries.some(
    (query) => query.isLoading,
  );
  const isDashboardError = zoneDashboardQueries.some((query) => query.isError);

  const zoneDashboard = zoneDashboardQueries[0].data || [];
  const zoneStaffData = zoneDashboardQueries[1].data || [];

  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    let role = null;
    if (location.state?.role) {
      role = location.state.role;
    } else {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          role = userData.role;
        } catch (e) {
          console.error("Failed to parse user data from sessionStorage:", e);
        }
      }
    }
    setUserRole(role);
  }, [location.state]);

  useEffect(() => {
    const tokenInStorage = sessionStorage.getItem("token");
    if (location.state?.token && location.state.token !== tokenInStorage) {
      sessionStorage.setItem("token", location.state.token);
    }
  }, [location.state]);

  const filteredZoneStaffData = zoneStaffData.filter((user) => {
    if (userRole === "Zone Admin") {
      return user.role === "Zone Staff";
    }
    return true;
  });

  if (isDashboardLoading || !zoneid) {
    return <div className="mx-5 mt-10 text-center text-xl">Loading Zone Dashboard...</div>;
  }

  if (isDashboardError) {
    return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data</div>;
  }

  if (!zoneDashboard || Object.keys(zoneDashboard).length === 0) {
    return <div className="mx-5 mt-10 text-center text-xl text-red-600">Zone ID "{zoneid}" not found.</div>;
  }

  const { alerts, deviceStatus, elders, zone } = zoneDashboard;

  const allAlertDetail = alerts;
  const allDeviceStatus = [
    { name: "เชื่อมต่อ Smartwatch ทั้งหมด", value: deviceStatus?.total || 0 },
    { name: "Online", value: deviceStatus?.online || 0 },
    { name: "Offline", value: deviceStatus?.offline || 0 }
  ];

  const allEldery = elders;
  const zoneDetail = zone;

  // ✅ 3. สลับหน้าจอมาที่ Report ถ้า State เป็น true
  if (showSummaryReport) {
    return (
      <ZoneSummaryReportView 
        zoneId={zoneid} 
        zoneName={zoneDetail?.name}
        eldersData={allEldery}
        onBack={() => setShowSummaryReport(false)} 
      />
    );
  }

  if (viewingProfile) {
    return (
      <ElderlyProfileView
        elderData={viewingProfile}
        onBack={() => setViewingProfile(null)} 
      />
    );
  }

  // เติมฟังก์ชันการค้นหา elder สำหรับ Modal ให้อยู่ข้างล่างที่เรามีตัวแปร allEldery แล้ว
  const executeOpenDeviceModal = (elderId) => {
    const elder = allEldery.find(e => e.elder_id === elderId);
    if (elder) {
        setSelectedElderForDevice(elder);
        setIsDeviceModalOpen(true);
    }
  };

  return (
    <>
      <div className="mx-5">
        {/* ✅ 4. เพิ่มปุ่ม Report ไว้มุมขวาบน */}
        <div className="flex justify-end mb-3 mt-2">
            <button 
              onClick={() => setShowSummaryReport(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
            >
              Zone Summary Report
            </button>
        </div>

        <MenuNameCard
          title={zoneDetail?.name || "Zone Detail"}
          description={"Zone Admin Dashboard"}
          onButtonClick={null}
          detail={filteredZoneStaffData.length + " คน"}
          buttonText="ผู้ดูแล"
        />
        <CardFull
          data={filteredZoneStaffData}
          showActions={false}
          onEdit={(user) => console.log("Edit User:", user)}
        />
        <CardFull data={allAlertDetail} />
        <Cardno2 data={allDeviceStatus} />

        <MenuNameCard2
          title={allEldery.length}
          description="จำนวนผู้สูงอายุทั้งหมด"
          onButtonClick={handleOpenModal}
          buttonText="เพิ่มผู้สูงอายุ"
        />
        <CardFull
          data={allEldery}
          showActions={userRole === "Zone Admin" || true}
          onEdit={handleOpenEditElderlyModal}
          onSetting={executeOpenDeviceModal}
          onDeleteSuccess={() => zoneDashboardQueries[0].refetch()}
          onRowClick={setViewingProfile} 
        />
      </div>

      <Modal title="เพิ่มข้อมูลผู้สูงอายุ" isOpen={isModalOpen} onClose={handleCloseModal}>
        <AddElderlyform zoneid={zoneid} onClose={handleCloseModal} onSaveSuccess={() => { handleCloseModal(); zoneDashboardQueries[0].refetch(); }} />
      </Modal>

      <Modal title="เพิ่มผู้ดูแลโซน" isOpen={isModalOpenStaff} onClose={handleCloseModalStaff}></Modal>

      <Modal title="แก้ไขข้อมูลผู้สูงอายุ" isOpen={isEditElderlyModalOpen} onClose={handleCloseEditElderlyModal}>
        <EditElderlyForm elderData={selectedElderly} onClose={handleCloseEditElderlyModal} onSaveSuccess={() => { handleCloseEditElderlyModal(); zoneDashboardQueries[0].refetch(); }} />
      </Modal>
      <Modal title="ตั้งค่าอุปกรณ์" isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)}>
        <SetElderlyDeviceForm 
          isOpen={isDeviceModalOpen}
          onClose={() => setIsDeviceModalOpen(false)}
          elderData={selectedElderForDevice}
          onSuccess={() => {
            zoneDashboardQueries[0].refetch(); // โหลดข้อมูลใหม่
          }}
        />
      </Modal>
    </>
  );
}

export default ZoneDashboardDetail;