export const filenames = (res: any): string => {
	const pattern = /filename\*?=UTF-8''([^;\n\r]+)/;
	const content =
		res.headers?.['content-disposition'] ||
		res.headers?.['Content-Disposition'] ||
		'';
	const match = decodeURIComponent(content).match(pattern);
	let filename = '';
	if (match) {
		filename = match[1];
	}
	return filename;
};