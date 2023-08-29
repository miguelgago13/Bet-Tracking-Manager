const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

class Predicts {
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
    const predicts = db.collection("predicts");
    return predicts;
  };

  getPredicts = async () => {
    console.log(`Predicts.js > getPredicts`);

    const predicts = await this.#getCollection();
    let res = await predicts.find({}).toArray();

    res = res.map((predict) => {
      return {
        id: predict._id.toHexString(),
        name: predict.name,
      };
    });
    console.log(res);
    return res;
  };

  getPredictNames = async () => {
    console.log(`Predicts.js > getPredictNames`);
  
    const predicts = await this.#getCollection();
    let res = await predicts.find({}).toArray();
  
    res = res.map((predict) => predict.name);
    res = res.sort();
    console.log(res);
    return res;
  };

  addPredict = async (predict) => {
    console.log(`Predict.js > addPredict: ${predict}`);

    const predicts = await this.#getCollection();
    return await predicts.insertOne(predict);
  };

  updatePredict = async (id, predict) => {
    console.log(`Predict.js > updatePredict: ${predict}`);
 
    const predicts = await this.#getCollection();
    return await predicts.updateOne({ _id: new ObjectId(id) }, { $set: predict });
  };

  deletePredict = async (id) => {
    console.log(`Predict.js > deletePredict: ${id}`);

    const predicts = await this.#getCollection();
    const res = await predicts.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  };

  async deletePredictByName(name) {
    console.log(`Predict.js > deletePredict: ${name}`);
    const predicts = await this.#getCollection();
    const res = await predicts.deleteOne({ name });
    return res.deletedCount > 0;
  }
  
  async predictExistsByName(name) {
    console.log(`Predict.js > teamExistsByName: ${name}`);
    const predicts = await this.#getCollection();
    const predict = await predicts.findOne({ name });
    return predict !== null;
  }
  
  async addPredict(teamData) {
    console.log(`Predict.js > addPredict: ${teamData}`);
    const predicts = await this.#getCollection();
    const result = await predicts.insertOne(teamData);
    return result.ops[0];
  }
  
  async getPredictByName(name) {
    console.log(`Predict.js > getPredictByName: ${name}`);
    const predicts = await this.#getCollection();
    const predict = await predicts.findOne({ name });
    return predict;
  }
}

module.exports = Predicts;
