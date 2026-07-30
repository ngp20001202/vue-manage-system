import request from '@/utils/request';

// 登录/Token 换取（支持用户名密码或 token）
export const gettoken = (data: { username?: string; password?: string; token?: string }) =>
	request({ url: '/api/Tokens', method: 'POST', data });

export const getuser = () =>
	request({ url: '/api/Users/me', method: 'GET' });