const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

class Teams {
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
    const teams = db.collection("teams");
    return teams;
  };

  getTeams = async () => {
    console.log(`Teams.js > getTeams`);

    const teams = await this.#getCollection();
    let res = await teams.find({}).toArray();

    res = res.map((team) => {
      return {
        id: team._id.toHexString(),
        name: team.name,
      };
    });
    console.log(res);
    return res;
  };

  getTeamNames = async () => {
    console.log(`Teams.js > getTeamNames`);
  
    const teams = await this.#getCollection();
    let res = await teams.find({}).toArray();
  
    res = res.map((team) => team.name);
    res = res.sort();
    console.log(res);
    return res;
  };

  addTeam = async (team) => {
    console.log(`Team.js > addTeam: ${team}`);

    const teams = await this.#getCollection();
    return await teams.insertOne(team);
  };

  updateTeam = async (id, team) => {
    console.log(`Team.js > updateTeam: ${team}`);
 
    const teams = await this.#getCollection();
    return await teams.updateOne({ _id: new ObjectId(id) }, { $set: team });
  };

  deleteTeam = async (id) => {
    console.log(`Team.js > deleteTeam: ${id}`);

    const teams = await this.#getCollection();
    const res = await teams.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  };

  async deleteTeamByName(name) {
    console.log(`Team.js > deleteTeam: ${name}`);
    const teams = await this.#getCollection();
    const res = await teams.deleteOne({ name });
    return res.deletedCount > 0;
  }
  
  async teamExistsByName(name) {
    console.log(`Team.js > teamExistsByName: ${name}`);
    const teams = await this.#getCollection();
    const team = await teams.findOne({ name });
    return team !== null;
  }
  
  async addTeam(teamData) {
    console.log(`Team.js > addTeam: ${teamData}`);
    const teams = await this.#getCollection();
    const result = await teams.insertOne(teamData);
    return result.ops[0];
  }
  
  async getTeamByName(name) {
    console.log(`Team.js > getTeamByName: ${name}`);
    const teams = await this.#getCollection();
    const team = await teams.findOne({ name });
    return team;
  }
}

module.exports = Teams;
