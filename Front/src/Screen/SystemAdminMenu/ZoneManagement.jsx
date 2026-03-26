import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/Card/CardFilter";
import DataTableCard from "../../components/Card/DataTableCard";
import Modal from "../../components/ModalForm/Modal";
import AddZoneForm from "../../components/ModalForm/AddZoneForm";
import EditZoneForm from "../../components/ModalForm/EditZoneForm";
import SetZoneForm from "../../components/ModalForm/SetZoneForm";

//กำหนดตัวแปรแต่ละช่อง Filter
const initialFilters = {
  search: "", // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
  province: "ทั้งหมด", // สำหรับ Role (option2Name)
  status: "ทั้งหมด", // สำหรับ Status (option1Name)
};
//กำหนดตัวแปรแต่ละช่อง Filter

function ZoneManagement() {
  
  const location = useLocation();
  
  const [filters, setFilters] = useState(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const [selectedZoneData, setSelectedZoneData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);

  //ดึงข้อมูลหลังบ้าน
  const zoneQueries = useQueries({
    queries: [
      { queryKey: ['zones'], queryFn: () => api.get('/zones').then(res => res.data) },
    ],
  });

  const isSystemLoading = zoneQueries.some(query => query.isLoading);
  const isSystemError = zoneQueries.some(query => query.isError);

  const zoneData = zoneQueries[0].data || [];
  console.log("Zone Data:", zoneData);

  console.log(zoneQueries.status)

  useEffect(() => {
    const tokenInStorage = sessionStorage.getItem('token');
    if (location.state?.token && location.state.token !== tokenInStorage) {
        sessionStorage.setItem('token', location.state.token);
    }
  }, [location.state]);
  //ดึงข้อมูลหลังบ้าน

  // ฟังก์ชันเปิด Modal แก้ไข
  const handleOpenEditModal = (zone) => {
    setSelectedZoneData(zone);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setSelectedZoneData(null);
    setIsEditModalOpen(false);
  }

  // ฟังก์ชันเปิด Modal ตั้งค่า
  const handleOpenSetModal = (zone) => {
    setSelectedZoneData(zone);
    setIsSetModalOpen(true);
  };
  const handleCloseSetModal = () => {
    setSelectedZoneData(null);
    setIsSetModalOpen(false);
  }

  //ระบบ filter
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const filteredZones = useMemo(() => {
    const { search, province, status } = filters;
    let data = zoneData || []; 

    // กรองตามช่องค้นหา (Search)
    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter((zone) => {

        // 1. การค้นหาด้วย ID (ต้องแปลงเป็น String ก่อน)
        const zoneIdSearch = zone.zone_id
          ? String(zone.zone_id).toLowerCase().includes(lowerSearch)
          : false;

        // 2. การค้นหาด้วยชื่อและรหัส (ป้องกันค่าเป็น null/undefined ก่อนเรียก toLowerCase)
        const nameSearch =
          zone.zone_name && zone.zone_name.toLowerCase().includes(lowerSearch);
        const addressSearch =
          zone.zone_address && zone.zone_address.toLowerCase().includes(lowerSearch);

        // รวมผลลัพธ์การค้นหาทั้งหมด
        return zoneIdSearch || nameSearch || addressSearch;
      });
    }

    if (province && province !== "ทั้งหมด") {
      data = data.filter((zone) => zone.province === province);
    }

    if (status && status !== "ทั้งหมด") {
      data = data.filter((zone) => zone.status === status);
    }

    return data;
  }, [zoneData, filters]);
  //ระบบ filter

  if (isSystemLoading) {
      return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
  }
    
  if (isSystemError) {
    return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
  }

  return (
    <>
      <div className="mx-5">
        <MenuNameCard
          title="จัดการ Zone พื้นที่"
          description="ระบบจัดการพื้นที่ใช้งาน Smart Healthcare System"
          onButtonClick={handleOpenModal}
          detail={false}
          buttonText=" Zone "
        />

        <CardFilter
          name="Zone"
          placeholderName=" ชื่อ zone, รหัส zone, หรือที่อยู่"
          option1Name="สถานะ"
          option2Name={null}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          option2Key="province"
        />
        <DataTableCard 
          data={filteredZones} 
          onEdit={handleOpenEditModal}
          onSetting={handleOpenSetModal}
        />
      </div>

      <Modal
        title="เพิ่ม Zone ใหม่"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      >

        <AddZoneForm 
          onClose={() => {
          handleCloseModal();
          zoneQueries[0].refetch();
          }} 
        />
      </Modal>

      <Modal
        title="แก้ไขข้อมูล Zone"
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      >
        <EditZoneForm
          zoneData={selectedZoneData} 
          zoneId={selectedZoneData?.zone_id} 
          onClose={handleCloseEditModal}
          onSaveSuccess={() => zoneQueries[0].refetch()}
        />
      </Modal>

      <Modal
        title="กำหนด Zone"
        isOpen={isSetModalOpen}
        onClose={handleCloseSetModal}
      >
        <SetZoneForm
          zoneData={selectedZoneData} 
          zoneId={selectedZoneData?.zone_id} 
          onClose={handleCloseSetModal}
          onSaveSuccess={() => zoneQueries[0].refetch()}
        />
      </Modal>  
    </>
  );
}

export default ZoneManagement;
