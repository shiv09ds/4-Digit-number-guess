(() => {
  // Elements
  const rulesBtn = document.getElementById("rulesBtn");
  const rulesPanel = document.getElementById("rulesPanel");
  const guessInput = document.getElementById("guessInput");
  const checkBtn = document.getElementById("checkBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const triesLeft = document.getElementById("triesLeft");

  const resultPanel = document.getElementById("resultPanel");
  const resultTitle = document.getElementById("resultTitle");
  const resultMessage = document.getElementById("resultMessage");
  const playAgainBtn = document.getElementById("playAgainBtn");

  const panel = document.querySelector(".panel");

  let secret = "";
  let attempts = 0;
  const maxAttempts = 10;

  // generate a 4-digit secret (1000 - 9999)
  function generateSecret() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  // update check button enable state
  function updateCheckState() {
    if (guessInput.value.length === 4 && attempts < maxAttempts) {
      checkBtn.disabled = false;
    } else {
      checkBtn.disabled = true;
    }
  }

  // reset UI and variables
  function resetGame() {
    secret = generateSecret();
    attempts = 0;
    triesLeft.textContent = `Attempts left: ${maxAttempts}`;
    guessInput.value = "";
    // reset boxes and secret boxes
    for (let i = 0; i < 4; i++) {
      const box = document.getElementById("box" + i);
      const sec = document.getElementById("secret" + i);
      if (box) { box.textContent = ""; box.className = "digit-box"; }
      if (sec) { sec.textContent = "*"; sec.className = "secret-box"; }
    }
    // hide result
    resultPanel.classList.remove("active", "win", "lose");
    resultPanel.setAttribute("aria-hidden", "true");
    // enable keys and buttons
    enableKeyboard(true);
    updateCheckState();
    // console.log for debugging
    console.log("New Secret:", secret);
  }

  // show result panel (win/lose)
  function showResult(isWin) {
    resultPanel.classList.remove("win", "lose");
    if (isWin) {
      resultTitle.textContent = "🎉 Congratulations!";
      resultMessage.textContent = "You guessed the number correctly!";
      resultPanel.classList.add("win");
    } else {
      resultTitle.textContent = "❌ Game Over!";
      resultMessage.textContent = `The number was ${secret}`;
      resultPanel.classList.add("lose");
    }
    resultPanel.classList.add("active");
    resultPanel.setAttribute("aria-hidden", "false");
    // disable further input
    enableKeyboard(false);
    checkBtn.disabled = true;
  }

  // enable/disable keyboard keys
  function enableKeyboard(shouldEnable) {
    const keys = document.querySelectorAll(".keyboard .key-btn");
    keys.forEach(k => {
      if (shouldEnable) {
        k.removeAttribute("disabled");
        k.classList.remove("disabled");
      } else {
        k.setAttribute("disabled", "true");
        k.classList.add("disabled");
      }
    });
  }

  // tiny visual shake when invalid attempt
  function invalidShake() {
    guessInput.classList.add("input-shake");
    setTimeout(() => guessInput.classList.remove("input-shake"), 360);
  }

  // check the guess
  function checkGuess() {
    if (attempts >= maxAttempts) return;

    const guess = guessInput.value.trim();
    if (!/^\d{4}$/.test(guess)) {
      // not enough digits — shake input
      invalidShake();
      return;
    }

    attempts++;
    // reveal guess into digit boxes and color them
    const secretArr = secret.split("");
    const guessArr = guess.split("");

    for (let i = 0; i < 4; i++) {
      const box = document.getElementById("box" + i);
      box.textContent = guessArr[i];
      box.className = "digit-box"; // reset classes
      if (guessArr[i] === secretArr[i]) {
        box.classList.add("green");
        const secBox = document.getElementById("secret" + i);
        secBox.textContent = secretArr[i];
        secBox.classList.add("green");
      } else if (secretArr.includes(guessArr[i])) {
        box.classList.add("yellow");
      } else {
        box.classList.add("red");
      }
    }

    triesLeft.textContent = `Attempts left: ${Math.max(0, maxAttempts - attempts)}`;
    updateCheckState();

    if (guess === secret) {
      // win
      setTimeout(() => showResult(true), 260);
      attempts = maxAttempts; // lock further attempts
      return;
    }

    if (attempts >= maxAttempts) {
      // reveal secret in red and show lose panel
      for (let i = 0; i < 4; i++) {
        const secBox = document.getElementById("secret" + i);
        secBox.textContent = secret[i];
        secBox.classList.add("red");
      }
      setTimeout(() => showResult(false), 360);
    }
  }

  // build virtual keyboard (phone-like layout)
  function buildKeyboard() {
    const keyboard = document.createElement("div");
    keyboard.className = "keyboard";

    // layout array for phone-like order:
    const keys = [
      "1","2","3",
      "4","5","6",
      "7","8","9",
      "del","0","enter"
    ];

    keys.forEach(k => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key-btn";
      if (k === "del") {
        btn.textContent = "⌫";
        btn.classList.add("special");
        btn.title = "Delete";
        btn.addEventListener("click", () => {
          if (guessInput.value.length > 0) {
            guessInput.value = guessInput.value.slice(0, -1);
            updateCheckState();
          }
        });
      } else if (k === "enter") {
        btn.textContent = "↵";
        btn.classList.add("special");
        btn.title = "Enter / Check";
        btn.addEventListener("click", () => {
          // small glow
          btn.classList.add("glow");
          setTimeout(() => btn.classList.remove("glow"), 220);
          checkGuess();
        });
      } else {
        btn.textContent = k;
        btn.addEventListener("click", () => {
          if (guessInput.value.length < 4 && attempts < maxAttempts) {
            guessInput.value += k;
            // visual glow
            btn.classList.add("glow");
            setTimeout(() => btn.classList.remove("glow"), 260);
            updateCheckState();
          }
        });
      }
      keyboard.appendChild(btn);
    });

    // insert keyboard just below tries text
    const triesEl = document.getElementById("triesLeft");
    panel.appendChild(keyboard);
  }

  // Events
  checkBtn.addEventListener("click", checkGuess);
  refreshBtn.addEventListener("click", resetGame);
  rulesBtn.addEventListener("click", () => rulesPanel.classList.toggle("active"));
  playAgainBtn.addEventListener("click", () => {
    resetGame();
  });

  // Initialize
  buildKeyboard();
  resetGame();

})();