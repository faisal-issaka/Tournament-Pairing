const {
  createTournamentService,
  createGroupStageService,
  viewAllTournamentService,
  updateTournamentService,
  // viewGroupStageTable,
  // viewGroupStageSingleTable,
  updateGroupStageScoreTableService,
  viewTournamentService,
  // viewTournamentService,
} = require('./tournamentService');

const {
  successResponseWithData,
  errorResponse,
  successResponse,
} = require('../../utility/apiResponse');
const {
  cleanScoreSheet,
  allMatchesPlayed,
  generateNextGroupPairing,
  generateGroupings,
  getQualifiedTeams,
  isFinals,
  generateGroupingsTable,
  // getVrsTableID,
  // allMatchesPlayed,
} = require('./tournamentHelpers');

exports.createTournament = async (req, res) => {
  const data = req.body;
  const defaultStages = ['Group Stages', 'Round of 16', 'Quarter Final', 'Semi-final', 'Final'];
  data.stages = data.stages || defaultStages;
  try {
    const response = await createTournamentService(data);
    const message = 'Tournament created successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.createGroupStage = async (req, res) => {
  const data = req.body;
  const {
    tournamentID,
    teamsPerGroup,
    mode,
    name,
  } = { ...data };

  let groupings = {};

  if (mode === 'automatic') {
    groupings = await generateGroupings(tournamentID, teamsPerGroup);
  } else {
    groupings = generateGroupingsTable(data.teamDivisions);
  }
  const dataObj = { name, groupings };

  try {
    const response = await createGroupStageService(dataObj);
    await updateTournamentService(tournamentID, { stage: response.id });
    const message = 'Group created successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.createStageScore = async (req, res) => {
  const data = req.body;
  try {
    const {
      tournamentID,
      tableID,
      scoreSheet,
    } = data;

    const tournament = await viewTournamentService(tournamentID);
    const groupStage = { id: tournament.stage[0].id, groupings: tournament.stage[0].groupings };
    const cleanedScoreSheet = cleanScoreSheet(tableID, scoreSheet, groupStage);
    const groupings = { ...groupStage?.groupings };
    groupings[tableID] = cleanedScoreSheet;

    await updateGroupStageScoreTableService(groupStage.id, groupings);
    let message = 'Score Table updated successfully';
    if (allMatchesPlayed(groupings)) {
      if (isFinals(groupings)) {
        const winner = getQualifiedTeams(cleanedScoreSheet.scoreTable)[0];
        message = `${winner} won the tournament`;
        return successResponse(res, message);
      }
      const nextStageGroupings = await generateNextGroupPairing(groupings);
      const nextStageName = tournament.stages[(tournament?.history?.length || 0) + 1];
      const nextStage = await createGroupStageService({
        name: nextStageName,
        groupings: nextStageGroupings,
      });
      await updateTournamentService(
        tournament.id,
        { stage: [nextStage.id], history: [...tournament.history, tournament.stage[0].id] },
      );
      message = 'All Fixtures are completed, the next stage has been created';
    }
    const response = await viewTournamentService(tournamentID);
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.getGroupStage = async (req, res) => {
  const { id } = req.params;
  try {
    const tournament = await viewTournamentService(id);
    const response = { id: tournament.id, groupings: tournament.groupings };
    const message = 'Group Stage retrieved successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.getGroupStageTable = async (req, res) => {
  const { tournamentID, tableID } = req.body;
  try {
    const tournament = await viewTournamentService(tournamentID);
    const response = tournament.stage[0].groupings[tableID];
    const message = 'Group Stage Table retrieved successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.getGroupStageTables = async (req, res) => {
  const { tournamentID } = req.body;
  try {
    const tournament = await viewTournamentService(tournamentID);
    const stageTable = tournament.stage[0].groupings;
    const message = 'Group Stage Table retrieved successfully';
    return successResponseWithData(res, message, stageTable);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.getTournaments = async (req, res) => {
  try {
    const response = await viewAllTournamentService();
    const message = 'Group Stage retrieved successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.updateTournament = async (req, res) => {
  const { id, ...data } = req.body;
  try {
    const response = await updateTournamentService(id, data);
    const message = 'Tournament updated successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};
