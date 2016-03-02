# fr24-callsign2position

Define bounds via env variables :
```
TOP_LEFT_LAT=xxx
TOP_LEFT_LONG=xxx
BOTTOM_RIGHT_LAT=xxx
BOTTOM_RIGHT_LONG=xxx
```

## API

```
/?callsigns=AZA11Y,AFR2015
```

Returns :
```
{
  lastFetched: Date,
  flights: [{
    callsign: AZA11Y,
    position: {
      lat: xxx,
      long: xxx,
      altitude: xxx
    }
  }, ...
  ]
}
```
