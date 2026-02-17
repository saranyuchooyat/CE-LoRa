// MenuNameCard.jsx
import Addbutton from "./AddButton";
import Banner from "./Banner";

function MenuNameCard({ title, description, buttonText, onButtonClick, detail }) {
    
    const componentCheck = () => {
        return (
            <div className="flex items-center gap-4 mr-3"> {/* 💡 เพิ่ม Container เพื่อจัดกลุ่มปุ่มและ Banner */}
                
                {/* 1. ตรวจสอบและแสดง Banner ถ้ามีข้อมูล detail */}
                {detail !== false && (
                    <Banner text={buttonText} detail={detail} />
                )}

                {/* 2. ตรวจสอบและแสดงปุ่มเพิ่ม ถ้ามีฟังก์ชัน onButtonClick */}
                {onButtonClick && (
                    <Addbutton buttonText={`เพิ่ม${buttonText}ใหม่`} onButtonClick={onButtonClick} />
                )}
                
            </div>
        );
    };

    return (
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <p className="text-[22px] font-bold text-start">{title}</p>
                    <p>{description}</p>
                </div>
                {componentCheck()}
            </div>
        </>
    );
}

export default MenuNameCard;