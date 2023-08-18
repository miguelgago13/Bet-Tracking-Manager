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
      <td>${bet.result}</td>
      <td><button class="button ${bet.result === "Green" ? "is-primary" : "has-background-grey-light"}" onclick="Green('${bet.id}')">Green</button></td>
      <td><button class="button ${bet.result === "Red" ? "is-danger" : "has-background-grey-light"}" onclick="Red('${bet.id}')">Red</button></td>
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

const btnSaveClick = async (event) => {
  console.log("Save button clicked");
  event.preventDefault();

  const league = document.getElementById("league").value;
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
  const league = document.getElementById("league");
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
  result.value = "";

  window.api.getBets();
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
  const league = document.getElementById("league");
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

function Green(betId){
  const betFound = betData.find((bet) => bet.id === betId);
  betFound.result = "Green";
  window.api.updateBet(betId, betFound);
  resetForm();
  // Change Green button from grey color to green color
  const greenButton = document.querySelector(`[onclick="Green('${betId}')"]`);
  greenButton.classList.remove("has-background-grey-light");
  greenButton.classList.add("is-primary");
}

function Red(betId){
  const betFound = betData.find((bet) => bet.id === betId);
  betFound.result = "Red";
  window.api.updateBet(betId, betFound);
  resetForm();
}

const gotBetUpdatedResult = (result) => {
  if (result) window.api.getBets();
};

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
  }
});
// Save Bet Button
const btnSaveBet = document.getElementById("btnSave");
btnSaveBet.addEventListener("click", function() {
  addBetContainer.style.display = "none";
  btnAddBet.textContent = "Add Bet";
});

