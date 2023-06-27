const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connection established");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connection;
