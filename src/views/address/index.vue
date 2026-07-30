<template>
	<div class="address-list">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane
					:label="t('pages.address.type.Billing')"
					name="Billing"
				/>
				<el-tab-pane
					:label="t('pages.address.type.Shipping')"
					name="Shipping"
				/>
				<el-tab-pane
					:label="t('pages.address.type.Returning')"
					name="Returning"
				/>
				<el-tab-pane
					:label="t('pages.address.type.Amazon')"
					name="Amazon"
				/>
				<el-tab-pane
					:label="t('pages.address.type.Consignee')"
					name="Consignee"
				/>
			</el-tabs>

			<div class="tabs-content">
				<el-form :inline="true" class="filter-form">
					<el-form-item>
						<el-input
							v-model="keyword"
							:placeholder="t('pages.Pleaseinput')"
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
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div class="op-row">
				<div class="op-row-left">
					<el-button
						type="primary"
						:icon="Plus"
						class="create-btn"
						@click="openCreate"
					>
						{{ t('pages.Create') }}
					</el-button>
				</div>
				<el-pagination
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

			<el-table
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
			>
				<el-table-column :label="t('pages.Name')" prop="name" min-width="140">
					<template #default="scope">
						<div class="name-cell">
							<span>{{ scope.row.name }}</span>
							<el-tag
								v-if="scope.row.isDefault"
								type="success"
								size="small"
								class="default-tag"
							>
								{{ t('pages.DefaultAddress') }}
							</el-tag>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.ContactName')"
					prop="contact"
					min-width="120"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.Phone')"
					prop="phone"
					width="160"
					show-overflow-tooltip
				/>
				<el-table-column :label="fullAddressLabel" min-width="280">
					<template #default="scope">
						<span class="address-cell">
							[{{ scope.row.countryCode || '--' }}]
							{{ scope.row.state || '' }}
							{{ scope.row.city || '' }}
							{{ scope.row.streetLine1 || '' }}
						</span>
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
								v-if="!scope.row.isDefault"
								type="success"
								size="small"
								@click="setDefault(scope.row)"
							>
								{{ t('pages.DefaultAddress') }}
							</el-button>
							<el-button
								type="primary"
								size="small"
								:icon="Edit"
								@click="openEdit(scope.row)"
							>
								{{ t('pages.Edit') }}
							</el-button>
							<el-button
								type="danger"
								size="small"
								:icon="Delete"
								@click="onDelete(scope.row)"
							>
								{{ t('pages.Delete') }}
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

		<!-- 创建 / 编辑 弹窗 -->
		<el-dialog
			v-model="dialogVisible"
			:title="
				dialogMode === 'create'
					? t('pages.address.create.title')
					: t('pages.address.edit.title')
			"
			width="640px"
			:close-on-click-modal="false"
			@closed="onDialogClosed"
		>
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="120px"
				label-position="right"
			>
				<el-form-item :label="t('pages.Name')" prop="name">
					<el-input v-model="form.name" :placeholder="t('pages.Pleaseinput')" />
				</el-form-item>
				<el-form-item :label="t('pages.ContactName')">
					<el-input v-model="form.contact" :placeholder="t('pages.Pleaseinput')" />
				</el-form-item>
				<el-form-item :label="t('pages.Phone')">
					<el-input v-model="form.phone" :placeholder="t('pages.phoneplace')" />
				</el-form-item>
				<el-form-item :label="t('pages.CountryCode')">
					<el-input
						v-model="form.countryCode"
						:placeholder="t('pages.countrycode')"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.ProvinceState')">
					<el-input v-model="form.state" />
				</el-form-item>
				<el-form-item :label="t('pages.City')">
					<el-input v-model="form.city" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine1')">
					<el-input v-model="form.streetLine1" />
				</el-form-item>
				<el-form-item :label="t('pages.ZipPostalCode')">
					<el-input v-model="form.zipPostalCode" />
				</el-form-item>
				<el-form-item :label="t('pages.address.create.default')">
					<el-switch v-model="form.isDefault" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">
					{{ t('pages.Cancel') }}
				</el-button>
				<el-button type="primary" :loading="submitting" @click="onSubmit">
					{{ t('pages.address.create.confirm') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import {
	Search,
	Refresh,
	Plus,
	Edit,
	Delete,
} from '@element-plus/icons-vue';
import {
	addresslist,
	addresscreate,
	addressupdate,
	addressdelete,
	addressdetail,
} from '@/api/address';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface AddressRow extends Record<string, any> {
	id: string | number;
	name: string;
	contact?: string;
	phone?: string;
	email?: string;
	company?: string;
	countryCode?: string;
	state?: string;
	city?: string;
	district?: string;
	streetLine1?: string;
	streetLine2?: string;
	streetLine3?: string;
	zipPostalCode?: string;
	type: string;
	isDefault?: boolean;
}

const fullAddressLabel = computed(
	() =>
		`${t('pages.CountryCode')}/${t('pages.ProvinceState')}/${t('pages.City')}/${t(
			'pages.StreetLine1',
		)}`,
);

const activeName = ref<string>('Billing');
const keyword = ref('');
const routeData = ref<AddressRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const submitting = ref(false);
const formRef = ref<FormInstance>();

const emptyForm = (): Omit<AddressRow, 'id'> => ({
	name: '',
	contact: '',
	phone: '',
	countryCode: '',
	state: '',
	city: '',
	streetLine1: '',
	zipPostalCode: '',
	type: activeName.value,
	isDefault: false,
});

const form = reactive<Omit<AddressRow, 'id'> & { id?: string | number }>(
	emptyForm(),
);

const rules = reactive<FormRules>({
	name: [
		{ required: true, message: t('pages.required'), trigger: 'blur' },
	],
});

const beforeLeave = (tab: string | number) => {
	activeName.value = String(tab);
	pagecurrent.value = 1;
	getdata();
	return true;
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const onReset = () => {
	keyword.value = '';
	pagecurrent.value = 1;
	getdata();
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await addresslist({
		index: pagecurrent.value - 1,
		size: count.value,
		Type: activeName.value,
		Keyword: keyword.value,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const openCreate = () => {
	dialogMode.value = 'create';
	Object.assign(form, emptyForm(), { type: activeName.value });
	dialogVisible.value = true;
};

const openEdit = (row: AddressRow) => {
	dialogMode.value = 'edit';
	Object.assign(form, row);
	dialogVisible.value = true;
};

const onDialogClosed = () => {
	formRef.value?.resetFields();
};

const onSubmit = async () => {
	if (!formRef.value) return;
	try {
		await formRef.value.validate();
	} catch {
		return;
	}
	submitting.value = true;
	try {
		let res: ApiResponse<any>;
		if (dialogMode.value === 'create') {
			res = await addresscreate({ ...form });
		} else {
			res = await addressupdate({ ...(form as AddressRow) });
		}
		if (res?.isSuccess) {
			ElMessage.success(t('pages.Success'));
			dialogVisible.value = false;
			getdata();
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} finally {
		submitting.value = false;
	}
};

const setDefault = async (row: AddressRow) => {
	try {
		await ElMessageBox.confirm(
			'',
			t('pages.DefaultAddress'),
			{
				confirmButtonText: t('pages.address.create.confirm'),
				cancelButtonText: t('pages.Cancel'),
				type: 'warning',
				center: true,
			},
		);
	} catch {
		return;
	}
	const res: ApiResponse<any> = await addresssetdefault(row.id);
	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
		getdata();
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const onDelete = async (row: AddressRow) => {
	try {
		await ElMessageBox.confirm(
			'',
			t('pages.Delete'),
			{
				confirmButtonText: t('pages.address.create.confirm'),
				cancelButtonText: t('pages.Cancel'),
				type: 'warning',
				center: true,
			},
		);
	} catch {
		return;
	}
	const res: ApiResponse<any> = await addressdelete({ id: row.id });
	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
		getdata();
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

watch([count, pagecurrent], () => {
	getdata();
});

onMounted(() => {
	getdata();
});
</script>

<style lang="scss" scoped>
.address-list {
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
	width: 220px;
}
.name-cell {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}
.default-tag {
	flex-shrink: 0;
}
.address-cell {
	color: #606266;
}
.op-row {
	display: flex;
	gap: 12px;
	align-items: center;
	margin-bottom: 12px;
	flex-wrap: wrap;
	justify-content: space-between;
}
.op-row-left {
	display: flex;
	gap: 8px;
	align-items: center;
}
.op-row-pager {
	flex-shrink: 0;
}
.op-row-pager :deep(.el-pagination__sizes) {
	margin-right: 0;
}
.create-btn {
	background-color: #409eff;
	border-color: #409eff;
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
	.keyword-input {
		width: 100%;
	}
}
</style>
