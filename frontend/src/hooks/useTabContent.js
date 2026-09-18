import { useState } from "react";

const useTabContent = (initialKey, contentObj) => {
    const [activeKey, setActiveKey] = useState(initialKey);
    const content = contentObj[activeKey];
    return {activeKey, setActiveKey, content};
};

export default useTabContent;