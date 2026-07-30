export const formatParagraphtext = (
	datalist: any[],
	param: string,
): string => {
	if (!datalist.length) {
		return ' ';
	}
	const idstr = datalist
		.filter((item) => item[param])
		.map((item) => item[param])
		.join('\n');
	return idstr || ' ';
};

export const formatXactType = (type: string): string => {
	if (type === 'Deduct' || type === 'Deposit') {
		return type;
	}
	return type ?? '';
};

export const formartenglishcurrency = (currency: string): string => {
	const map: Record<string, string> = {
		美元: 'USD',
		人民币: 'CNY',
		欧元: 'EUR',
		英镑: 'GBP',
		加拿大元: 'CAD',
		日元: 'JPY',
		韩元: 'KRW',
		澳大利亚元: 'AUD',
		港币: 'HKD',
		马来西亚币: 'MYR',
		新台币: 'TWD',
	};
	return map[currency] || currency;
};