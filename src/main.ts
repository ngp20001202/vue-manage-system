import { createApp, watch } from 'vue';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { usePermissStore } from './store/permiss';
import { useUserStore } from './store/user';
import i18n from './language';
import 'element-plus/dist/index.css';
import './assets/css/icon.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
// 初始化 user store（从 localStorage 恢复 token/name）
const user = useUserStore();
user.init();

// 自定义权限指令：响应 permiss.key 的变化，
// 用户从外部 ?token= 跳入时 reset() 把 key 从 user 改成 admin，
// 这里也会随之重新计算 hidden。
const permiss = usePermissStore();
app.directive('permiss', {
    mounted(el, binding) {
        const apply = () => {
            const value = String(binding.value ?? '');
            if (value && !permiss.key.includes(value)) {
                el.hidden = true;
            } else {
                el.hidden = false;
            }
        };
        apply();
        watch(() => permiss.key, apply);
    },
});

app.mount('#app');
