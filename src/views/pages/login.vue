<template>
	<div class="login-bg">
		<div class="login-container">
			<div class="login-header">
				<div class="login-title">{{ t('menu.Login') }}</div>
			</div>
			<el-form :model="param" :rules="rules" ref="loginForm" size="large">
				<el-form-item prop="username">
					<el-input v-model="param.username" :placeholder="t('pages.username')">
						<template #prepend>
							<el-icon>
								<User />
							</el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input
						:type="showPassword ? 'text' : 'password'"
						:placeholder="t('pages.password')"
						v-model="param.password"
						@keyup.enter="submitForm(loginForm)"
					>
						<template #prepend>
							<el-icon>
								<Lock />
							</el-icon>
						</template>
						<template #suffix>
							<el-icon class="pwd-toggle" @click="showPassword = !showPassword">
								<component :is="showPassword ? View : Hide" />
							</el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-button
					class="login-btn"
					type="primary"
					size="large"
					:loading="submitting"
					@click="submitForm(loginForm)"
				>
					{{ t('menu.Login') }}
				</el-button>
				<p class="login-tips">Tips：{{ t('pages.Plseenteryourusername') }} / {{ t('pages.enteryourPIN') }}</p>
			</el-form>
			<slot name="lang">
				<div class="lang-switch">
					<el-radio-group v-model="currentLang" size="small" @change="onLangChange">
						<el-radio-button label="zh-cn">中文</el-radio-button>
						<el-radio-button label="en">EN</el-radio-button>
					</el-radio-group>
				</div>
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { View, Hide } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';
import { useTabsStore } from '@/store/tabs';

interface LoginInfo {
	username: string;
	password: string;
}

const { t } = useI18n();
const router = useRouter();
const user = useUserStore();
const tabs = useTabsStore();

const lgStr = localStorage.getItem('login-param');
const defParam = lgStr ? JSON.parse(lgStr) : null;
const checked = ref(lgStr ? true : false);
const submitting = ref(false);
const showPassword = ref(false);
const appTitle = (import.meta.env.VITE_APP_TITLE as string) || '随手寄';

const currentLang = ref(localStorage.getItem('lang') || 'zh-cn');
const onLangChange = (val: string | number | boolean | undefined) => {
	const lang = String(val ?? 'zh-cn');
	localStorage.setItem('lang', lang);
	window.location.reload();
};

const param = reactive<LoginInfo>({
	username: defParam?.username ?? '',
	password: defParam?.password ?? '',
});

const rules: FormRules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const loginForm = ref<FormInstance>();
const submitForm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	const valid = await formEl.validate().catch(() => false);
	if (!valid) {
		ElMessage.error('请输入完整登录信息');
		return;
	}
	submitting.value = true;
	try {
		const res: any = await user.login(param.username, param.password);
		if (!user.token) {
			ElMessage.error(res?.message || t('pages.Failed'));
			return;
		}
		ElMessage.success(t('pages.LoginSuccessfully'));
		if (checked.value) {
			localStorage.setItem('login-param', JSON.stringify(param));
		} else {
			localStorage.removeItem('login-param');
		}
		tabs.clearTabs();
		router.replace('/');
	} catch (e: any) {
		ElMessage.error(e?.message || '登录失败');
	} finally {
		submitting.value = false;
	}
};
</script>

<style scoped>
.login-bg {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100vh;
	background: url(../../assets/img/login-bg.jpg) center/cover no-repeat;
}
.login-header {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40px;
}
.logo {
	width: 35px;
}
.login-title {
	font-size: 22px;
	color: #333;
	font-weight: bold;
}
.login-container {
	width: 450px;
	border-radius: 5px;
	background: #fff;
	padding: 40px 50px 50px;
	box-sizing: border-box;
}
.pwd-tips {
	display: flex;
	justify-content: flex-end;
	margin: -10px 0 10px;
	font-size: 14px;
	color: #787878;
}
.login-btn {
	display: block;
	width: 100%;
}
.login-tips {
	font-size: 12px;
	color: #999;
	margin-top: 8px;
}
.lang-switch {
	display: flex;
	justify-content: center;
	margin-top: 20px;
}
.mr10 {
	margin-right: 10px;
}
.pwd-toggle {
	cursor: pointer;
	color: #909399;
}
.pwd-toggle:hover {
	color: #409eff;
}
</style>
