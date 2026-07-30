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
							:key="s.id"
							:label="s.alias"
							:value="s.id"
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
					align="center"
					fixed="right"
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
			width="720px"
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
				<h4 class="form-section">
					{{ t('pages.config.user.LoginInformation') }}
				</h4>
				<el-form-item :label="t('pages.Username')" prop="username">
					<el-input v-model="form.username" :placeholder="t('pages.Username')" />
				</el-form-item>
				<el-form-item
					v-if="!isEdit"
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
					v-if="!isEdit"
					:label="t('pages.config.user.VerifyPassword')"
					prop="verifyPassword"
				>
					<el-input
						v-model="form.verifyPassword"
						type="password"
						show-password
						:placeholder="t('pages.config.user.VerifyPasswordplace')"
					/>
				</el-form-item>

				<h4 class="form-section">
					{{ t('pages.config.user.UserInformation') }}
				</h4>
				<el-form-item :label="t('pages.Alias')" prop="alias">
					<el-input
						v-model="form.alias"
						:placeholder="t('pages.config.user.Aliasplace')"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.config.user.UserType')" prop="userType">
					<el-radio-group v-model="form.userType">
						<el-radio :label="1">{{ t('pages.config.user.TenantUser') }}</el-radio>
						<el-radio :label="2">{{ t('pages.config.user.SiteUser') }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item
					v-if="form.userType === 2"
					:label="t('pages.config.user.Site')"
					prop="siteId"
				>
					<el-select
						v-model="form.siteId"
						:placeholder="t('pages.config.user.Site')"
						style="width: 100%"
					>
						<el-option
							v-for="s in siteOptions"
							:key="s.id"
							:label="s.alias"
							:value="s.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.config.user.Roles')" prop="role">
					<el-select v-model="form.role" style="width: 100%">
						<el-option label="ClientMgr" value="ClientMgr" />
						<el-option label="ClientAdmin" value="ClientAdmin" />
						<el-option label="ClientOP" value="ClientOP" />
						<el-option label="HubOperator" value="HubOperator" />
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.Phone')" prop="phone">
					<el-input v-model="form.phone" :placeholder="t('pages.phoneplace')" />
				</el-form-item>
				<el-form-item :label="t('pages.Email')" prop="email">
					<el-input v-model="form.email" :placeholder="t('pages.emailplace')" />
				</el-form-item>
				<el-form-item :label="t('pages.countrycode')" prop="countryCode">
					<el-input
						v-model="form.countryCode"
						:placeholder="t('pages.countrycode')"
					/>
				</el-form-item>
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
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Search, Refresh, Plus, Edit, Key, Lock, Unlock } from '@element-plus/icons-vue';
import {
	userlist,
	usercreate,
	userupdate,
	userdisable,
	userresetpwd,
	usersitelist,
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
const siteId = ref(0);
const siteOptions = ref<Array<{ id: string | number; alias: string }>>([]);
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
	username: '',
	password: '',
	verifyPassword: '',
	alias: '',
	userType: 1 as number,
	siteId: undefined as number | undefined,
	role: 'ClientOP',
	phone: '',
	email: '',
	countryCode: '',
});

const form = reactive(defaultForm());

const rules = reactive<FormRules>({
	username: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	password: [
		{ required: true, message: t('pages.required'), trigger: 'blur' },
		{ min: 6, message: t('pages.required'), trigger: 'blur' },
	],
	verifyPassword: [
		{ required: true, message: t('pages.required'), trigger: 'blur' },
		{
			validator: (_r, value, cb) => {
				if (value !== form.password) {
					cb(new Error(t('pages.required')));
				} else {
					cb();
				}
			},
			trigger: 'blur',
		},
	],
	alias: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	userType: [{ required: true, message: t('pages.required'), trigger: 'change' }],
	siteId: [{ required: true, message: t('pages.required'), trigger: 'change' }],
	role: [{ required: true, message: t('pages.required'), trigger: 'change' }],
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

const loadSites = async () => {
	const res: ApiResponse<any[]> = await usersitelist();
	if (res?.isSuccess && Array.isArray(res.result)) {
		siteOptions.value = res.result.map((s: any) => ({
			id: s.id ?? s.siteId,
			alias: s.alias ?? s.name ?? s.text ?? String(s.id ?? ''),
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
	isEdit.value = false;
	dialogVisible.value = true;
};

const onEdit = (row: UserRow) => {
	Object.assign(form, defaultForm(), {
		id: row.id,
		username: row.loginName || '',
		alias: row.userAlias || '',
		userType: row.userType ?? 1,
		siteId: row.siteId,
		role: row.role || 'ClientOP',
		phone: row.phone || '',
		email: row.email || '',
		countryCode: row.countryCode || '',
	});
	isEdit.value = true;
	dialogVisible.value = true;
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

	const body: Record<string, any> = {
		username: form.username,
		alias: form.alias,
		userType: form.userType,
		role: form.role,
		phone: form.phone,
		email: form.email,
		countryCode: form.countryCode,
	};
	if (form.userType === 2) body.siteId = form.siteId;
	if (!isEdit.value) body.password = form.password;
	else body.id = form.id;

	submitting.value = true;
	const res: ApiResponse<any> = isEdit.value
		? await userupdate(body as any)
		: await usercreate(body);
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
	justify-content: center;
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
