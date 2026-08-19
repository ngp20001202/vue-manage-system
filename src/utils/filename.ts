/**
 * 从响应的 Content-Disposition 头里提取文件名。
 * 支持以下入参：
 *  - axios 原始 response 对象（含 .headers）
 *  - 任何含有 headers / Content-Disposition 字段的对象
 */
export const filenames = (res: any): string => {
	const pattern = /filename\*?=UTF-8''([^;\n\r]+)/;
	const headers = res?.headers || {};
	const content =
		headers['content-disposition'] ||
		headers['Content-Disposition'] ||
		'';
	if (!content) return '';
	const match = decodeURIComponent(content).match(pattern);
	return match ? match[1] : '';
};