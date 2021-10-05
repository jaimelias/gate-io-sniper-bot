import {apiKey, apiSecret} from './secrets.js';
import {getOrderConfig} from './utilities.js';
import GateApi from 'gate-api';

const IS_PRODUCTION = true;
let ORDER_CREATED = false;
let orderConfig = await getOrderConfig();
let {currencyPair, buyPrice, buyBalance} = orderConfig;
let buyAmount = buyBalance / buyPrice;

let client = new GateApi.ApiClient();
client.basePath = 'https://api.gateio.ws/api/v4';

client.setApiKeySecret(apiKey, apiSecret);

const api = new GateApi.SpotApi(client);


const opts = {currencyPair};

const handleError = error => {
	const {status, data, statusText}  = error.response;
	
	console.error({status, data, statusText});	
}; 

const buy = () => {
	
	if(ORDER_CREATED)
	{
		return;
	}
	
	api.getCurrencyPair(currencyPair)
		.then(value => {
			
			if(value.body.tradeStatus === 'tradable' && IS_PRODUCTION)
			{
				console.log('is tradable');
				
				const buyOrderProps = {
					currencyPair,
					text: 't-' + currencyPair + '-' + Date.now(),
					type: 'limit',
					account: 'spot',
					side: 'buy',
					iceberg: '0',
					amount: buyAmount,
					price: buyPrice,
					timeInForce: 'gtc',
					autoBorrow: false,
				};
				
				const buyOrder = new GateApi.Order();
				
				for(let k in buyOrderProps)
				{
					buyOrder[k] = buyOrderProps[k];
				}
												
				api.createOrder(buyOrder)
					.then(value => {
						console.log(value.body);
						ORDER_CREATED = true;
					},
					error => handleError(error));
			}
			
			buy();
		},
		error => {

			handleError(error);
			buy();
		});
	setInterval(async ()=> {
		orderConfig = await getOrderConfig();
		currencyPair = orderConfig.currencyPair;
		buyPrice = orderConfig.buyPrice;
		buyBalance = orderConfig.buyBalance;
		buyAmount = buyBalance / buyPrice;

	}, 1000);
};

buy();