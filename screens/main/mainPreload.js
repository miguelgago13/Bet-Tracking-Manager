const { contextBridge, ipcRenderer } = require("electron");
const globals = require("../../globals");
const Bets = require("../../models/Bets");
const Teams = require("../../models/Teams");
const Leagues = require("../../models/Leagues");
const Predicts = require("../../models/Predicts");

const bets = new Bets(globals.URI, globals.DB_NAME);
const teams = new Teams(globals.URI, globals.DB_NAME);
const leagues = new Leagues(globals.URI, globals.DB_NAME);
const predicts = new Predicts(globals.URI, globals.DB_NAME);
let gotBetCallback;
let gotBetUpdatedCallback;
let gotDeletedResultCallback;


let getBets = () => {
  console.log(`mainPreload > getBets`);

  bets.getBets().then((res) => {
    gotBetCallback(res);
  });
};

let gotBets = (callback) => {
  gotBetCallback = callback;
};

let saveBet = async (bet) => {
  console.log(
    `mainPreload > League: ${bet.league}, Home: ${bet.home}, Away: ${bet.away}, Predict: ${bet.predict}, Amount: ${bet.amount}, Odd: ${bet.odd}, Result: ${bet.result}`
  );
  try {
    // If the league was never used in a bet, add it to the leagues collection
    let league = await leagues.getLeagueByName(bet.league);
    if (!league) {
      league = await leagues.addLeague({ name: bet.league });
    }
    // If the home team was never used in a bet, add it to the teams collection
    let homeTeam = await teams.getTeamByName(bet.home);
    if (!homeTeam) {
      homeTeam = await teams.addTeam({ name: bet.home });
    }
    // If the home team was never used in a bet, add it to the teams collection
    let awayTeam = await teams.getTeamByName(bet.away);
    if (!awayTeam) {
      awayTeam = await teams.addTeam({ name: bet.away });
    }
    // If the predict was never used in a bet, add it to the predicts collection
    let predict = await predicts.getPredictByName(bet.predict);
    if (!predict) {
      predict = await predicts.addPredict({ name: bet.predict });
    }

    const savedBet = await bets.addBet(bet);
    return savedBet;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

let deleteBets = async (id) => {
  console.log(`mainPreload > Delete : ${id}`);
  
  const bet = await bets.getBetById(id);

  // For each attribute of a bet, check if it was the only bet for that attribute
  const leagueHasMultipleBets = await bets.hasMultipleBetsWithALeague(bet.league);
  const homeTeamHasMultipleBets = await bets.hasMultipleBetsWithATeam(bet.home);
  const awayTeamHasMultipleBets = await bets.hasMultipleBetsWithATeam(bet.away);
  const predictHasMultipleBets = await bets.hasMultipleBetsWithAPredict(bet.predict);
  // If it is the only bet for that attribute, delete that attribute from their own collection type
  if (!leagueHasMultipleBets) {
    await leagues.deleteLeagueByName(bet.league);
  }
  if (!homeTeamHasMultipleBets) {
    await teams.deleteTeamByName(bet.home);
  }
  if (!awayTeamHasMultipleBets) {
    await teams.deleteTeamByName(bet.away);
  }
  if (!predictHasMultipleBets) {
    await predicts.deletePredictByName(bet.predict);
  }

  bets.deleteBet(id).then((res) => {
    gotDeletedResultCallback(res);
  });
};

let gotDeletedResult = (callback) => {
  gotDeletedResultCallback = callback;
};

let updateBet = async (id, betarg) => {
  console.log(`mainPreload > upDateBet : ${id}`);

  oldBet = await bets.getBetById(id);
  if(oldBet.league != betarg.league){
    const oldLeagueHasMultipleBets = await bets.hasMultipleBetsWithALeague(oldBet.league);
    const newLeagueExists = await leagues.leagueExistsByName(betarg.league);
    // If the old bet is the only one with this league, delete league from leagues collection
    if (!oldLeagueHasMultipleBets) {
      await leagues.deleteLeagueByName(oldBet.league);
    }
    // If the old bet is the only one with this league, delete league from leagues collection
    if (!newLeagueExists) {
      await leagues.addLeague({name: betarg.league});
    }
  }
  if(oldBet.home != betarg.home){
    const oldHomeHasMultipleBets = await bets.hasMultipleBetsWithATeam(oldBet.home);
    const newHomeExists = await teams.teamExistsByName(betarg.home);
    // If the old bet is the only one with this home team, delete team from teams collection
    if (!oldHomeHasMultipleBets) {
      await teams.deleteTeamByName(oldBet.home);
    }
    // If the new bet is the first one with this home team, add team to teams colection
    if (!newHomeExists) {
      await teams.addTeam({name: betarg.home});
    }
  }
  if(oldBet.away != betarg.away){
    const oldAwayHasMultipleBets = await bets.hasMultipleBetsWithATeam(oldBet.away);
    const newAwayExists = await teams.teamExistsByName(betarg.away);
    // If the old bet is the only one with this away team, delete team from teams collection
    if (!oldAwayHasMultipleBets) {
      await teams.deleteTeamByName(oldBet.away);
    }
    // If the new bet is the first one with this away team, add team to teams colection
    if (!newAwayExists) {
      await teams.addTeam({name: betarg.away});
    }
  }
  if(oldBet.predict != betarg.predict){
    const oldPredictHasMultipleBets = await bets.hasMultipleBetsWithAPredict(oldBet.predict);
    const newPredictExists = await predicts.predictExistsByName(betarg.predict);
    // If the old bet is the only one with this away team, delete team from teams collection
    if (!oldPredictHasMultipleBets) {
      await predicts.deletePredictByName(oldBet.predict);
    }
    // If the new bet is the first one with this away team, add team to teams colection
    if (!newPredictExists) {
      await predicts.addPredict({name: betarg.predict});
    }
  }

  const bet = {
    league: betarg.league,
    home: betarg.home,
    away: betarg.away,
    predict: betarg.predict,
    amount: betarg.amount,
    odd: betarg.odd,
    result: betarg.result,
  };

  bets.updateBet(id, bet).then((res) => {
    gotBetUpdatedCallback(res);
  });
};

let gotBetUpdatedResult = (callback) => {
  gotBetUpdatedCallback = callback;
};

let getLeagueNames = async () => {
  try {
    const leagueNames = await leagues.getLeagueNames(); // Assuming leagues is available
    return leagueNames;
  } catch (error) {
    console.error("Error fetching league names:", error);
    return [];
  }
};

contextBridge.exposeInMainWorld("api", {
  getBets,
  gotBets,
  saveBet,
  updateBet,
  getLeagueNames,
  gotBetUpdatedResult,
  gotDeletedResult,
  deleteBets,
});