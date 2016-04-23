import _ from 'lodash';

import rp from 'request-promise';

import d from 'debug';
const debug = d('fr24.fetcher');

const requestOptions = {
  json: true
};

const request = rp.defaults(requestOptions);

const localData = {
  lastFetched: null,
  flights: []
};

function urlMaker(topLeft, bottomRight) {
  const tlLat = _.get(topLeft, 'lat', 0);
  const tlLong = _.get(topLeft, 'long', 0);
  const brLat = _.get(bottomRight, 'lat', 0);
  const brLong = _.get(bottomRight, 'long', 0);

  return `http://data.flightradar24.com/zones/fcgi/feed.js?bounds=${tlLat},${brLat},${tlLong},${brLong}&air=1`
}

function fetch() {
  const topLeft = {
    lat: parseFloat(process.env.TOP_LEFT_LAT),
    long: parseFloat(process.env.TOP_LEFT_LONG)
  };

  const bottomRight = {
    lat: parseFloat(process.env.BOTTOM_RIGHT_LAT),
    long: parseFloat(process.env.BOTTOM_RIGHT_LONG)
  };

  const url = urlMaker(topLeft, bottomRight);

  debug(`Refreshing data from FR24 : ${url}`);

  return request(url)
    .then(processData)
    .catch(err => {
      debug(err);
      return Promise.reject(err);
    });
}

const processFlight = (flight) => {
  return {
    callsign: flight[16],
    lat: flight[1],
    long: flight[2],
    alt: flight[4]
  };
}

function processData(rawData) {
  localData.lastFetched = Date.now();

  const flights = _.omit(rawData, ['full_count', 'version']);

  localData.flights = _(flights)
    .map(processFlight)
    .uniqBy(f => f.callsign)
    .value();

  debug('Data retrieved from FR24 : %d flights', localData.flights.length);
  return localData;
}



export function getData() {
  const cacheMaxAge = parseInt(process.env.CACHE_MAX_AGE) || 60*3;
  const cacheExpired = (lastFetched) => Date.now() > (lastFetched + cacheMaxAge);

  debug(`Last fetched: ${localData.lastFetched} / Last fetched + cache : ${localData.lastFetched + cacheMaxAge} / Now: ${Date.now()}`);

  if(_.isEmpty(localData.flights) || cacheExpired(localData.lastFetched)) {
    debug('Cache expired, fetching fresh data');
    return fetch();
  }

  debug('Hitting local cache');
  return Promise.resolve(localData);
}
