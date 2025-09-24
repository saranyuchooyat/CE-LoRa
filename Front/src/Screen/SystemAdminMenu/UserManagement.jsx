import MenuNameCard from "../../components/MenuNameCard";
import FilterCard from "../../components/FilterCard";
import Cardno2 from "../../components/Cardno2";
import Cardno5 from "../../components/Cardno5";


function UserManagement(){

    const UserData = 
    [
        {value:"156",name:"จำนวนผู้ใช้งานทั้งหมด"},
        {value:"8",name:"System Admin"},
        {value:"24",name:"Zone Admin"},
        {value:"124",name:"Zone Staff"},
    ]

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการผู้ใช้งาน"
                description="ระบบจัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง"
                buttonText="เพิ่มผู้ใช้งานใหม่"/>
                <Cardno2 data={UserData}/>
                <FilterCard
                name="ผู้ใช้งาน"
                placeholderName=" ชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
                option1Name="สถานะ"
                option2Name="บทบาท"/>
                <Cardno5/>
            </div>
        </>
    );
}

export default UserManagement;