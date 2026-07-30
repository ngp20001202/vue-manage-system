import request from '@/utils/request';
import type { ApiResponse } from './types';

// 公司详情
export const companyDetail = (): Promise<ApiResponse> =>
	request({ url: '/api/Configuration/company/detail', method: 'GET' });

// 编辑/保存公司配置
export const companyEdit = (body: Record<string, any>): Promise<ApiResponse> =>
	request({ url: '/api/Configuration/company/edit', method: 'POST', data: body });
