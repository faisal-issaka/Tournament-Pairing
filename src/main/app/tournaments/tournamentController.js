const {
  createTournamentService,
  createGroupStageService,
  viewGroupStage,
  viewAllTournamentService,
  updateTournamentService,
  viewGroupStageTable,
  updateGroupStageScoreTableService,
} = require('./tournamentService');

const {
  successResponseWithData,
  errorResponse,
} = require('../../utility/apiResponse');

exports.createTournament = async (req, res) => {
  const data = req.body;
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
  try {
    const response = await createGroupStageService(data);
    const message = 'Group created successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.createStageScore = async (req, res) => {
  const data = req.body;

  try {
    const response = await updateGroupStageScoreTableService(data);
    console.log(response);
    const message = 'Score Table updated successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.getGroupStage = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await viewGroupStage(id);
    const message = 'Group Stage retrieved successfully';
    return successResponseWithData(res, message, response);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.getGroupStageTable = async (req, res) => {
  const { tournamentID, stageID, tableID } = req.body;
  try {
    const stage = await viewGroupStageTable(tournamentID, stageID);
    const stageTable = stage?.groupings[tableID];
    const message = 'Group Stage Table retrieved successfully';
    return successResponseWithData(res, message, stageTable);
  } catch (error) {
    return errorResponse(res, error.errors);
  }
};

exports.getGroupStageTables = async (req, res) => {
  const { tournamentID, stageID } = req.body;
  try {
    const stage = await viewGroupStageTable(tournamentID, stageID);
    const stageTable = stage?.groupings;
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
