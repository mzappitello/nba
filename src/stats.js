"use strict"

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const qs = require("querystring");
const partial = require("lodash.partial");
const endpoints = require("./stats-endpoints");
const dicts = require("./dicts");
const translateKeys = require("./util/translate-keys");
let transport = require("./get-json");

const translate = partial(translateKeys, dicts.jsToNbaMap);

const stats = Object.create({
  setTransport (_transport) {
    transport = _transport;
  },
  getTransport () {
    return transport;
  },
});

Object.keys(endpoints).forEach(key => {
  stats[key] = makeStatsMethod(endpoints[key]);
});

function makeStatsMethod (endpoint) {

  return function statsMethod (query, callback) {

    if (typeof query === "function") {
      callback = query;
      query = {};
    }

    if (typeof callback !== "function") {
      throw new TypeError("Must pass a callback function.");
    }

    var params = _extends({}, endpoint.defaults, translate(query));

    transport(endpoint.url, params, function (err, response) {
      if (err) return callback(err);

      if (response == null) return callback();

      // response is something like "GameID is required"
      if (typeof response === "string") return callback(new Error(response));

      if (endpoint.transform) return callback(null, endpoint.transform(response));
      callback(null, response);
    });
  };
}

module.exports = stats;
