import {handleError} from './utilities.js';

export const createOrder = props => {

	let {api, Order, side, orderConfig, amount} = props;
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
				startSale({api, Order, id, orderConfig});
			}
		},
		error => {
			handleError(error);
			
			if(side === 'buy')
			{
				createOrder(props);
			}
			
		});					
};


const startSale = props => {
	
	const {api, Order, id, orderConfig} = props;
	const {currencyPair} = orderConfig;
	
	api.getOrder(id, currencyPair, {account: 'spot'})
		.then(value => {
			
			const {status, amount} = value.body;
			
			if(status === 'closed')
			{
				createOrder({api, Order,  orderConfig, side: 'sell', amount});
			}
			else
			{
				console.log('buy order still opened');
				startSale(props);
			}
		},
		error => handleError(error));					
};