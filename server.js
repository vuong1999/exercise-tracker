const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

try {
  mongoose.connect(process.env.MONGO_URI);
} catch (error) {
  console.log('connect error', error);
}

var userSchema = new mongoose.Schema({
  username: String,
});
var User = mongoose.model('User', userSchema);

var exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date,
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
      username: username,
    };
    const data = await User.create(value);
    return res.json(data);
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(err);
  }
});

app.get('/api/users', async (req, res) => {
  try {
    let data = await User.find();
    let tmpdata = data.map((e) => {
      return {
        _id: e._id,
        username: e.username,
      };
    });
    return res.json(tmpdata);
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(err);
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const user_id = req.params._id;
    const user = await User.findById(user_id);
    if (!user) {
      return res.json({ error: 'error' });
    }

    let { description, duration, date } = req.body;
    duration = Number(duration);
    if (!date) date = new Date();
    else date = new Date(date);
    const value = {
      user_id: user_id,
      description: description,
      duration: duration,
      date: date.toDateString(),
    };
    const data = await Exercise.create(value);
    if (data) {
      const resdata = {
        _id: user._id,
        username: user.username,
        description: description,
        duration: duration,
        date: date.toDateString(),
      };
      return res.json(resdata);
    } else {
      return res.json({ error: 'error' });
    }
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const user_id = req.params._id;
    const user = await User.findById(user_id);
    if (!user) {
      return res.json({ error: 'error' });
    }

    const { from, to, limit } = req.query;
    console.log(from, to, limit);

    let log = [];
    if (from && to && limit)
      log = await Exercise.find({
        user_id: user_id,
        date: { $gte: new Date(from), $lte: new Date(to) },
      }).limit(limit);
    else if (from && to)
      log = await Exercise.find({
        user_id: user_id,
        date: { $gte: new Date(from), $lte: new Date(to) },
      });
    else if (limit) log = await Exercise.find({ user_id: user_id }).limit(limit);
    else log = await Exercise.find({ user_id: user_id });

    log = log.map((e) => {
      return {
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString(),
      };
    });
    const resdata = {
      username: user.username,
      count: log.length,
      _id: user._id,
      log: log,
    };
    return res.json(resdata);
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
