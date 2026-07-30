export interface ApiResponse<T = any> {
	isSuccess?: boolean;
	result?: T;
	message?: string;
	errors?: Record<string, string[]>;
	availcnt?: number; // populated by interceptor from x-paging-availcnt
	pagination?: { availCnt?: number };
	token?: string; // login response
}