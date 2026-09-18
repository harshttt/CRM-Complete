import { io } from 'socket.io-client';
import util from '../utils/util';
import { meetingRequest, meetingRequestRejected, meetingRequestCanceled, meetingRequestStarted } from './meeting';
import config from '../config';

const socket = io.connect(config.apiBaseurl, {
    auth: (cb) => {
        cb({
            token: 'Bearer ' + util.getToken()
        });
    }
});

socket.on("request-meeting", (data) => {
    meetingRequest(data);
});

socket.on("reject-meeting-request", (data) => {
    meetingRequestRejected(data);
});

socket.on("cancel-meeting-request", (data) => {
    meetingRequestCanceled(data);
});

socket.on("meeting-request-started", (data) => {
    meetingRequestStarted(data);
});