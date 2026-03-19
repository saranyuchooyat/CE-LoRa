import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import MenuNameCard2 from "../../components/MainCardOption/MenuNameCard2";
import Cardno2 from "../../components/Card/Cardno2";
import CardFull from "../../components/Card/Cardno5";
import Modal from "../../components/ModalForm/Modal";
import AddElderlyform from "../../components/ModalForm/AddElderly";
import EditElderlyForm from "../../components/ModalForm/EditElderlyForm";
import ElderlyProfileView from "../../components/Card/ElderlyProfileView";

function ZoneDashboardDetail() {
  const { zoneid } = useParams();
  const location = useLocation();

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

  // ✅ 2. สร้าง State สำหรับเก็บข้อมูลคนที่ถูกคลิก
  const [viewingProfile, setViewingProfile] = useState(null);

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

  // ตั้งค่า user role
  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    let role = null;
    if (location.state?.role) {
      role = location.state.role;
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          role = userData.role;
        } catch (e) {
          console.error("Failed to parse user data from localStorage:", e);
        }
      }
    }
    setUserRole(role);
  }, [location.state]);

  useEffect(() => {
    const tokenInStorage = localStorage.getItem("token");
    if (location.state?.token && location.state.token !== tokenInStorage) {
      localStorage.setItem("token", location.state.token);
    }
  }, [location.state]);

  const filteredZoneStaffData = zoneStaffData.filter((user) => {
    if (userRole === "Zone Admin") {
      return user.role === "Zone Staff";
    }
    return true;
  });

  console.log("ZoneData", zoneDashboard);

  if (isDashboardLoading || !zoneid) {
    return (
      <div className="mx-5 mt-10 text-center text-xl">
        Loading Zone Dashboard...
      </div>
    );
  }

  if (isDashboardError) {
    return (
      <div className="mx-5 mt-10 text-center text-xl text-red-600">
        Error fetching data: {error.message}
      </div>
    );
  }

  if (!zoneDashboard || Object.keys(zoneDashboard).length === 0) {
    return (
      <div className="mx-5 mt-10 text-center text-xl text-red-600">
        Zone ID "{zoneid}" not found.
      </div>
    );
  }

  const { alerts, deviceStatus, elders, zone } = zoneDashboard;

  const allAlertDetail = alerts;
  // console.log("alert",allAlertDetail)

  // จัดรูปแบบข้อมูลให้ตรงกับที่ Cardno2 ต้องการ
  const allDeviceStatus = [
    { name: "เชื่อมต่อ Smartwatch ทั้งหมด", value: deviceStatus?.total || 0 },
    { name: "Online", value: deviceStatus?.online || 0 },
    { name: "Offline", value: deviceStatus?.offline || 0 }
  ];

  const allEldery = elders;
  console.log("Elder", allEldery);

  const zoneDetail = zone;

  
  // ✅ 3. ดักสลับหน้าจอ ถ้ามีการกดเลือกผู้สูงอายุ ให้โชว์หน้าโปรไฟล์แทน!
  if (viewingProfile) {
    return (
      <ElderlyProfileView
        elderData={viewingProfile}
        onBack={() => setViewingProfile(null)} // พอกดกลับ ก็เคลียร์ค่าให้เป็น null เพื่อโชว์ Dashboard เหมือนเดิม
      />
    );
  }

  return (
    <>
      <div className="mx-5">
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
          onDeleteSuccess={() => zoneDashboardQueries[0].refetch()}
          onRowClick={setViewingProfile} // ✅ 4. ส่งคำสั่งให้ตารางรับรู้ว่าถ้ากดแถว ให้เอาข้อมูลมาใส่ใน viewingProfile
        />
      </div>

      <Modal
        title="เพิ่มข้อมูลผู้สูงอายุ"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      >
        <AddElderlyform
          zoneid={zoneid}
          onClose={handleCloseModal}
          onSaveSuccess={() => {
            handleCloseModal();
            zoneDashboardQueries[0].refetch();
          }}
        />
      </Modal>

      <Modal
        title="เพิ่มผู้ดูแลโซน"
        isOpen={isModalOpenStaff}
        onClose={handleCloseModalStaff}
      ></Modal>

      <Modal
        title="แก้ไขข้อมูลผู้สูงอายุ"
        isOpen={isEditElderlyModalOpen}
        onClose={handleCloseEditElderlyModal}
      >
        <EditElderlyForm
          elderData={selectedElderly}
          onClose={handleCloseEditElderlyModal}
          onSaveSuccess={() => {
            handleCloseEditElderlyModal();
            zoneDashboardQueries[0].refetch();
          }}
        />
      </Modal>
    </>
  );
}

export default ZoneDashboardDetail;
