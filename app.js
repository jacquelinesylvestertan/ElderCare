// =====================================================
// ELDERCARE WEB APP
// Firebase Realtime Database
// Twilio WhatsApp is handled by PHP
// =====================================================


import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
  query,
  limitToLast,
  set,
  push,
  remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyD3PyawBlB2szqzvEugHqyX0tYg6iXhnzA",

  authDomain:
    "eldercare-e783b.firebaseapp.com",

  databaseURL:
    "https://eldercare-e783b-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "eldercare-e783b",

  storageBucket:
    "eldercare-e783b.firebasestorage.app",

  messagingSenderId:
    "380812951098",

  appId:
    "1:380812951098:web:a6e2f198023c3bfac87f03"
};


// =====================================================
// INITIALIZE
// =====================================================

const app =
  initializeApp(firebaseConfig);

const db =
  getDatabase(app);

const auth =
  getAuth(app);


// =====================================================
// HTML ELEMENTS
// =====================================================

const heartRateEl =
  document.getElementById("heartRate");

const spo2El =
  document.getElementById("spo2");

const fallStatusEl =
  document.getElementById("fallStatus");

const fallCard =
  document.getElementById("fallCard");

const connectionDot =
  document.getElementById("connectionDot");

const connectionText =
  document.getElementById("connectionText");

const lastUpdated =
  document.getElementById("lastUpdated");

const historyList =
  document.getElementById("historyList");

const refreshBtn =
  document.getElementById("refreshBtn");

const caretakerPhoneInput =
  document.getElementById("caretakerPhone");

const saveCaretakerBtn =
  document.getElementById("saveCaretakerBtn");

const caretakerMessage =
  document.getElementById("caretakerMessage");

const mpuStatusEl =
  document.getElementById("mpuStatus");

const max30102StatusEl =
  document.getElementById("max30102Status");

const fingerStatusEl =
  document.getElementById("fingerStatus");


// Medication elements

const medicineNameInput =
  document.getElementById("medicineName");

const medicineTimeInput =
  document.getElementById("medicineTime");

const addReminderBtn =
  document.getElementById("addReminderBtn");

const reminderMessage =
  document.getElementById("reminderMessage");

const reminderList =
  document.getElementById("reminderList");


// =====================================================
// CONNECTION STATUS
// =====================================================

function setConnection(online) {

  if (online) {

    connectionDot.className =
      "status-dot online";

    connectionText.textContent =
      "Connected to Firebase";

  } else {

    connectionDot.className =
      "status-dot offline";

    connectionText.textContent =
      "Disconnected";
  }
}


// =====================================================
// CURRENT HEALTH DATA
// =====================================================

function showCurrentData(data) {

  if (!data) {

    heartRateEl.textContent = "--";
    spo2El.textContent = "--";
    fallStatusEl.textContent = "--";
    lastUpdated.textContent = "--";
    mpuStatusEl.textContent = "--";
    max30102StatusEl.textContent = "--";
    fingerStatusEl.textContent = "--";

    return;
  }


  heartRateEl.textContent =
    data.heartRate ?? "--";

  spo2El.textContent =
    data.spo2 ?? "--";


  const fall =
    data.fallStatus ?? "Unknown";

  fallStatusEl.textContent =
    fall;


  fallCard.classList.remove(
    "fall-normal",
    "fall-alert"
  );

  fallStatusEl.classList.remove(
    "normal",
    "alert"
  );


  if (fall === "FALL DETECTED") {

    fallCard.classList.add(
      "fall-alert"
    );

    fallStatusEl.classList.add(
      "alert"
    );

  } else {

    fallCard.classList.add(
      "fall-normal"
    );

    fallStatusEl.classList.add(
      "normal"
    );
  }


  lastUpdated.textContent =
    data.timestamp ?? "--";

  mpuStatusEl.textContent =
    data.mpuStatus ?? "--";

  max30102StatusEl.textContent =
    data.max30102Status ?? "--";

  fingerStatusEl.textContent =
    data.fingerStatus ?? "--";
}


// =====================================================
// CURRENT DATA LISTENER
// =====================================================

const currentRef =
  ref(
    db,
    "ElderCare/current"
  );


onValue(

  currentRef,

  (snapshot) => {

    setConnection(true);

    showCurrentData(
      snapshot.val()
    );
  },

  (error) => {

    console.error(
      "Firebase current error:",
      error
    );

    setConnection(false);
  }
);


// =====================================================
// CARETAKER PHONE
// =====================================================

