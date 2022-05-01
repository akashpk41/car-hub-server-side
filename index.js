// dependencies
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

// ! verify jwt token

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorize Access " });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    console.log("decoded: ", decoded);
  });

  next();
}

// ! -----------

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

    //! secure api with  json web token.
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // ! Create a single item details
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      const result = await carCollection.insertOne(newItem);
      res.send(result);
    });

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

    // ! send item data by filter email address.
    app.get("/my-items", verifyJWT, async (req, res) => {
      // ! jwt auth code
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const result = await carCollection.find({ email }).toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access..." });
      }
    });

    // ! delete a single item from database .
    app.delete("/manage-inventory/:id", async (req, res) => {
      const id = req.params.id;
      const find = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(find);
      res.send(result);
    });

    // ! delete my items data from database .
    app.delete("/my-items/:id", async (req, res) => {
      const id = req.params.id;
      const find = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(find);
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
