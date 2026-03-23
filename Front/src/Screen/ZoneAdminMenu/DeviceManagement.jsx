import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/Card/CardFilter";
import Cardno2 from "../../components/Card/Cardno2";
import CardLayouts from "../../components/Card/CardLayouts";
import Modal from "../../components/ModalForm/Modal";
import AddDeviceForm from "../../components/ModalForm/AddDeviceForm";
import SetDeviceForm from "../../components/ModalForm/SetDeviceForm";
import EditDeviceForm from "../../components/ModalForm/EditDeviceForm";

const initialFilters = {
  search: "", // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
  deviceType: "ทั้งหมด", // สำหรับ Role (option2Name)
  status: "ทั้งหมด", // สำหรับ Status (option1Name)
};

function DeviceManagement() {
  const location = useLocation();
  const [filters, setFilters] = useState(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [selectedSettingDeviceId, setSelectedSettingDeviceId] = useState(null);
  const handleOpenSetModal = (deviceId) => {
    setSelectedSettingDeviceId(deviceId);
    setIsSetModalOpen(true);
  };
  const handleCloseSetModal = () => {
    setSelectedSettingDeviceId(null);
    setIsSetModalOpen(false);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditDevice, setSelectedEditDevice] = useState(null);
  const handleOpenEditModal = (deviceData) => {
    setSelectedEditDevice(deviceData);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setSelectedEditDevice(null);
    setIsEditModalOpen(false);
  };

  //ดึงข้อมูลหลังบ้าน
  const deviceQueries = useQueries({
    queries: [
      {
        queryKey: ["devices"],
        queryFn: () => api.get("/devices").then((res) => res.data),
      },
    ],
  });

  const isSystemLoading = deviceQueries.some((query) => query.isLoading);
  const isSystemError = deviceQueries.some((query) => query.isError);

  useEffect(() => {
    const tokenInStorage = sessionStorage.getItem("token");
    if (location.state?.token && location.state.token !== tokenInStorage) {
      sessionStorage.setItem("token", location.state.token);
      // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
      // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
    }
  }, [location.state]);

  const deviceQueryResult = deviceQueries[0];
  //ดึงข้อมูลหลังบ้าน

  console.log("deviceQueryResult.data", deviceQueryResult.data);

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

  const filteredDevices = useMemo(() => {
    const { search, deviceType, status } = filters;
    let data = deviceQueryResult.data || [];

    // 1. กรองด้วยช่องค้นหา (Search)
    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter((device) => {
        // ค้นหาจาก DeviceID
        const deviceIdMatch = device.device_id
          ?.toLowerCase()
          .includes(lowerSearch);

        // ค้นหาจาก Model
        const modelMatch = device.model?.toLowerCase().includes(lowerSearch);

        // ค้นหาจาก Device Name
        const nameMatch = device.device_name
          ?.toLowerCase()
          .includes(lowerSearch);

        // ค้นหาจาก Serial Number (เพิ่มใหม่ตาม struct)
        const snMatch = device.serial_number
          ?.toLowerCase()
          .includes(lowerSearch);

        // ค้นหาจากชื่อผู้ที่ได้รับมอบหมาย (เพิ่มใหม่ตาม struct)
        const assignedMatch = device.assigned_to
          ?.toLowerCase()
          .includes(lowerSearch);

        return (
          deviceIdMatch || modelMatch || nameMatch || snMatch || assignedMatch
        );
      });
    }

    // 2. กรองตามประเภท (Type)
    // เช็คให้ชัวร์ว่าค่าจาก Frontend (deviceType) ตรงกับค่าใน DB (device.type)
    if (deviceType && deviceType !== "ทั้งหมด") {
      data = data.filter((device) => device.type === deviceType);
    }

    // 3. กรองตามสถานะ (Status)
    if (status && status !== "ทั้งหมด") {
      data = data.filter((device) => device.status === status);
    }

    return data;
  }, [deviceQueryResult.data, filters]);
  //ระบบ filter

  //ระบบกรองสถานะอุปกรณ์
  const deviceStatusCount = (deviceQueryResult.data || []).reduce(
    (acc, device) => {
      const status = device.status || "unassigned";
      console.log(device.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { online: 0, offline: 0, unassigned: 0 },
  );

  const deviceStatusList = Object.entries(deviceStatusCount).map(
    ([status, count]) => {
      return {
        name: status,
        value: count,
      };
    },
  );

  const totalDevicesObject = {
    name: "อุปกรณ์ทั้งหมด",
    value: (deviceQueryResult.data || []).length,
  };

  const deviceStatusData = [totalDevicesObject, ...deviceStatusList];
  //ระบบกรองสถานะอุปกรณ์

  if (isSystemLoading) {
    return (
      <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>
    );
  }

  if (isSystemError) {
    return (
      <div className="mx-5 mt-10 text-center text-xl text-red-600">
        Error fetching data!
      </div>
    );
  }

  return (
    <>
      <div className="mx-5">
        <MenuNameCard
          title="จัดการอุปกรณ์ Smart Healthcare ภายในพื้นที่"
          description=""
          onButtonClick={handleOpenModal}
          detail={false}
          buttonText="อุปกรณ์"
        />

        <Cardno2 data={deviceStatusData} />

        <div className="relative z-10">
          <CardFilter
            name="อุปกรณ์"
            placeholderName="รหัสอุปกรณ์, ชื่อรุ่นอุปกรณ์"
            option1Name="สถานะ"
            option2Name="ประเภท"
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
            option2Key="deviceType"
          />
        </div>

        <CardLayouts
          name="device"
          data={filteredDevices}
          onSetting={handleOpenSetModal}
          onEdit={handleOpenEditModal}
        />
      </div>

      <Modal
        title="เพิ่มอุปกรณ์ใหม่"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      >
        <AddDeviceForm
          onClose={() => {
            handleCloseModal();
            deviceQueries[0].refetch();
          }}
        />
      </Modal>

      <Modal
        title="ตั้งค่าอุปกรณ์"
        isOpen={isSetModalOpen}
        onClose={handleCloseSetModal}
      >
        <SetDeviceForm
          deviceId={selectedSettingDeviceId}
          onClose={() => {
            handleCloseSetModal();
            deviceQueries[0].refetch();
          }}
        />
      </Modal>

      <Modal
        title="แก้ไขข้อมูลอุปกรณ์"
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      >
        <EditDeviceForm
          deviceData={selectedEditDevice}
          onClose={() => {
            handleCloseEditModal();
            deviceQueries[0].refetch();
          }}
        />
      </Modal>
    </>
  );
}

export default DeviceManagement;
