window.addEventListener("load", () => {
  //Event handlers
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

  const leagueInput = document.getElementById("leagueInput");
  const leagueOptions = document.getElementById("leagueOptions");

  let allLeagueOptions = []; // To store all league options fetched from the API

  // Fetch league names from the API and populate the datalist
  async function populateLeagueOptions() {
    try {
      const leagueNames = await window.api.getLeagueNames();
      const leagueOptions = document.getElementById("leagueOptions");
      allLeagueOptions = leagueNames;
      leagueOptions.innerHTML = ""; // Clear existing options
      leagueNames.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        leagueOptions.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching league names:", error);
    }
  }

  // Add an input event listener to filter the options based on user input
  leagueInput.addEventListener("input", () => {
    const inputText = leagueInput.value.toLowerCase();
    const filteredOptions = allLeagueOptions.filter((name) =>
      name.toLowerCase().startsWith(inputText)
    );
    leagueOptions.innerHTML = ""; // Clear existing options
    filteredOptions.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      leagueOptions.appendChild(option);
    });
  });
  populateLeagueOptions(); // Populate options when the page loads
});

let betData = {};

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

const btnGetClick = (event) => {
  console.log("Get button clicked");
  event.preventDefault();

  window.api.getBets();
};
let allLeagueOptions = []; 
async function refreshLeagueOptions() {
  try {
    const leagueNames = await window.api.getLeagueNames();
    const leagueOptions = document.getElementById("leagueOptions");
    allLeagueOptions = leagueNames;
    leagueOptions.innerHTML = ""; // Clear existing options
    leagueNames.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      leagueOptions.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching league names:", error);
  }
}

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
    // setFocusOnInput('league');
  } catch (error) {
    console.error(error);
  }
};

// Helper function to reset the form fields
const resetForm = () => {
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
  refreshLeagueOptions();
};

const setFocusOnInput = (inputId) => {
  const inputElement = document.getElementById(inputId);
  if (inputElement) {
    inputElement.focus();
  }
};

const gotDeletedResult = (result) => {
  if (result) {
    // alert("Record deleted");
    resetForm();
    //setFocusOnInput('league');
  }
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

// Add an event listener to each input field to track character count and focus events
const inputFields = document.querySelectorAll(".input");
inputFields.forEach((input, index) => {
  input.addEventListener("input", function () {
    const maxLength = parseInt(input.getAttribute("maxlength"));
    const currentLength = input.value.length;
    const remainingChars = maxLength - currentLength;

    // Display character count feedback in the sibling char-count element
    const charCountElement = input.nextElementSibling;
    charCountElement.textContent = `${remainingChars} characters remaining`;

    // Apply styling to indicate remaining characters or exceed the limit
    if (remainingChars < 0) {
      charCountElement.classList.add("has-text-danger");
    } else {
      charCountElement.classList.remove("has-text-danger");
    }
  });

  // Show character count element when the input field is focused
  input.addEventListener("focus", function () {
    const charCountElement = input.nextElementSibling;
    charCountElement.style.display = "block";
  });

  // Hide character count element when the input field loses focus
  input.addEventListener("blur", function () {
    const charCountElement = input.nextElementSibling;
    charCountElement.style.display = "none";
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

const gotBetUpdatedResult = (result) => {
  if (result) window.api.getBets();
};







