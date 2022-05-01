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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    // ! Create a single item details
    app.post('/inventory',async (req, res)=>{
      const newItem = req.body;
      const result = await carCollection.insertOne(newItem)
      res.send(result)
    })

    //!     send all data to the client .
    app.get("/inventory", async (req, res) => {
      const result = await carCollection.find({}).toArray();
      res.send(result);
    });

    //     ! send single data to the client
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const find = { _id: ObjectId(id) };
      const result = await carCollection.findOne(find);
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
