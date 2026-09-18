import axiosInstance from "../utils/axios";

export default class service {
    static baseURL = 'file';

    static get(url){
        return axiosInstance.get('../' + url);
    }

    static save(data, config){
        return axiosInstance.post(this.baseURL+'/save',data, config);
    }

    static remove(data){
        return axiosInstance.post(this.baseURL + '/remove', data);
    }

}