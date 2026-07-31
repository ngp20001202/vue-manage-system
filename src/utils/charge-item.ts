import i18n from '@/language';

const CHARGE_ID_MAP: Record<string, string> = {
	'1': 'Other',
	'11': 'OrderCharge',
	'12': 'FuelSurcharge',
	'13': 'DAS',
	'14': 'DASExtended',
	'10011': 'FreightAdjustment',
	'10021': 'OrderRefund',
	'10031': 'OriginalRecord',
	'10041': 'RefundFee',
	'10051': 'OrderRebound',
	'10061': 'OrderClaim',
	Other: 'Other',
	Freight: 'Freight',
	FuelSurcharge: 'FuelSurcharge',
	DAS: 'DAS',
	DASExtended: 'DASExtended',
	FreightAdjustment: 'FreightAdjustment',
	Void: 'Void',
};

export const formatChargeItem = (
	chargeID: string | number | null | undefined,
): string => {
	if (chargeID == null || chargeID === '') return (chargeID as any) ?? '';
	const key = CHARGE_ID_MAP[String(chargeID)];
	if (!key) return String(chargeID);
	return i18n.global.t(`pages.Charge.${key}`);
};

export const LEDGER_CHARGE_FILTERS: Array<{ value: number; key: string }> = [
	{ value: 0, key: 'pages.Parcels.detail.ChargeItem' },
	{ value: 1, key: 'pages.Charge.Other' },
	{ value: 11, key: 'pages.Charge.Freight' },
	{ value: 12, key: 'pages.Charge.FuelSurcharge' },
	{ value: 13, key: 'pages.Charge.DAS' },
	{ value: 14, key: 'pages.Charge.DASExtended' },
	{ value: 10011, key: 'pages.Charge.FreightAdjustment' },
	{ value: 10021, key: 'pages.Charge.Void' },
	{ value: 10061, key: 'pages.Charge.OrderClaim' },
];
