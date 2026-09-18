import axios from "axios";
import config from "../config";
import util from "./util";


const axiosInstance = axios.create({
    baseURL:config.apiUrl
});

axiosInstance.interceptors.request.use(
    (config)=>{
        config.headers.Authorization = 'Bearer' + " " + util.getToken();
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response)=> {
        if(typeof response.data === typeof String()){
            return {data:response.data, headers:response.headers};
        }
        return  {...response.data, headers: response.headers};
    },
    (error) => {
        let response = {};
        if(typeof error.response?.data !== 'undefined'){
            response = error.response.data;
            if(!response.message){
                response.message = error.message
            }
            if(response.errors && Array.isArray(response.errors)){
                response.message = response.errors[0].msg;
            }
            
        }else {
            response.message = error.message
        }
        return Promise.reject(response);
    }
);

export default axiosInstance;