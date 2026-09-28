
// ================================
// Firebase
// ================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    set,
    push,
    remove,
    get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// ================================
// Firebase Configuration
// ================================
const firebaseConfig = {
    apiKey: "AIzaSyApIoRHGu714Fv4GLC4remucT-StXMXWjE",
    authDomain: "eldercare-de234.firebaseapp.com",
    databaseURL: "https://eldercare-de234-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "eldercare-de234",
    storageBucket: "eldercare-de234.firebasestorage.app",
    messagingSenderId: "162372032696",
    appId: "1:162372032696:web:6540a4ef34626542d37c4d",
    measurementId: "G-MSDHSNF15W"
};

// ================================
// Pushover Configuration
// ================================

const pushoverToken =
    "ap2ikydru3uipbg45mxt8bpcm5q7hw";

const pushoverUser =
    "uvh1sa841kaxp1qimyohavgid1ocie";


// ================================
// Initialize Firebase
// ================================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ================================
// Firebase References
// ================================
const currentRef = ref(db, "ElderCare/current");
const historyRef = ref(db, "ElderCare/history");

// ================================
// Pushover Fall Notification
// ================================

let pushoverFallSent = false;
let pushoverFallSending = false;
let pushoverRetryCount = 0;
const maxPushoverRetries = 3;
const pushoverRetryDelay = 5000;


// ================================
// DOM Elements
// ================================

// Connection
const connectionDot =
    document.getElementById("connectionDot");

const connectionText =
    document.getElementById("connectionText");


// Current Health
const heartRate =
    document.getElementById("heartRate");

const spo2 =
    document.getElementById("spo2");

const fallCard =
    document.getElementById("fallCard");

const fallStatus =
    document.getElementById("fallStatus");

const lastUpdated =
    document.getElementById("lastUpdated");


// Device Status
const wifiStatus =
    document.getElementById("wifiStatus");

const mpuStatus =
    document.getElementById("mpuStatus");

const max30102Status =
    document.getElementById("max30102Status");

const fingerStatus =
    document.getElementById("fingerStatus");


// History
const historyList =
    document.getElementById("historyList");

const refreshBtn =
    document.getElementById("refreshBtn");


// Caretaker
const caretakerPhone =
    document.getElementById("caretakerPhone");

const saveCaretakerBtn =
    document.getElementById("saveCaretakerBtn");

const caretakerMessage =
    document.getElementById("caretakerMessage");


// Medication
const medicineName =
    document.getElementById("medicineName");

const medicineTime =
    document.getElementById("medicineTime");

const addReminderBtn =
    document.getElementById("addReminderBtn");

const reminderMessage =
    document.getElementById("reminderMessage");

const reminderList =
    document.getElementById("reminderList");


// ================================
// Helper
// ================================
function safeValue(value, defaultValue = "--") {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return defaultValue;
    }

    return value;
}

// ==================================================
// PUSHOVER NOTIFICATION
// ==================================================

async function sendPushover(
    title,
    message
) {

    const url =
        "https://api.pushover.net/1/messages.json";


    const formData =
        new URLSearchParams();


    formData.append(
        "token",
        pushoverToken
    );

    formData.append(
        "user",
        pushoverUser
    );

    formData.append(
        "title",
        title
    );

    formData.append(
        "message",
        message
    );


    try {

        const response =
            await fetch(
                url,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body:
                        formData.toString()
                }
            );


        const result =
            await response.json();


        console.log(
            "Pushover Response:",
            result
        );


        if (
            result.status === 1
        ) {

            console.log(
                "Pushover notification sent successfully."
            );

            return true;

        } else {

            console.error(
                "Pushover notification failed:",
                result
            );

            return false;
        }


    } catch (error) {

        console.error(
            "Pushover error:",
            error
        );

        return false;
    }
}

// ==================================================
// PUSHOVER FALL NOTIFICATION WITH RETRY
// ==================================================

