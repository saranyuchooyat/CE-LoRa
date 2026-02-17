import { useState, useEffect, useMemo} from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/Card/CardFilter";
import Cardno2 from "../../components/Card/Cardno2";
import CardLayouts from "../../components/Card/CardLayouts";
import Modal from "../../components/ModalForm/Modal";
import AddDeviceForm from "../../components/ModalForm/AddDeviceForm";

const initialFilters = {
    search: '', // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
    deviceType: 'ทั้งหมด', // สำหรับ Role (option2Name)
    status: 'ทั้งหมด' // สำหรับ Status (option1Name)
};

function DeviceManagement(){

    const location = useLocation();
    const [filters, setFilters] = useState(initialFilters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    //ดึงข้อมูลหลังบ้าน
    const deviceQueries = useQueries({
        queries: [
        { queryKey: ['devices'], queryFn: () => api.get('/devices').then(res => res.data) },
        ],
    });

    const isSystemLoading = deviceQueries.some(query => query.isLoading);
    const isSystemError = deviceQueries.some(query => query.isError);

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
            // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
            // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);

    const deviceQueryResult = deviceQueries[0];
    //ดึงข้อมูลหลังบ้าน

    console.log("deviceQueryResult.data",deviceQueryResult.data)


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
    
            // กรองตามช่องค้นหา (Search)
            if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter((device) => {
                // 1. การค้นหาด้วย ID (ต้องแปลงเป็น String ก่อน)
                const deviceIdSearch = device.device_id
                ? String(device.device_id).includes(lowerSearch)
                : false;
    
                // 2. การค้นหาด้วยชื่อและรหัส (ป้องกันค่าเป็น null/undefined ก่อนเรียก toLowerCase)
                const modelSearch =
                device.model && device.model.toLowerCase().includes(lowerSearch);
                const addressSearch =
                device.address && device.address.toLowerCase().includes(lowerSearch);
    
                // รวมผลลัพธ์การค้นหาทั้งหมด
                return deviceIdSearch || modelSearch || addressSearch;
            });
            }
    
            if (deviceType && deviceType !== "ทั้งหมด") {
            data = data.filter((device) => device.type === deviceType);
            }
    
            if (status && status !== "ทั้งหมด") {
            data = data.filter((device) => device.status === status);
            }
    
            return data;
        }, [deviceQueryResult.data, filters]);
        //ระบบ filter

    //ระบบกรองสถานะอุปกรณ์
    const deviceStatusCount = (deviceQueryResult.data || []).reduce((acc, device) => {
    const status = device.status;
    acc[status] = (acc[status] || 0)+1;
    console.log("acc",acc)
    return acc
    }, {});

    const deviceStatusList = Object.entries(deviceStatusCount).map(([status, count]) => {
        return {
            name: status, 
            value: count
        }
        
    })

    const totalDevicesObject = {name: "อุปกรณ์ทั้งหมด", value: deviceQueries.length}

    const deviceStatusData = [
        totalDevicesObject,
        ...deviceStatusList
    ];
    //ระบบกรองสถานะอุปกรณ์

    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
        
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการอุปกรณ์ Smart Healthcare ภายในพื้นที่"
                description=""
                onButtonClick={handleOpenModal}
                detail={false}
                buttonText="อุปกรณ์"/>
                
                <Cardno2 data={deviceStatusData}/>

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
                data={filteredDevices}/>

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

        </>
    );

}

export default DeviceManagement;