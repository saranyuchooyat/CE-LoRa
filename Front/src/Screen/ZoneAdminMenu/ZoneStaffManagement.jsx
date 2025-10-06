import { useState, useEffect, useMemo } from "react"; 
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/CardFilter";
import Cardno2 from "../../components/Cardno2";
import CardLayouts from "../../components/CardLayouts";
import Modal from "../../components/ModalForm/Modal";
import AddUserForm from "../../components/ModalForm/AddUserForm";

const initialFilters = {
    search: '', // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
    role: 'ทั้งหมด', // สำหรับ Role (option2Name)
    status: 'ทั้งหมด' // สำหรับ Status (option1Name)
};


function ZoneStaffManagement(){

    const [userData, setUserData] = useState([]);

    const [filters, setFilters] = useState(initialFilters);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const [loading, setLoading] = useState(true);

    //ดึงข้อมูลหลังบ้าน
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
            
            // 💡 ถ้าคุณใช้ Promise.all ให้ใช้ตามนี้ (เพื่อความรวดเร็ว)
            const [userRes] = await Promise.all([
                api.get('/zones/my-zones'),
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
        fetchZoneData(); 
        
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

    const totalStaffObjects= {name:"zone id", value:"zone name"}

    const staffData=[
        totalStaffObjects,
        staffDataList[2]
    ]

    // ระบบกรองจำวน Role
    
    if (loading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการ Zone Staff Smart Healthcare"
                description=""
                onButtonClick={handleOpenModal} // ต้องเพิ่ม Prop นี้ใน MenuNameCard
                detail={false}
                buttonText="เพิ่ม Zone Staff ใหม่"/>

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
                <CardLayouts data="staff"/>
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

export default ZoneStaffManagement;