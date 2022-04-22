const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

try {
  mongoose.connect(process.env.MONGO_URI);
} catch (error) {
  console.log('err mongoose', error);
}

var userSchema = new mongoose.Schema({
  username: String,
});
var User = mongoose.model('User', userSchema);

var exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
  user_id: {
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  },
});
var Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const value = {
      username: username
    }
    const data = await User.create(value);
    return res.json(data);
  } catch (error) {
    return res.status(500).send(err);
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const data = await User.find();
    return res.json(data);
  } catch (error) {
    return res.status(500).send(err);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
