
/* global self */
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCLI1NT5uWMEfoj8wtchkUOQzSNqqCsS2A",
  authDomain: "next-hike-crm.firebaseapp.com",
  projectId: "next-hike-crm",
  messagingSenderId: "15362362100",
  appId: "1:15362362100:web:59b5f91aac70566f02aca1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});
