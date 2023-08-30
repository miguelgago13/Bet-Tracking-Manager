var leagueOptions = [], teamOptions = [], predictOptions = [];
var leagueInput = document.getElementById("league-input");
var homeInput = document.getElementById("home-input");
var awayInput = document.getElementById("away-input");
var predictInput = document.getElementById("predict-input");
var amountInput = document.getElementById("amount-input");
var oddInput = document.getElementById("odd-input");
const inputFields = document.querySelectorAll(".input");

function updateList(input, options) {
  const inputValue = input.value;
  const filtered = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const displayed = filtered.slice(0, 3);
  const html = displayed.map(option => `<li>${option}</li>`).join("");
  if (input === leagueInput) document.getElementById("leagues-list").innerHTML = html;
  else if (input === homeInput) document.getElementById("home-list").innerHTML = html;
  else if (input === awayInput) document.getElementById("away-list").innerHTML = html;
  else if (input === predictInput) document.getElementById("predicts-list").innerHTML = html;
  return html;
}

function updateLists() {
  updateList(leagueInput, leagueOptions);
  updateList(homeInput, teamOptions);
  updateList(awayInput, teamOptions);
  updateList(predictInput, predictOptions);
}

window.addEventListener("load", async () => {
  //Event handlers
  leagueOptions = await window.api.getLeagueNames();
  teamOptions = await window.api.getTeamNames();
  predictOptions = await window.api.getPredictNames();


  setupDropdown(leagueInput, document.getElementById("leagues-list"), leagueOptions);
  setupDropdown(homeInput, document.getElementById("home-list"), teamOptions);
  setupDropdown(awayInput, document.getElementById("away-list"), teamOptions);
  setupDropdown(predictInput, document.getElementById("predicts-list"), predictOptions);

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
  updateLists();
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

  const league = leagueInput.value;
  const home = homeInput.value;
  const away = awayInput.value;
  const predict = predictInput.value;
  const amount = amountInput.value;
  const odd = oddInput.value;
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
  const league = leagueInput;
  const home = homeInput;
  const away = awayInput;
  const predict = predictInput;
  const amount = amountInput;
  const odd = oddInput;
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
  teamOptions = await window.api.getTeamNames();
  predictOptions = await window.api.getPredictNames();
  updateLists();
  resetAllCharacterCountElements();
};

function Delete(betId) {
  console.log(`mainView > Delete : ${betId}`);
  window.api.deleteBets(betId);
}

function Edit(betId) {
  const betFound = betData.find((bet) => bet.id === betId);

  const inputId = document.getElementById("betId");
  const league = leagueInput;
  const home = homeInput;
  const away = awayInput;
  const predict = predictInput;
  const amount = amountInput;
  const odd = oddInput;
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

function resetCharacterCountElement(inputField) {
  const maxLength = parseInt(inputField.getAttribute("maxlength"));
  const remainingChars = maxLength;

  // Navigate to the parent container and find the char-count element
  const parentContainer = inputField.closest(".field");
  const charCountElement = parentContainer.querySelector(".char-count");
  charCountElement.textContent = `${remainingChars} characters remaining`;
  charCountElement.style.display = "none";
}

// Reset character count element for all input fields
function resetAllCharacterCountElements() {
  inputFields.forEach((input) => {
    resetCharacterCountElement(input);
  });
}

// Add an event listener to each input field to track character count and focus events

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

function setupDropdown(input, dropdown, options) {
  input.addEventListener("focus", function () {
    updateList(input, options);
    dropdown.style.display = "block";
  });

  input.addEventListener("input", function () {
    const html = updateList(input, options);
    dropdown.innerHTML = html;
    dropdown.style.display = "block";
  });

  dropdown.addEventListener("click", function (event) {
    const clickedItem = event.target;
    if (clickedItem.tagName === "LI") {
      input.value = clickedItem.textContent;
      dropdown.style.display = "none";
    }
  });

  window.addEventListener("click", function (event) {
    if (event.target !== input && event.target !== dropdown) {
      dropdown.style.display = "none";
    }
  });
}
