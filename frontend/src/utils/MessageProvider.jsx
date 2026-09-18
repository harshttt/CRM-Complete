import { message } from "antd";

let messageApiGlobal = null;

export const getMessageApi = () => messageApiGlobal;

export const MessageProvider = ({children}) => {
    const [messageApi, contextHolder] = message.useMessage();
    messageApiGlobal = messageApi;

    return (
        <>
          {contextHolder}
          {children}
        </>
    )

};


