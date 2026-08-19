import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
	baseURL: (import.meta.env.VITE_APP_BASE as string) || '',
	timeout: 60000,
});

service.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token: string | null = localStorage.getItem('token');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		config.headers['Content-Type'] = 'application/json';
		// FormData 必须交给浏览器设置 multipart/form-data + boundary，
		// 否则 axios 1.x 会把 FormData 序列化成 JSON，文件丢失
		if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
			delete config.headers['Content-Type'];
		}
		config.headers['Accept-Language'] = localStorage.getItem('lang') || 'zh-cn';
		return config;
	},
	(error: AxiosError) => {
		console.log(error);
		return Promise.reject(error);
	},
);

service.interceptors.response.use(
	(response: any) => {
		// blob / arraybuffer / text / stream 等二进制或非 JSON 响应：返回完整 axios response，
		// 由调用方通过 res.data 取 Blob / ArrayBuffer / string，并通过 res.headers 取 Content-Disposition
		if ((response.headers?.['content-type'] || '').toLowerCase().indexOf('application/json') === -1) {
			return response;
		}
		const availcnt = response.headers['x-paging-availcnt'];
		if (response.data && typeof availcnt !== 'undefined') {
			response.data.availcnt = availcnt;
		}
		return response.data;
	},
	(error: AxiosError) => {
		if (error.response && error.response.status === 401) {
			localStorage.removeItem('token');
			import('@/router').then(({ default: router }) => {
				router.push('/login');
			});
		} else {
			const data: any = error.response && error.response.data;
			ElMessage.error((data && (data.errors || data.message)) || error.message);
		}
		return Promise.reject(error);
	},
);

const request = (config: any): Promise<any> => service(config);

export default request;
