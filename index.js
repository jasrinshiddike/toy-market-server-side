const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pvq6u78.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const toyCollection = client.db('toyMarket').collection('sellerService');


    //console.log(result);

    app.get('/get-toys/:text', async (req, res) => {
      const indexKeys = { toy_name: 1 }; // Replace field1 and field2 with your actual field names
      const indexOptions = { name: "toyName" }; // Replace index_name with the desired index name
      const result2 = await toyCollection.createIndex(indexKeys, indexOptions);
      const searchToy = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { toy_name: { $regex: searchToy, $options: "i" } }
          ],
        })
        .toArray();
      res.send(result);
    });

    app.get('/all-toys', async (req, res) => {
      const result = await toyCollection.find({}).limit(20).toArray();;
      res.send(result);
    })



    app.get('/all-toys-by-category/:text', async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == "regular car" || req.params.text == "police car" || req.params.text == "mini truck") {
        const result = await toyCollection.find({ sub_category: req.params.text }).toArray();
        return res.send(result);
      }
      const result = await toyCollection.find({}).toArray();
      res.send(result);
    })

    app.get('/all-toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }


      const result = await toyCollection.findOne(query);
      res.send(result);
    })


    app.post('/post-toy', async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      //console.log(body);
      const result = await toyCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "Please try again later",
          status: false,
        });
      }
    });

    app.get('/my-toys/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await toyCollection.find({ seller_email: req.params.email }).toArray();
      res.send(result);
    })

    app.get('/sort-toys', async (req, res) => {
      const {sort, email} = req.query;
      let query = {};
      if(email){
        query={seller_email: email}
      }
      //console.log(sort);
      const result = await toyCollection.find(query).sort({
        price: sort=== 'dec'? -1: 1
      }).toArray();
      res.send(result);

    })

    app.get('/get-my-toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const result = await toyCollection.findOne(query);
      res.send(result);
    })

    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: body.price,
          available_quantity: body.available_quantity,
          detail_description: body.detail_description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete('/delete/:id', async (req, res) => {
      //console.log("hello")
      const id = req.params.id;
      //console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('toys are running')
})

app.listen(port, () => {
  console.log(`Toy Market Server is running on port ${port}`)
})