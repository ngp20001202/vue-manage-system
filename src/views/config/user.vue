<template>
	<div class="config-user">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="0" />
				<el-tab-pane :label="t('pages.config.user.TenantUser')" name="1" />
				<el-tab-pane :label="t('pages.config.user.SiteUser')" name="2" />
			</el-tabs>

			<div class="tabs-content">
				<el-form :inline="true" class="filter-form">
					<el-form-item>
						<el-input
							v-model="keyword"
							:placeholder="t('pages.Alias')"
							clearable
							class="keyword-input"
							@keyup.enter="onSearch"
						/>
					</el-form-item>
					<el-form-item v-if="activeName === '2'">
						<el-select
							v-model="siteId"
							class="site-select"
							:placeholder="t('pages.config.user.Site')"
							clearable
						>
							<el-option
								v-for="s in siteOptions"
								:key="s.id"
								:label="s.alias"
								:value="s.id"
							/>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Reset') }}
						</el-button>
						<el-button type="primary" :icon="Plus" @click="onCreate">
							{{ t('pages.Create') }}
						</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<el-table
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
			>
				<el-table-column :label="t('pages.Alias')" prop="alias" min-width="140">
					<template #default="scope">
						<span class="cyan">{{ scope.row.alias }}</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.Username')"
					prop="username"
					min-width="140"
				/>
				<el-table-column :label="t('pages.Role')" min-width="140">
					<template #default="scope">
						<el-tag :type="roleTagType(scope.row.role)" effect="light">
							{{ roleText(scope.row.role) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.config.user.UserType')" min-width="120">
					<template #default="scope">
						<el-tag
							:type="scope.row.userType === 1 ? 'success' : 'warning'"
							effect="plain"
						>
							{{ userTypeText(scope.row.userType) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.config.user.Site')"
					prop="siteAlias"
					min-width="140"
				/>
				<el-table-column :label="t('pages.Phone')" prop="phone" min-width="140" />
				<el-table-column :label="t('pages.Email')" prop="email" min-width="180" />
				<el-table-column :label="statusLabel" min-width="120">
					<template #default="scope">
						<el-tag :type="scope.row.enabled ? 'success' : 'danger'" effect="light">
							{{ scope.row.enabled ? t('pages.config.user.Enabled') : t('pages.config.user.disabled') }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.Action')"
					width="220"
					align="center"
					fixed="right"
				>
					<template #default="scope">
						<div class="action-cell">
							<el-button
								type="primary"
								size="small"
								:icon="Edit"
								@click="() => onEdit(scope.row)"
							>
								{{ t('pages.Edit') }}
							</el-button>
							<el-button
								:type="scope.row.enabled ? 'warning' : 'success'"
								size="small"
								:icon="scope.row.enabled ? 'Lock' : 'Unlock'"
								@click="() => onToggleStatus(scope.row)"
							>
								{{ scope.row.enabled ? t('pages.config.user.disabled') : t('pages.config.user.Enabled') }}
							</el-button>
							<el-button
								type="info"
								size="small"
								:icon="Key"
								@click="() => onResetPassword(scope.row)"
							>
								{{ t('pages.config.user.ResetPassword') }}
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
				<el-form-item
					:label="t('pages.Username')"
					prop="username"
				>
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
				<el-form-item
					:label="t('pages.Alias')"
					prop="alias"
				>
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
					<el-input v-model="form.countryCode" :placeholder="t('pages.countrycode')" />
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
				<el-form-item
					:label="t('pages.config.user.Password')"
					prop="newPassword"
				>
					<el-input
						v-model="resetForm.newPassword"
						type="password"
						show-password
						:placeholder="t('pages.config.user.Password')"
					/>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Search, Refresh, Plus, Edit, Key } from '@element-plus/icons-vue';
import {
	userlist,
	usercreate,
	userupdate,
	userdisable,
	userresetpwd,
	usersitelist,
	userroleslist,
} from '@/api/userlist';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface UserRow extends Record<string, any> {
	id: string | number;
	alias?: string;
	username?: string;
	role?: string;
	userType?: number;
	siteId?: number;
	siteAlias?: string;
	phone?: string;
	email?: string;
	countryCode?: string;
	enabled?: boolean;
}

const activeName = ref('0');
const keyword = ref('');
const siteId = ref<string | number | undefined>(undefined);
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
	username: [
		{ required: true, message: t('pages.required'), trigger: 'blur' },
	],
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

const statusLabel = computed(() => t('pages.config.user.Enabled') + '/' + t('pages.config.user.disabled'));

const userTypeText = (ut?: number) =>
	ut === 1
		? t('pages.config.user.TenantUser')
		: ut === 2
		? t('pages.config.user.SiteUser')
		: '';

const roleText = (r?: string) => {
	if (!r) return '';
	if (r === 'ClientMgr') return t('pages.config.user.ClientMgr');
	if (r === 'ClientAdmin') return t('pages.config.user.ClientAdmin');
	if (r === 'ClientOP') return t('pages.config.user.ClientOP');
	if (r === 'HubOperator') return t('pages.config.user.HubOperator');
	return r;
};

const roleTagType = (r?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
	if (r === 'ClientAdmin') return 'danger';
	if (r === 'ClientMgr') return 'warning';
	if (r === 'HubOperator') return 'info';
	return 'success';
};

const init = () => {
	keyword.value = '';
	siteId.value = undefined;
};

const onReset = () => {
	init();
	pagecurrent.value = 1;
	onSearch();
};

const beforeLeave = (e: string | number) => {
	init();
	pagecurrent.value = 1;
	if (String(e) === '0') {
		activeName.value = '0';
	} else {
		activeName.value = String(e);
	}
	getdata();
	return true;
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const loadSites = async () => {
	const res: ApiResponse<any[]> = await usersitelist();
	if (res?.isSuccess && Array.isArray(res.result)) {
		siteOptions.value = res.result.map((s: any) => ({
			id: s.id ?? s.siteId,
			alias: s.alias ?? s.name ?? String(s.id ?? ''),
		}));
	}
};

const getdata = async () => {
	loading.value = true;
	// shippingspa 后端：UserAlias（关键字）/ SiteID（操作点过滤）。
	// 角色 / 类型 tab 改成客户端过滤。
	const res: ApiResponse<any> = await userlist({
		pageIndex: pagecurrent.value - 1,
		pageSize: count.value,
		UserAlias: keyword.value,
		SiteID: siteId.value || undefined,
	});
	if (res?.isSuccess) {
		const all = (res.result ?? []) as UserRow[];
		// 客户端按角色 / tab 过滤
		const tab = activeName.value;
		routeData.value = tab === '0'
			? all
			: all.filter((u) => {
				if (tab === '1') return !!u.tenantID && !u.siteID;
				if (tab === '2') return !!u.siteID;
				return true;
			});
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
		username: row.username || '',
		alias: row.alias || '',
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
		ElMessage.success(t('pages.Success'));
		closeDialog();
		getdata();
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const onToggleStatus = (row: UserRow) => {
	const target = !row.enabled;
	ElMessageBox.confirm(
		target
			? t('pages.config.user.Enabled') + ' ' + (row.username || row.alias)
			: t('pages.config.user.disabled') + ' ' + (row.username || row.alias),
		target ? t('pages.config.user.Enabled') : t('pages.config.user.disabled'),
		{
			confirmButtonText: t('pages.Save'),
			cancelButtonText: t('pages.Cancel'),
			type: 'warning',
			center: true,
		},
	)
		.then(async () => {
			const res: ApiResponse<any> = await userupdate({
				id: row.id as any,
				enabled: target,
			});
			if (res?.isSuccess) {
				ElMessage.success(t('pages.Success'));
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		})
		.catch(() => {});
};

const onDisableRow = async (row: UserRow) => {
	const res: ApiResponse<any> = await userdisable({ id: row.id });
	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
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
		{ min: 6, message: t('pages.required'), trigger: 'blur' },
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

const onResetPassword = (row: UserRow) => {
	resetForm.id = row.id;
	resetForm.username = row.username || row.alias || '';
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
		id: resetForm.id,
		newPassword: resetForm.newPassword,
	});
	resetSubmitting.value = false;
	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
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
.tabs-content {
	margin-top: 12px;
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
	width: 180px;
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
:deep(.el-tabs--border-card) {
	box-shadow: none;
	border: 1px solid #ebeef5;
}
:deep(.el-tabs__content) {
	display: none !important;
}
:deep(.el-tabs__item) {
	height: 40px;
	line-height: 40px;
}
@media (max-width: 768px) {
	.keyword-input,
	.site-select {
		width: 100%;
	}
}
</style>
