import request from '@/utils/request';
import type { ApiResponse } from './types';

// 操作点列表分页参数
export interface SiteListParams {
	pageIndex: number;
	pageSize: number;
}

// 操作点列表（shippingspa: GET /api/Configuration/sites/list）
export const sitelist = (data: SiteListParams): Promise<ApiResponse> =>
	request({
		url: `/api/Configuration/sites/list?pageIndex=${data.pageIndex}&pageSize=${data.pageSize}`,
		method: 'GET',
	});

// 操作点详情（shippingspa: GET /api/Configuration/sites/detail/{id}）
export const sitedetail = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Configuration/sites/detail/${id}`, method: 'GET' });

// 创建操作点（shippingspa: POST /api/Configuration/sites/create）
export const sitecreate = (body: Record<string, any>): Promise<ApiResponse> =>
	request({ url: '/api/Configuration/sites/create', method: 'POST', data: body });

// 更新操作点（shippingspa: POST /api/Configuration/sites/edit）
export const siteupdate = (
	body: Record<string, any> & { id: string | number },
): Promise<ApiResponse> =>
	request({ url: '/api/Configuration/sites/edit', method: 'POST', data: body });

// 禁用 / 启用操作点（保留 /disable 推测为软删除，需要时再核实）
export const sitedisable = (body: { id: string | number; enabled?: boolean }): Promise<ApiResponse> =>
	request({ url: `/api/Configuration/sites/disable`, method: 'POST', data: body });
