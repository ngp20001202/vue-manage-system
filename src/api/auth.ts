import request from '@/utils/request';

// 登录/Token 换取（支持用户名密码或 token）
export const gettoken = (data: { username?: string; password?: string; token?: string }) =>
	request({ url: '/api/Tokens', method: 'POST', data });

// 用 URL 上的 token 换取 accessToken
// 线上：GET /api/Tokens/{token}
// 开发：POST /.authentication/signIn，body 为 application/x-www-form-urlencoded 的 token=...
// 注意：dev 后端目前只接受 GET，等后端补 POST 路由
export const gettokens = (token: string) => {
	if (import.meta.env.DEV) {
		return request({
			url: '/.authentication/signIn',
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: `token=${encodeURIComponent(token)}`,
		});
	}
	return request({ url: `/api/Tokens/${token}`, method: 'GET' });
};

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
