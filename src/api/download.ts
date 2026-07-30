import request from '@/utils/request';
import type { ApiResponse } from './types';

export interface DownloadListParams {
	index: number;
	size: number;
	Status?: string;
	PeriodMin?: string;
	PeriodMax?: string;
}

export const downloadlist = (data: DownloadListParams): Promise<ApiResponse> => {
	const Status = data.Status ? `Status=${data.Status}&` : '';
	const PeriodMin = data.PeriodMin ? `PeriodMin=${data.PeriodMin}&` : '';
	const PeriodMax = data.PeriodMax ? `PeriodMax=${data.PeriodMax}` : '';
	return request({
		url: `/api/Download?pageIndex=${data.index}&pageSize=${data.size}&` +
			Status + PeriodMin + PeriodMax,
		method: 'GET',
	});
};

export const DELETEDownload = (body: { ids: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/Download', method: 'DELETE', data: body });

export const Downloadpdf = (id: string | number, body: { url: string }) =>
	request({
		url: `/api/Download/${id}/pdf`,
		method: 'POST',
		headers: { 'Content-Type': 'multipart/form-data' },
		responseType: 'blob',
		data: body,
	});
