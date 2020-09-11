# homebridge2mqtt

Export values from Homebridge to MQTT for other sources.  

Uses the homebridge-config-ui-x REST API to obtain values.

Just a quick and dirty solution for my needs... not very configurable for other use cases, but should be easy enough to modify.


## Setup

```
npm install
```

## Configure

```
cp auth.json.example auth.json
vim auth.json
```

## Running

```
node homebridge2mqtt.js
```