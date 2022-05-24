const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    // Get All the products data from mongodb server
    app.get('/product', async(req, res) =>{
        const query = {};
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
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