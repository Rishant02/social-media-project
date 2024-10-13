const mongoose = require("mongoose");
const locals = require("./locals");

async function connectDB() {
  try {
    const conn = await mongoose.connect(locals.MONGO_URI);
    console.log(
      `MongoDB Connected: ${conn.connection.host} - ${conn.connection.name}`
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

module.exports = connectDB;
