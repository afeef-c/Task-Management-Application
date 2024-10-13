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
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://taskmanager-wfqi.onrender.com/ws/tasks/";
    let socket;

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            // Try to reconnect after some delay if needed
        };

        socket.onclose = (event) => {
            console.log(`WebSocket closed: ${event.code}, reason: ${event.reason}`);
            // Optionally implement reconnection logic here
        };
        
        return socket;

    } catch (error) {
        console.error("Failed to connect WebSocket:", error);
        // Handle connection failure, show UI notification, etc.
    }
};


export default api 