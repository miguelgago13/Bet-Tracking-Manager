const { contextBridge, ipcRenderer } = require("electron");
const globals = require("../../globals");
const Bets = require("../../models/Bets");
const Teams = require("../../models/Teams");
const Leagues = require("../../models/Leagues");

const bets = new Bets(globals.URI, globals.DB_NAME);
const teams = new Teams(globals.URI, globals.DB_NAME);
const leagues = new Leagues(globals.URI, globals.DB_NAME);
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
    let league = await leagues.getLeagueByName(bet.league);
    if (!league) {
      league = await leagues.addLeague({ name: bet.league });
    }

    let homeTeam = await teams.getTeamByName(bet.home);
    if (!homeTeam) {
      homeTeam = await teams.addTeam({ name: bet.home });
    }

    let awayTeam = await teams.getTeamByName(bet.away);
    if (!awayTeam) {
      awayTeam = await teams.addTeam({ name: bet.away });
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
  const leagueHasMultipleBets = await bets.hasMultipleBetsWithALeague(bet.league);
  const homeTeamHasMultipleBets = await bets.hasMultipleBetsWithATeam(bet.home);
  const awayTeamHasMultipleBets = await bets.hasMultipleBetsWithATeam(bet.away);
  if (!leagueHasMultipleBets) {
    await leagues.deleteLeagueByName(bet.league);
  }
  if (!homeTeamHasMultipleBets) {
    await teams.deleteTeamByName(bet.home);
  }
  if (!awayTeamHasMultipleBets) {
    await teams.deleteTeamByName(bet.away);
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

contextBridge.exposeInMainWorld("api", {
  getBets,
  gotBets,
  saveBet,
  updateBet,
  gotBetUpdatedResult,
  gotDeletedResult,
  deleteBets,
});