import MenuNameCard from "../../components/MenuNameCard";
import FilterCard from "../../components/FilterCard";
import Cardno5 from "../../components/Cardno5";

function ZoneManagement(){
    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการ zone พื้นที่"
                description="ระบบจัดการพื้นที่ใช้งาน Smart Healthcare System"
                buttonText="เพิ่ม Zone"/>
                <FilterCard
                name="Zone"
                placeholderName=" ชื่อ zone, รหัส zone, หรือที่อยู่"
                option1Name="สถานะ"
                option2Name="จังหวัด"/>
                <Cardno5/>
            </div>
        </>
    );
}

export default ZoneManagement;