async function sendFallPushoverWithRetry() {

    if (pushoverFallSent) {
        return;
    }


    if (
        pushoverRetryCount >=
        maxPushoverRetries
    ) {

        console.error(
            "❌ Pushover: Maximum retry attempts reached."
        );

        pushoverFallSending = false;

        return;
    }


    pushoverRetryCount++;


    console.log(
        "Pushover attempt " +
        pushoverRetryCount +
        "/" +
        maxPushoverRetries
    );


    const success =
        await sendPushover(
            "🚨 ElderCare Fall Alert",
            "FALL DETECTED! Please check the elderly person immediately."
        );


    if (success) {

        pushoverFallSent = true;

        pushoverFallSending = false;

        console.log(
            "✅ Pushover notification sent successfully."
        );

        return;
    }


    console.error(
        "❌ Pushover attempt " +
        pushoverRetryCount +
        " failed."
    );


    if (
        pushoverRetryCount <
        maxPushoverRetries
    ) {

        console.log(
            "Retrying Pushover in 5 seconds..."
        );


        setTimeout(
            () => {

                sendFallPushoverWithRetry();

            },
            pushoverRetryDelay
        );

    } else {

        console.error(
            "❌ Pushover failed after maximum attempts."
        );

        pushoverFallSending = false;
    }
}

// ==================================================
// FIREBASE CONNECTION STATUS
// ==================================================

// IMPORTANT:
// Use .info/connected to check the REAL Firebase
// Realtime Database connection.

const connectedRef =
    ref(db, ".info/connected");


onValue(
    connectedRef,
    (snapshot) => {

        const connected =
            snapshot.val();


        if (connected === true) {

            if (connectionDot) {

                connectionDot.classList.remove(
                    "offline"
                );

                connectionDot.classList.add(
                    "connected"
                );
            }


            if (connectionText) {

                connectionText.textContent =
                    "Connected";
            }


            console.log(
                "Firebase: Connected"
            );

        } else {

            if (connectionDot) {

                connectionDot.classList.remove(
                    "connected"
                );

                connectionDot.classList.add(
                    "offline"
                );
            }


            if (connectionText) {

                connectionText.textContent =
                    "Disconnected";
            }


            console.log(
                "Firebase: Disconnected"
            );
        }
    },

    (error) => {

        console.error(
            "Firebase connection error:",
            error
        );


        if (connectionDot) {

            connectionDot.classList.remove(
                "connected"
            );

            connectionDot.classList.add(
                "offline"
            );
        }


        if (connectionText) {

            connectionText.textContent =
                "Disconnected";
        }
    }
);


// ==================================================
// CURRENT HEALTH DATA
// ==================================================

