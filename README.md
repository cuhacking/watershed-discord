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
  "message": "This is an announcement",
  "channel": "announcements"
}
```
Or use channel id
```json
{
  "message": "This is an announcement",
  "id": "691816726148677636"
}
```

Response
```json
{
    "status": "SUCCESS",
    "message": "This is an announcement",
    "channel": "announcements"
}
```

Not found
```json
{
    "status": "NOT FOUND",
    "channel": "announcements"
}
```

### Give a user the hacker role
POST `/upgrade`
```json
{
    "user": "Test#0021"
}
```
or use ID
POST `/upgrade`
```json
{
    "id": "147468550859908096"
}
```

Response
```json
{
    "status": "SUCCESS",
    "user": "Test#0021"
}
```

Not found
```json
{
    "status": "NOT FOUND",
    "user": "Test#0021"
}
```
