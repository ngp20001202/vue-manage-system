import { defineStore } from 'pinia';
import { gettoken, getuser } from '@/api/auth';

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
		logout() {
			this.token = '';
			this.user.name = '';
			this.user.tenantAlias = '';
			localStorage.removeItem('token');
			localStorage.removeItem('vuems_name');
		},
		init() {
			/* ensures reactive hydration from localStorage on first use */
		},
	},
});