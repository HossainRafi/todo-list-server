const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ml95k.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const taskCollection = client.db("todo").collection("taskCollection");

    app.get("/task", async (req, res) => {
      const query = { completed: false };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/completed", async (req, res) => {
      const query = { completed: true };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });
    app.put("/task/:id", async (req, res) => {
      const id = req.params.id;
      const task = req.body.task;
      console.log(task);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          task,
        },
      };
      const result = await taskCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.put("/completed/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          completed: true,
        },
      };
      const result = await taskCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.post("/task", async (req, res) => {
      const doc = req.body;
      const result = await taskCollection.insertOne(doc);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// ===========================================================================
app.get("/", (req, res) => {
  res.send("welcome to todo-app");
});

app.listen(port, () => {
  console.log("listing to port", port);
});
