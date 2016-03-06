"use strict"

const find = require("lodash.find");
const contains = require("lodash.contains");
const assign = require("lodash.assign");
const pify = require("pify");

const getTeamsInfo = require("./team-info");
const getPlayersInfo = require("./player-info");

const sportVu = require("./sport-vu");
const stats = require("./stats");
const buildPlayers = require("./util/build-players");
const promisify = require("./util/promisify").promisify;
const promisifyAll = require("./util/promisify").promisifyAll;

const teams = require("./../data/teams.json");
const players = buildPlayers(require("./../data/players.json"));

const nba = {
  stats,
  sportVu,
  players,
  updatePlayers,
  teams,
  updateTeams,

  teamIdFromName,
  playerIdFromName,
  findPlayer,
  searchPlayers,
  usePromises,

  // backwards compatibility
  ready: (cb) => cb.call(nba),
  api: stats,
};

function teamIdFromName (name) {
  const n = name.toLowerCase();
  const team = find(nba.teams, function (t) {
    return (
      t.abbreviation.toLowerCase() === n ||
      t.location.toLowerCase() === n ||
      t.teamName.toLowerCase() === n ||
      t.simpleName.toLowerCase() === n
    );
  });
  return team ? team.teamId : null;
}

function playerIdFromName (name) {
  const p = findPlayer(name);
  return p ? p.playerId : null;
}

function findPlayer (str) {
  str = str.toLowerCase();
  return find(nba.players, function (p) {
    return contains(p.fullName.toLowerCase(), str);
  });
}

function searchPlayers (str) {
  str = str.toLowerCase();
  return nba.players.filter(function (p) {
    return contains(p.fullName.toLowerCase(), str);
  });
}

function updatePlayers (cb) {
  return getPlayersInfo(function (err, resp) {
    if (err) return cb(err);
    nba.players = resp;
    cb(null, resp);
  });
}

function updateTeams (cb) {
  return getTeamsInfo(function (err, resp) {
    if (err) return cb(err);
    nba.teams = resp;
    cb(null, resp);
  });
}

let usedPromises = false;

function usePromises (Prms) {
  if (usedPromises) return nba;
  usedPromises = true;

  Prms = Prms || global.Promise;
  if (typeof Prms !== "function") {
    throw new Error("Invalid Promise implementation");
  }
  
  nba.stats = assign(Object.create(Object.getPrototypeOf(nba.stats)), pify(nba.stats, Prms));
  nba.sportVu = assign(Object.create(Object.getPrototypeOf(nba.sportVu)), pify(nba.sportVu, Prms));
  nba.updatePlayers = pify(updatePlayers, Prms);
  nba.updateTeams = pify(updateTeams, Prms);
  
  nba.api = nba.stats;
  return nba;
}

module.exports = nba;
