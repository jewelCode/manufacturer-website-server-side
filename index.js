const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ktqtdpu.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db('manufacturer_website').collection('products');
    const usersCollection = client.db('manufacturer_website').collection('users');
    const reviewsCollection = client.db('manufacturer_website').collection('reviews');

    // Get All the products data from mongodb server
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    })

    // Load Single Prodcut from database
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    })

    // Users

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    })

    // Review Collection


    // Post Reviews
    app.post('/review', async (req, res) => {
        const addNewReview = req.body;
        const result = await reviewsCollection.insertOne(addNewReview);
        res.send(result);
    })
    // Get Reviews API in the UI
    
    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews= await cursor.toArray();
      res.send(reviews);
    })
  }
  finally {

  }
}

run().catch(console.dir);


// Test the API is working

app.get('/', (req, res) => {
  res.send('Hello Manufacturer')
})

app.listen(port, () => {
  console.log(`Manufacturer app listening on port ${port}`)
})