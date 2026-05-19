import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';


const ENDPOINTS = {
    'zone': '/zones',
    'user': '/users',
    'device': '/devices',
    'elder': '/elders',
};

// 💡 Custom Hook ที่รับประเภทการลบ (deleteType) และ QueryKey ที่จะ Invalidate
const ApiDelete = (deleteType, onSuccessCallback) => {
    const queryClient = useQueryClient();
    
    // ตรวจสอบว่าประเภทที่ส่งมามีอยู่จริง
    const endpoint = ENDPOINTS[deleteType];

    const mutation = useMutation({
        // 💡 1. mutationFn รับ ID (หรือ Array ของ ID สำหรับ Batch)
        mutationFn: (idOrIds) => {
            if (!endpoint) {
                return Promise.reject(new Error(`Unknown delete type: ${deleteType}`));
            }
            
            // 💡 2. Logic การลบ: ตรวจสอบว่าเป็น Batch หรือ Single Delete
            const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
            
            const deletePromises = ids.map(id => {
                // ส่ง DELETE ไปที่ /zones/123 หรือ /users/456
                return api.delete(`${endpoint}/${id}`);
            });
            
            return Promise.all(deletePromises);
        },
        
        // 💡 3. เมื่อการลบสำเร็จ
        onSuccess: (_, variables) => { // '_' คือ data response, variables คือ input (idOrIds)
            console.log(`Successfully deleted ${variables.length || 1} item(s) from ${deleteType}.`);
            
            // 💡 4. สั่งให้ Query ที่เกี่ยวข้องทั้งหมดรีเฟรชข้อมูล
            // ใช้ queryKey ที่ตรงกับประเภทที่ลบ (เช่น 'zones', 'users')
            queryClient.invalidateQueries({ queryKey: [deleteType + 's'] }); 
            
            // 💡 5. เรียก Callback ที่ส่งมาจาก Component แม่
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        
        // ... (ส่วน onError)
    });
    
    return mutation;
};

export default ApiDelete;