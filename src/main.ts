import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
	ArrowDown,
	ArrowRight,
	CircleCheck,
	CircleClose,
	CirclePlus,
	ColdDrink,
	Delete,
	DocumentCopy,
	Download,
	Edit,
	Expand,
	Fold,
	FolderAdd,
	FullScreen,
	Hide,
	InfoFilled,
	Key,
	List,
	Lock,
	Message,
	Notebook,
	Picture,
	Plus,
	Printer,
	Refresh,
	RefreshLeft,
	RefreshRight,
	Remove,
	Search,
	Setting,
	Timer,
	Upload,
	UploadFilled,
	User,
	Van,
	View,
	Warning,
	WarningFilled,
} from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { useUserStore } from './store/user';
import i18n from './language';
import './assets/css/icon.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

// 注册模板中实际使用的 Element Plus 图标（按需具名导入 + sideEffects:false 保证 tree-shake，
// 不会再打包未使用的 ~160+ 图标）
const icons = {
	ArrowDown,
	ArrowRight,
	CircleCheck,
	CircleClose,
	CirclePlus,
	ColdDrink,
	Delete,
	DocumentCopy,
	Download,
	Edit,
	Expand,
	Fold,
	FolderAdd,
	FullScreen,
	Hide,
	InfoFilled,
	Key,
	List,
	Lock,
	Message,
	Notebook,
	Picture,
	Plus,
	Printer,
	Refresh,
	RefreshLeft,
	RefreshRight,
	Remove,
	Search,
	Setting,
	Timer,
	Upload,
	UploadFilled,
	User,
	Van,
	View,
	Warning,
	WarningFilled,
};
for (const [name, comp] of Object.entries(icons)) {
	app.component(name, comp);
}

// 初始化 user store（从 localStorage 恢复 token/name）
const user = useUserStore();
user.init();

app.mount('#app');