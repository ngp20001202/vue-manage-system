export const utcOffsetOptions = Array.from({ length: 27 }, (_, i) => {
	const value = i - 12;
	const sign = value < 0 ? '-' : '+';
	return {
		label: `(UTC${sign}${String(Math.abs(value)).padStart(2, '0')}:00)`,
		value,
	};
});