const caretakerRef =
  ref(
    db,
    "ElderCare/settings/caretakerPhone"
  );


onValue(

  caretakerRef,

  (snapshot) => {

    const phone =
      snapshot.val();

    caretakerPhoneInput.value =
      phone ? phone : "";
  },

  (error) => {

    console.error(
      "Caretaker read error:",
      error
    );
  }
);


// =====================================================
// SAVE CARETAKER PHONE
// =====================================================

saveCaretakerBtn.addEventListener(
  "click",
  async () => {

    let phone =
      caretakerPhoneInput.value.trim();


    phone =
      phone
        .replace(/\+/g, "")
        .replace(/\s/g, "")
        .replace(/-/g, "");


    if (!phone) {

      caretakerMessage.textContent =
        "Please enter a phone number.";

      caretakerMessage.className =
        "caretaker-message error";

      return;
    }


    if (!/^[0-9]{8,15}$/.test(phone)) {

      caretakerMessage.textContent =
        "Please enter a valid phone number.";

      caretakerMessage.className =
        "caretaker-message error";

      return;
    }


    try {

      saveCaretakerBtn.disabled =
        true;

      saveCaretakerBtn.textContent =
        "Saving...";


      await set(
        caretakerRef,
        phone
      );


      caretakerMessage.textContent =
        "Caretaker WhatsApp number saved successfully.";

      caretakerMessage.className =
        "caretaker-message success";

      caretakerPhoneInput.value =
        phone;


    } catch (error) {

      console.error(
        "Caretaker save error:",
        error
      );

      caretakerMessage.textContent =
        "Failed to save phone number.";

      caretakerMessage.className =
        "caretaker-message error";


    } finally {

      saveCaretakerBtn.disabled =
        false;

      saveCaretakerBtn.textContent =
        "Save Caretaker";
    }
  }
);


// =====================================================
// MEDICATION REMINDER
// =====================================================

const medicationRef =
  ref(
    db,
    "ElderCare/settings/medicationReminders"
  );


// =====================================================
// ADD MEDICATION REMINDER
// =====================================================

addReminderBtn.addEventListener(
  "click",
  async () => {

    const medicineName =
      medicineNameInput.value.trim();

    const medicineTime =
      medicineTimeInput.value;


    // -----------------------------------------------
    // CHECK MEDICINE NAME
    // -----------------------------------------------

    if (!medicineName) {

      reminderMessage.textContent =
        "Please enter the medicine name.";

      reminderMessage.className =
        "caretaker-message error";

      return;
    }


    // -----------------------------------------------
    // CHECK TIME
    // -----------------------------------------------

    if (!medicineTime) {

      reminderMessage.textContent =
        "Please select a reminder time.";

      reminderMessage.className =
        "caretaker-message error";

      return;
    }


    try {

      addReminderBtn.disabled =
        true;

      addReminderBtn.textContent =
        "Adding...";


      // Create new Firebase ID

      const newReminderRef =
        push(medicationRef);


      await set(
        newReminderRef,
        {
          medicineName:
            medicineName,

          time:
            medicineTime
        }
      );


      medicineNameInput.value =
        "";

      medicineTimeInput.value =
        "";


      reminderMessage.textContent =
        "Medication reminder added successfully.";

      reminderMessage.className =
        "caretaker-message success";


    } catch (error) {

      console.error(
        "Add reminder error:",
        error
      );


      reminderMessage.textContent =
        "Failed to add medication reminder.";

      reminderMessage.className =
        "caretaker-message error";


    } finally {

      addReminderBtn.disabled =
        false;

      addReminderBtn.textContent =
        "Add Reminder";
    }
  }
);


// =====================================================
// LOAD MEDICATION REMINDERS
// =====================================================

onValue(

  medicationRef,

  (snapshot) => {

    showMedicationReminders(
      snapshot.val()
    );
  },

  (error) => {

    console.error(
      "Medication reminder error:",
      error
    );

    reminderList.innerHTML =
      '<p class="empty">Unable to load reminders.</p>';
  }
);


// =====================================================
// SHOW MEDICATION REMINDERS
// =====================================================

