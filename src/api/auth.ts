import request from '@/utils/request';

// 登录/Token 换取（支持用户名密码或 token）
export const gettoken = (data: { username?: string; password?: string; token?: string }) =>
	request({ url: '/api/Tokens', method: 'POST', data });

export const getuser = () =>
	request({ url: '/api/Users/me', method: 'GET' });

// NOTE: 以下两个端点为占位实现，待 shippingspa 后端确认后修正
// 发送重置密码验证码
export const getVerificationCode = (data: { username: string; email: string }) =>
	request({ url: '/api/Users/sendCode', method: 'POST', data });

// 重置密码（提交验证码 + 新密码）
export const resetPassword = (data: {
	username: string;
	email: string;
	code: string;
	newPassword: string;
}) =>
	request({ url: '/api/Users/password/reset', method: 'POST', data });
