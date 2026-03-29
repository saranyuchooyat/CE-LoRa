import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/api";
import MenuNameCard from "../../components/mainCardOption/menuNameCard";
import MenuNameCard2 from '../../components/mainCardOption/menuNameCard2';
import SummaryCard from "../../components/card/summaryCard";
import CardFilter from "../../components/card/cardFilter";
import DataTableCard from "../../components/card/dataTableCard";
import Modal from "../../components/modalForm/modal";
import EditZoneStaff from "../../components/modalForm/editZoneStaff";
import AddZoneStaffForm from "../../components/modalForm/addZoneStaff";
import SetZoneZoneStaff from "../../components/modalForm/setZoneZoneStaff";

//กำหนดตัวแปรแต่ละช่อง Filter
const initialFilters = {
  search: "", // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
  zonestaff: "ทั้งหมด", // สำหรับ Role (option2Name)
  status: "ทั้งหมด", // สำหรับ Status (option1Name)
};
//กำหนดตัวแปรแต่ละช่อง Filter

function ZoneStaffManagement(){
    
    const location = useLocation();

    const [filters, setFilters] = useState(initialFilters);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const handleOpenEditModal = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setSelectedUserId(null);
        setIsEditModalOpen(false);
    };

    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [selectedSettingUserId, setSelectedSettingUserId] = useState(null);
     const handleOpenSettingModal = (userId) => {
        setSelectedSettingUserId(userId);
        setIsSettingModalOpen(true);
    };

    const handleCloseSettingModal = () => {
        setSelectedSettingUserId(null);
        setIsSettingModalOpen(false);
    };

    //ดึงข้อมูลหลังบ้าน
    const userQueries = useQueries({
        queries: [
        { queryKey: ['users'], queryFn: () => api.get('/users').then(res => res.data) },
        { queryKey: ['zones'], queryFn: () => api.get('/zones').then(res => res.data) },
        ],
    });

    const isSystemLoading = userQueries.some(query => query.isLoading);
    const isSystemError = userQueries.some(query => query.isError);

    const userData = userQueries[0].data || [];
    const zoneData = userQueries[1].data || [];

    const zonestaffData = userData.filter(user => user.role === "Zone Staff");

    const zoneOptions = useMemo(() => {
    return zoneData.map(zone => ({ 
        label: zone.zone_name, // ใช้ชื่อ 'label' เพื่อให้ง่ายต่อการนำไปใส่ Dropdown
        value: zone.zone_id    // ใช้ชื่อ 'value' สำหรับค่าที่จะส่งไป API
    }));
    }, [zoneData]);

    useEffect(() => {
        const tokenInStorage = sessionStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            sessionStorage.setItem('token', location.state.token);
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    // ฟังก์ชันเปิด Modal แก้ไข
    
    // ระบบ filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const filteredUsers = useMemo(() => {
        const { search, zonestaff, status } = filters;
        let data = zonestaffData;

        // กรองตามช่องค้นหา (Search)
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(user => {
                const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
                return (
                    fullName.includes(lowerSearch) ||
                    (user.username && user.username.toLowerCase().includes(lowerSearch)) ||
                    (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
                    (user.phone && String(user.phone).includes(lowerSearch))
                );
            });
        }

        if (zonestaff && zonestaff !== "ทั้งหมด") {
            // zone_id from API might be comma separated string or array or single string
            data = data.filter((user) => {
                if (!user.zone_id) return false;
                if (Array.isArray(user.zone_id)) return user.zone_id.includes(zonestaff);
                if (typeof user.zone_id === 'string') {
                    // split by comma if there are multiple zones
                    const zones = user.zone_id.split(',').map(z => z.trim());
                    return zones.includes(zonestaff);
                }
                return false;
            });
        }
        if (status && status !== 'ทั้งหมด') {
            data = data.filter((user) => user.account_status === status);
        }
        return data;
    }, [userData, filters]);
    // ระบบ filter

    // ระบบกรองจำวน Role
        const roleCountsObject = (userData).reduce((acc, user) => {
        const role = user.role;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const staffDataList = Object.entries(roleCountsObject).map(([roleName, count]) => {
        return {
            name: roleName,
            value: count
        };
    })

    const totalStaffObjects= {name:"จำนวนทั้งหมด", value:userQueries.length}

    const staffData=[
        totalStaffObjects,
        ...staffDataList
    ]
    // ระบบกรองจำวน Role
    
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
                title="จัดการผู้ใช้งาน"
                description="ระบบจัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง"
                onButtonClick={handleOpenModal} // ต้องเพิ่ม Prop นี้ใน MenuNameCard
                detail={false}
                buttonText="ผู้ใช้งาน"/>

                {/* <SummaryCard data={staffData}/> */}
                <MenuNameCard2
                    title={zonestaffData.length}
                    description=" จำนวน Zone Staff ทั้งหมด"
                    detail={false}
                />
 
                <CardFilter
                    name="ผู้ใช้งาน"
                    placeholderName=" ชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
                    option1Name="สถานะ"
                    option2Name="โซนที่ดูแล"
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                    option2Key="zonestaff"
                    data={zoneOptions}
                />
                <DataTableCard 
                    data={filteredUsers}
                    onEdit={handleOpenEditModal}
                    onSetting={handleOpenSettingModal}
                />
            </div>

            <Modal 
                title="เพิ่มผู้ใช้งานใหม่" 
                isOpen={isModalOpen}
                onClose={handleCloseModal}>

                <AddZoneStaffForm
                    zones={zoneOptions}
                    onClose={() => {
                    handleCloseModal();
                    userQueries[0].refetch();
                    }} 
                />
            </Modal>

            <Modal
                title="แก้ไขข้อมูลพนักงานโซน"
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
            >
                <EditZoneStaff 
                    userId={selectedUserId} 
                    zones={zoneOptions}
                    onClose={handleCloseEditModal}
                    onSaveSuccess={() => userQueries[0].refetch()}
                />
            </Modal>

            <Modal
                title="ตั้งค่าผู้ใช้งาน"
                isOpen={isSettingModalOpen}
                onClose={handleCloseSettingModal}
            >
                <SetZoneZoneStaff 
                    userId={selectedSettingUserId}
                    onClose={handleCloseSettingModal}
                    onSaveSuccess={() => userQueries[0].refetch()}
                />
            </Modal>


        </>
    );
}

export default ZoneStaffManagement;