import { createI18n } from 'vue-i18n';
import ch from './ch';
import en from './en';

const lang = (localStorage.getItem('lang') as 'zh-cn' | 'en' | null) || 'zh-cn';

const i18n = createI18n({
	legacy: false,
	locale: lang,
	messages: {
		'zh-cn': ch,
		en,
	},
});

export default i18n;
