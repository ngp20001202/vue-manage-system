import request from '@/utils/request';
import type { ApiResponse } from './types';

// 地址簿列表
export interface AddressListParams {
	index: number;
	size: number;
	Type?: string | number; // Billing / Shipping / Returning / Amazon / Consignee
	Keyword?: string;
}
export const addresslist = (data: AddressListParams): Promise<ApiResponse> => {
	const Type = data.Type ? `&Type=${data.Type}` : '';
	const Keyword = data.Keyword ? `&Keyword=${encodeURIComponent(data.Keyword)}` : '';
	return request({
		url: `/api/address/list?pageIndex=${data.index}&pageSize=${data.size}` +
			Type + Keyword,
		method: 'GET',
	});
};

// 地址详情
export const addressdetail = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/address/info/${id}`, method: 'GET' });

// 创建地址
export interface AddressBody {
	name: string;
	contact?: string;
	phone?: string;
	email?: string;
	company?: string;
	countryCode?: string;
	state?: string;
	city?: string;
	district?: string;
	streetLine1?: string;
	streetLine2?: string;
	streetLine3?: string;
	zipPostalCode?: string;
	type: string | number;
	isDefault?: boolean;
}
export const addresscreate = (body: AddressBody): Promise<ApiResponse> =>
	request({ url: '/api/address/Create', method: 'POST', data: body });

// 更新地址（shippingspa: PUT /api/address/Edit）
export const addressupdate = (body: AddressBody & { id: string | number }): Promise<ApiResponse> =>
	request({ url: '/api/address/Edit', method: 'PUT', data: body });

// 删除地址（shippingspa: POST /api/address/remove）
export const addressdelete = (body: { id: string | number }): Promise<ApiResponse> =>
	request({ url: '/api/address/remove', method: 'POST', data: body });
