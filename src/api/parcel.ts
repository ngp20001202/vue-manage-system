import request from '@/utils/request';
import type { ApiResponse } from './types';

// 包裹阶段（下拉框选项）
export const parcelstage = (): Promise<ApiResponse> =>
	request({ url: '/api/Parcels/stage', method: 'GET' });

// 主列表
export interface ParcelListParams {
	index: number;
	size: number;
	Stage?: number;
	StageMin?: number;
	StageMax?: number;
	PeriodMin?: string;
	PeriodMax?: string;
	IsUseTrackingNbr?: string;
}
export const parcellist = (data: ParcelListParams) => {
	const Stage = data.Stage ? `&Stage=${data.Stage}` : '';
	const StageMin = data.StageMin ? `&StageMin=${data.StageMin}` : '';
	const StageMax = data.StageMax ? `&StageMax=${data.StageMax}` : '';
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	const IsUseTrackingNbr = data.IsUseTrackingNbr
		? `&IsUseTrackingNbr=true&TrackingNbr=${data.IsUseTrackingNbr}`
		: '';
	return request({
		url: `/api/Parcels/list?pageIndex=${data.index}&pageSize=${data.size}` +
			Stage + StageMin + StageMax + PeriodMin + PeriodMax + IsUseTrackingNbr,
		method: 'GET',
	});
};

// 追踪号批量搜索
export const parcelSearchlist = (body: { pageIndex: number; pageSize: number; trackingNbrs: string[] }) =>
	request({ url: '/api/Parcels/search', method: 'POST', data: body });

// 取消包裹
export const parcelcancel = (body: { ids: string[] }) =>
	request({ url: '/api/Parcels/cancel', method: 'POST', data: body });

// 撤销取消订单
export const parcelUndo = (body: { ids: (string | number)[] }) =>
	request({ url: '/api/Parcels/revocations', method: 'POST', data: body });

// 退款列表
export const refundlist = (params: {
	pageIndex: number;
	pageSize: number;
	RefNbrs?: string;
	stateID?: string | number;
	periodMin?: string;
	periodMax?: string;
}): Promise<ApiResponse> => request({ url: '/api/Parcels/refunds', method: 'GET', params });

// 单个面单下载（返回 url）
export const downloadlabel = (id: string) =>
	request({ url: `/api/Parcels/${id}/labels`, method: 'GET' });

// 包裹列表导出（blob）
export const parcelexport = (params: { Stage?: number; StageMin?: number; StageMax?: number; PeriodMin?: string; PeriodMax?: string }, body: { trackingNbrs?: string[] }) =>
	request({
		url: `/api/Parcels/export?` +
			(params.Stage ? `Stage=${params.Stage}&` : '') +
			(params.StageMin ? `StageMin=${params.StageMin}&` : '') +
			(params.StageMax ? `StageMax=${params.StageMax}&` : '') +
			(params.PeriodMin ? `PeriodMin=${params.PeriodMin}&` : '') +
			(params.PeriodMax ? `PeriodMax=${params.PeriodMax}` : ''),
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		data: body,
		responseType: 'blob',
	});

// 看板 tab 数据
export const getdashtab = () =>
	request({ url: '/api/Parcels/dashtab', method: 'GET' });

// 签名 token（shippingspa: POST /api/Tokens/sign）
export const SackMftsign = (data: { url: string }) =>
	request({ url: '/api/Tokens/sign', method: 'POST', data });

// 批量下载面单（添加到下载中心任务，shippingspa: /api/Download/parcels）
export const parceldownloadfile = (body: { ids: string[] }) =>
	request({ url: '/api/Download/parcels', method: 'POST', data: body });

// 包裹详情
export const parcellistdetail = (params: { id: string }) =>
	request({ url: `/api/Parcels/detail/${params.id}`, method: 'GET' });

// 一票多件详情子单
export const parcellistdetailmps = (params: { id: string }) =>
	request({ url: `/api/Parcels/detail/${params.id}/mps`, method: 'GET' });

// 详情内面单预览 URL
export const downloaddetaillabel = (id: string) =>
	request({ url: `/api/Parcels/detail/${id}/labels`, method: 'GET' });

// 一票多件导出
export const mpsexport = (id: string) =>
	request({
		url: `/api/Parcels/${id}/mpsexport`,
		method: 'GET',
		responseType: 'blob',
	});

// 包裹追踪事件
export const trackingdetail = (id: string) =>
	request({ url: `/api/tracking/${id}`, method: 'GET' });

