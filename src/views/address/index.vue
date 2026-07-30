<template>
	<div class="address-list">
		<el-card shadow="never" class="filter-card">
			<div class="filter-row">
				<el-select
					v-model="type"
					class="type-select"
					:placeholder="t('pages.type')"
				>
					<el-option
						v-for="opt in typeOptions"
						:key="opt.value"
						:label="opt.label"
						:value="opt.value"
					/>
				</el-select>
				<el-button type="primary" :icon="Search" @click="onSearch">
					{{ t('pages.Search') }}
				</el-button>
				<el-button :icon="Refresh" @click="onReset">
					{{ t('pages.Reset') }}
				</el-button>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div class="operation">
				<el-button type="success" size="small" class="create-btn" :icon="Plus" @click="openCreate" />
			</div>

			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.ID')" width="120">
					<template #default="scope">
						<span class="cyan" @click="() => openEdit(scope.row)">
							<el-icon><Edit /></el-icon>{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.type')" width="120">
					<template #default="scope">
						{{ formatType(scope.row.type) }}
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.CountryCode')"
					prop="countryCode"
					width="120"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.company')"
					prop="company"
					min-width="140"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.Name')"
					prop="name"
					min-width="120"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.Phone')"
					prop="phone"
					width="140"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.Email')"
					prop="email"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.ProvinceState')"
					prop="state"
					min-width="120"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.City')"
					prop="city"
					min-width="120"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.district')"
					prop="district"
					min-width="120"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.StreetLine1')"
					prop="streetLine1"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.StreetLine2')"
					prop="streetLine2"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.StreetLine3')"
					prop="streetLine3"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.ZipPostalCode')"
					prop="zipPostalCode"
					width="120"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.Action')"
					width="180"
					align="center"
					fixed="right"
				>
					<template #default="scope">
						<div class="action-cell">
							<el-button
								type="primary"
								size="small"
								:icon="Edit"
								@click="() => openEdit(scope.row)"
							>
								{{ t('pages.Edit') }}
							</el-button>
							<el-button
								type="danger"
								size="small"
								:icon="Delete"
								@click="() => onDelete(scope.row)"
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

		<el-dialog
			v-model="dialogVisible"
			:title="dialogMode === 'create' ? t('pages.address.create.title') : t('pages.address.edit.title')"
			width="680px"
			destroy-on-close
			:close-on-click-modal="false"
			@closed="onDialogClosed"
		>
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="130px"
			>
				<el-form-item :label="t('pages.type')" prop="type">
					<el-select v-model="form.type" style="width: 100%">
						<el-option
							v-for="opt in typeOptions.filter((o) => o.value !== 0)"
							:key="opt.value"
							:label="opt.label"
							:value="opt.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.Name')" prop="name">
					<el-input v-model="form.name" :placeholder="t('pages.Pleaseinput')" />
				</el-form-item>
				<el-form-item :label="t('pages.company')">
					<el-input v-model="form.company" :placeholder="t('pages.Pleaseinput')" />
				</el-form-item>
				<el-form-item :label="t('pages.ContactName')">
					<el-input v-model="form.contact" :placeholder="t('pages.Pleaseinput')" />
				</el-form-item>
				<el-form-item :label="t('pages.Phone')">
					<el-input v-model="form.phone" :placeholder="t('pages.phoneplace')" />
				</el-form-item>
				<el-form-item :label="t('pages.Email')">
					<el-input v-model="form.email" :placeholder="t('pages.emailplace')" />
				</el-form-item>
				<el-form-item :label="t('pages.CountryCode')">
					<el-input v-model="form.countryCode" :placeholder="t('pages.countrycode')" />
				</el-form-item>
				<el-form-item :label="t('pages.ProvinceState')">
					<el-input v-model="form.state" />
				</el-form-item>
				<el-form-item :label="t('pages.City')">
					<el-input v-model="form.city" />
				</el-form-item>
				<el-form-item :label="t('pages.district')">
					<el-input v-model="form.district" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine1')">
					<el-input v-model="form.streetLine1" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine2')">
					<el-input v-model="form.streetLine2" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine3')">
					<el-input v-model="form.streetLine3" />
				</el-form-item>
				<el-form-item :label="t('pages.ZipPostalCode')">
					<el-input v-model="form.zipPostalCode" />
				</el-form-item>
				<el-form-item :label="t('pages.address.create.default')">
					<el-switch v-model="form.isDefault" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">{{ t('pages.Cancel') }}</el-button>
				<el-button type="primary" :loading="submitting" @click="onSubmit">
					{{ t('pages.address.create.confirm') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue';
import {
	addresslist,
	addresscreate,
	addressupdate,
	addressdelete,
	addresssetdefault,
} from '@/api/address';
import type { AddressBody } from '@/api/address';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface AddressRow {
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
	type: string | number;
	isDefault?: boolean;
}

const typeOptions = [
	{ value: 0, label: t('pages.type') },
	{ value: 'Billing', label: t('pages.address.type.Billing') },
	{ value: 'Shipping', label: t('pages.address.type.Shipping') },
	{ value: 'Returning', label: t('pages.address.type.Returning') },
	{ value: 'Amazon', label: t('pages.address.type.Amazon') },
	{ value: 'Consignee', label: t('pages.address.type.Consignee') },
];

const formatType = (value?: string | number) => {
	const found = typeOptions.find((o) => o.value === value);
	return found?.label || String(value || '');
};

const type = ref<string | number>(0);
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
	email: '',
	company: '',
	countryCode: '',
	state: '',
	city: '',
	district: '',
	streetLine1: '',
	streetLine2: '',
	streetLine3: '',
	zipPostalCode: '',
	type: 'Billing',
	isDefault: false,
});

const form = reactive<Omit<AddressRow, 'id'> & { id?: string | number }>(emptyForm());

const rules = reactive<FormRules>({
	name: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	type: [{ required: true, message: t('pages.required'), trigger: 'change' }],
});

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const onReset = () => {
	type.value = 0;
	pagecurrent.value = 1;
	getdata();
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await addresslist({
		index: pagecurrent.value - 1,
		size: count.value,
		Type: type.value || undefined,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const openCreate = () => {
	dialogMode.value = 'create';
	Object.assign(form, emptyForm());
	dialogVisible.value = true;
};

const openEdit = (row: AddressRow) => {
	dialogMode.value = 'edit';
	Object.assign(form, emptyForm(), row);
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
			res = await addresscreate(form as AddressBody);
		} else {
			res = await addressupdate(form as AddressBody & { id: string | number });
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
		await ElMessageBox.confirm('', t('pages.DefaultAddress'), {
			confirmButtonText: t('pages.address.create.confirm'),
			cancelButtonText: t('pages.Cancel'),
			type: 'warning',
			center: true,
		});
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
		await ElMessageBox.confirm('', t('pages.Delete'), {
			confirmButtonText: t('pages.address.create.confirm'),
			cancelButtonText: t('pages.Cancel'),
			type: 'warning',
			center: true,
		});
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
.filter-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8px;
	min-height: 60px;
}
.type-select {
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
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
.cyan:hover {
	text-decoration: underline;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
@media (max-width: 768px) {
	.type-select {
		width: 100%;
	}
}
</style>
