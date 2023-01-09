/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const { TournamentModel, TournamentStageModel } = require('./tournamentModels');

// Create
exports.createTournamentService = async (data) => TournamentModel.create({ ...data });

exports.createGroupStageService = async (data) => TournamentStageModel.create({ ...data });

// Read
exports.viewTournamentService = async (id) => TournamentModel.findOne({ id }).populate('stage');

// exports.viewGroupStage = async (id) => {
//   const groupStage = await TournamentStageModel.findOne({ tournament_id: id });
//   return { id: groupStage._id, groupings: groupStage.groupings };
// };

exports.viewAllTournamentService = async () => TournamentModel.find({}).populate('stage');

// Update
exports.updateTournamentService = async (id, tournamentData) => TournamentModel.updateOne({ _id: id }, tournamentData);

exports.updateGroupStageScoreTableService = async (stageID, groupings) => TournamentStageModel.findByIdAndUpdate({ _id: stageID }, { $set: { groupings } });

// Delete
exports.deleteTournamentService = async (id) => TournamentModel.findByIdAndRemove(id);
