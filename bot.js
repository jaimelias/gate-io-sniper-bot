import {apiKey, apiSecret} from './secrets.js';
import {getOrderConfig, handleError} from './utilities.js';
import {createOrder} from './createOrders.js';
import GateApi, {Order} from 'gate-api';

let ORDER_CREATED = false;
let orderConfig = await getOrderConfig();
let {currencyPair} = orderConfig;

let client = new GateApi.ApiClient();
client.basePath = 'https://api.gateio.ws/api/v4';

client.setApiKeySecret(apiKey, apiSecret);

const api = new GateApi.SpotApi(client);
const opts = {currencyPair};

const startTrade = () => {
	
	if(ORDER_CREATED)
	{
		return;
	}
	
	
	createOrder({
		api, 
		Order, 
		side: 'buy',
		orderConfig
	});
	
	/*
	api.getCurrencyPair(currencyPair)
		.then(value => {
			
			if(value.body.tradeStatus === 'tradable')
			{
				console.log('+++ creating order +++');
				
				createOrder({
					api, 
					Order, 
					side: 'buy',
					orderConfig
				});
			}
			else
			{
				console.log('--- not tradable ---');
				startTrade();
			}
		},
		error => {

			handleError(error);
			startTrade();
		});
	*/
		
	setInterval(async ()=> {
		orderConfig = await getOrderConfig();
		currencyPair = orderConfig.currencyPair;
	}, 1000);
};

startTrade();