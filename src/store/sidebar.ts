import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
	state: () => {
		return {
			collapse: false,
			mobileOpen: false,
			bgColor: localStorage.getItem('sidebar-bg-color') || '#324157',
			textColor: localStorage.getItem('sidebar-text-color') || '#bfcbd9'
		};
	},
	getters: {},
	actions: {
		handleCollapse() {
			this.collapse = !this.collapse;
		},
		toggleMobile() {
			this.mobileOpen = !this.mobileOpen;
		},
		closeMobile() {
			this.mobileOpen = false;
		},
		setBgColor(color: string) {
			this.bgColor = color;
			localStorage.setItem('sidebar-bg-color', color);
		},
		setTextColor(color: string) {
			this.textColor = color;
			localStorage.setItem('sidebar-text-color', color);
		}
	}
});
