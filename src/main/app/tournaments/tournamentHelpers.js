/* eslint-disable max-len */
/* eslint-disable implicit-arrow-linebreak */
const _ = require('lodash');
// const { viewTournamentService } = require('./tournamentService');
const { TournamentModel } = require('./tournamentModels');

const teamsMatcher = (teams) => {
  const shuffledTeams = _.shuffle(teams);
  const matched = [];

  shuffledTeams?.forEach((elt) => {
    shuffledTeams?.forEach((innerElt) => {
      if (elt !== innerElt) {
        const match = `${elt}-${innerElt}`;
        const matchReversed = `${innerElt}-${elt}`;
        if (!(matched.includes(match) || matched.includes(matchReversed))) {
          matched.push(match);
        }
      }
    });
  });

  return matched;
};

const generateScoreTable = (teams) => {
  const scoreTable = {};
  teams?.forEach((elt) => {
    scoreTable[elt] = {
      name: elt,
      points: 0,
      goalsAgainst: 0,
      goalsFor: 0,
    };
  });

  return scoreTable;
};

exports.generateGroupings = async (tournamentID, teamsPerGroup) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const tournament = await TournamentModel.findOne({ _id: tournamentID });
  const teamDivisions = _.chunk(_.shuffle(tournament?.teams), teamsPerGroup);

  const teamGroupings = {};
  teamDivisions?.forEach(
    (elt, index) => {
      const fixtures = teamsMatcher(elt);
      const scoreTable = generateScoreTable(elt);
      teamGroupings[letters[index]] = {
        teams: elt,
        fixtures,
        scoreTable,
      };
    },
  );
  return teamGroupings;
};

exports.cleanScoreSheet = (table, scoreSheet, fixtures) => {
  const scoreTable = { ...table?.scoreTable };
  let modifiedFixtures = fixtures;

  const getMatchPoints = (homeScore, awayScore) => {
    if (homeScore > awayScore) return 3;
    if (homeScore === awayScore) return 1;
    return 0;
  };

  const isOustandingMatch = (homeTeam, awayTeam) => (
    modifiedFixtures?.includes(`${homeTeam}-${awayTeam}`) || modifiedFixtures?.includes(`${awayTeam}-${homeTeam}`)
  );

  const removeFixture = (homeTeam, awayTeam) => {
    const originalOrder = `${homeTeam}-${awayTeam}`;
    const reverseOrder = `${awayTeam}-${homeTeam}`;

    if (modifiedFixtures?.includes(originalOrder)) {
      const updateFixtures = modifiedFixtures?.filter((elt) => elt !== originalOrder);
      return updateFixtures;
    }

    const updateFixtures = modifiedFixtures?.filter((elt) => elt !== reverseOrder);
    return updateFixtures;
  };

  scoreSheet?.forEach((teamsScore) => {
    const [homeTeamScoreData, awayTeamScoreData] = teamsScore.split(':');
    const [homeTeam, homeScore] = homeTeamScoreData.split(',');
    const [awayTeam, awayScore] = awayTeamScoreData.split(',');

    if (isOustandingMatch(homeTeam, awayTeam)) {
      scoreTable[homeTeam] = {
        ...scoreTable[homeTeam],
        points: scoreTable[homeTeam].points + getMatchPoints(Number(homeScore), Number(awayScore)),
        goalsAgainst: scoreTable[homeTeam].goalsAgainst + Number(awayScore),
        goalsFor: scoreTable[homeTeam].goalsFor + Number(homeScore),
      };

      scoreTable[awayTeam] = {
        ...scoreTable[awayTeam],
        points: scoreTable[awayTeam].points + getMatchPoints(Number(awayScore), Number(homeScore)),
        goalsAgainst: scoreTable[awayTeam].goalsAgainst + Number(homeScore),
        goalsFor: scoreTable[awayTeam].goalsFor + Number(awayScore),
      };

      modifiedFixtures = removeFixture(homeTeam, awayTeam);
    }
  });

  return {
    scoreTable, modifiedFixtures,
  };
};