function showMedicationReminders(data) {

  reminderList.innerHTML =
    "";


  if (!data) {

    reminderList.innerHTML =
      '<p class="empty">No medication reminders yet.</p>';

    return;
  }


  const reminders =
    Object.entries(data)
      .sort(
        ([, a], [, b]) =>
          (a.time || "").localeCompare(
            b.time || ""
          )
      );


  reminders.forEach(
    ([id, reminder]) => {

      const item =
        document.createElement("div");

      item.className =
        "reminder-item";


      const info =
        document.createElement("div");

      info.className =
        "reminder-info";


      const medicine =
        document.createElement("span");

      medicine.className =
        "reminder-medicine";

      medicine.textContent =
        "💊 " +
        (reminder.medicineName || "--");


      const time =
        document.createElement("span");

      time.className =
        "reminder-time";

      time.textContent =
        "🕐 " +
        formatTime(
          reminder.time
        );


      info.appendChild(
        medicine
      );

      info.appendChild(
        time
      );


      const deleteBtn =
        document.createElement("button");

      deleteBtn.className =
        "delete-reminder-btn";

      deleteBtn.textContent =
        "Delete";


      deleteBtn.addEventListener(
        "click",
        () => {
          deleteReminder(id);
        }
      );


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
  );
}


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(time) {

  if (!time) {
    return "--";
  }


  const parts =
    time.split(":");


  if (parts.length !== 2) {
    return time;
  }


  let hour =
    parseInt(
      parts[0],
      10
    );

  const minute =
    parts[1];


  const period =
    hour >= 12
      ? "PM"
      : "AM";


  if (hour === 0) {
    hour = 12;
  }

  else if (hour > 12) {
    hour -= 12;
  }


  return (
    hour +
    ":" +
    minute +
    " " +
    period
  );
}


// =====================================================
// DELETE REMINDER
// =====================================================

async function deleteReminder(id) {

  const confirmed =
    confirm(
      "Delete this medication reminder?"
    );


  if (!confirmed) {
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


    reminderMessage.textContent =
      "Medication reminder deleted.";

    reminderMessage.className =
      "caretaker-message success";


  } catch (error) {

    console.error(
      "Delete reminder error:",
      error
    );


    reminderMessage.textContent =
      "Failed to delete reminder.";

    reminderMessage.className =
      "caretaker-message error";
  }
}


// =====================================================
// HEALTH HISTORY
// =====================================================

function loadHistory() {

  const historyRef =
    query(
      ref(
        db,
        "ElderCare/history"
      ),
      limitToLast(20)
    );


  onValue(

    historyRef,

    (snapshot) => {

      showHistory(
        snapshot.val()
      );
    },

    (error) => {

      console.error(
        "History error:",
        error
      );

      historyList.innerHTML =
        '<p class="empty">Unable to load history.</p>';
    },

    {
      onlyOnce: true
    }
  );
}


// =====================================================
// SHOW HISTORY
// =====================================================

function showHistory(data) {

  historyList.innerHTML =
    "";


  if (!data) {

    historyList.innerHTML =
      '<p class="empty">No history data yet.</p>';

    return;
  }


  const records =
    Object.entries(data)
      .reverse();


  records.forEach(
    ([key, record]) => {

      const item =
        document.createElement("div");

      item.className =
        "history-item";


      const fallClass =
        record.fallStatus === "FALL DETECTED"
          ? "alert"
          : "normal";


      item.innerHTML = `

        <div class="history-row">

          <strong>
            Heart Rate
          </strong>

          <span>
            ${record.heartRate ?? "--"} BPM
          </span>

        </div>


        <div class="history-row">

          <strong>
            SpO₂
          </strong>

          <span>
            ${record.spo2 ?? "--"}%
          </span>

        </div>


        <div class="history-row">

          <strong>
            Fall
          </strong>

          <span class="${fallClass}">
            ${record.fallStatus ?? "--"}
          </span>

        </div>


        <div class="history-row">

          <strong>
            Finger
          </strong>

          <span>
            ${record.fingerStatus ?? "--"}
          </span>

        </div>


        <div class="history-time">
          ${record.timestamp ?? "--"}
        </div>

      `;


      historyList.appendChild(
        item
      );
    }
  );
}


// =====================================================
// REFRESH
// =====================================================

refreshBtn.addEventListener(
  "click",
  loadHistory
);


// =====================================================
// FIREBASE AUTH
// =====================================================

async function startAuthentication() {

  try {

    await signInAnonymously(
      auth
    );

    console.log(
      "[Firebase] Anonymous login successful."
    );

  } catch (error) {

    console.error(
      "[Firebase] Anonymous login failed:",
      error
    );


    caretakerMessage.textContent =
      "Firebase authentication failed.";

    caretakerMessage.className =
      "caretaker-message error";
  }
}


// =====================================================
// START
// =====================================================

startAuthentication();

loadHistory();