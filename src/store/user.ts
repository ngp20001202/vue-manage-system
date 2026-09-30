import { defineStore } from 'pinia';
import { gettoken, gettokens, getuser } from '@/api/auth';
import { usePermissStore } from './permiss';

interface UserInfo {
	name: string;
	avatar?: string;
	tenantAlias?: string;
}

export const useUserStore = defineStore('user', {
	state: () => ({
		token: localStorage.getItem('token') || '',
		user: {
			name: localStorage.getItem('vuems_name') || '',
			avatar: '',
			tenantAlias: '',
		} as UserInfo,
	}),
	actions: {
		setToken(t: string) {
			this.token = t;
			localStorage.setItem('token', t);
		},
		async login(username: string, password: string) {
			const res: any = await gettoken({ username, password });
			const token = res?.result?.accessToken ?? res?.result?.token ?? res?.token;
			if (token) {
				this.setToken(token);
				localStorage.setItem('vuems_name', username);
					usePermissStore().reset();
				try {
					await this.fetchProfile();
				} catch {}
			}
			return res;
		},
		async fetchProfile() {
			try {
				const res: any = await getuser();
				const u = res?.result ?? res;
				if (u?.name) this.user.name = u.name;
				if (u?.avatar) this.user.avatar = u.avatar;
				if (u?.tenantAlias) this.user.tenantAlias = u.tenantAlias;
			} catch {}
		},
		// 免密登录：URL 上带 ?token= 时用它换取 accessToken
		async loginByToken(urlToken: string) {
			const res: any = await gettokens(urlToken);
			const token = res?.result?.accessToken ?? res?.result?.token;
			if (!token) return res;
			this.setToken(token);
			await this.fetchProfile();
			// vuems_name 必须先落盘，permiss.reset() 依赖它判断是否已登录
			localStorage.setItem('vuems_name', this.user.name || 'admin');
			usePermissStore().reset();
			return res;
		},
		logout() {
			this.token = '';
			this.user.name = '';
			this.user.tenantAlias = '';
			localStorage.removeItem('token');
			localStorage.removeItem('vuems_name');
			usePermissStore().reset();
		},
		init() {
			/* ensures reactive hydration from localStorage on first use */
		},
	},
});