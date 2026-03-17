let state = {
  teamNumber: "",
  matchNumber: "",
  scoutName: "",

  autoMoved: false,
  autoContribution: 0,
  autoClimb: "no",
  autoPenalties: "no",
  autoDisabled: "no",

  defenseLevel: "none",
  teleopContribution: 0,
  teleopPenalties: "no",
  teleopDisabled: "no",

  endgameClimb: "none",
  endgamePenalties: "no",
  endgameDisabled: "no",

  tags: [],
  comments: "",

  qrSent: false,
  qrData: ""
};

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  showPage("page-setup");

  // SETUP PAGE
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

  document.getElementById("back-to-setup").addEventListener("click", () => {
    showPage("page-setup");
  });

  // AUTO SLIDER
  const autoSlider = document.getElementById("autoContribution");
  const autoValue = document.getElementById("autoContributionValue");
  autoSlider.addEventListener("input", () => {
    autoValue.textContent = autoSlider.value + "%";
  });

  document.getElementById("to-teleop").addEventListener("click", () => {
    state.autoMoved = document.getElementById("autoMoved").checked;
    state.autoContribution = parseInt(autoSlider.value, 10);
    state.autoClimb = document.getElementById("autoClimb").value;
    state.autoPenalties = document.getElementById("autoPenalties").value;
    state.autoDisabled = document.getElementById("autoDisabled").value;

    showPage("page-teleop");
  });

  // TELEOP SLIDER
  const teleopSlider = document.getElementById("teleopContribution");
  const teleopValue = document.getElementById("teleopContributionValue");
  teleopSlider.addEventListener("input", () => {
    teleopValue.textContent = teleopSlider.value + "%";
  });

  document.getElementById("back-to-auto").addEventListener("click", () => {
    showPage("page-auto");
  });

  document.getElementById("to-endgame").addEventListener("click", () => {
    const radios = document.querySelectorAll("input[name='defenseLevel']");
    radios.forEach(r => {
      if (r.checked) state.defenseLevel = r.value;
    });

    state.teleopContribution = parseInt(teleopSlider.value, 10);
    state.teleopPenalties = document.getElementById("teleopPenalties").value;
    state.teleopDisabled = document.getElementById("teleopDisabled").value;

    showPage("page-endgame");
  });

  // ENDGAME PAGE
  document.getElementById("back-to-teleop").addEventListener("click", () => {
    showPage("page-teleop");
  });

  document.getElementById("to-tags").addEventListener("click", () => {
    state.endgameClimb = document.getElementById("endgameClimb").value;
    state.endgamePenalties = document.getElementById("endgamePenalties").value;
    state.endgameDisabled = document.getElementById("endgameDisabled").value;

    showPage("page-tags");
  });

  // TAGS PAGE
  const commentsEl = document.getElementById("comments");
  const commentsCounter = document.getElementById("comments-counter");
  commentsEl.addEventListener("input", () => {
    commentsCounter.textContent = `${commentsEl.value.length} / 300`;
  });

  document.getElementById("back-to-endgame").addEventListener("click", () => {
    showPage("page-endgame");
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

  // QR PAGE
  document.getElementById("back-to-tags").addEventListener("click", () => {
    showPage("page-tags");
  });

  document.getElementById("send-email").addEventListener("click", () => {
    sendEmailWithQR();
  });

  document.getElementById("done-match").addEventListener("click", () => {
    if (!state.qrSent) {
      alert("Please send the email first.");
      return;
    }
    resetForNewMatch();
    showPage("page-setup");
  });

  // SERVICE WORKER
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
    autoContribution: state.autoContribution,
    autoClimb: state.autoClimb,
    autoPenalties: state.autoPenalties,
    autoDisabled: state.autoDisabled,

    defenseLevel: state.defenseLevel,
    teleopContribution: state.teleopContribution,
    teleopPenalties: state.teleopPenalties,
    teleopDisabled: state.teleopDisabled,

    endgameClimb: state.endgameClimb,
    endgamePenalties: state.endgamePenalties,
    endgameDisabled: state.endgameDisabled,

    tags: state.tags,
    comments: state.comments
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
  const subject = encodeURIComponent(
    `Scouting Data - Team ${state.teamNumber} - Match ${state.matchNumber}`
  );

  const body = encodeURIComponent(
    `Team: ${state.teamNumber}\nMatch: ${state.matchNumber}\nScout: ${state.scoutName}\n\nQR Data:\n${state.qrData}`
  );

  window.location.href = `mailto:wcflee@yahoo.com?subject=${subject}&body=${body}`;

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
    autoContribution: 0,
    autoClimb: "no",
    autoPenalties: "no",
    autoDisabled: "no",

    defenseLevel: "none",
    teleopContribution: 0,
    teleopPenalties: "no",
    teleopDisabled: "no",

    endgameClimb: "none",
    endgamePenalties: "no",
    endgameDisabled: "no",

    tags: [],
    comments: "",

    qrSent: false,
    qrData: ""
  };

  document.getElementById("teamNumber").value = "";
  document.getElementById("matchNumber").value = "";
  document.getElementById("scoutName").value = "";

  document.getElementById("autoMoved").checked = false;
  document.getElementById("autoContribution").value = 0;
  document.getElementById("autoContributionValue").textContent = "0%";
  document.getElementById("autoClimb").value = "no";
  document.getElementById("autoPenalties").value = "no";
  document.getElementById("autoDisabled").value = "no";

  document.querySelectorAll("input[name='defenseLevel']").forEach(r => {
    r.checked = r.value === "none";
  });

  document.getElementById("teleopContribution").value = 0;
  document.getElementById("teleopContributionValue").textContent = "0%";
  document.getElementById("teleopPenalties").value = "no";
  document.getElementById("teleopDisabled").value = "no";

  document.getElementById("endgameClimb").value = "none";
  document.getElementById("endgamePenalties").value = "no";
  document.getElementById("endgameDisabled").value = "no";

  document.querySelectorAll(".tag-checkbox").forEach(cb => {
    cb.checked = false;
  });

  const commentsEl = document.getElementById("comments");
  commentsEl.value = "";
  document.getElementById("comments-counter").textContent = "0 / 300";

  document.getElementById("qrcode").innerHTML = "";
  document.getElementById("email-status").textContent = "";
}