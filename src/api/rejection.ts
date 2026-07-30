import request from '@/utils/request';
import type { ApiResponse } from './types';

// 末段拒绝列表（获取面单失败）
export interface LastMilerRejectedListParams {
	index: number;
	size: number;
	PeriodMin?: string;
	PeriodMax?: string;
	IsUseTrackingNbr?: string;
	TrackingNbr?: string;
}
export const lastMilerRejectedlist = (data: LastMilerRejectedListParams): Promise<ApiResponse> => {
	const PeriodMin = data.PeriodMin ? `&PeriodMin=${data.PeriodMin}` : '';
	const PeriodMax = data.PeriodMax ? `&PeriodMax=${data.PeriodMax}` : '';
	const IsUseTrackingNbr = data.IsUseTrackingNbr
		? `&IsUseTrackingNbr=true&TrackingNbr=${data.TrackingNbr ?? data.IsUseTrackingNbr}`
		: '';
	return request({
		url: `/api/exception/lastMiler/list/?pageIndex=${data.index}&pageSize=${data.size}` +
			PeriodMin + PeriodMax + IsUseTrackingNbr,
		method: 'GET',
	});
};

// 追踪号批量搜索
export const lastMilerRejectedSearch = (body: { pageIndex: number; pageSize: number; trackingNbrs: string[] }): Promise<ApiResponse> =>
	request({ url: '/api/exception/lastMiler/search', method: 'POST', data: body });

// 详情（shippingspa: /api/exception/lastMiler/detail/{id}）
export const lastMilerRejectedDetail = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/exception/lastMiler/detail/${id}`, method: 'GET' });

// 取消订单（shippingspa: /api/exception/lastMiler/cancel）
export const lastMilerCancel = (body: { ids: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/exception/lastMiler/cancel', method: 'POST', data: body });

// 编辑重推（shippingspa: /api/exception/lastMiler/requeue）
export const Editrso = (body: { ids: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/exception/lastMiler/requeue', method: 'POST', data: body });

// 编辑后再次提交（shippingspa: /api/exception/lastMiler/edit）
export const lastMilerEdit = (body: Record<string, any>): Promise<ApiResponse> =>
	request({ url: '/api/exception/lastMiler/edit', method: 'POST', data: body });
