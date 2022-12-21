const express = require('express');
const {
  createTournament,
  createGroupStage,
  getGroupStage,
  getTournaments,
  updateTournament,
  getGroupStageTable,
  getGroupStageTables,
  createStageScore,
} = require('./tournamentController');

const router = express.Router();

router.post('/create', createTournament);
router.patch('/update', updateTournament);

router.post('/group-stage', createGroupStage);
router.get('/group-stage', createGroupStage);
router.get('/group-stage/:id', getGroupStage);

router.post('/group-stage-table', getGroupStageTable);
router.post('/group-stage-tables', getGroupStageTables);

router.patch('/group-stage-scores', createStageScore);

router.get('/', getTournaments);

module.exports = router;
