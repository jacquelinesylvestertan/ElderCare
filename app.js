// ================================
// ElderCare Web App - app.js
// ================================

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// ================================
// Firebase Configuration
// ================================

const firebaseConfig = {
    apiKey: "AIzaSyD3PyawBl2BszqzvEugHqy0tYg6iXhnzA",

    authDomain: "eldercare-e783b.firebaseapp.com",

    databaseURL:
        "https://eldercare-e783b-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "eldercare-e783b",

    storageBucket:
        "eldercare-e783b.firebasestorage.app",

    messagingSenderId:
        "380812951098",

    appId:
        "1:380812951098:web:a6e2f198023c3bfac87f03"
};


// ================================
// Initialize Firebase
// ================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);


// ================================
// HTML Elements
// ================================

// Connection
const connectionStatusEl =
    document.getElementById("connectionStatus");

const connectionDotEl =
    document.getElementById("connectionDot");


// Fall Detection
const fallStatusEl =
    document.getElementById("fallStatus");

const fallCard =
    document.getElementById("fallCard");


// Heart Rate
const heartRateEl =
    document.getElementById("heartRate");


// SpO2
const spo2El =
    document.getElementById("spo2");


// Finger
const fingerStatusEl =
    document.getElementById("fingerStatus");


// MPU6050
const mpuStatusEl =
    document.getElementById("mpuStatus");


// MAX30102
const max30102StatusEl =
    document.getElementById("max30102Status");


// WiFi
const wifiStatusEl =
    document.getElementById("wifiStatus");

const wifiSsidEl =
    document.getElementById("wifiSSID");


// Timestamp
const timestampEl =
    document.getElementById("timestamp");


// ================================
// Connection Status
// ================================

function setConnection(connected) {

    if (!connectionStatusEl) return;

    if (connected) {

        connectionStatusEl.textContent =
            "Connected";

        if (connectionDotEl) {
            connectionDotEl.classList.add("connected");
            connectionDotEl.classList.remove("disconnected");
        }

    } else {

        connectionStatusEl.textContent =
            "Disconnected";

        if (connectionDotEl) {
            connectionDotEl.classList.add("disconnected");
            connectionDotEl.classList.remove("connected");
        }
    }
}


// ================================
// Update Fall Status
// ================================

function updateFallStatus(data) {

    if (!fallStatusEl || !fallCard) return;


    // IMPORTANT:
    // Only use fallStatus.
    // Do NOT use eventType here.

    const fall =
        data.fallStatus ?? "Unknown";


    fallStatusEl.textContent = fall;


    // Remove old classes

    fallCard.classList.remove(
        "fall-normal",
        "fall-alert"
    );

    fallStatusEl.classList.remove(
        "normal",
        "alert"
    );


    // ================================
    // Fall Detected
    // ================================

    if (fall === "FALL DETECTED") {

        fallCard.classList.add(
            "fall-alert"
        );

        fallStatusEl.classList.add(
            "alert"
        );

    }

    // ================================
    // Normal
    // ================================

    else {

        fallCard.classList.add(
            "fall-normal"
        );

        fallStatusEl.classList.add(
            "normal"
        );
    }
}


// ================================
// Show Current Firebase Data
// ================================

function showCurrentData(data) {

    if (!data) {
        console.log(
            "[Firebase] No current data."
        );
        return;
    }


    console.log(
        "[Firebase] Current data:",
        data
    );


    // ================================
    // Fall
    // ================================

    updateFallStatus(data);


    // ================================
    // Heart Rate
    // ================================

    if (heartRateEl) {

        heartRateEl.textContent =
            data.heartRate ?? "--";
    }


    // ================================
    // SpO2
    // ================================

    if (spo2El) {

        spo2El.textContent =
            data.spo2 ?? "--";
    }


    // ================================
    // Finger Status
    // ================================

    if (fingerStatusEl) {

        fingerStatusEl.textContent =
            data.fingerStatus ?? "--";
    }


    // ================================
    // MPU6050 Status
    // ================================

    if (mpuStatusEl) {

        mpuStatusEl.textContent =
            data.mpuStatus ?? "--";
    }


    // ================================
    // MAX30102 Status
    // ================================

    if (max30102StatusEl) {

        max30102StatusEl.textContent =
            data.max30102Status ?? "--";
    }


    // ================================
    // WiFi Status
    // ================================

    if (wifiStatusEl) {

        wifiStatusEl.textContent =
            data.wifiStatus ?? "--";
    }


    // ================================
    // WiFi SSID
    // ================================

    if (wifiSsidEl) {

        wifiSsidEl.textContent =
            data.wifiSSID ?? "--";
    }


    // ================================
    // Timestamp
    // ================================

    if (timestampEl) {

        timestampEl.textContent =
            data.timestamp ?? "--";
    }
}


// ================================
// Anonymous Login
// ================================

signInAnonymously(auth)
    .then(() => {

        console.log(
            "[Firebase] Anonymous login successful."
        );

    })
    .catch((error) => {

        console.error(
            "[Firebase] Anonymous login failed:",
            error
        );
    });


// ================================
// Authentication State
// ================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "[Firebase] User authenticated:",
                user.uid
            );

        } else {

            console.log(
                "[Firebase] User not authenticated."
            );
        }
    }
);


// ================================
// Listen to Current Data
// ================================

const currentRef =
    ref(db, "ElderCare/current");


onValue(
    currentRef,

    (snapshot) => {

        setConnection(true);

        const data =
            snapshot.val();

        showCurrentData(data);
    },

    (error) => {

        console.error(
            "[Firebase] Database error:",
            error
        );

        setConnection(false);
    }
);