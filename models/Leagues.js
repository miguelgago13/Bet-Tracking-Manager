const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

class Leagues {
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
    const leagues = db.collection("leagues");
    return leagues;
  };

  getLeagues = async () => {
    console.log(`Leagues.js > getLeagues`);

    const leagues = await this.#getCollection();
    let res = await leagues.find({}).toArray();

    res = res.map((league) => {
      return {
        id: league._id.toHexString(),
        name: league.name,
      };
    });
    console.log(res);
    return res;
  };

  addLeague = async (league) => {
    console.log(`League.js > addLeague: ${league}`);

    const leagues = await this.#getCollection();
    return await leagues.insertOne(league);
  };

  updateLeague = async (id, league) => {
    console.log(`League.js > updateLeague: ${league}`);
 
    const leagues = await this.#getCollection();
    return await leagues.updateOne({ _id: new ObjectId(id) }, { $set: league });
  };

  deleteLeague = async (id) => {
    console.log(`League.js > deleteLeague: ${id}`);

    const leagues = await this.#getCollection();
    const res = await leagues.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  };

  async deleteLeagueByName(name) {
    console.log(`League.js > deleteLeague: ${name}`);
    const leagues = await this.#getCollection();
    const res = await leagues.deleteOne({ name });
    return res.deletedCount > 0;
  }
  
  async leagueExistsByName(name) {
    console.log(`League.js > leagueExistsByName: ${name}`);
    const leagues = await this.#getCollection();
    const league = await leagues.findOne({ name });
    return league !== null;
  }
  
  async addLeague(leagueData) {
    console.log(`League.js > addLeague: ${leagueData}`);
    const leagues = await this.#getCollection();
    const result = await leagues.insertOne(leagueData);
    return result.ops[0];
  }
  
  async getLeagueByName(name) {
    console.log(`League.js > getLeagueByName: ${name}`);
    const leagues = await this.#getCollection();
    const league = await leagues.findOne({ name });
    return league;
  }
}

module.exports = Leagues;