// 批量获取面单 URL
export const POSTparcelslabels = (body: { ids: string[] }) =>
	request({ url: '/api/Parcels/labels', method: 'POST', data: body });

// 单笔创建包裹（提交到 lastMiler）
export const createparcel = (data: any) =>
	request({ url: '/api/Parcels/submit', method: 'POST', data });

// 试算运费
export const postrate = (data: any) =>
	request({ url: '/api/Parcels/rate', method: 'POST', data });

// 收发件地址列表
export const parcelsender = () =>
	request({ url: '/api/address/list', method: 'GET' });

// 获取可用服务（lastMiler 渠道）
export const getservices = () =>
	request({ url: '/api/Parcels/services', method: 'GET' });

// 收件人地址簿（Amazon）
export const getAmazon = () =>
	request({ url: '/api/address/Amazon/list', method: 'GET' });

// 发票详情
export const getInvoice = (id: string, invoiceID: string) =>
	request({ url: `/api/accounting/xacts/${id}/Invoices/${invoiceID}`, method: 'GET' });

// ========================= Overlabel =========================

// 换单列表（shippingspa: /api/Parcels/overlabel/list）
export interface OverlabelListParams {
	index: number;
	size: number;
	StageMin?: number;
	StageMax?: number;
	PeriodMin?: string;
	PeriodMax?: string;
	IsUseTrackingNbr?: string;
}
export const overlabellist = (data: OverlabelListParams): Promise<ApiResponse> => {
	const StageMin = data.StageMin ? `&StageMin=${data.StageMin}` : '';
	const StageMax = data.StageMax ? `&StageMax=${data.StageMax}` : '';
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	const IsUseTrackingNbr = data.IsUseTrackingNbr
		? `&IsUseTrackingNbr=true&TrackingNbr=${data.IsUseTrackingNbr}`
		: '';
	return request({
		url: `/api/Parcels/overlabel/list?pageIndex=${data.index}&pageSize=${data.size}` +
			StageMin + StageMax + PeriodMin + PeriodMax + IsUseTrackingNbr,
		method: 'GET',
	});
};

// 换单导入（shippingspa: /api/Parcels/overlabel/import）
export const overlabelImport = (data: FormData): Promise<ApiResponse> =>
	request({
		url: '/api/Parcels/overlabel/import',
		method: 'POST',
		headers: { 'Content-Type': 'multipart/form-data' },
		data,
	});

// 换单导入确认（shippingspa: /api/Parcels/overlabel/{fileid}/confirm）
export const overlabelCfmImport = (fileid: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Parcels/overlabel/${fileid}/confirm`, method: 'POST' });

// ========================= 包裹批量导入 =========================

// 包裹批量导入（shippingspa: importfile）
export const parcelImportfile = (data: FormData): Promise<ApiResponse> =>
	request({
		url: '/api/Parcels/import',
		method: 'POST',
		headers: { 'Content-Type': 'multipart/form-data' },
		data,
	});

// 导入预览明细（shippingspa: DetailImport）
export const parcelDetailImport = (fileid: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Parcels/files/${fileid}/detail`, method: 'GET' });

// 导出导入错误信息（shippingspa: ExportImport）
export const parcelExportImport = (fileid: string | number): Promise<any> =>
	request({
		url: `/api/Parcels/files/${fileid}/export`,
		method: 'GET',
		responseType: 'blob',
	});

// 确认导入（shippingspa: CfmImport）
export const parcelCfmImport = (fileid: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Parcels/files/${fileid}/confirm`, method: 'POST' });

// ========================= 推送入网 =========================

// 推送入网批量导入（shippingspa: postingfile）
export const postingfile = (data: FormData): Promise<ApiResponse> =>
	request({
		url: '/api/Parcels/postingToLastMiler/Import',
		method: 'POST',
		headers: { 'Content-Type': 'multipart/form-data' },
		data,
	});

// 推送入网导入结果确认（shippingspa: CfmPosting）
export const CfmPosting = (fileid: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Parcels/postingToLastMiler/${fileid}/confirm`, method: 'POST' });

// ========================= 批量试算 =========================

// 批量试算导入（shippingspa: parcelrateimport）
export const parcelrateimport = (data: FormData): Promise<ApiResponse> =>
	request({
		url: '/api/Parcels/rate/import',
		method: 'POST',
		headers: { 'Content-Type': 'multipart/form-data' },
		data,
	});

// 批量试算结果确认（shippingspa: parcelrateCfmImport）
export const parcelrateCfmImport = (fileid: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Parcels/rate/import/${fileid}/confirm`, method: 'POST' });