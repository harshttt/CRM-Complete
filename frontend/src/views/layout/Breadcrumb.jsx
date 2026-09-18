import { Breadcrumb } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import routes from "./route";

const newRoutes = [];
function convertMultiToSingle(arr, prevBaseUrl = '') {
    arr.forEach(v => {
        if (v.children) {
            convertMultiToSingle(v.children, prevBaseUrl + v.url);
        }
        newRoutes.push({ title: v.title, url: prevBaseUrl + v.url })
    })
}
convertMultiToSingle([...routes]);

export default function MyBreadcrumb() {
    const location = useLocation().pathname;
    const [breads, setBreads] = useState([]);
    useEffect(() => {
        const paths = [];
        location.split('/')?.reduce((prev, cur) => {
            paths.push(prev + '/' + cur);
            return prev + '/' + cur;
        });
        setBreads(newRoutes.filter(v => paths.includes(v.url)).reverse());
    }, [location]);

    return (
        <Breadcrumb separator="">
            {
                breads?.map((v, i) => {
                    if (i === breads.length - 1) {
                        return <Breadcrumb.Item key={v.url}>{v.title}</Breadcrumb.Item>
                    } else {
                        return <React.Fragment key={v.url}>
                            <Breadcrumb.Item><Link to={v.url + '/'}>{v.title}</Link></Breadcrumb.Item>
                            <Breadcrumb.Separator>/</Breadcrumb.Separator>
                        </React.Fragment>
                    }
                })
            }
        </Breadcrumb>
    )
};
