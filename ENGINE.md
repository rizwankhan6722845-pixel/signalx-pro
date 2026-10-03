# SignalX Pro — V1 Signal Engine

The V1 engine is an analytical/paper-trading component. It does not place trades.

## Inputs
At least 50 OHLC candles:
`{ open, high, low, close }`

## Indicators
- EMA 20
- EMA 50
- RSI 14
- Short-term momentum
- Candle-body strength

## Scoring
The engine assigns points to CALL and PUT conditions and returns the higher score, capped at 95. It also returns the reasons and indicator values used.

## API
`POST /api/analyze`

Example body:
```json
{"candles":[{"open":100,"high":102,"low":99,"close":101}]}
```

The endpoint requires 50+ candles and returns `PAPER` mode. Results are analytical probabilities, not guarantees.
