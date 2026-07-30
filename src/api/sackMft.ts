import request from '@/utils/request';
import type { ApiResponse } from './types';

// 清单列表（下拉框选项 / 看板 tab）
export const sackMftstage = (): Promise<ApiResponse> =>
	request({ url: '/api/SackMfts/stage', method: 'GET' });

// 看板 tab 数据
export const getSackMftdashtab = (): Promise<ApiResponse> =>
	request({ url: '/api/SackMfts/dashtab', method: 'GET' });

// 主列表
export interface SackMftListParams {
	index: number;
	size: number;
	Stage?: number;
	StageMin?: number;
	StageMax?: number;
	PeriodMin?: string;
	PeriodMax?: string;
	IsUseTrackingNbr?: string;
	MawbNbr?: string;
}
export const sackMftlist = (data: SackMftListParams): Promise<ApiResponse> => {
	const Stage = data.Stage ? `&Stage=${data.Stage}` : '';
	const StageMin = data.StageMin ? `&StageMin=${data.StageMin}` : '';
	const StageMax = data.StageMax ? `&StageMax=${data.StageMax}` : '';
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	const IsUseMawbNbr = data.IsUseTrackingNbr
		? `&IsUseMawbNbr=true&MawbNbr=${data.MawbNbr ?? data.IsUseTrackingNbr}`
		: '';
	return request({
		url: `/api/SackMfts?pageIndex=${data.index}&pageSize=${data.size}` +
			Stage + StageMin + StageMax + PeriodMin + PeriodMax + IsUseMawbNbr,
		method: 'GET',
	});
};

// 追踪号批量搜索
export const sackMftSearchlist = (body: { pageIndex: number; pageSize: number; trackingNbrs: string[] }): Promise<ApiResponse> =>
	request({ url: '/api/SackMfts/search', method: 'POST', data: body });

// 确认出库
export const sackMftCfmOutgated = (body: { ids: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/SackMfts/cfmOutgated', method: 'POST', data: body });

// 确认航班离港
export const sackMftCfmFlightDeparted = (body: { ids: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/SackMfts/cfmFlightDeparted', method: 'POST', data: body });

// 确认航班到港
export const sackMftCfmFlightArrived = (body: { ids: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/SackMfts/cfmFlightArrived', method: 'POST', data: body });

// 确认取货
export const sackMftCfmPickup = (body: { ids: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/SackMfts/cfmPickup', method: 'POST', data: body });

// 清单列表导出（blob）
export const sackMftexport = (params: { Stage?: number; StageMin?: number; StageMax?: number; PeriodMin?: string; PeriodMax?: string }, body: { trackingNbrs?: string[] }): Promise<Blob> =>
	request({
		url: `/api/SackMfts/export?` +
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

// 下载相关文档（shippingspa uses /api/SackMfts/{id}/docs）
export const sackMftDownload = (id: string): Promise<Blob> =>
	request({ url: `/api/SackMfts/${id}/docs`, method: 'GET', responseType: 'blob' });

// 创建 SCAN FORM（multipart）
export const sackMftScanform = (id: string, body: any): Promise<ApiResponse> =>
	request({
		url: `/api/SackMfts/${id}/scanform`,
		headers: { 'Content-Type': 'multipart/form-data' },
		method: 'POST',
		data: body,
	});

// 签名 token（shippingspa ships from usesackMfts.js → /api/Tokens/sign）
export const sackMftsign = (data: { url: string }): Promise<any> =>
	request({ url: '/api/Tokens/sign', method: 'POST', data });

// 详情（shippingspa 有 detail 路径，下面按推测的 /api/SackMfts/detail/{id}）
export const sackMftDetail = (params: { id: string }): Promise<ApiResponse> =>
	request({ url: `/api/SackMfts/detail/${params.id}`, method: 'GET' });
