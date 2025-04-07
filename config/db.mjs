import { MongoClient, ServerApiVersion } from "mongodb";

// Use environment variables for security (create a .env file)
const uri =
  "mongodb+srv://sadeepalsumudu:3UgZe9wn9z35OBiZ@gamified-learning.iusmvdu.mongodb.net/?retryWrites=true&w=majority&appName=gamified-learning";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: false, // Now set to false since IP is whitelisted
  retryWrites: true,
  retryReads: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  maxPoolSize: 50,
  minPoolSize: 5,
  heartbeatFrequencyMS: 10000,
});

let database;

async function connectToDatabase() {
  if (!database) {
    try {
      await client.connect();
      database = client.db("gamified-learning");
      console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error; // Rethrow to allow handling at application level
    }
  }
  return database;
}

function getDb() {
  if (!database) {
    throw new Error(
      "Database not initialized. Call connectToDatabase() first."
    );
  }
  return database;
}

// Graceful shutdown handler
process.on("SIGINT", async () => {
  await client.close();
  process.exit();
});

export { connectToDatabase, getDb, client };
