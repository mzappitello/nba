const stats = require("./stats");

module.exports = function (cb) {
  stats.playersInfo(function (err, resp) {
    if (err) return cb(err);
    const players = resp.resultSets[0].rowSet;
    cb(null, players.map(makePlayer));

  });
};

function makePlayer (tuple) {
  const playerId = tuple[0];
  const lastName = tuple[1].split(", ")[0];
  const firstName = tuple[1].split(", ")[1];
  const teamId = tuple[7];
  return { firstName, lastName, playerId, teamId };
}
