// Global state
let state = {
  teamNumber: "",
  matchNumber: "",
  scoutName: "",
  autoMoved: false,
  autoNotes: "",
  teleopScored: 0,
  defenseLevel: "none",
  tags: [],
  comments: "",
  qrSent: false,
  qrData: ""
};

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Setup listeners
window.addEventListener("DOMContentLoaded", () => {
  // Initial page
  showPage("page-setup");

  // Setup page
  document.getElementById("to-auto").addEventListener("click", () => {
    state.teamNumber = document.getElementById("teamNumber").value.trim();
    state.matchNumber = document.getElementById("matchNumber").value.trim();
    state.scoutName = document.getElementById("scoutName").value.trim();

    if (!state.teamNumber || !state.matchNumber) {
      alert("Please enter team number and match number.");
      return;
    }

    showPage("page-auto");
  });

  // Auto page
  document.getElementById("back-to-setup").addEventListener("click", () => {
    showPage("page-setup");
  });

  document.getElementById("to-teleop").addEventListener("click", () => {
    state.autoMoved = document.getElementById("autoMoved").checked;
    state.autoNotes = document.getElementById("autoNotes").value.trim();
    showPage("page-teleop");
  });

  // Teleop page
  document.getElementById("back-to-auto").addEventListener("click", () => {
    showPage("page-auto");
  });

  document.getElementById("to-tags").addEventListener("click", () => {
    const teleopScored = parseInt(document.getElementById("teleopScored").value || "0", 10);
    state.teleopScored = isNaN(teleopScored) ? 0 : teleopScored;

    const defenseRadios = document.querySelectorAll("input[name='defenseLevel']");
    defenseRadios.forEach(r => {
      if (r.checked) state.defenseLevel = r.value;
    });

    showPage("page-tags");
  });

  // Tags page
  document.getElementById("back-to-teleop").addEventListener("click", () => {
    showPage("page-teleop");
  });

  const commentsEl = document.getElementById("comments");
  const commentsCounter = document.getElementById("comments-counter");
  commentsEl.addEventListener("input", () => {
    const len = commentsEl.value.length;
    commentsCounter.textContent = `${len} / 300`;
  });

  document.getElementById("to-qr").addEventListener("click", () => {
    const tagCheckboxes = document.querySelectorAll(".tag-checkbox");
    state.tags = [];
    tagCheckboxes.forEach(cb => {
      if (cb.checked) state.tags.push(cb.value);
    });

    state.comments = commentsEl.value.trim();

    generateQR();
    resetEmailState();
    showPage("page-qr");
  });

  // QR page
  document.getElementById("back-to-tags").addEventListener("click", () => {
    showPage("page-tags");
  });

  document.getElementById("send-email").addEventListener("click", () => {
    sendEmailWithQR();
  });

  document.getElementById("done-match").addEventListener("click", () => {
    if (!state.qrSent) {
      alert("Please send the email before completing the match.");
      return;
    }
    resetForNewMatch();
    showPage("page-setup");
  });

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  }
});

function generateQR() {
  const payload = {
    teamNumber: state.teamNumber,
    matchNumber: state.matchNumber,
    scoutName: state.scoutName,
    autoMoved: state.autoMoved,
    autoNotes: state.autoNotes,
    teleopScored: state.teleopScored,
    defenseLevel: state.defenseLevel,
    tags: state.tags,
    comments: state.comments
    // alliance intentionally omitted for now
  };

  const json = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(json);
  state.qrData = compressed;

  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, {
    text: compressed,
    width: 256,
    height: 256
  });
}

function resetEmailState() {
  state.qrSent = false;
  const sendBtn = document.getElementById("send-email");
  const doneBtn = document.getElementById("done-match");
  const status = document.getElementById("email-status");

  sendBtn.classList.remove("sent");
  sendBtn.disabled = false;
  sendBtn.textContent = "Send via Email";
  doneBtn.disabled = true;
  status.textContent = "";
}

function sendEmailWithQR() {
  if (!state.qrData) {
    alert("QR data not generated yet.");
    return;
  }

  const subject = encodeURIComponent(
    `Scouting Data - Team ${state.teamNumber} - Match ${state.matchNumber}`
  );
  const bodyLines = [
    `Team: ${state.teamNumber}`,
    `Match: ${state.matchNumber}`,
    `Scout: ${state.scoutName}`,
    "",
    "QR Data (compressed):",
    state.qrData
  ];
  const body = encodeURIComponent(bodyLines.join("\n"));

  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;

  state.qrSent = true;
  const sendBtn = document.getElementById("send-email");
  const doneBtn = document.getElementById("done-match");
  const status = document.getElementById("email-status");

  sendBtn.classList.add("sent");
  sendBtn.disabled = true;
  sendBtn.textContent = "Sent";
  doneBtn.disabled = false;
  status.textContent = "Email sent — you may continue.";
}

function resetForNewMatch() {
  state = {
    teamNumber: "",
    matchNumber: "",
    scoutName: "",
    autoMoved: false,
    autoNotes: "",
    teleopScored: 0,
    defenseLevel: "none",
    tags: [],
    comments: "",
    qrSent: false,
    qrData: ""
  };

  document.getElementById("teamNumber").value = "";
  document.getElementById("matchNumber").value = "";
  document.getElementById("scoutName").value = "";
  document.getElementById("autoMoved").checked = false;
  document.getElementById("autoNotes").value = "";
  document.getElementById("teleopScored").value = "";

  document.querySelectorAll("input[name='defenseLevel']").forEach(r => {
    r.checked = r.value === "none";
  });

  document.querySelectorAll(".tag-checkbox").forEach(cb => {
    cb.checked = false;
  });

  const commentsEl = document.getElementById("comments");
  commentsEl.value = "";
  document.getElementById("comments-counter").textContent = "0 / 300";

  document.getElementById("qrcode").innerHTML = "";
  document.getElementById("email-status").textContent = "";
}