onValue(
    currentRef,
    (snapshot) => {

        const data =
            snapshot.val();


        if (!data) {

            console.log(
                "No current data."
            );

            return;
        }


        console.log(
            "Current Firebase data:",
            data
        );


        // ------------------------------------------
        // Heart Rate
        // ------------------------------------------

        if (heartRate) {

            const hr =
                safeValue(
                    data.heartRate
                );


            if (hr === "--") {

                heartRate.textContent =
                    "--";

            } else {

                heartRate.textContent =
                    hr + " BPM";
            }
        }


        // ------------------------------------------
        // SpO2
        // ------------------------------------------

        if (spo2) {

            const oxygen =
                safeValue(
                    data.spo2
                );


            if (oxygen === "--") {

                spo2.textContent =
                    "--";

            } else {

                spo2.textContent =
                    oxygen + " %";
            }
        }


        // ------------------------------------------
        // Fall Status
        // ------------------------------------------

        if (fallStatus) {

            const status =
                safeValue(
                    data.fallStatus,
                    "NORMAL"
                );


            fallStatus.textContent =
                status;


            // if (
            //     status === "FALL DETECTED"
            // ) {

            //     if (fallCard) {

            //         fallCard.classList.add(
            //             "danger"
            //         );
            //     }

            // } else {

            //     if (fallCard) {

            //         fallCard.classList.remove(
            //             "danger"
            //         );
            //     }
            // }
            // ==========================================
            // PUSHOVER FALL NOTIFICATION
            // ==========================================

            if (
                status === "FALL DETECTED"
            ) {

                if (fallCard) {

                    fallCard.classList.add(
                        "danger"
                    );
                }


                // ==========================================
                // PUSHOVER FALL NOTIFICATION WITH RETRY
                // ==========================================

                if (
                    !pushoverFallSent &&
                    !pushoverFallSending
                ) {

                    pushoverFallSending = true;

                    pushoverRetryCount = 0;

                    console.log(
                        "🚨 Fall detected. Starting Pushover notification..."
                    );


                    sendFallPushoverWithRetry();
                }


            } else {

                if (fallCard) {

                    fallCard.classList.remove(
                        "danger"
                    );
                }


                // ==========================================
                // RESET PUSHOVER
                // ==========================================

                pushoverFallSent = false;

                pushoverFallSending = false;

                pushoverRetryCount = 0;
            }
        }


        // ------------------------------------------
        // WiFi Status
        // ------------------------------------------

        if (wifiStatus) {

            wifiStatus.textContent =
                safeValue(
                    data.wifiStatus,
                    "Unknown"
                );
        }


        // ------------------------------------------
        // MPU6050 Status
        // ------------------------------------------

        if (mpuStatus) {

            mpuStatus.textContent =
                safeValue(
                    data.mpuStatus,
                    "Unknown"
                );
        }


        // ------------------------------------------
        // MAX30102 Status
        // ------------------------------------------

        if (max30102Status) {

            max30102Status.textContent =
                safeValue(
                    data.max30102Status,
                    "Unknown"
                );
        }


        // ------------------------------------------
        // Finger Status
        // ------------------------------------------

        if (fingerStatus) {

            fingerStatus.textContent =
                safeValue(
                    data.fingerStatus,
                    "--"
                );
        }


        // ------------------------------------------
        // Last Updated
        // ------------------------------------------

        if (lastUpdated) {

            if (data.timestamp) {

                lastUpdated.textContent =
                    data.timestamp;

            } else {

                lastUpdated.textContent =
                    new Date().toLocaleString();
            }
        }
    },

    (error) => {

        console.error(
            "Error reading current data:",
            error
        );
    }
);


// ==================================================
// CARETAKER PHONE
// ==================================================

const caretakerRef =
    ref(
        db,
        "ElderCare/settings/caretakerPhone"
    );


// ------------------------------------------
// Load caretaker phone
// ------------------------------------------

onValue(
    caretakerRef,
    (snapshot) => {

        const phone =
            snapshot.val();


        if (
            phone !== null &&
            phone !== undefined
        ) {

            if (caretakerPhone) {

                caretakerPhone.value =
                    phone;
            }
        }
    },

    (error) => {

        console.error(
            "Error loading caretaker phone:",
            error
        );
    }
);


// ------------------------------------------
// Save caretaker phone
// ------------------------------------------

if (saveCaretakerBtn) {

    saveCaretakerBtn.addEventListener(
        "click",
        async () => {

            let phone =
                caretakerPhone.value.trim();


            // Check empty
            if (!phone) {

                if (caretakerMessage) {

                    caretakerMessage.textContent =
                        "Please enter a WhatsApp number.";

                    caretakerMessage.style.color =
                        "red";
                }

                return;
            }


            // Remove spaces, +, -, brackets
            phone =
                phone.replace(
                    /[^0-9]/g,
                    ""
                );


            // Check phone length
            if (
                !/^[0-9]{8,15}$/.test(
                    phone
                )
            ) {

                if (caretakerMessage) {

                    caretakerMessage.textContent =
                        "Please enter a valid phone number.";

                    caretakerMessage.style.color =
                        "red";
                }

                return;
            }


            try {

                await set(
                    caretakerRef,
                    phone
                );


                if (caretakerMessage) {

                    caretakerMessage.textContent =
                        "Caretaker number saved successfully.";

                    caretakerMessage.style.color =
                        "green";
                }


                console.log(
                    "Caretaker number saved:",
                    phone
                );


            } catch (error) {

                console.error(
                    "Save caretaker error:",
                    error
                );


                if (caretakerMessage) {

                    caretakerMessage.textContent =
                        "Failed to save caretaker number.";

                    caretakerMessage.style.color =
                        "red";
                }
            }
        }
    );
}


