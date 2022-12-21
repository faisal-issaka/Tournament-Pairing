/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const { generateGroupings, cleanScoreSheet } = require('./tournamentHelpers');
const { TournamentModel, TournamentStageModel } = require('./tournamentModels');

// Create
exports.createTournamentService = async (data) => TournamentModel.create({ ...data });

exports.createGroupStageService = async (data) => {
  const { tournamentID, teamsPerGroup, name } = { ...data };
  const groupings = await generateGroupings(tournamentID, teamsPerGroup);
  const dataObj = {
    tournament: tournamentID,
    name,
    groupings,
  };
  const groupStage = await TournamentStageModel.create({ ...dataObj });
  return groupStage;
};

// Read
exports.viewTournamentService = async (id) => TournamentModel.findOne({ id });

exports.viewGroupStage = async (id) => {
  const groupStage = await TournamentStageModel.findOne({ tournament_id: id });
  return { id: groupStage._id, groupings: groupStage.groupings };
};

exports.viewGroupStageTable = async (tournamentID, stageID) => {
  const groupStage = await TournamentStageModel.findOne({
    tournament_id: tournamentID, id: stageID,
  });
  return { id: groupStage._id, groupings: groupStage.groupings };
};

exports.viewAllTournamentService = async () => TournamentModel.find({});

// Update
exports.updateTournamentService = async (id, tournamentData) => TournamentModel.findByIdAndUpdate(id, { $set: tournamentData });

exports.updateGroupStageScoreTableService = async (tournamentData) => {
  const {
    tournamentID,
    stageID,
    tableID,
    scoreSheet,
  } = tournamentData;

  const groupStage = await TournamentStageModel.findOne({
    tournament_id: tournamentID, id: stageID,
  });

  const table = groupStage?.groupings[tableID];
  const groupings = { ...groupStage?.groupings };
  const fixtures = groupings[tableID]?.fixtures;

  const cleanedScoreSheet = cleanScoreSheet(table, scoreSheet, fixtures);
  console.log(cleanedScoreSheet);

  groupings[tableID].scoreTable = cleanedScoreSheet.scoreTable;
  groupings[tableID].fixtures = cleanedScoreSheet.modifiedFixtures;

  return TournamentStageModel.findByIdAndUpdate({ _id: stageID }, { $set: { groupings } });
};

// Delete
exports.updateTournamentService = async (id) => TournamentModel.findByIdAndRemove(id);
