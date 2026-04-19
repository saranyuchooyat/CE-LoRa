import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/api";
import MenuNameCard from "../../components/card/menuNameCard";
import CardFilter from "../../components/card/cardFilter";
import SummaryCard from "../../components/card/summaryCard";
import CardLayouts from "../../components/card/cardLayouts";
import Modal from "../../components/modalForm/modal";
import AddDeviceForm from "../../components/modalForm/addDeviceForm";
import SetDeviceForm from "../../components/modalForm/setDeviceForm";
import EditDeviceForm from "../../components/modalForm/editDeviceForm";

const initialFilters = {
  search: "", 
  deviceType: "ทั้งหมด", 
  status: "ทั้งหมด", 
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
    }
  }, [location.state]);

  const deviceQueryResult = deviceQueries[0];

  console.log("deviceQueryResult.data", deviceQueryResult.data);

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

    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter((device) => {
        const deviceIdMatch = device.device_id
          ?.toLowerCase()
          .includes(lowerSearch);

        const modelMatch = device.model?.toLowerCase().includes(lowerSearch);

        const nameMatch = device.device_name
          ?.toLowerCase()
          .includes(lowerSearch);

        const snMatch = device.serial_number
          ?.toLowerCase()
          .includes(lowerSearch);

        const assignedMatch = device.assigned_to
          ?.toLowerCase()
          .includes(lowerSearch);

        return (
          deviceIdMatch || modelMatch || nameMatch || snMatch || assignedMatch
        );
      });
    }

    if (deviceType && deviceType !== "ทั้งหมด") {
      data = data.filter((device) => device.model === deviceType);
    }

    if (status && status !== "ทั้งหมด") {
      data = data.filter((device) => device.status === status);
    }

    return data;
  }, [deviceQueryResult.data, filters]);

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

        <SummaryCard data={deviceStatusData} />

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
