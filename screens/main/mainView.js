var leagueOptions = [];
var leagueInput = document.getElementById("leagueInput");

function updateLeagueList() {
  const inputValue = leagueInput.value;
  const filteredLeagues = leagueOptions.filter(league =>
    league.toLowerCase().includes(inputValue.toLowerCase())
  );

  const displayedLeagues = filteredLeagues.slice(0, 3);
  const html = displayedLeagues.map(league => `<li>${league}</li>`).join("");
  document.getElementById("leagues-list").innerHTML = html;
  return html;
}

window.addEventListener("load", async () => {
  //Event handlers
  leagueOptions = await window.api.getLeagueNames();
  //Save button
  const btnSave = document.getElementById("btnSave");
  btnSave.addEventListener("click", btnSaveClick);

  //Get button
  const btnGet = document.getElementById("btnGet");
  btnGet.addEventListener("click", btnGetClick);

  //Callbacks
  window.api.gotBets(gotBets);
  window.api.gotBetUpdatedResult(gotBetUpdatedResult);
  window.api.gotDeletedResult(gotDeletedResult);
  updateLeagueList();
});


const gotBets = (bets) => {
  betData = bets;

  console.log("view gotBets");

  var betRows = bets
    .map((bet) => {
      var res = `<tr>
      <td>${bet.league}</td>
      <td>${bet.home}</td>
      <td>${bet.away}</td>
      <td>${bet.predict}</td>
      <td>${bet.amount}</td>
      <td>${bet.odd}</td>
      <td>
        <button class="button result-button ${bet.result === "Pending" ? "has-background-grey-light" : (bet.result === "Green" ? "is-primary" : "is-danger")}" 
        onclick="toggleResult('${bet.id}')">${bet.result}
        </button>
      </td>
      <td><button class="button is-link" onclick="Delete('${bet.id}')">Delete</button></td>
      <td><button class="button is-link" onclick="Edit('${bet.id}')">Edit</button></td>
      </tr>`;

      return res;
    })
    .join("");

  var tbData = document.getElementById("tbBets");
  tbData.innerHTML = betRows;
};

const gotDeletedResult = (result) => {
  if (result) {
    // alert("Record deleted");
    resetForm();
  }
};

const gotBetUpdatedResult = (result) => {
  if (result) window.api.getBets();
};

const btnGetClick = (event) => {
  console.log("Get button clicked");
  event.preventDefault();

  window.api.getBets();
};


const btnSaveClick = async (event) => {
  console.log("Save button clicked");
  event.preventDefault();

  const league = document.getElementById("leagueInput").value;
  const home = document.getElementById("home").value;
  const away = document.getElementById("away").value;
  const predict = document.getElementById("predict").value;
  const amount = document.getElementById("amount").value;
  const odd = document.getElementById("odd").value;
  const result = document.getElementById("result").value;
  const betId = document.getElementById("betId").value;

  console.log(
    `League: ${league}, Home: ${home}, Away: ${away}, Predict: ${predict}, Amount: ${amount}, Odd: ${odd}, Result: ${result}, betId: ${betId}`
  );
  try {
    if (betId === "") {
      await window.api.saveBet({ league, home, away, predict, amount, odd, result });
      // alert("Record saved");
    } else {
      await window.api.updateBet(betId, { league, home, away, predict, amount, odd, result });
    }
    resetForm();
  } catch (error) {
    console.error(error);
  }
};

// Helper function to reset the form fields
const resetForm = async () => {
  const inputId = document.getElementById("betId");
  const league = document.getElementById("leagueInput");
  const home = document.getElementById("home");
  const away = document.getElementById("away");
  const predict = document.getElementById("predict");
  const amount = document.getElementById("amount");
  const odd = document.getElementById("odd");
  const result = document.getElementById("result");

  inputId.value = "";
  league.value = "";
  home.value = "";
  away.value = "";
  predict.value = "";
  amount.value = "";
  odd.value = "";
  result.value = "Pending";

  window.api.getBets();
  leagueOptions = await window.api.getLeagueNames();
  updateLeagueList();
};

function Delete(betId) {
  console.log(`mainView > Delete : ${betId}`);
  window.api.deleteBets(betId);
}

function Edit(betId) {
  const betFound = betData.find((bet) => bet.id === betId);

  const inputId = document.getElementById("betId");
  const league = document.getElementById("leagueInput");
  const home = document.getElementById("home");
  const away = document.getElementById("away");
  const predict = document.getElementById("predict");
  const amount = document.getElementById("amount");
  const odd = document.getElementById("odd");
  const result = document.getElementById("result");

  inputId.value = betId;
  league.value = betFound.league;
  home.value = betFound.home;
  away.value = betFound.away;
  predict.value = betFound.predict;
  amount.value = betFound.amount;
  odd.value = betFound.odd;
  result.value = betFound.result;

  // Show the addBetContainer
  addBetContainer.style.display = "block";
  btnAddBet.textContent = "Cancel";
}

