import * as fs from 'fs';

export const getOrderConfig = async () => {
	const file = await fs.readFileSync('orderConfig.json', 'utf8');
	return JSON.parse(file);
};

export const handleError = error => {
	const {status, data, statusText}  = error.response;
	
	console.error({status, data, statusText});	
}; 