import { create } from "zustand";

const useNotificationStore = create((set) => ({
    notifications:[],
    unreadCount:0,

    addNotification:(notification) => {
        set(state => ({
            notifications:[notification, ...state.notifications].slice(0, 50),
            unreadCount:state.unreadCount + 1
        }));

    },
    markAllRead:() => {
       set(state => ({
         unreadCount:0,
         notifications:state?.notifications?.map(n => ({
            ...n,
            read:true
         })),
       }));
    }
}));

export default useNotificationStore;