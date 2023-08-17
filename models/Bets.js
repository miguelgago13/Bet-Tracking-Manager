const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

class Bets {
  dbName;
  client;

  constructor(uri, dbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(this.uri);
  }
  
  #getCollection = async () => {
    await this.client.connect();
    const db = this.client.db(this.dbName);
    const bets = db.collection("bets");
    return bets;
  };

  getBets = async () => {
    console.log(`Bets.js > getBets`);

    const bets = await this.#getCollection();
    let res = await bets.find({}).toArray();

    res = res.map((bet) => {
      return {
        id: bet._id.toHexString(),
        league: bet.league,
        home: bet.home,
        away: bet.away,
        predict: bet.predict,
        amount: bet.amount,
        odd: bet.odd,
        result: bet.result,
      };
    });
    console.log(res);
    return res;
  };

  getBetsByName = async (teamName) => {
    console.log(`Bets.js > getBetsByName for: ${teamName}`);

    const bets = await this.#getCollection();
    let res = await bets.find({$or: [{ home: teamName }, { away: teamName }],}).toArray();

    res = res.map((bet) => {
      return {
        id: bet._id.toHexString(),
        league: bet.league,
        home: bet.home,
        away: bet.away,
        predict: bet.predict,
        amount: bet.amount,
        odd: bet.odd,
        result: bet.result,
      };
    });
    console.log(res);
    return res;
  };

  getBetById = async (id) => {
    console.log(`Bets.js > getBetsById for id: ${id}`);

    const bets = await this.#getCollection();
    let bet = await bets.findOne({_id: new ObjectId(id)});

    if (bet) {
      return {
        id: bet._id.toHexString(),
        league: bet.league,
        home: bet.home,
        away: bet.away,
        predict: bet.predict,
        amount: bet.amount,
        odd: bet.odd,
        result: bet.result,
      };
    } else {
      return null; // Return null if the bet with the given id is not found
    }
  };

  addBet = async (bet) => {
    console.log(`Bet.js > addBet: ${bet}`);

    const bets = await this.#getCollection();
    return await bets.insertOne(bet);
  };

  updateBet = async (id, bet) => {
    console.log(`Bet.js > updateBet: ${bet}`);
 
    const bets = await this.#getCollection();
    return await bets.updateOne({ _id: new ObjectId(id) }, { $set: bet });
  };

  deleteBet = async (id) => {
    console.log(`Bet.js > deleteBet: ${id}`);

    const bets = await this.#getCollection();
    const res = await bets.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  };

  async hasMultipleBetsWithALeague(leagueName) {
    console.log(`Bets.js > hasMultipleBetsWithLeague for league: ${leagueName}`);

    const bets = await this.#getCollection();
    const count = await bets.countDocuments({ league: leagueName});

    return count > 1;
  }

  async hasMultipleBetsWithATeam(teamName) {
    console.log(`Bets.js > hasMultipleBetsWithTeam for team: ${teamName}`);

    const bets = await this.#getCollection();
    const count = await bets.countDocuments({
      $or: [{ home: teamName }, { away: teamName }],
    });

    return count > 1;
  }

  async hasMultipleBetsWithAPredict(predictName) {
    console.log(`Bets.js > hasMultipleBetsWithPredict for predict: ${predictName}`);

    const bets = await this.#getCollection();
    const count = await bets.countDocuments({predict: predictName});

    return count > 1;
  }
}

module.exports = Bets;
