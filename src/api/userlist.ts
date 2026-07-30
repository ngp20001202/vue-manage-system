import request from '@/utils/request';
import type { ApiResponse } from './types';

// 用户列表分页参数
export interface UserListParams {
	pageIndex: number;
	pageSize: number;
	UserAlias?: string;
	SiteID?: string | number;
}

// 用户列表（shippingspa: GET /api/Users?pageIndex=&pageSize=&UserAlias=&SiteID=）
export const userlist = (params: UserListParams): Promise<ApiResponse> => {
	const UserAlias = params.UserAlias ? `&UserAlias=${encodeURIComponent(params.UserAlias)}` : '';
	const SiteID = params.SiteID ? `&SiteID=${params.SiteID}` : '';
	return request({
		url: `/api/Users?pageIndex=${params.pageIndex}&pageSize=${params.pageSize}` +
			UserAlias + SiteID,
		method: 'GET',
	});
};

// 用户详情（shippingspa: GET /api/Users/{id}）
export const userdetail = (id: string | number): Promise<ApiResponse> =>
	request({ url: `/api/Users/${id}`, method: 'GET' });

// 用户创建（shippingspa: POST /api/Users）
export const usercreate = (body: Record<string, any>): Promise<ApiResponse> =>
	request({ url: '/api/Users', method: 'POST', data: body });

// 用户更新（shippingspa: PUT /api/Users/{id}）
export const userupdate = (
	body: Record<string, any> & { id: string | number },
): Promise<ApiResponse> =>
	request({ url: `/api/Users/${body.id}`, method: 'PUT', data: body });

// 禁用 / 启用用户（shippingspa: POST /api/Users/disable，body: { ID, IsDisable }）
export const userdisable = (body: { ID: string | number; IsDisable: boolean }): Promise<ApiResponse> =>
	request({ url: '/api/Users/disable', method: 'POST', data: body });

// 重置密码（shippingspa: POST /api/Configuration/user/reset，body: { ID, NewPassword }）
export const userresetpwd = (body: { ID: string | number; NewPassword: string }): Promise<ApiResponse> =>
	request({
		url: '/api/Configuration/user/reset',
		method: 'POST',
		data: body,
	});

// 操作点下拉（用于 Site User 选择 Site；shippingspa: GET /api/Configuration/user/sites）
export const usersitelist = (): Promise<ApiResponse> =>
	request({ url: '/api/Configuration/user/sites', method: 'GET' });

// 角色列表（shippingspa: GET /api/Configuration/roles）
export const userroleslist = (): Promise<ApiResponse> =>
	request({ url: '/api/Configuration/roles', method: 'GET' });

// 用户角色（shippingspa: GET /api/users/getRole）
export const userRole = (): Promise<ApiResponse> =>
	request({ url: '/api/users/getRole', method: 'GET' });