// Add Bet/Cancel Button
const btnAddBet = document.getElementById("btnAddBet");
const addBetContainer = document.getElementById("addBetContainer");
btnAddBet.addEventListener("click", function() {
  if (addBetContainer.style.display === "none") {
    addBetContainer.style.display = "block";
    btnAddBet.textContent = "Cancel";
  } else {
    addBetContainer.style.display = "none";
    btnAddBet.textContent = "Add Bet";
    resetForm();
  }
});

// Save Bet Button
const btnSaveBet = document.getElementById("btnSave");
btnSaveBet.addEventListener("click", function() {
  addBetContainer.style.display = "none";
  btnAddBet.textContent = "Add Bet";
});


// Pending -> Green -> Red -> Pending -> ...
function toggleResult(betId) {
  const betFound = betData.find((bet) => bet.id === betId);
  console.log("Current bet result:", betFound.result);

  const resultStates = ["Pending", "Green", "Red"];
  const currentResultIndex = resultStates.indexOf(betFound.result);

  // Find the next result state when the Result button gets clicked
  const newResultIndex = (currentResultIndex + 1) % resultStates.length;
  const newResult = resultStates[newResultIndex];
  console.log("New bet result:", newResult);

  // Apply the new result
  betFound.result = newResult;

  console.log("Updating bet with new result:", betFound.result);
  window.api.updateBet(betId, betFound);
}

function addCharacterCounter(inputField) {
  const maxLength = parseInt(inputField.getAttribute("maxlength"));
  const currentLength = inputField.value.length;
  const remainingChars = maxLength - currentLength;

  // Navigate to the parent container and find the char-count element
  const parentContainer = inputField.closest(".field");
  const charCountElement = parentContainer.querySelector(".char-count");
  charCountElement.textContent = `${remainingChars} characters remaining`;

  // Apply styling to indicate remaining characters or exceed the limit
  if (remainingChars < 6) {
    charCountElement.classList.add("has-text-danger");
  } else {
    charCountElement.classList.remove("has-text-danger");
  }
}

function showCharacterCountElement(inputField) {
  const parentContainer = inputField.closest(".field");
  const charCountElement = parentContainer.querySelector(".char-count");
  charCountElement.style.display = "block";
}

function hideCharacterCountElement(inputField) {
  const parentContainer = inputField.closest(".field");
    const charCountElement = parentContainer.querySelector(".char-count");
    charCountElement.style.display = "none";
}

// Add an event listener to each input field to track character count and focus events
const inputFields = document.querySelectorAll(".input");
inputFields.forEach((input, index) => {
  input.addEventListener("input", function () {
    addCharacterCounter(input);
  });

  // Show character count element when the input field is focused
  input.addEventListener("focus", function () {
    showCharacterCountElement(input);
  });

  // Hide character count element when the input field loses focus
  input.addEventListener("blur", function () {
    hideCharacterCountElement(input);
  });

  // Enter key advances to the next input field
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission

      // Calculate the index of the next input field
      const nextIndex = index + 1;
      if (nextIndex < inputFields.length) {
        inputFields[nextIndex].focus(); // Shift focus to the next input field
      }
    }
  });
});

///////////////////////  LEAGUE INPUT FIELD DROPDOWN  ///////////////////////

// Add an event listener to the leagueInput to show the dropdown when clicked
leagueInput.addEventListener("focus", function () {
  updateLeagueList();
  document.getElementById("leagues-list").style.display = "block"; // Show the dropdown
});

leagueInput.addEventListener("input", function () {
  const html = updateLeagueList();
  document.getElementById("leagues-list").innerHTML = html;
});

// Add click event listeners to the dropdown items
document.getElementById("leagues-list").addEventListener("click", function (event) {
  const clickedItem = event.target;
  if (clickedItem.tagName === "LI") {
    leagueInput.value = clickedItem.textContent;
    document.getElementById("leagues-list").style.display = "none"; // Hide the dropdown after selection
  }
});

// Hide the dropdown when clicking outside of it
window.addEventListener("click", function (event) {
  if (event.target !== leagueInput && event.target !== document.getElementById("leagues-list")) {
    document.getElementById("leagues-list").style.display = "none";
  }
});