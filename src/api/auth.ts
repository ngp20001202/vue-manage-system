import request from '@/utils/request';

export const gettoken = (data: { username: string; password: string }) =>
	request({ url: '/api/Tokens', method: 'POST', data });

export const getuser = () =>
	request({ url: '/api/Users/me', method: 'GET' });