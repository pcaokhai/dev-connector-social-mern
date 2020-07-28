const express = require('express');
const chalk = require('chalk');
const app = express();
const path = require('path');

const connectDB = require('./config/db');

// connect database
connectDB();

app.use(express.json());

// router
app.use('/api/users', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));


// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(chalk.blue.inverse(`Server is up on port ${port}`))
})