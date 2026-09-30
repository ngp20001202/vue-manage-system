import request from '@/utils/request';
import type { ApiResponse } from './types';

// 账户余额
export const getBalance = (): Promise<ApiResponse> =>
	request({ url: '/api/Accounting/vault', method: 'GET' });

// 余额明细（交易记录）列表
export interface XactsListParams {
	index: number;
	size: number;
	PeriodMin?: string;
	PeriodMax?: string;
}
export const xactslist = (data: XactsListParams): Promise<ApiResponse> => {
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	return request({
		url: `/api/accounting/xacts/list?pageIndex=${data.index}&pageSize=${data.size}` +
			PeriodMin + PeriodMax,
		method: 'GET',
	});
};

// 余额明细导出（blob）
export const xactsexport = (params: { PeriodMin?: string; PeriodMax?: string }): Promise<Blob> => {
	const PeriodMin = params.PeriodMin ? `PeriodMin=${params.PeriodMin}&` : '';
	const PeriodMax = params.PeriodMax ? `PeriodMax=${params.PeriodMax}&` : '';
	return request({
		url: `/api/accounting/xacts/export?` + PeriodMin + PeriodMax,
		method: 'GET',
		responseType: 'blob',
	});
};

// 签名 token（导出 / 下载走签名链接时使用）
export const SackMftsign = (data: { url: string }): Promise<any> =>
	request({ url: '/api/Tokens/sign', method: 'POST', data });

// 充值：创建支付订单
export const Paymentsdata = (data: any): Promise<ApiResponse> =>
	request({ url: '/api/Payments', method: 'POST', data });

// 充值：获取收银台支付链接
export const CashierPayments = (data: any): Promise<any> =>
	request({ url: '/cashier/Payments', method: 'POST', data });

// 账单 / 发票列表
export interface InvoicesListParams {
	index: number;
	size: number;
	PeriodMin?: string;
	PeriodMax?: string;
	Status?: string;
}
export const GetInvoices = (data: InvoicesListParams): Promise<ApiResponse> => {
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	const Status = data.Status ? `&Status=${data.Status}` : '';
	return request({
		url: `/api/BillingStatements?pageIndex=${data.index}&pageSize=${data.size}` +
			PeriodMin + PeriodMax + Status,
		method: 'GET',
	});
};

// 单个账单 PDF 导出（blob）
export const ExportInvoices = (id: string | number): Promise<Blob> =>
	request({ url: `/api/Invoices/${id}/export`, method: 'GET', responseType: 'blob' });

// 账单 PDF 导出（与 BillingStatements 列表配套）
export const ExportBillingStatement = (id: string | number): Promise<Blob> =>
	request({ url: `/api/BillingStatements/${id}/export`, method: 'GET', responseType: 'blob' });

// 账单详情
export const GetInvoicesDetail = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Invoices/${id}`, method: 'GET' });

// 应收-运费 / 账本流水（Ledger）列表
export interface LedgerListParams {
	index: number;
	size: number;
	PeriodMin?: string;
	PeriodMax?: string;
	ChargeID?: number | string;
	TrackingNbr?: string; // 启用 RefNbrs 搜索
}
export const ledgerlist = (data: LedgerListParams): Promise<ApiResponse> => {
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	const ChargeID = data.ChargeID ? `&ChargeID=${data.ChargeID}` : '';
	const RefNbrs = data.TrackingNbr
		? `&IsUseTrackingNbr=true&RefNbrs=${data.TrackingNbr}`
		: '';
	return request({
		url: `/api/accounting/ledger/list/?pageIndex=${data.index}&pageSize=${data.size}` +
			ChargeID + PeriodMin + PeriodMax + RefNbrs,
		method: 'GET',
	});
};

// 账本流水导出（blob）
export const ledgerexport = (params: {
	PeriodMin?: string;
	PeriodMax?: string;
	ChargeID?: number | string;
	TrackingNbr?: string;
}): Promise<Blob> => {
	const PeriodMin = params.PeriodMin ? `PeriodMin=${params.PeriodMin}&` : '';
	const PeriodMax = params.PeriodMax ? `PeriodMax=${params.PeriodMax}&` : '';
	const ChargeID = params.ChargeID ? `ChargeID=${params.ChargeID}&` : '';
	const IsUseTrackingNbr = params.TrackingNbr
		? `IsUseTrackingNbr=true&RefNbrs=${params.TrackingNbr}`
		: '';
	return request({
		url: `/api/accounting/ledger/export?` + ChargeID + PeriodMin + PeriodMax + IsUseTrackingNbr,
		method: 'GET',
		responseType: 'blob',
	});
};

// 余额明细：获取支付单详情
export const getPayment = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/accounting/xacts/Payment/${id}`, method: 'GET' });

// 余额明细：获取账单详情
export const getInvoice = (
	id: string | number,
	invoiceID: string | number,
): Promise<ApiResponse> =>
	request({ url: `/api/accounting/xacts/${id}/Invoices/${invoiceID}`, method: 'GET' });

// 余额明细：账单导出（blob）
export const Invoiceexport = (
	id: string | number,
	invoiceID: string | number,
): Promise<Blob> =>
	request({
		url: `/api/Accounting/xacts/${id}/invoices/${invoiceID}/export`,
		method: 'GET',
		responseType: 'blob',
	});

// 应收-运费 / Statements 列表（应收运费）
export interface StatementListParams {
	index: number;
	size: number;
	PeriodMin?: string;
	PeriodMax?: string;
	LastMilerID?: string;
}
export const statementlist = (data: StatementListParams): Promise<ApiResponse> => {
	const LastMilerID = data.LastMilerID ? `&LastMilerID=${data.LastMilerID}` : '';
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	return request({
		url: `/api/accounting/statement/list?pageIndex=${data.index}&pageSize=${data.size}` +
			LastMilerID + PeriodMin + PeriodMax,
		method: 'GET',
	});
};

// 应收-运费导出（blob）
export const statementexport = (params: {
	PeriodMin?: string;
	PeriodMax?: string;
	LastMilerID?: string;
}): Promise<Blob> => {
	const LastMilerID = params.LastMilerID ? `LastMilerID=${params.LastMilerID}&` : '';
	const PeriodMin = params.PeriodMin ? `PeriodMin=${params.PeriodMin}&` : '';
	const PeriodMax = params.PeriodMax ? `PeriodMax=${params.PeriodMax}` : '';
	return request({
		url: `/api/accounting/statement/export?` + LastMilerID + PeriodMin + PeriodMax,
		method: 'GET',
		responseType: 'blob',
	});
};
