const mongoose = require('mongoose');

const tournamentStageModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  tournament: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TournamentModel',
    }],
  },

  groupings: {
    type: Object,
    required: true,
    default: {},
  },

  history: {
    type: Object,
    default: {},
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const TournamentStageModel = mongoose.model('TournamentStageModel', tournamentStageModel);
exports.TournamentStageModel = TournamentStageModel;

const tournamentModel = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v) => v.trim() !== '',
      message: (props) => `${props} is not a valid name`,
    },
  },

  description: {
    type: String,
  },

  teams: {
    type: [String],
    required: true,
    default: [],
    validate: {
      validator: (v) => v.length % 2 === 0,
      message: (props) => `${props} is not a valid team number`,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

exports.TournamentModel = mongoose.model('TournamentModel', tournamentModel);
