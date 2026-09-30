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
		user: {
			name: localStorage.getItem('vuems_name') || '',
			avatar: '',
			tenantAlias: '',
		} as UserInfo,
	}),
	actions: {
		async login(username: string, password: string) {
			const res: any = await gettoken({ username, password });
			if (res?.isSuccess) {
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
				if (u?.idUrl) localStorage.setItem('idUrl', u.idUrl);
			} catch {}
		},
		// 免密登录：URL 上带 ?token= 时用它换取 cookie，由后端 Set-Cookie 写入
		async loginByToken(urlToken: string) {
			const res: any = await gettokens(urlToken);
			if (!res?.isSuccess) return res;
			await this.fetchProfile();
			// vuems_name 必须先落盘，permiss.reset() 依赖它判断是否已登录
			localStorage.setItem('vuems_name', this.user.name || 'admin');
			usePermissStore().reset();
			return res;
		},
		logout() {
			localStorage.clear();
			usePermissStore().reset();
			window.location.href = '/Account/Logout';
		},
	},
});

export const redirectToAuthUrl = (options?: { clearStorage?: boolean }) => {
	const idUrl = localStorage.getItem('idUrl');
	const loginUrl = idUrl ? `${idUrl.replace(/\/$/, '')}` : '/Account/Logout';
	if (options?.clearStorage) localStorage.clear();
	window.location.href = loginUrl;
};