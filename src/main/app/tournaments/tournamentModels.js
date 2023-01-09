const mongoose = require('mongoose');

const tournamentStageModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  groupings: {
    type: Object,
    required: true,
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

  stages: {
    type: [],
    required: true,
  },

  stage: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TournamentStageModel',
    }],
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

  history: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TournamentStageModel',
    }],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

exports.TournamentModel = mongoose.model('TournamentModel', tournamentModel);
