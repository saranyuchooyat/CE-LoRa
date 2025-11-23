import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import Cardno2 from "../../components/Card/Cardno2";
import CardFilter from "../../components/Card/CardFilter";
import Cardno5 from "../../components/Card/Cardno5";
import Modal from "../../components/ModalForm/Modal";
import AddUserForm from "../../components/ModalForm/AddUserForm";

//กำหนดตัวแปรแต่ละช่อง Filter
const initialFilters = {
  search: "", // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
  province: "ทั้งหมด", // สำหรับ Role (option2Name)
  status: "ทั้งหมด", // สำหรับ Status (option1Name)
};
//กำหนดตัวแปรแต่ละช่อง Filter

function UserManagement(){
    
    const location = useLocation();

    const [filters, setFilters] = useState(initialFilters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    //ดึงข้อมูลหลังบ้าน
    const userQueries = useQueries({
        queries: [
        { queryKey: ['users'], queryFn: () => api.get('/users').then(res => res.data) },
        ],
    });

    const isSystemLoading = userQueries.some(query => query.isLoading);
    const isSystemError = userQueries.some(query => query.isError);

    const userData = userQueries[0].data || [];

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
            // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
            // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน


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
        let data = userData; 

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

        // กรองตามบทบาท (Role)
        if (role && role !== 'ทั้งหมด') {
            data = data.filter(user => user.role === role);
        }

        if (status && status !== 'ทั้งหมด') {
            data = data.filter((zone) => zone.status === status);
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
                buttonText="เพิ่มผู้ใช้งานใหม่"/>

                <Cardno2 data={staffData}/>

                <CardFilter
                    name="ผู้ใช้งาน"
                    placeholderName=" ชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
                    option1Name="สถานะ"
                    option2Name="บทบาท"
                    // ส่งค่าปัจจุบันและฟังก์ชันควบคุม
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                    option2Key="role"
                />
                <Cardno5 data={filteredUsers}/> 
            </div>

            <Modal 
                title="เพิ่มผู้ใช้งานใหม่" 
                isOpen={isModalOpen}
                onClose={handleCloseModal}>

                <AddUserForm 
                onClose={handleCloseModal} 
                onSaveSuccess={userData}/>
            </Modal>


        </>
    );
}

export default UserManagement;