const config = require("config");
const mongoose = require("mongoose");
const chalk = require('chalk');

db = config.get("mongoURI");

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: false
        });
        console.log(chalk.yellow.inverse('MongoDB connected...'));
    } catch (e) {
        console.log(chalk.red(e.message));
        process.exit(1)
    }
}

module.exports = connectDB;