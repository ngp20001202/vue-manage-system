import request from '@/utils/request';
import type { ApiResponse } from './types';

export interface ServiceListParams {
	index: number;
	size: number;
}

export const servicelistdata = (data: ServiceListParams): Promise<ApiResponse> =>
	request({ url: `/api/Services?pageIndex=${data.index}&pageSize=${data.size}`, method: 'GET' });
