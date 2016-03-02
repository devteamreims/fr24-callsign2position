import express from 'express';
import {getData} from './fetch';
import d from 'debug';
const debug = d('fr24.routes');

import _ from 'lodash';

export function getRoutes() {

  let router = express.Router();


  router.get('/', getFlightsPosition);

  return router;
};

function getFlightsPosition(req, res, next) {
  let callsigns = [];
  if(req.query.callsigns !== undefined) {
    callsigns = req.query.callsigns;
  }

  const positions = {
    lastFetched: Date.now(),
    flights: []
  };

  const callsignFilter = (flight) => _.includes(callsigns, flight.callsign);

  const byCallsign = (callsign) => (flight) => flight.callsign === callsign;

  const emptyLocation = {
    lat: 0,
    long: 0,
    alt: 0
  };

  getData()
    .then(data => {
      const filteredFlights = _.filter(data.flights, callsignFilter);
      //debug(filteredFlights);
      return Object.assign({}, data, {flights: filteredFlights});
    })
    .then(data => {
      const flights = _.map(callsigns, callsign => {
        const fr24Flight = _.find(data.flights, {callsign});
        return Object.assign({}, {callsign}, emptyLocation, fr24Flight);
      });

      debug(flights);

      return Object.assign({}, data, {flights});
    })
    .then(data => res.send(data));

}

export default {
  getRoutes
};