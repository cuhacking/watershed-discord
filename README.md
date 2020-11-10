# Setup

`yarn install`

Create `.env` file and add a line:
`TOKEN=<XXX>`

Token can be found in the Discord developer portal, go to the app, then go to the "Bot" tab.

# Running

`yarn start`

# Endpoints

### Make an announcement

POST `/announce`
```json
{
  "message": "This is an announcement"
}
```

Response
```json
{
    "status": "SENT",
    "message": "This is an announcement"
}
```

