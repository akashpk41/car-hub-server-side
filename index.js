// dependencies
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Car Hub Server Is Running...");
});

// ? -------------------- MongoDB -----------------------

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q4llj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db("carHub").collection("car");

    //     send all data to the client .
    app.get("/inventory", async (req, res) => {
      const result = await carCollection.find({}).toArray();
      res.send(result);
    });
  } catch (err) {
    console.log(err);
  }
}

run();
// ? -------------------- MongoDB -----------------------

app.listen(port, () => {
  console.log("Server Is Running On Port : ", port);
});
