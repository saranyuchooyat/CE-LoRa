function MenuNameCard({
  title,
  description,
  buttonText,
  onButtonClick,
  detail,
  children,
}) {
  const componentCheck = () => {
    return (
      <div className="flex items-center gap-4 mr-3">
        {children}
        {/* 💡 เพิ่ม Container เพื่อจัดกลุ่มปุ่มและ Banner */}
        {/* 1. ตรวจสอบและแสดง Banner ถ้ามีข้อมูล detail */}
        {detail !== false && (
          <div className="w-fit p-2 bg-gray-200 rounded-lg">
            {buttonText} {detail}
          </div>
        )}
        {/* 2. ตรวจสอบและแสดงปุ่มเพิ่ม ถ้ามีฟังก์ชัน onButtonClick */}
        {onButtonClick && (
          <button className="add-btn" onClick={onButtonClick}>
             {`+ เพิ่ม${buttonText}ใหม่`}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="card flex justify-between items-center py-5">
        <div className="ml-3">
          <h1 className="text-3xl font-extrabold text-start py-1">{title}</h1>
          <p className="text-gray-800 text-start">{description}</p>
        </div>
        {componentCheck()}
      </div>
    </>
  );
}

export default MenuNameCard;
