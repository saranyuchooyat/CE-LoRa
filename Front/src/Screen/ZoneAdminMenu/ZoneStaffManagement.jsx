import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/CardFilter";
import Cardno2 from "../../components/Cardno2";
import Cardno5 from "../../components/Cardno5";
import CardLayouts from "../../components/CardLayouts";
import Modal from "../../components/ModalForm/Modal";
import AddUserForm from "../../components/ModalForm/AddUserForm";

const initialFilters = {
    search: '', // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
    role: 'ทั้งหมด', // สำหรับ Role (option2Name)
    status: 'ทั้งหมด' // สำหรับ Status (option1Name)
};

function UserManagement(){
    
    const location = useLocation();
    // const [filters, setFilters] = useState(initialFilters);
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const handleOpenModal = () => setIsModalOpen(true);
    // const handleCloseModal = () => setIsModalOpen(false);

    //ดึงข้อมูลหลังบ้าน
    const userQueries = useQueries({
        queries: [
        { queryKey: ['zoneStaff'], queryFn: () => api.get(`/zones/${2}/staff`).then(res => res.data) }
        ],
    });

    const isSystemLoading = userQueries.some(query => query.isLoading);
    const isSystemError = userQueries.some(query => query.isError);

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
            // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
            // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);

    const zoneStaffData = userQueries[0].data || [];
    //ดึงข้อมูลหลังบ้าน


    // ระบบ filter
    // const handleFilterChange = (key, value) => {
    //     setFilters(prev => ({
    //         ...prev,
    //         [key]: value
    //     }));
    // };

    // const handleClearFilters = () => {
    //     setFilters(initialFilters);
    // };

    // const filteredUsers = useMemo(() => {
    //     const { search, role, status } = filters;
    //     let data = userQueryResult.data || []; 

    //     // กรองตามช่องค้นหา (Search)
    //     if (search) {
    //         const lowerSearch = search.toLowerCase();
    //         data = data.filter(user => (
    //         //ตรวจสอบ user.username
    //         (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
    //         //ตรวจสอบ email
    //         (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
    //         //ตรวจสอบ phone
    //         (user.phone && String(user.phone).includes(lowerSearch))));
    //     }

    //     // กรองตามบทบาท (Role)
    //     if (role && role !== 'ทั้งหมด') {
    //         data = data.filter(user => user.role === role);
    //     }

    //     // กรองตามสถานะ (Status) - *ต้องเพิ่ม Key 'status' ในข้อมูล user*
    //     // สมมติว่า user มี Key 'status' (Active/Inactive)
    //     if (status && status !== 'ทั้งหมด') {
    //         data = data.filter(user => user.status === status);
    //     }
    //     return data;
    // }, [userQueryResult.data, filters]);
    // ระบบ filter


    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
        
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    console.log("zoneStaff",zoneStaffData)

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการ Zone Staff Smart Healthcare"
                description=""
                onButtonClick="{handleOpenModal}" // ต้องเพิ่ม Prop นี้ใน MenuNameCard
                detail={false}
                buttonText="เพิ่ม Zone Staff ใหม่"/>

                {/* <Cardno2 data=""/> */}

                {/* <CardFilter
                    name="ผู้ใช้งาน"
                    placeholderName=" ชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
                    option1Name="สถานะ"
                    option2Name="บทบาท"
                    // ส่งค่าปัจจุบันและฟังก์ชันควบคุม
                    // filters={filters}
                    onFilterChange="{handleFilterChange}"
                    onClear="{handleClearFilters}"
                    option2Key="role"
                /> */}
                <CardLayouts
                name= "staff" 
                data={zoneStaffData}/> 
            </div>

            {/* <Modal 
                title="เพิ่มผู้ใช้งานใหม่" 
                isOpen={isModalOpen}
                onClose={handleCloseModal}>

                <AddUserForm 
                onClose={handleCloseModal} 
                onSaveSuccess={userQueryResult}/>
            </Modal> */}


        </>
    );
}

export default UserManagement;