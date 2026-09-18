import {createContext, useState, useEffect, useContext} from "react";
import axios from "../../utils/axios";
import {message} from 'antd';

const ConstantContext = createContext();

export const useConstants = () => useContext(ConstantContext);

export function ConstantProvider({children}){
    const [constants, setConstants] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        fetchConstants();
    });

    const fetchConstants = async () => {
        try {
            const res = await axios.get('/constants');
            setConstants(res.data);
        } catch (error) {
            message.error('Failed to load constants');
        }finally{
            setLoading(false);
        }
    };

    return (
        <ConstantContext.Provider value={{constants, loading, refetch:fetchConstants}}>
            {children}
        </ConstantContext.Provider>

    )
}