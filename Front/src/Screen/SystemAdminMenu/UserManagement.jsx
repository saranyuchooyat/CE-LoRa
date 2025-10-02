import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import FilterCard from "../../components/FilterCard";
import Cardno2 from "../../components/Cardno2";
import Cardno5 from "../../components/Cardno5";
import Modal from "../../components/ModalForm/Modal";
import AddUserForm from "../../components/ModalForm/AddUserForm";
import axios from "axios";

const initialFilters = {
    search: '', // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
    role: 'ทั้งหมด', // สำหรับ Role (option2Name)
    status: 'ทั้งหมด' // สำหรับ Status (option1Name)
};


function UserManagement(){

    const location = useLocation();
    const [userData, setUserData] = useState([]);

    const [filters, setFilters] = useState(initialFilters);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        // 1. ตรวจสอบว่า Token พร้อมใน LocalStorage แล้ว
        const tokenInStorage = localStorage.getItem('token');
        const tokenInState = location.state?.token;

        if (!tokenInStorage && !tokenInState) {
            console.error("No authentication context found. Please log in.");
            setLoading(false);
            return;
        }

        // 2. ถ้ามี Token ใน Storage แล้ว (ไม่ว่าจะมาจาก state หรือ Refresh) ให้เริ่มดึงข้อมูล
        try {
            setLoading(true);
            
            const [userRes] = await Promise.all([
                api.get('/users'),
            ]);
            setUserData(userRes.data);

        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');

        // สำคัญ: บันทึก Token จาก State ลง Storage ถ้าเพิ่งมาจากหน้า Login
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
             // 💡 เมื่อบันทึกเสร็จแล้ว ไม่ต้องเรียก fetchZoneData ที่นี่
             // เราจะให้ Component โหลดซ้ำด้วย dependency (location.state) แล้วค่อยเรียก
        }

        // 💡 เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อ Component ถูกโหลด หรือเมื่อมีการอัปเดต Token
        fetchUserData(); 
        
    }, [location.state]);
    // ดึงข้อมูลจากหลังบ้าน


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
                // 💡 FIX 1: ตรวจสอบ user.username ก่อนเรียก .toLowerCase()
            (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
                // ส่วนนี้ดีอยู่แล้ว: ตรวจสอบ email
            (user.email && user.email.toLowerCase().includes(lowerSearch)) ||

                // ส่วนนี้ควรตรวจสอบ phone ด้วย หาก phone เป็น string
                // (user.phone && user.phone.includes(lowerSearch))
                // หาก user.phone เป็นตัวเลขและคุณแน่ใจว่ามันจะไม่ใช่ undefined/null ก็ใช้ได้
            (user.phone && String(user.phone).includes(lowerSearch))));
        }

        // กรองตามบทบาท (Role)
        if (role && role !== 'ทั้งหมด') {
            data = data.filter(user => user.role === role);
        }

        // กรองตามสถานะ (Status) - *ต้องเพิ่ม Key 'status' ในข้อมูล user*
        // สมมติว่า user มี Key 'status' (Active/Inactive)
        if (status && status !== 'ทั้งหมด') {
            data = data.filter(user => user.status === status);
        }

        return data;
    }, [userData, filters]);
    // ระบบ filter

    // ระบบกรองจำวน Role
        const roleCountsObject = userData.reduce((acc, user) => {
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

    const totalStaffObjects= {name:"จำนวนทั้งหมด", value:userData.length}

    const staffData=[
        totalStaffObjects,
        ...staffDataList
    ]

    // ระบบกรองจำวน Role
    
    if (loading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
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

                <FilterCard
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
                onSaveSuccess={fetchUserData}/>
            </Modal>


        </>
    );
}

export default UserManagement;