// ==================================================
// MEDICATION REMINDERS
// ==================================================

const remindersRef =
    ref(
        db,
        "ElderCare/settings/medicationReminders"
    );


// ------------------------------------------
// Load medication reminders
// ------------------------------------------

onValue(
    remindersRef,
    (snapshot) => {

        if (!reminderList) {
            return;
        }


        reminderList.innerHTML =
            "";


        const reminders =
            snapshot.val();


        if (!reminders) {

            reminderList.innerHTML =
                "<p>No medication reminders.</p>";

            return;
        }


        Object.entries(
            reminders
        ).forEach(
            ([id, reminder]) => {

                displayReminder(
                    id,
                    reminder
                );
            }
        );
    },

    (error) => {

        console.error(
            "Error loading reminders:",
            error
        );
    }
);


// ==================================================
// DISPLAY MEDICATION REMINDER
// ==================================================

function displayReminder(
    id,
    reminder
) {

    if (!reminderList) {
        return;
    }


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "reminder-item";


    // ------------------------------------------
    // Medicine name
    // ------------------------------------------

    const name =
        safeValue(
            reminder.medicineName,
            "Medicine"
        );


    // ------------------------------------------
    // Medicine time
    // ------------------------------------------

    const time =
        safeValue(
            reminder.time,
            "--:--"
        );


    // ------------------------------------------
    // Enabled
    // ------------------------------------------

    const enabled =
        reminder.enabled === true;


    // ------------------------------------------
    // Information
    // ------------------------------------------

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "reminder-info";


    const nameElement =
        document.createElement(
            "strong"
        );


    nameElement.textContent =
        name;


    const timeElement =
        document.createElement(
            "span"
        );


    timeElement.textContent =
        "Time: " + time;


    const statusElement =
        document.createElement(
            "span"
        );


    if (enabled) {

        statusElement.textContent =
            "Enabled";

        statusElement.style.color =
            "green";

    } else {

        statusElement.textContent =
            "Disabled";

        statusElement.style.color =
            "red";
    }


    info.appendChild(
        nameElement
    );

    info.appendChild(
        timeElement
    );

    info.appendChild(
        statusElement
    );


    // ------------------------------------------
    // Delete button
    // ------------------------------------------

    const deleteBtn =
        document.createElement(
            "button"
        );


    deleteBtn.textContent =
        "Delete";


    deleteBtn.className =
        "delete-reminder";


    deleteBtn.addEventListener(
        "click",
        async () => {

            const confirmDelete =
                confirm(
                    "Delete this medication reminder?"
                );


            if (!confirmDelete) {
                return;
            }


            try {

                const reminderRef =
                    ref(
                        db,
                        "ElderCare/settings/medicationReminders/" +
                        id
                    );


                await remove(
                    reminderRef
                );


                if (reminderMessage) {

                    reminderMessage.textContent =
                        "Reminder deleted successfully.";

                    reminderMessage.style.color =
                        "green";
                }


            } catch (error) {

                console.error(
                    "Delete reminder error:",
                    error
                );


                if (reminderMessage) {

                    reminderMessage.textContent =
                        "Failed to delete reminder.";

                    reminderMessage.style.color =
                        "red";
                }
            }
        }
    );


    // ------------------------------------------
    // Add elements
    // ------------------------------------------

    item.appendChild(
        info
    );

    item.appendChild(
        deleteBtn
    );


    reminderList.appendChild(
        item
    );
}


// ==================================================
// ADD MEDICATION REMINDER
// ==================================================

