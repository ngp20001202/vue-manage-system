<template>
	<div class="login-bg">
		<div class="login-container">
			<div class="login-header">
				<img class="logo mr10" src="../../assets/img/logo.svg" alt="" />
				<div class="login-title">重置密码</div>
			</div>
			<el-form :model="param" :rules="rules" ref="resetForm" size="large">
				<el-form-item prop="username">
					<el-input v-model="param.username" placeholder="用户名">
						<template #prepend>
							<el-icon>
								<User />
							</el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="email">
					<el-input v-model="param.email" placeholder="邮箱">
						<template #prepend>
							<el-icon>
								<Message />
							</el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="code">
					<el-input v-model="param.code" placeholder="请输入验证码" maxlength="6">
						<template #prepend>
							<el-icon>
								<Key />
							</el-icon>
						</template>
						<template #append>
							<el-button :disabled="codeState.status" @click="getCode">
								{{ codeState.title }}
							</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="newPassword">
					<el-input
						:type="showNew ? 'text' : 'password'"
						placeholder="新密码"
						v-model="param.newPassword"
					>
						<template #prepend>
							<el-icon>
								<Lock />
							</el-icon>
						</template>
						<template #suffix>
							<el-icon class="pwd-toggle" @click="showNew = !showNew">
								<component :is="showNew ? View : Hide" />
							</el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="confirmPassword">
					<el-input
						:type="showConfirm ? 'text' : 'password'"
						placeholder="确认密码"
						v-model="param.confirmPassword"
						@keyup.enter="submitForm(resetForm)"
					>
						<template #prepend>
							<el-icon>
								<Lock />
							</el-icon>
						</template>
						<template #suffix>
							<el-icon class="pwd-toggle" @click="showConfirm = !showConfirm">
								<component :is="showConfirm ? View : Hide" />
							</el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-button
					class="login-btn"
					type="primary"
					size="large"
					:loading="submitting"
					@click="submitForm(resetForm)"
				>
					重置密码
				</el-button>
				<p class="login-text">
					记起密码了？<el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
				</p>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Message, Lock, Key, View, Hide } from '@element-plus/icons-vue';
import { getVerificationCode, resetPassword } from '@/api/auth';

interface ResetPwdParam {
	username: string;
	email: string;
	code: string;
	newPassword: string;
	confirmPassword: string;
}

const router = useRouter();

const submitting = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const param = reactive<ResetPwdParam>({
	username: '',
	email: '',
	code: '',
	newPassword: '',
	confirmPassword: '',
});

const codeState = reactive({
	title: '获取验证码',
	time: 60,
	status: false,
});

let timer: ReturnType<typeof setInterval> | null = null;

const validateConfirm = (_rule: any, value: string, callback: (err?: Error) => void) => {
	if (value === '') {
		callback(new Error('请再次输入密码'));
	} else if (value !== param.newPassword) {
		callback(new Error('两次输入密码不一致'));
	} else {
		callback();
	}
};

const validatePasswordStrength = (_rule: any, value: string, callback: (err?: Error) => void) => {
	if (value === '') {
		callback(new Error('请输入新密码'));
		return;
	}
	if (value.length < 8) {
		callback(new Error('密码长度不能少于 8 位'));
		return;
	}
	// 至少包含字母与数字
	const hasLetter = /[A-Za-z]/.test(value);
	const hasDigit = /[0-9]/.test(value);
	if (!hasLetter || !hasDigit) {
		callback(new Error('密码必须包含字母和数字'));
		return;
	}
	callback();
};

const rules: FormRules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	email: [
		{ required: true, message: '请输入邮箱', trigger: 'blur' },
		{
			pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
			message: '请输入正确的邮箱格式',
			trigger: 'blur',
		},
	],
	code: [
		{ required: true, message: '请输入验证码', trigger: 'blur' },
		{ pattern: /^\d{6}$/, message: '验证码为 6 位数字', trigger: 'blur' },
	],
	newPassword: [
		{ required: true, validator: validatePasswordStrength, trigger: 'blur' },
		{ required: true, validator: validatePasswordStrength, trigger: 'change' },
	],
	confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }],
};

const resetForm = ref<FormInstance>();

const getCode = async () => {
	if (codeState.status) return;
	if (!param.username) {
		ElMessage.error('请先输入用户名');
		return;
	}
	if (!param.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(param.email)) {
		ElMessage.error('请输入正确的邮箱');
		return;
	}
	try {
		await getVerificationCode({ username: param.username, email: param.email });
		ElMessage.success('验证码已发送，请注意查收');
		startCountdown();
	} catch (e: any) {
		ElMessage.error(e?.message || '验证码发送失败');
	}
};

const startCountdown = () => {
	codeState.status = true;
	codeState.time = 60;
	codeState.title = `${codeState.time}s 后重发`;
	if (timer) clearInterval(timer);
	timer = setInterval(() => {
		codeState.time -= 1;
		if (codeState.time <= 0) {
			resetCodeState();
		} else {
			codeState.title = `${codeState.time}s 后重发`;
		}
	}, 1000);
};

const resetCodeState = () => {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
	codeState.title = '获取验证码';
	codeState.time = 60;
	codeState.status = false;
};

onUnmounted(() => {
	if (timer) clearInterval(timer);
});

const submitForm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	const valid = await formEl.validate().catch(() => false);
	if (!valid) {
		ElMessage.error('请填写完整信息');
		return;
	}
	submitting.value = true;
	try {
		await resetPassword({
			username: param.username,
			email: param.email,
			code: param.code,
			newPassword: param.newPassword,
		});
		ElMessage.success('密码重置成功，请登录');
		router.replace('/login');
	} catch (e: any) {
		ElMessage.error(e?.message || '密码重置失败');
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
.login-btn {
	display: block;
	width: 100%;
}
.login-text {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 20px;
	font-size: 14px;
	color: #787878;
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
