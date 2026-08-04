/**
 * 复制文本到剪贴板。
 *
 * 优先使用 navigator.clipboard（需 HTTPS/localhost）。
 * 在 HTTP 环境（如 IIS 内网部署）回退到 document.execCommand('copy')。
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
	if (navigator.clipboard && window.isSecureContext) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// 回退到传统方案
		}
	}

	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.style.position = 'fixed';
	textarea.style.left = '-9999px';
	textarea.style.top = '0';
	textarea.setAttribute('readonly', '');
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();

	try {
		const ok = document.execCommand('copy');
		document.body.removeChild(textarea);
		return ok;
	} catch {
		document.body.removeChild(textarea);
		return false;
	}
};
