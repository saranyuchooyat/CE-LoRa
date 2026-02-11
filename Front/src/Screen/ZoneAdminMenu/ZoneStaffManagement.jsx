import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import MenuNameCard2 from '../../components/MainCardOption/MenuNameCard2';
import Cardno2 from "../../components/Card/Cardno2";
import CardFilter from "../../components/Card/CardFilter";
import Cardno5 from "../../components/Card/Cardno5";
import Modal from "../../components/ModalForm/Modal";
import EditUserForm from "../../components/ModalForm/EditUserForm";
import AddZoneStaffForm from "../../components/ModalForm/AddZoneStaff";

//กำหนดตัวแปรแต่ละช่อง Filter
const initialFilters = {
  search: "", // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
  role: "ทั้งหมด", // สำหรับ Role (option2Name)
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
        label: zone.zonename, // ใช้ชื่อ 'label' เพื่อให้ง่ายต่อการนำไปใส่ Dropdown
        value: zone.zoneid    // ใช้ชื่อ 'value' สำหรับค่าที่จะส่งไป API
    }));
    }, [zoneData]);

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    // ฟังก์ชันเปิด Modal แก้ไข
    const handleOpenEditModal = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setSelectedUserId(null);
        setIsEditModalOpen(false);
    };


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
        const { search, role, status } = filters;
        let data = zonestaffData; 

        // กรองตามช่องค้นหา (Search)
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(user => (
            //ตรวจสอบ user.username
            (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
            //ตรวจสอบ email
            (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
            //ตรวจสอบ phone
            (user.phone && String(user.phone).includes(lowerSearch))));
        }

        if (role && role !== "ทั้งหมด") {
            data = data.filter((user) => user.role === role);
        }

        if (status && status !== 'ทั้งหมด') {
            data = data.filter((user) => user.status === status);
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

                {/* <Cardno2 data={staffData}/> */}
                <MenuNameCard2
                    title={zonestaffData.length}
                    description=" จำนวน Zone Staff ทั้งหมด"
                    detail={false}
                />

                <CardFilter
                    name="ผู้ใช้งาน"
                    placeholderName=" ชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
                    option1Name="สถานะ"
                    option2Name="บทบาท"
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                    option2Key="role"
                />
                <Cardno5 
                    data={filteredUsers}
                    onEdit={handleOpenEditModal}
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
            title="แก้ไขข้อมูลผู้ใช้งาน"
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            >
                <EditUserForm 
                    userId={selectedUserId} 
                    onClose={handleCloseEditModal}
                    onSaveSuccess={() => userQueries[0].refetch()}
                />
            </Modal>


        </>
    );
}

export default ZoneStaffManagement;