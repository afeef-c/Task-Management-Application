import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token){
            config.headers.Authorization = `Bearer ${token}` 
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

export const connectWebSocket = () => {
    const socket = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/tasks/");
    return socket;
};


export default api 