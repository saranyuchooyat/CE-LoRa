import J3 from '../../assets/picture/J3-Smartwatch.png';
import { Link, useNavigate } from 'react-router-dom';
import ApiDelete from '../API-Delete';


function DeviceCard({data}) {

    console.log("device",data)
    const navigate = useNavigate();

    const handleRowClick = (deviceId) => {
        navigate(`/deivce-details/${deviceId}`); 
    };

    // Delete Button
    const { mutate: deleteDevice, isPending } = ApiDelete('device'); 

    const handleDeleteClick = (deviceId, event) => {
        event.stopPropagation(); 
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Device ID: ${deviceId}?`)) {
            deleteDevice(deviceId); 
        }
    };
    // Delete Button

    return(
        <>
            {data.map((card, index) =>{

                return(
                    <button key={index} className="flex flex-col items-center bg-test-color border-l-0 border-y-5 border-main-green rounded-[15px] gap-4 p-3 drop-shadow-lg hover:bg-main-card/30 cursor-pointer transition-colors duration-150" onClick={() => handleRowClick(card.device_id)}>
                        
                        <div className="bg-main-green font-semibold text-white rounded-full py-1 px-10 w-fit">
                            <p>{card.status}</p>
                        </div>

                        <div className="grid grid-cols-2 text-start gap-4 w-full">

                            <div className='text-start'>
                                <img src={J3} alt="J3-ismarch"/>
                                <div>
                                    <p className='text-gray-400'>ประเภท</p>
                                    <p>{card.type}</p>
                                </div>

                            </div>

                            <div className='flex flex-col justify-between'>

                                <div className=''>
                                    <p className='text-gray-400'>รหัสอุปกรณ์</p>
                                    <p>{card.device_id}</p>
                                </div>

                                <div className=''>
                                    <p className='text-gray-400'>ผู้ใช้งาน</p>
                                    <p>{card.assigned_to}</p>
                                </div>

                                <div className=''>
                                    <p className='text-gray-400'>รุ่นอุปกรณ์</p>
                                    <p>{card.model}</p>
                                </div>

                            </div>
                            
                            <div className=''>
                                <p className='text-gray-400'>แบตเตอรี่</p>
                                <p>{card.battery}%</p>
                            </div>

                            <div className=''>
                                <p className='text-gray-400'>อัพเดตล่าสุด</p>
                                <p>{card.last_update}</p>
                            </div>

                        </div>

                        <div className='text-start w-full'>
                            <p className='text-gray-400'>เซนเซอร์/ฟีเจอร์</p>
                            <div className='flex gap-2 w-full'>
                                {card.features.map((data,index)=>{
                                    return(
                                        <div key={index} className='bg-main-green font-xs text-white rounded-lg px-2 w-fit'>{data}</div>

                                    );
                                })}
                            </div>
                        </div>

                        <div className='flex w-full gap-4'>
                            <button className="table-btn hover:bg-main-yellow hover:text-white">Edit</button>
                            <button className="table-btn hover:bg-green-500 hover:text-white">Setting</button>
                            <button className="table-btn hover:bg-main-red hover:text-white"
                                    onClick={(event) => handleDeleteClick(card.device_id, event)}
                                    disabled={isPending} >{isPending ? 'ลบ...' : 'Delete'}</button>
                        </div>

                    </button>
                );
            })}
        </>
    );
}

export default DeviceCard;