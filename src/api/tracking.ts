import request from '@/utils/request';
import type { ApiResponse } from './types';

// 批量追踪号搜索（shippingspa: POST /api/tracking，body {TrackingNbrs: "<newline-joined>"})
export const trackingSearch = (data: { TrackingNbrs: string }): Promise<ApiResponse> =>
	request({ url: '/api/tracking', method: 'POST', data });

// 单号追踪事件详情（shippingspa: GET /api/tracking/{id}）
export const trackingDetail = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/tracking/${id}`, method: 'GET' });
