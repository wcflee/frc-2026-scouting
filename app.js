// Basic state
let state = {
  match_number: 1,
  team_number: null,
  alliance: null,
  scout_name: "",
  auto: {
    contribution_percent: 0,
    taxi: false,
    auto_climb: false,
    penalties: false,
    disabled: false
  },
  teleop: {
    contribution_percent: 0,
    defense_played: "none",
    penalties: false,
    disabled: false
  },
  endgame: {
    teleop_climb: "none",
    climb_time_seconds: null
  },
  tags: {
    good_intake: false,
    weak_intake: false,
    fast_cycle: false,
    slow_cycle: false,
    good_driver: false,
    unstable: false,
    dead_robot: false
  },
  timestamp: "",
  device_id: ""
};

function $(id) {
  return document.getElementById(id);
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll("#progress .step").forEach(s => s.classList.remove("active"));

  const screenId = `screen-${name}`;
  $(screenId).classList.add("active");

  const order = ["setup", "auto", "tele", "endgame", "tags", "qr"];
  const idx = order.indexOf(name);
  if (idx >= 0) {
    document.querySelectorAll("#progress .step")[idx].classList.add("active");
  }

  saveToLocal();
}

function saveToLocal() {
  try {
    localStorage.setItem("frc_scout_state", JSON.stringify(state));
  } catch (e) {}
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem("frc_scout_state");
    if (!raw) return;
    const s = JSON.parse(raw);
    state = s;
  } catch (e) {}
}

function initSetupScreen() {
  $("match-number").value = state.match_number;
  $("team-number").value = state.team_number || "";
  $("scout-name").value = state.scout_name || "";

  if (state.alliance === "red") {
    $("alliance-red").classList.add("active");
  } else if (state.alliance === "blue") {
    $("alliance-blue").classList.add("active");
  }

  $("match-inc").onclick = () => {
    state.match_number = (parseInt($("match-number").value) || 0) + 1;
    $("match-number").value = state.match_number;
    saveToLocal();
  };
  $("match-dec").onclick = () => {
    state.match_number = Math.max(1, (parseInt($("match-number").value) || 1) - 1);
    $("match-number").value = state.match_number;
    saveToLocal();
  };

  $("alliance-red").onclick = () => {
    state.alliance = "red";
    $("alliance-red").classList.add("active");
    $("alliance-blue").classList.remove("active");
    saveToLocal();
  };
  $("alliance-blue").onclick = () => {
    state.alliance = "blue";
    $("alliance-blue").classList.add("active");
    $("alliance-red").classList.remove("active");
    saveToLocal();
  };

  $("match-number").onchange = () => {
    state.match_number = parseInt($("match-number").value) || 1;
    saveToLocal();
  };
  $("team-number").onchange = () => {
    state.team_number = parseInt($("team-number").value) || null;
    saveToLocal();
  };
  $("scout-name").onchange = () => {
    state.scout_name = $("scout-name").value;
    saveToLocal();
  };

  $("setup-next").onclick = () => {
    if (!state.match_number || !state.team_number || !state.alliance || !state.scout_name) {
      alert("Please fill all fields.");
      return;
    }
    showScreen("auto");
  };
}

function initAutoScreen() {
  const slider = $("auto-contrib");
  const valueSpan = $("auto-contrib-value");
  slider.value = state.auto.contribution_percent || 0;
  valueSpan.textContent = slider.value;

  slider.oninput = () => {
    state.auto.contribution_percent = parseInt(slider.value);
    valueSpan.textContent = slider.value;
    saveToLocal();
  };

  document.querySelectorAll('[data-field="auto-taxi"]').forEach(btn => {
    btn.onclick = () => {
      state.auto.taxi = btn.dataset.value === "true";
      setToggleGroup("auto-taxi", btn.dataset.value);
    };
  });
  document.querySelectorAll('[data-field="auto-climb"]').forEach(btn => {
    btn.onclick = () => {
      state.auto.auto_climb = btn.dataset.value === "true";
      setToggleGroup("auto-climb", btn.dataset.value);
    };
  });
  document.querySelectorAll('[data-field="auto-penalties"]').forEach(btn => {
    btn.onclick = () => {
      state.auto.penalties = btn.dataset.value === "true";
      setToggleGroup("auto-penalties", btn.dataset.value);
    };
  });
  document.querySelectorAll('[data-field="auto-disabled"]').forEach(btn => {
    btn.onclick = () => {
      state.auto.disabled = btn.dataset.value === "true";
      setToggleGroup("auto-disabled", btn.dataset.value);
    };
  });

  document.querySelector('#screen-auto [data-back="setup"]').onclick = () => showScreen("setup");
  document.querySelector('#screen-auto [data-next="tele"]').onclick = () => showScreen("tele");
}

