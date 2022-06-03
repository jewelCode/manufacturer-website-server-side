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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ messege: 'UnAuthorized Access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ messege: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    await client.connect();
    const productsCollection = client.db('manufacturer_website').collection('products');
    const usersCollection = client.db('manufacturer_website').collection('users');
    const reviewsCollection = client.db('manufacturer_website').collection('reviews');
    const orderCollection = client.db('manufacturer_website').collection('orders');

    // Get All the products data from mongodb server
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    })

    // Add Your Product

    app.post('/product', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    })


    // Load Single Prodcut from database
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    })

    // User Admin Role

    app.put('/user/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await usersCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
      else {
        res.status(403).send({ messege: 'forbidden' });
      }

    })

    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin });
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


    app.get('/user', async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
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
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    // Order Post
    // Order Post

    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })

    app.get('/order', async (req, res) => {
      const orders = await orderCollection.find().toArray();
      res.send(orders);
    })


    // Delete order
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // get individual order
    app.get('/order', async (req, res) => {
      const useremail = req.query.useremail;
      const query = { useremail: useremail }
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
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