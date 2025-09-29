// ModalComponent จะรับ children (เนื้อหาข้างใน) และ onClose (ฟังก์ชันปิดตัวเอง)
function Modal({ title, isOpen, onClose, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        // Overlay (พื้นหลังสีทึบ)
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            {/* Modal Box */}
            <div className="bg-main-card p-6 rounded-lg shadow-xl w-full max-w-lg mx-4">
                
                {/* Header ส่วนหัว */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button 
                        className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
                        onClick={onClose}>
                        &times; {/* สัญลักษณ์ 'x' */}
                    </button>
                </div>

                {/* Body ส่วนเนื้อหา */}
                <div className="modal-body">
                    {children}
                </div>               
            </div>
        </div>
    );
}

export default Modal;