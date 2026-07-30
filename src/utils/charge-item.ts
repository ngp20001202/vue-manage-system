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