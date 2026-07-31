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
export interface AddressContact {
	Name: string;
	Phone?: string;
	Email?: string;
	Company?: string;
	Street1?: string;
	Street2?: string;
	Street3?: string;
	District?: string;
	City?: string;
	Province?: string;
	PostalCode?: string;
	CountryCode?: string;
}

export interface AddressBody {
	Type: number;
	Contact: AddressContact;
	IsDefault?: boolean;
}

export const addresscreate = (body: AddressBody): Promise<ApiResponse> =>
	request({ url: '/api/address/Create', method: 'POST', data: body });

// 更新地址（shippingspa: PUT /api/address/Edit，ID 走 body）
export const addressupdate = (body: AddressBody & { ID: string | number }): Promise<ApiResponse> =>
	request({ url: '/api/address/Edit', method: 'PUT', data: body });

// 设置默认地址
export const addresssetdefault = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/address/setDefault/${id}`, method: 'POST' });

// 删除地址（shippingspa: POST /api/address/remove，body: { IDS: [id] }）
export const addressdelete = (body: { IDS: (string | number)[] }): Promise<ApiResponse> =>
	request({ url: '/api/address/remove', method: 'POST', data: body });
