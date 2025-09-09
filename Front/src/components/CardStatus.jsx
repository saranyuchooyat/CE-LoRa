function CardStatus(){
    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <p className="text-[22px] font-bold text-start">จัดการ Zone พื้นที่</p>
                    <p>ระบบจัดการพื้นที่ใช้งาน Smart Healthcare System</p>
                </div>
                <button className="add-btn">เพิ่ม Zone</button>
            </div>
        </>
    )
}

export default CardStatus;