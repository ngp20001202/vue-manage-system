<template>
	<div class="config-user">
		<el-card shadow="never" class="filter-card">
			<el-form :inline="true" class="filter-form">
				<el-form-item>
					<el-select
						v-model="siteId"
						class="site-select"
						:placeholder="t('pages.config.user.Site')"
						filterable
					>
						<el-option :label="t('pages.config.user.Site')" :value="0" />
						<el-option
							v-for="s in siteOptions"
							:key="s.value"
							:label="s.label"
							:value="s.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-input
						v-model="alias"
						:placeholder="t('pages.Alias')"
						clearable
						class="keyword-input"
						@keyup.enter="onSearch"
					/>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :icon="Search" @click="onSearch">
						{{ t('pages.Search') }}
					</el-button>
					<el-button :icon="Refresh" @click="onReset">
						{{ t('pages.Reset') }}
					</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div class="operation">
				<el-button type="success" size="small" class="create-btn" :icon="Plus" @click="onCreate" />
				<el-pagination
					v-show="routeData.length"
					class="op-row-pager"
					background
					layout="total, prev, pager, next, sizes"
					:total="availcnt"
					:current-page="pagecurrent"
					:page-size="count"
					:page-sizes="[10, 20, 50, 100]"
					@current-change="(p: number) => (pagecurrent = p)"
					@size-change="(s: number) => (count = s)"
				/>
			</div>

			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.ID')" min-width="120">
					<template #default="scope">
						<span class="cyan" @click="() => onEdit(scope.row)">
							<el-icon class="edit-icon"><Edit /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.Alias')"
					prop="userAlias"
					min-width="160"
				/>
				<el-table-column
					:label="t('pages.Username')"
					prop="loginName"
					min-width="160"
				/>
				<el-table-column
					:label="t('pages.Site')"
					prop="siteAlias"
					min-width="160"
				/>
				<el-table-column
					:label="t('pages.Action')"
					width="280"
					align="left"
					fixed="right"
					class-name="action-col"
				>
					<template #default="scope">
						<div class="action-cell">
							<el-button
								type="primary"
								size="small"
								:icon="Key"
								@click="() => onResetPassword(scope.row)"
							>
								{{ t('pages.config.user.ResetPassword') }}
							</el-button>
							<el-button
								v-if="!scope.row.isDisabled"
								type="danger"
								size="small"
								:icon="Lock"
								@click="() => onToggleDisabled(scope.row, true)"
							>
								{{ t('pages.config.user.disabled') }}
							</el-button>
							<el-button
								v-else
								type="success"
								size="small"
								:icon="Unlock"
								@click="() => onToggleDisabled(scope.row, false)"
							>
								{{ t('pages.config.user.Enabled') }}
							</el-button>
						</div>
					</template>
				</el-table-column>
				<template #empty>
					<el-empty :description="t('pages.NoData')" />
				</template>
			</el-table>

			<el-pagination
				v-if="routeData.length"
				class="pager"
				background
				layout="total, prev, pager, next, sizes"
				:total="availcnt"
				:current-page="pagecurrent"
				:page-size="count"
				:page-sizes="[10, 20, 50, 100]"
				@current-change="(p: number) => (pagecurrent = p)"
				@size-change="(s: number) => (count = s)"
			/>
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			:title="isEdit ? t('pages.Edit') : t('pages.Create')"
			width="50%"
			destroy-on-close
			:close-on-click-modal="false"
			@close="closeDialog"
		>
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="140px"
				class="user-form"
			>
				<el-form-item
					:label="t('pages.config.user.Site')"
					prop="siteId"
				>
					<el-select
						v-model="form.siteId"
						:placeholder="t('pages.config.user.Site')"
						filterable
						style="width: 100%"
					>
						<el-option v-if="isEdit" label=" " :value="'0'" />
						<el-option
							v-for="s in siteOptions"
							:key="s.value"
							:label="s.label"
							:value="s.value"
						/>
					</el-select>
				</el-form-item>

				<template v-if="!isEdit">
					<h4 class="form-section">
						{{ t('pages.config.user.LoginInformation') }}
					</h4>
					<hr class="section-divider" />
					<el-form-item :label="t('pages.Username')" prop="loginName">
						<el-input
							v-model="form.loginName"
							:placeholder="t('pages.Username')"
						/>
					</el-form-item>
					<el-form-item
						:label="t('pages.config.user.Password')"
						prop="password"
					>
						<el-input
							v-model="form.password"
							type="password"
							show-password
							:placeholder="t('pages.config.user.Password')"
						/>
					</el-form-item>
					<el-form-item
						v-if="form.password"
						label=""
					>
						<div class="pwd-strength">
							<div class="pwd-strength__segments">
								<div
									v-for="i in 5"
									:key="i"
									class="pwd-strength__segment"
									:class="{ active: i <= pwdStrength.level }"
									:style="{
										backgroundColor:
											i <= pwdStrength.level ? pwdStrength.color : '#e0e0e0',
									}"
								/>
							</div>
							<span
								class="pwd-strength__label"
								:style="{ color: pwdStrength.color }"
							>
								{{ pwdStrength.label }}
							</span>
						</div>
					</el-form-item>
					<el-form-item
						:label="t('pages.config.user.VerifyPassword')"
						prop="cfmpassword"
					>
						<el-input
							v-model="form.cfmpassword"
							type="password"
							show-password
							:placeholder="t('pages.config.user.VerifyPasswordplace')"
						/>
					</el-form-item>

					<h4 class="form-section">
						{{ t('pages.config.user.UserInformation') }}
					</h4>
					<hr class="section-divider" />
				</template>

				<el-form-item :label="t('pages.Alias')" prop="userAlias">
					<el-input
						v-model="form.userAlias"
						:placeholder="t('pages.config.user.Aliasplace')"
					/>
				</el-form-item>

				<template v-if="!isEdit">
					<el-form-item :label="t('pages.Email')" prop="email">
						<el-input
							v-model="form.email"
							:placeholder="t('pages.emailplace')"
							maxlength="50"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.Role')" prop="roleIds">
						<el-checkbox-group v-model="form.roleIds">
							<el-checkbox
								v-for="r in roleOptions"
								:key="r.value"
								:value="r.value"
							>
								{{ r.label }}
							</el-checkbox>
						</el-checkbox-group>
					</el-form-item>
				</template>
			</el-form>
			<template #footer>
				<el-button @click="closeDialog">{{ t('pages.Cancel') }}</el-button>
				<el-button type="primary" :loading="submitting" @click="onSubmit">
					{{ t('pages.Save') }}
				</el-button>
			</template>
		</el-dialog>

		<el-dialog
			v-model="resetPwdVisible"
			:title="t('pages.config.user.ResetPassword')"
			width="440px"
			destroy-on-close
			:close-on-click-modal="false"
		>
			<el-form
				ref="resetFormRef"
				:model="resetForm"
				:rules="resetRules"
				label-width="120px"
			>
				<el-form-item :label="t('pages.Username')">
					<span>{{ resetForm.username }}</span>
				</el-form-item>
				<el-form-item :label="t('pages.config.user.Password')" prop="newPassword">
					<el-input
						v-model="resetForm.newPassword"
						type="password"
						show-password
						:placeholder="t('pages.config.user.Password')"
					/>
					<div v-if="resetForm.newPassword" class="pwd-strength">
						<div class="pwd-strength__segments">
							<div
								v-for="i in 5"
								:key="i"
								class="pwd-strength__segment"
								:class="{ active: i <= resetPwdStrength.level }"
								:style="{
									backgroundColor:
										i <= resetPwdStrength.level ? resetPwdStrength.color : '#e0e0e0',
								}"
							/>
						</div>
						<span
							class="pwd-strength__label"
							:style="{ color: resetPwdStrength.color }"
						>
							{{ resetPwdStrength.label }}
						</span>
					</div>
				</el-form-item>
				<el-form-item
					:label="t('pages.config.user.VerifyPassword')"
					prop="verifyPassword"
				>
					<el-input
						v-model="resetForm.verifyPassword"
						type="password"
						show-password
						:placeholder="t('pages.config.user.VerifyPasswordplace')"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="resetPwdVisible = false">{{ t('pages.Cancel') }}</el-button>
				<el-button
					type="primary"
					:loading="resetSubmitting"
					@click="onSubmitReset"
				>
					{{ t('pages.Save') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Search, Refresh, Plus, Edit, Key, Lock, Unlock } from '@element-plus/icons-vue';
import {
	userlist,
	userdetail,
	usercreate,
	userupdate,
	userdisable,
	userresetpwd,
	usersitelist,
	userRole,
} from '@/api/userlist';
import type { ApiResponse } from '@/api/types';
import { passwordLevel, passwordStrengthValidator } from '@/utils/password-strength';

const { t } = useI18n();

interface UserRow extends Record<string, any> {
	id: string | number;
	userAlias?: string;
	loginName?: string;
	siteAlias?: string;
	isDisabled?: boolean;
	userType?: number;
	siteId?: number;
	role?: string;
	phone?: string;
	email?: string;
	countryCode?: string;
}

const alias = ref('');
const siteId = ref<string | number>(0);
const siteOptions = ref<Array<{ value: string | number; label: string }>>([]);
const roleOptions = ref<Array<{ value: string | number; label: string }>>([]);
const routeData = ref<UserRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const defaultForm = () => ({
	id: '' as string | number,
	siteId: undefined as string | number | undefined,
	loginName: '',
	password: '',
	cfmpassword: '',
	userAlias: '',
	email: '',
	roleIds: [] as Array<string | number>,
});

const form = reactive(defaultForm());

const pwdStrength = ref(passwordLevel(''));
watch(
	() => form.password,
	(val) => {
		pwdStrength.value = passwordLevel(val);
	},
);

const rules = computed<FormRules>(() => {
	// 编辑态只允许改操作点和别名，其余字段不参与校验
	if (isEdit.value) {
		return {
			siteId: [
				{
					validator: (_r: any, value: any, cb: any) => {
						if (!value || value === '0') cb(new Error(t('pages.required')));
						else cb();
					},
					trigger: 'change',
				},
			],
			userAlias: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
		};
	}
	return {
		siteId: [{ required: true, message: t('pages.required'), trigger: 'change' }],
		loginName: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
		password: [
			{ required: true, message: t('pages.required'), trigger: 'blur' },
			{
				validator: (_r, value, cb) => {
					if (!value) {
						cb(new Error(t('pages.required')));
						return;
					}
					const result = passwordStrengthValidator(value, 3);
					if (result === true) cb();
					else cb(new Error(result));
				},
				trigger: 'blur',
			},
		],
		cfmpassword: [
			{ required: true, message: t('pages.required'), trigger: 'blur' },
			{
				validator: (_r, value, cb) => {
					if (value !== form.password) {
						cb(new Error(t('pages.passwordMismatch') || '两次密码不一致'));
					} else {
						cb();
					}
				},
				trigger: 'blur',
			},
		],
		userAlias: [{ required: false }],
		email: [
			{ required: true, message: t('pages.required'), trigger: 'blur' },
			{
				validator: (_r, value, cb) => {
					const mailReg = /^([a-zA-Z0-9_.\-])+\@(([a-zA-Z0-9_.\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
					if (value && mailReg.test(value)) cb();
					else cb(new Error(t('pages.invalidEmail') || '邮箱格式不正确'));
				},
				trigger: 'blur',
			},
		],
		roleIds: [{ required: true, message: t('pages.required'), trigger: 'change' }],
	};
});

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const onReset = () => {
	alias.value = '';
	siteId.value = 0;
	pagecurrent.value = 1;
	getdata();
};

// 接口返回 { value, text }
const loadSites = async () => {
	const res: ApiResponse<any[]> = await usersitelist();
	if (res?.isSuccess && Array.isArray(res.result)) {
		siteOptions.value = res.result.map((s: any) => ({
			value: s.value,
			label: s.text,
		}));
	}
};

// 接口返回 { id, name }，勾选项的值为角色 id
const loadRoles = async () => {
	const res: ApiResponse<any[]> = await userRole();
	if (res?.isSuccess && Array.isArray(res.result)) {
		roleOptions.value = res.result.map((r: any) => ({
			value: r.id,
			label: r.name,
		}));
	}
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await userlist({
		pageIndex: pagecurrent.value - 1,
		pageSize: count.value,
		UserAlias: alias.value,
		SiteID: siteId.value || undefined,
	});
	if (res?.isSuccess) {
		routeData.value = (res.result ?? []) as UserRow[];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const onCreate = () => {
	Object.assign(form, defaultForm());
	if (siteOptions.value.length) {
		form.siteId = siteOptions.value[0].value;
	}
	isEdit.value = false;
	dialogVisible.value = true;
};

const onEdit = async (row: UserRow) => {
	Object.assign(form, defaultForm(), { id: row.id });
	isEdit.value = true;
	dialogVisible.value = true;
	const res: ApiResponse<any> = await userdetail(row.id);
	if (res?.isSuccess && res.result) {
		form.siteId = String(res.result.siteID);
		form.userAlias = res.result.userAlias || '';
	}
};

const closeDialog = () => {
	dialogVisible.value = false;
	isEdit.value = false;
	formRef.value?.resetFields();
};

const onSubmit = async () => {
	if (!formRef.value) return;
	const valid = await formRef.value.validate().catch(() => false);
	if (!valid) return;

	submitting.value = true;
	const res: ApiResponse<any> = isEdit.value
		? await userupdate(form.id, {
				siteID: form.siteId,
				userAlias: form.userAlias,
			})
		: await usercreate({
				email: form.email,
				loginName: form.loginName,
				userAlias: form.userAlias || form.loginName,
				siteID: form.siteId || 0,
				password: { value: form.password },
				RoleIds: form.roleIds || [],
			});
	submitting.value = false;

	if (res?.isSuccess) {
		ElMessage.success(res.message || t('pages.Success'));
		closeDialog();
		getdata();
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const onToggleDisabled = async (row: UserRow, isDisable: boolean) => {
	const res: ApiResponse<any> = await userdisable({
		ID: row.id,
		IsDisable: isDisable,
	});
	if (res?.isSuccess) {
		ElMessage.success(res.message || t('pages.Success'));
		getdata();
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const resetPwdVisible = ref(false);
const resetSubmitting = ref(false);
const resetFormRef = ref<FormInstance>();
const resetForm = reactive({
	id: '' as string | number,
	username: '',
	newPassword: '',
	verifyPassword: '',
});

const resetRules = reactive<FormRules>({
	newPassword: [
		{ required: true, message: t('pages.required'), trigger: 'blur' },
		{
			validator: (_r, value, cb) => {
				if (!value) {
					cb(new Error(t('pages.required')));
					return;
				}
				const result = passwordStrengthValidator(value, 3);
				if (result === true) {
					cb();
				} else {
					cb(new Error(result));
				}
			},
			trigger: 'blur',
		},
	],
	verifyPassword: [
		{ required: true, message: t('pages.required'), trigger: 'blur' },
		{
			validator: (_r, value, cb) => {
				if (value !== resetForm.newPassword) {
					cb(new Error(t('pages.required')));
				} else {
					cb();
				}
			},
			trigger: 'blur',
		},
	],
});

const resetPwdStrength = ref(passwordLevel(''));
watch(
	() => resetForm.newPassword,
	(val) => {
		resetPwdStrength.value = passwordLevel(val);
	},
);

const onResetPassword = (row: UserRow) => {
	resetForm.id = row.id;
	resetForm.username = row.loginName || row.userAlias || '';
	resetForm.newPassword = '';
	resetForm.verifyPassword = '';
	resetPwdVisible.value = true;
};

const onSubmitReset = async () => {
	if (!resetFormRef.value) return;
	const valid = await resetFormRef.value.validate().catch(() => false);
	if (!valid) return;
	resetSubmitting.value = true;
	const res: ApiResponse<any> = await userresetpwd({
		ID: resetForm.id,
		NewPassword: resetForm.newPassword,
	});
	resetSubmitting.value = false;
	if (res?.isSuccess) {
		ElMessage.success(res.message || t('pages.Success'));
		resetPwdVisible.value = false;
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

watch([count, pagecurrent], () => {
	getdata();
});

onMounted(() => {
	loadSites();
	loadRoles();
	getdata();
});
</script>

<style lang="scss" scoped>
.config-user {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.filter-card,
.table-card {
	background: #fff;
}
.filter-form {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	min-height: 60px;
}
.filter-form :deep(.el-form-item) {
	margin-right: 8px;
	margin-bottom: 0;
}
.keyword-input {
	width: 200px;
}
.site-select {
	width: 220px;
}
.operation {
	display: flex;
	align-items: center;
	min-height: 50px;
	margin-bottom: 10px;
	flex-wrap: wrap;
	gap: 12px;
	justify-content: space-between;
}
.create-btn {
	min-width: 0 !important;
	padding: 5px 8px;
	color: #fff;
	border: none;
}
.action-cell {
	display: flex;
	flex-wrap: nowrap;
	justify-content: left;
	align-items: center;
	gap: 4px;
	padding: 0;
}
.action-cell :deep(.el-button.is-small) {
	padding: 3px 6px;
	font-size: 12px;
}
.action-cell :deep(.el-button.is-small .el-icon) {
	font-size: 12px;
}
.cyan {
	color: #17a2b8;
	cursor: pointer;
}
.edit-icon {
	margin-right: 4px;
	vertical-align: middle;
}
.user-form {
	padding-right: 16px;
}
.form-section {
	margin: 0 0 8px;
	font-weight: 500;
	font-size: 14px;
	color: #303133;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
.op-row-pager {
	flex-shrink: 0;
}
@media (max-width: 768px) {
	.keyword-input,
	.site-select {
		width: 100%;
	}
}
.pwd-strength {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 6px;
}
.pwd-strength__segments {
	display: flex;
	flex: 1;
	gap: 3px;
	height: 5px;
}
.pwd-strength__segment {
	flex: 1;
	height: 100%;
	background-color: #e0e0e0;
	transition: background-color 0.3s ease;
}
.pwd-strength__label {
	font-size: 12px;
	min-width: 48px;
	text-align: right;
	transition: color 0.3s ease;
}
</style>
