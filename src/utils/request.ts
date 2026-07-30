import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
	baseURL: (import.meta.env.VITE_APP_BASE as string) || '/api1',
	timeout: 60000,
});

service.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token: string | null = localStorage.getItem('token');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		config.headers['Content-Type'] = 'application/json';
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
		const availcnt = response.headers['x-paging-availcnt'];
		if (response.data && typeof availcnt !== 'undefined') {
			response.data.availcnt = availcnt;
		}
		const ct: string = response.headers['content-type'] || '';
		if (ct.indexOf('application/json') === -1) {
			return response;
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