function initTeleScreen() {
  const slider = $("tele-contrib");
  const valueSpan = $("tele-contrib-value");
  slider.value = state.teleop.contribution_percent || 0;
  valueSpan.textContent = slider.value;

  slider.oninput = () => {
    state.teleop.contribution_percent = parseInt(slider.value);
    valueSpan.textContent = slider.value;
    saveToLocal();
  };

  document.querySelectorAll('[data-field="tele-defense"]').forEach(btn => {
    btn.onclick = () => {
      state.teleop.defense_played = btn.dataset.value;
      setToggleGroup("tele-defense", btn.dataset.value);
    };
  });
  document.querySelectorAll('[data-field="tele-penalties"]').forEach(btn => {
    btn.onclick = () => {
      state.teleop.penalties = btn.dataset.value === "true";
      setToggleGroup("tele-penalties", btn.dataset.value);
    };
  });
  document.querySelectorAll('[data-field="tele-disabled"]').forEach(btn => {
    btn.onclick = () => {
      state.teleop.disabled = btn.dataset.value === "true";
      setToggleGroup("tele-disabled", btn.dataset.value);
    };
  });

  document.querySelector('#screen-tele [data-back="auto"]').onclick = () => showScreen("auto");
  document.querySelector('#screen-tele [data-next="endgame"]').onclick = () => showScreen("endgame");
}

function initEndgameScreen() {
  document.querySelectorAll('[data-field="endgame-climb"]').forEach(btn => {
    btn.onclick = () => {
      state.endgame.teleop_climb = btn.dataset.value;
      setToggleGroup("endgame-climb", btn.dataset.value);
      saveToLocal();
    };
  });

  $("climb-time").value = state.endgame.climb_time_seconds || "";
  $("climb-time").onchange = () => {
    const v = $("climb-time").value;
    state.endgame.climb_time_seconds = v === "" ? null : parseInt(v);
    saveToLocal();
  };

  document.querySelector('#screen-endgame [data-back="tele"]').onclick = () => showScreen("tele");
  document.querySelector('#screen-endgame [data-next="tags"]').onclick = () => showScreen("tags");
}

function initTagsScreen() {
  document.querySelectorAll(".tag").forEach(btn => {
    const tag = btn.dataset.tag;
    if (state.tags[tag]) btn.classList.add("active");

    btn.onclick = () => {
      state.tags[tag] = !state.tags[tag];
      btn.classList.toggle("active");
      saveToLocal();
    };
  });

  document.querySelector('#screen-tags [data-back="endgame"]').onclick = () => showScreen("endgame");
  $("generate-qr").onclick = () => {
    generateQR();
    showScreen("qr");
  };
}

function setToggleGroup(field, value) {
  document.querySelectorAll(`[data-field="${field}"]`).forEach(btn => {
    if (btn.dataset.value === value) btn.classList.add("active");
    else btn.classList.remove("active");
  });
  saveToLocal();
}

//
// ⭐ COMPRESSED QR VERSION + SHARE OPTIONS
//
function generateQR() {
  state.timestamp = new Date().toISOString();
  if (!state.device_id) {
    state.device_id = "device-" + Math.random().toString(36).slice(2, 10);
  }
  saveToLocal();

  const payload = {
    match_number: state.match_number,
    team_number: state.team_number,
    alliance: state.alliance,
    scout_name: state.scout_name,
    auto: state.auto,
    teleop: state.teleop,
    endgame: state.endgame,
    tags: state.tags,
    timestamp: state.timestamp,
    device_id: state.device_id
  };

  const json = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(json);

  const qrContainer = $("qrcode");
  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
    text: compressed,
    width: 512,
    height: 512,
    correctLevel: QRCode.CorrectLevel.H,
    typeNumber: 20
  });

  //
  // ⭐ SHARE BUTTONS (Email, SMS, Copy only)
  //

  // EMAIL (default recipient)
  $("send-email").onclick = () => {
    const subject = encodeURIComponent("Scouting QR Code");
    const body = encodeURIComponent("Scouting QR:\n\n" + compressed);
    window.location.href = `mailto:wcflee@yahoo.com?subject=${subject}&body=${body}`;
  };

  // SMS
  $("send-sms").onclick = () => {
    const body = encodeURIComponent("Scouting QR:\n" + compressed);
    window.location.href = `sms:?body=${body}`;
  };

  // COPY TO CLIPBOARD (with fallback)
  $("copy-qr").onclick = async () => {
    try {
      await navigator.clipboard.writeText(compressed);
      alert("QR data copied to clipboard!");
    } catch (err) {
      const temp = document.createElement("textarea");
      temp.value = compressed;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      alert("QR data copied (fallback mode)!");
    }
  };
}

function initQRScreen() {
  $("new-match").onclick = () => {
    state.match_number = state.match_number + 1;
    state.team_number = null;
    state.auto = {
      contribution_percent: 0,
      taxi: false,
      auto_climb: false,
      penalties: false,
      disabled: false
    };
    state.teleop = {
      contribution_percent: 0,
      defense_played: "none",
      penalties: false,
      disabled: false
    };
    state.endgame = {
      teleop_climb: "none",
      climb_time_seconds: null
    };
    state.tags = {
      good_intake: false,
      weak_intake: false,
      fast_cycle: false,
      slow_cycle: false,
      good_driver: false,
      unstable: false,
      dead_robot: false
    };

    saveToLocal();
    showScreen("setup");
    initSetupScreen();
  };
}

window.onload = () => {
  loadFromLocal();
  initSetupScreen();
  initAutoScreen();
  initTeleScreen();
  initEndgameScreen();
  initTagsScreen();
  initQRScreen();
  showScreen("setup");
};