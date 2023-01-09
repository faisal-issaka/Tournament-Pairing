/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable implicit-arrow-linebreak */
const _ = require('lodash');
const { TournamentModel } = require('./tournamentModels');
// const { viewGroupStageSingleTable } = require('./tournamentService');

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

const generateGroupingsTable = (teamDivisions) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const teamGroupings = {};
  if ((teamDivisions.length === 2) && (teamDivisions.every((elt) => typeof elt === 'string'))) {
    const fixtures = teamsMatcher(teamDivisions);
    const scoreTable = generateScoreTable(teamDivisions);
    teamGroupings[letters[0]] = {
      teams: teamDivisions,
      fixtures,
      scoreTable,
    };
  } else {
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
  }
  return teamGroupings;
};

exports.generateGroupings = async (tournamentID, teamsPerGroup) => {
  const tournament = await TournamentModel.findOne({ _id: tournamentID });
  const teamDivisions = _.chunk(_.shuffle(tournament?.teams), teamsPerGroup);
  return generateGroupingsTable(teamDivisions);
};

exports.getVrsTableID = (tableID) => {
  const tableIDs = 'abcdefghijklmnopqrstuvwxyz';
  const chunkTableIDs = _.chunk(Array.from(tableIDs), 2);
  const tableGrouping = chunkTableIDs.find((t) => t.includes(tableID));
  const vrsTableID = tableGrouping.indexOf(tableID) === 0 ? tableGrouping[1] : tableGrouping[0];
  return vrsTableID;
};

const sortTeamsByPoints = (teams) => {
  teams.sort((a, b) => {
    const pointsA = a.points;
    const pointsB = b.points;
    if (pointsA > pointsB) {
      return -1;
    }
    if (pointsA < pointsB) {
      return 1;
    }

    return 0;
  });
};

const getQualifiedTeams = (team) => {
  const teamsData = [...Object.values(team)];
  sortTeamsByPoints(teamsData);

  const qualifiedTeams = teamsData.slice(0, teamsData.length / 2).reduce((acc, data) => {
    const teamName = data.name;
    acc.push(teamName);
    return acc;
  }, []);

  return qualifiedTeams;
};
exports.getQualifiedTeams = getQualifiedTeams;

exports.generateNextGroupPairing = async (groupings) => {
  const allQualifiedTeams = Object.keys(groupings).reduce((acc, group) => {
    const qualifiedTeams = getQualifiedTeams(groupings[group].scoreTable);
    let res = [...acc];
    if (qualifiedTeams.length === 1) {
      res = [...res, ...qualifiedTeams];
    } else {
      res.push(qualifiedTeams);
    }
    return res;
  }, []);

  return generateGroupingsTable(allQualifiedTeams);
};

exports.cleanScoreSheet = (tableID, scoreSheet, groupStage) => {
  const table = groupStage?.groupings[tableID];
  const groupings = { ...groupStage?.groupings };
  const teams = groupings[tableID]?.teams;
  const fixtures = groupings[tableID]?.fixtures;
  const groupHistory = groupings[tableID]?.groupHistory || [];
  const scoreTable = { ...table?.scoreTable };

  let modifiedFixtures = fixtures;
  let modifiedGroupHistory = groupHistory;

  const getMatchPoints = (homeScore, awayScore) => {
    if (homeScore > awayScore) return 3;
    if (homeScore === awayScore) return 1;
    return 0;
  };

  const isOutstandingMatch = (homeTeam, awayTeam) => (
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

    if (isOutstandingMatch(homeTeam, awayTeam)) {
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

  modifiedGroupHistory = [...modifiedGroupHistory, ...scoreSheet];

  return {
    teams,
    scoreTable,
    fixtures: modifiedFixtures,
    groupHistory: modifiedGroupHistory,
  };
};

exports.allMatchesPlayed = (groupings) => {
  const noFixtures = Object.keys(groupings).every((tableID) => groupings[tableID]?.fixtures.length === 0);
  return noFixtures;
};

exports.isFinals = (scoreTable) => {
  const teams = (Object.values(scoreTable).reduce((acc, table) => {
    acc += table.teams.length;
    return acc;
  }, 0));
  return teams === 2;
};
