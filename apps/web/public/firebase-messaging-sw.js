
/* public/firebase-messaging-sw.js */

importScripts(
    "https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyD65_izGzbYzHYS0M5JToW6UXSHZzXmij0",
    authDomain: "gatepass-6de69.firebaseapp.com",
    projectId: "gatepass-6de69",
    storageBucket: "gatepass-6de69.firebasestorage.app",
    messagingSenderId: "219028321892",
    appId: "1:219028321892:web:ee7d2ec5b5b9480f269171"
};


firebase.initializeApp(firebaseConfig);

firebase.messaging();
