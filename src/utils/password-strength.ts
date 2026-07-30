/**
 * Password strength utility, ported from shippingspa's CheckPassword.js / formatpassword.
 * Returns a 5-tier level (1 = very weak ... 5 = very strong).
 */

const REG_NUMBER = /\d+/;
const REG_UPPERCASE = /[A-Z]+/;
const REG_LOWERCASE = /[a-z]+/;
const REG_SYMBOL = /[~!@#$%^&*()_+|<>,.?/:;'[\]{}"]+/;

export interface PasswordStrength {
	level: number; // 1..5
	label: string;
	color: string;
	width: number; // 20, 40, 60, 80, 100
}

const SCALE: Array<Omit<PasswordStrength, 'level'>> = [
	{ label: '非常弱', color: 'red', width: 20 },
	{ label: '弱', color: '#ee795c', width: 40 },
	{ label: '一般', color: 'orange', width: 60 },
	{ label: '强', color: 'green', width: 80 },
	{ label: '非常强', color: '#1B8EF8', width: 100 },
];

const lengthScore = (str: string): number => {
	if (str.length < 5) return 5;
	if (str.length < 8) return 10;
	return 25;
};

const lettersScore = (str: string): number => {
	let lower = 0;
	let upper = 0;
	for (let i = 0; i < str.length; i++) {
		const c = str.charAt(i);
		if (c >= 'a' && c <= 'z') lower++;
		if (c >= 'A' && c <= 'Z') upper++;
	}
	if (lower === 0 && upper === 0) return 0;
	if (lower !== 0 && upper !== 0) return 20;
	return 10;
};

const numbersScore = (str: string): number => {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		if (str.charAt(i) >= '0' && str.charAt(i) <= '9') count++;
	}
	if (count === 0) return 0;
	if (count === 1) return 10;
	return 20;
};

const symbolsScore = (str: string): number => {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		const code = str.charCodeAt(i);
		if (
			(code >= 0x21 && code <= 0x2f) ||
			(code >= 0x3a && code <= 0x40) ||
			(code >= 0x5b && code <= 0x60) ||
			(code >= 0x7b && code <= 0x7e)
		) {
			count++;
		}
	}
	if (count === 0) return 0;
	if (count === 1) return 10;
	return 25;
};

const rewardsScore = (str: string): number => {
	const letter = lettersScore(str);
	const number = numbersScore(str);
	const symbol = symbolsScore(str);
	if (letter > 0 && number > 0 && symbol === 0) return 2;
	if (letter === 10 && number > 0 && symbol > 0) return 3;
	if (letter === 20 && number > 0 && symbol > 0) return 5;
	return 0;
};

/**
 * Compute the password strength level (1..5).
 * Returns a default "very weak" record for an empty string.
 */
export const passwordLevel = (str: string): PasswordStrength => {
	if (!str) return { level: 0, label: '', color: '#e0e0e0', width: 0 };

	const sum =
		lengthScore(str) +
		lettersScore(str) +
		numbersScore(str) +
		symbolsScore(str) +
		rewardsScore(str);

	let idx = 0;
	if (sum >= 80) idx = 4;
	else if (sum >= 60) idx = 3;
	else if (sum >= 40) idx = 2;
	else if (sum >= 25) idx = 1;

	return { level: idx + 1, ...SCALE[idx] };
};

/**
 * Validator for Element Plus form rules: requires at least medium strength (level >= 3).
 */
export const passwordStrengthValidator = (
	password: string,
	minLevel = 3,
): true | string => {
	const { level, label } = passwordLevel(password);
	if (level < minLevel) {
		return `密码强度过低（当前：${label}），请使用包含大小写字母、数字和特殊字符的组合`;
	}
	return true;
};

export { REG_NUMBER, REG_UPPERCASE, REG_LOWERCASE, REG_SYMBOL };