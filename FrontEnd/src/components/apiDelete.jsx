import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';


const ENDPOINTS = {
    'zone': '/zones',
    'user': '/users',
    'device': '/devices',
    'elder': '/elders',
};

const ApiDelete = (deleteType, onSuccessCallback) => {
    const queryClient = useQueryClient();

    const endpoint = ENDPOINTS[deleteType];

    const mutation = useMutation({
        mutationFn: (idOrIds) => {
            if (!endpoint) {
                return Promise.reject(new Error(`Unknown delete type: ${deleteType}`));
            }

            const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
            
            const deletePromises = ids.map(id => {
                return api.delete(`${endpoint}/${id}`);
            });
            
            return Promise.all(deletePromises);
        },

        onSuccess: (_, variables) => { // '_' คือ data response, variables คือ input (idOrIds)
            console.log(`Successfully deleted ${variables.length || 1} item(s) from ${deleteType}.`);
            
            queryClient.invalidateQueries({ queryKey: [deleteType + 's'] }); 

            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        
    });
    
    return mutation;
};

export default ApiDelete;