if (addReminderBtn) {

    addReminderBtn.addEventListener(
        "click",
        async () => {

            const name =
                medicineName.value.trim();


            const time =
                medicineTime.value;


            // --------------------------------------
            // Check medicine name
            // --------------------------------------

            if (!name) {

                if (reminderMessage) {

                    reminderMessage.textContent =
                        "Please enter the medicine name.";

                    reminderMessage.style.color =
                        "red";
                }

                return;
            }


            // --------------------------------------
            // Check time
            // --------------------------------------

            if (!time) {

                if (reminderMessage) {

                    reminderMessage.textContent =
                        "Please select a reminder time.";

                    reminderMessage.style.color =
                        "red";
                }

                return;
            }


            try {

                const newReminderRef =
                    push(
                        remindersRef
                    );


                // ==================================================
                // IMPORTANT
                // ESP32 REQUIRES enabled = true
                // ==================================================

                await set(
                    newReminderRef,
                    {
                        medicineName: name,
                        time: time,
                        enabled: true
                    }
                );


                console.log(
                    "Medication reminder saved:",
                    {
                        medicineName: name,
                        time: time,
                        enabled: true
                    }
                );


                // Clear input
                medicineName.value =
                    "";

                medicineTime.value =
                    "";


                if (reminderMessage) {

                    reminderMessage.textContent =
                        "Medication reminder added successfully.";

                    reminderMessage.style.color =
                        "green";
                }


            } catch (error) {

                console.error(
                    "Add reminder error:",
                    error
                );


                if (reminderMessage) {

                    reminderMessage.textContent =
                        "Failed to add medication reminder.";

                    reminderMessage.style.color =
                        "red";
                }
            }
        }
    );
}


// ==================================================
// HISTORY
// ==================================================

async function loadHistory() {

    try {

        const snapshot =
            await get(
                historyRef
            );


        if (!historyList) {
            return;
        }


        historyList.innerHTML =
            "";


        if (!snapshot.exists()) {

            historyList.innerHTML =
                "<p>No history available.</p>";

            return;
        }


        const history =
            snapshot.val();


        let entries =
            Object.entries(
                history
            );


        // Newest first
        entries.reverse();


        // Show maximum 20 records
        entries =
            entries.slice(
                0,
                20
            );


        entries.forEach(
            ([id, record]) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "history-item";


                const timestamp =
                    safeValue(
                        record.timestamp,
                        "--"
                    );


                const hr =
                    safeValue(
                        record.heartRate,
                        "--"
                    );


                const oxygen =
                    safeValue(
                        record.spo2,
                        "--"
                    );


                const fall =
                    safeValue(
                        record.fallStatus,
                        "NORMAL"
                    );


                item.innerHTML = `
                    <div>
                        <strong>${timestamp}</strong>
                    </div>

                    <div>
                        Heart Rate:
                        ${hr} BPM
                    </div>

                    <div>
                        SpO₂:
                        ${oxygen} %
                    </div>

                    <div>
                        Fall:
                        ${fall}
                    </div>
                `;


                historyList.appendChild(
                    item
                );
            }
        );


    } catch (error) {

        console.error(
            "Error loading history:",
            error
        );


        if (historyList) {

            historyList.innerHTML =
                "<p>Failed to load history.</p>";
        }
    }
}


// ==================================================
// REFRESH HISTORY
// ==================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            refreshBtn.textContent =
                "Refreshing...";


            await loadHistory();


            refreshBtn.textContent =
                "Refresh";


            setTimeout(
                () => {

                    refreshBtn.textContent =
                        "Refresh";

                },
                1000
            );
        }
    );
}


// ==================================================
// INITIAL LOAD
// ==================================================

loadHistory();

// ==================================================
// PUSHOVER TEST
// ==================================================

// sendPushover(
//     "ElderCare Test",
//     "Hei, saya jatuh, tolong"
// );


// ==================================================
// Console
// ==================================================

console.log(
    "================================="
);

console.log(
    "ElderCare Web App"
);

console.log(
    "Firebase initialized"
);

console.log(
    "Database:",
    firebaseConfig.databaseURL
);

console.log(
    "================================="
);
