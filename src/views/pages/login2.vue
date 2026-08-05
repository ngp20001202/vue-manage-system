<template>
	<div class="login2-page">
		<div class="login2-left">
			<div class="login2-brand">
				<img class="brand-logo" src="../../assets/img/logo.svg" alt="" />
				<span class="brand-name">{{ appTitle }}</span>
			</div>
			<div class="login2-visual">
				<AnimatedCharacters
					:is-typing="isTyping"
					:show-password="showPassword"
					:password-length="param.password.length"
				/>
			</div>
			<!-- Decorative orbs (match careercompass) -->
			<div class="visual-orb visual-orb-a" />
			<div class="visual-orb visual-orb-b" />
		</div>

		<div class="login2-right">
			<div class="login2-mobile-brand">
				<img class="brand-logo" src="../../assets/img/logo.svg" alt="" />
				<span class="brand-name">{{ appTitle }}</span>
			</div>

			<div class="login2-form-wrap">
				<div class="login2-header">
					<h1 class="login2-title">{{ t('pages.WelcomeBack') }}</h1>
					<p class="login2-subtitle">{{ t('pages.EnterDetails') }}</p>
				</div>

				<el-form
					ref="loginForm"
					:model="param"
					:rules="rules"
					size="large"
					class="login2-form"
					@keyup.enter="submitForm(loginForm)"
				>
					<el-form-item prop="username">
						<label class="login2-label">{{ t('pages.username') }}</label>
						<el-input
							v-model="param.username"
							:placeholder="t('pages.Pleaseenteryourusername')"
							autocomplete="username"
							clearable
							@focus="isTyping = true"
							@blur="isTyping = false"
						/>
					</el-form-item>

					<el-form-item prop="password">
						<label class="login2-label">{{ t('pages.password') }}</label>
						<el-input
							v-model="param.password"
							:type="showPassword ? 'text' : 'password'"
							:placeholder="t('pages.enteryourPIN')"
							autocomplete="current-password"
							@focus="isTyping = true"
							@blur="isTyping = false"
						>
							<template #suffix>
								<el-icon class="pwd-toggle" @click="showPassword = !showPassword">
									<component :is="showPassword ? View : Hide" />
								</el-icon>
							</template>
						</el-input>
					</el-form-item>

					<div v-if="errorMsg" class="login2-error">
						{{ errorMsg }}
					</div>

					<el-button
						class="login2-btn"
						type="primary"
						size="large"
						:loading="submitting"
						@click="submitForm(loginForm)"
					>
						{{ submitting ? t('pages.LoggingIn') || '登录中...' : t('menu.Login') }}
					</el-button>
				</el-form>

				<div class="login2-lang">
					<el-radio-group v-model="currentLang" size="small" @change="onLangChange">
						<el-radio-button label="zh-cn">中文</el-radio-button>
						<el-radio-button label="en">EN</el-radio-button>
					</el-radio-group>
				</div>
			</div>
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
import AnimatedCharacters from '@/components/AnimatedCharacters.vue';

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
const submitting = ref(false);
const showPassword = ref(false);
const isTyping = ref(false);
const errorMsg = ref('');
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
	username: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	password: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
};

const loginForm = ref<FormInstance>();
const submitForm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	errorMsg.value = '';
	const valid = await formEl.validate().catch(() => false);
	if (!valid) {
		errorMsg.value = t('pages.required');
		return;
	}
	submitting.value = true;
	try {
		const res: any = await user.login(param.username, param.password);
		if (!user.token) {
			errorMsg.value = res?.message || t('pages.Failed');
			return;
		}
		ElMessage.success(t('pages.LoginSuccessfully'));
		localStorage.setItem('login-param', JSON.stringify(param));
		tabs.clearTabs();
		router.replace('/');
	} catch (e: any) {
		errorMsg.value = e?.message || t('pages.Failed');
	} finally {
		submitting.value = false;
	}
};
</script>

<style lang="scss" scoped>
.login2-page {
	display: grid;
	grid-template-columns: 1fr 1fr;
	min-height: 100vh;
	width: 100%;
	font-family: inherit;
}

.login2-left {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 48px;
	color: #1f2937;
	background: #f5a404;
	overflow: hidden;
}

.login2-brand {
	display: flex;
	align-items: center;
	gap: 12px;
	z-index: 2;
	.brand-logo {
		width: 32px;
		height: 32px;
		padding: 4px;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		backdrop-filter: blur(4px);
	}
	.brand-name {
		font-size: 18px;
		font-weight: 600;
	}
}

.login2-visual {
	position: relative;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 500px;
	pointer-events: none;
	margin-bottom: 20%;
}

.visual-orb {
	position: absolute;
	border-radius: 50%;
	filter: blur(80px);
	opacity: 0.55;
	pointer-events: none;
	z-index: 1;
}
.visual-orb-a {
	width: 320px;
	height: 320px;
	top: 15%;
	right: 18%;
	background: #f5a404;
}
.visual-orb-b {
	width: 420px;
	height: 420px;
	bottom: 15%;
	left: 10%;
	background: #f5a404;
}

.login2-right {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48px;
	background: #f9fafb;
}

.login2-mobile-brand {
	display: none;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	margin-bottom: 32px;
	.brand-logo {
		width: 28px;
		height: 28px;
		padding: 3px;
		background: #f3f4f6;
		border-radius: 6px;
	}
	.brand-name {
		font-size: 16px;
		font-weight: 600;
		color: #111827;
	}
}

.login2-form-wrap {
	width: 100%;
	max-width: 420px;
}
.el-form-item--large{
	margin-bottom: 20px !important;
}
.login2-header {
	margin-bottom: 32px;
	text-align: center;
}

.login2-title {
	font-size: 28px;
	font-weight: 700;
	color: #111827;
	margin: 0 0 8px;
	letter-spacing: -0.5px;
}

.login2-subtitle {
	font-size: 14px;
	color: #6b7280;
	margin: 0;
}

.login2-form {
	display: flex;
	flex-direction: column;
	gap: 0;
}

.login2-form :deep(.el-input__wrapper) {
	border-radius: 999px;
	padding: 4px 12px;
}

.login2-label {
	display: block;
	font-size: 14px;
	font-weight: 500;
	color: #374151;
	margin-bottom: 4px;
}

.login2-error {
	padding: 12px;
	font-size: 14px;
	color: #b91c1c;
	background: #fef2f2;
	border: 1px solid #fecaca;
	border-radius: 8px;
	margin-top: 4px;
}

.login2-btn {
	width: 100%;
	height: 48px;
	font-size: 16px;
	font-weight: 500;
	margin-top: 4px;
	border-radius: 999px;
}

.login2-lang {
	display: flex;
	justify-content: center;
	margin-top: 24px;
}

.pwd-toggle {
	cursor: pointer;
	color: #9ca3af;
	transition: color 0.2s;
}
.pwd-toggle:hover {
	color: #4f46e5;
}

@media (max-width: 768px) {
	.login2-page {
		grid-template-columns: 1fr;
	}
	.login2-left {
		display: none;
	}
	.login2-mobile-brand {
		display: flex;
	}
	.login2-right {
		flex-direction: column;
		padding: 24px;
	}
	.login2-header {
		text-align: center;
	}
}
</style>