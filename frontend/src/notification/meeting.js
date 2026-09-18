import { Button, notification, Space } from 'antd';
import React from 'react';
// import employeeService from '../services/employee';
import commonObj from '../commonObj';

export function meetingRequestRejected(data) {
    const key = data.extra._id;
    notification.open({
        message: data.message,
        description: data.description,
        key,
        duration: 0,
        type: 'error'
    });

    if(commonObj.employeeCheckMeeting){ commonObj.employeeCheckMeeting(); }
};


export function meetingRequestCanceled(data) {
    const key = data.extra._id;
    notification.close(key);
    notification.open({
        message: data.message,
        description: data.description,
        key,
        duration: 0,
        type: 'error'
    });
};

export function meetingRequestStarted(data) {
    const key = data.extra._id;
    notification.open({
        message: data.message,
        description: data.description,
        key,
        type: 'success'
    });
    if(commonObj.employeeCheckMeeting){ commonObj.employeeCheckMeeting(); }
};