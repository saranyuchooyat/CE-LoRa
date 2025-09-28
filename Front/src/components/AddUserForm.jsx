import { useState } from "react";

function AddUserForm({ onClose, onSaveSuccess }){

    const [role, setRole]= useState("เลือกบทบาท")
    const [openRole, setOpenRole] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // ... State ข้อมูลฟอร์ม

    // ระบบเลือก Role
    const selectRole = (role) =>{
        setRole(role);
        setOpenRole(false);
    };
    // ระบบเลือก Role
    
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);
        // ... API Logic ...
        // onSaveSuccess(); 
        // onClose();
        // ... finally { setIsSubmitting(false); }
    };
    
    return (
        // 💡 <form> ต้องคลุมทุกอย่าง รวมถึงปุ่มด้วย
                <form onSubmit={handleSubmit}> 
                    <div className="grid grid-cols-2 justify-center items-center gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700">ชื่อ</label>
                            <input type="text" className="border rounded w-full p-2 bg-white" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">นามสกุล</label>
                            <input type="text" className="border rounded w-full p-2 bg-white" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">อีเมลล์</label>
                            <input type="text" className="border rounded w-full p-2 bg-white" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">เบอร์โทรศัพท์</label>
                            <input type="text" className="border rounded w-full p-2 bg-white" />
                        </div>

                        <div className="relative mr-3">
                            <p className="block text-gray-700">เลือกบทบาท</p>
                            <button className="border rounded w-full p-2 bg-white text-start" onClick={() => setOpenRole((prev) => !prev)} type="button">{role}</button>
                             {openRole &&
                             <div className="dropdown-menu border rounded ">
                                <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectRole("System Admin")}>System Admin</div>
                                <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectRole("Zone Admin")}>Zone Admin</div>
                                <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectRole("Zone Staff")}>Zone staff</div>
                            </div>}
                        </div>
                    </div>

                    {/* Footer (ปุ่ม Save/Cancel)*/}
                    <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                        <button 
                            type="submit" 
                            className="bg-complete-bg text-main-blue px-4 py-2 rounded-lg hover:bg-main-blue hover:text-white cursor-pointer"
                            disabled={isSubmitting} // ป้องกันการกดซ้ำขณะโหลด
                        >
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
    

                        <button 
                            type="button" // ต้องระบุ type="button" เพื่อไม่ให้เป็น submit
                            onClick={onClose} 
                            className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 hover:text-white cursor-pointer"
                            disabled={isSubmitting} // ป้องกันการกดปิดขณะส่งข้อมูล
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
    );
}

export default AddUserForm;