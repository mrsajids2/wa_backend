const mongoose = require("mongoose");

exports.dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("DB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1); // Optionally exit the process if DB connection fails
  }
};
