import * as fs from 'fs';

export const getOrderConfig = async () => {
	const file = await fs.readFileSync('orderConfig.json', 'utf8');
	return JSON.parse(file);
};
