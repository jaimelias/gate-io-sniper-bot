import {handleError} from './utilities.js';

export const createOrder = ({api, Order, startTrade, side, orderConfig, amount}) => {

	const {currencyPair, buyPrice, inputAmount, salePrice} = orderConfig;
	const price = (side === 'buy') ? buyPrice : salePrice;
	amount = (side === 'buy') ? (inputAmount / buyPrice) :  amount;
	
	const orderProps = {
		currencyPair,
		text: 't-' + currencyPair + '-' + Date.now(),
		type: 'limit',
		account: 'spot',
		side,
		iceberg: '0',
		amount,
		price,
		timeInForce: 'gtc',
		autoBorrow: false,
	};
	
	let order = new Order();
	
	for(let k in orderProps)
	{
		order[k] = orderProps[k];
	}
									
	api.createOrder(order)
		.then(value => {
			
			if(side === 'buy' && salePrice > buyPrice)
			{
				const {id, amount} = value.body;
				startSale({api, Order, startTrade, id, orderConfig});
			}
		},
		error => {
			handleError(error);
			
			if(side === 'buy')
			{
				startTrade();
			}
			
		});					
};


const startSale = ({api, Order, startTrade, id, orderConfig}) => {
	
	const {currencyPair} = orderConfig;
	
	api.getOrder(id, currencyPair, {account: 'spot'})
		.then(value => {
			
			const {status, amount} = value.body;
			
			if(status === 'closed')
			{
				createOrder({api, Order, startTrade, side: 'sell', orderConfig, amount});
			}
			else
			{
				console.log('buy order still opened');
				startSale({api, Order, startTrade, id, orderConfig});
			}
		},
		error => console.error(error));					
};