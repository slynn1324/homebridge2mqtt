const http = require('http');
const mqtt = require('async-mqtt');
const auth = require('./auth.json');

run();

async function run(){

	const accessories = await getAccessories();
	console.log(JSON.stringify(accessories, null, 2));


	let data = {};

	// iterate the accessories to obtain data
	accessories.forEach( (a) => {

		//console.log(a.aid + "-" + a.iid + " => " + a.humanType + " : " + a.serviceName + JSON.stringify(a.values));	

		// nest thermostat
		if ( a.aid == 25 && a.iid == 8 ){
			data.nestCurrentTemperature = a.values.CurrentTemperature.toFixed(2);
			data.nestTargetTemperature = a.values.TargetTemperature.toFixed(2);
			data.nestCurrentRelativeHumidity = a.values.CurrentRelativeHumidity.toFixed(2);
		}

		else if ( a.aid == 25 && a.iid == 24 ){
			data.nestFanOn = a.values.On ? "1" : "0";
		}

	});

	console.log(data);

	const mqttClient = await mqtt.connectAsync('mqtt://homebridge');

	try{

		for ( key in data ){
			await mqttClient.publish('homebridge/' + key, data[key]);
		}

		mqttClient.end();

	} catch (err){
		console.log(err);
		process.exit(2);
	}

}

async function getAuthToken(){



	return new Promise((resolve, reject) => {

		let options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			}
		}

		let request = http.request('http://homebridge/api/auth/login', options, (response) => {

			let data = '';

			response.on('data', (d) => {
				data += d;
			});

			response.on('end', () => {
				resolve(JSON.parse(data).access_token);
			});

		});

		request.on('error', (e) => {
			console.error(e);
		});

		let postData = {
			"username" : auth.username,
			"password" : auth.password
		};

		request.write(JSON.stringify(postData));
		request.end();


	});

}

async function getAccessories(){

	return new Promise( async (resolve, reject) => {

		const token = await getAuthToken();

		http.get('http://homebridge/api/accessories', {headers: {"Authorization":"Bearer " + token}},  (resp) => {

			let data = '';

			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				// console.log(data);
				resolve(JSON.parse(data));
			});

		}).on('error', (err) => {
			console.log("ERROR: " + err.message);
			reject(err);
		});

	});
	
}