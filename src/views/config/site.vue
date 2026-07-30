<template>
	<div class="config-site">
		<el-card shadow="never" class="filter-card">
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
		</el-card>

		<el-card shadow="never" class="table-card">
			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
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
				<el-table-column
					:label="t('pages.CompanyName')"
					prop="companyName"
					min-width="180"
					show-overflow-tooltip
				/>
				<el-table-column :label="t('pages.CountryRegion')" min-width="140">
					<template #default="scope">
						{{ scope.row.countryRegion || scope.row.countryCode || '-' }}
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Routes')" min-width="220">
					<template #default="scope">
						<div v-if="routeNames(scope.row).length" class="route-tags">
							<el-tag
								v-for="(name, idx) in routeNames(scope.row)"
								:key="idx"
								type="info"
								effect="plain"
								size="small"
							>
								{{ name }}
							</el-tag>
						</div>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.UtcOffset')" min-width="140">
					<template #default="scope">
						{{ scope.row.utcOffset || '-' }}
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.config.site.Status')" min-width="110">
					<template #default="scope">
						<el-tag :type="scope.row.enabled === false ? 'danger' : 'success'" effect="light">
							{{
								scope.row.enabled === false
									? t('pages.config.site.disabled')
									: t('pages.config.site.Enabled')
							}}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.Action')"
					width="200"
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
								:type="scope.row.enabled === false ? 'success' : 'warning'"
								size="small"
								@click="() => onToggleStatus(scope.row)"
							>
								{{
									scope.row.enabled === false
										? t('pages.config.site.Enabled')
										: t('pages.config.site.disabled')
								}}
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
			width="760px"
			destroy-on-close
			:close-on-click-modal="false"
			@close="closeDialog"
		>
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="150px"
				class="site-form"
			>
				<h4 class="form-section">
					{{ t('pages.config.site.SiteInformation') }}
				</h4>
				<el-form-item :label="t('pages.Alias')" prop="alias">
					<el-input
						v-model="form.alias"
						:placeholder="t('pages.config.site.Aliasplace')"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.Username')" prop="username">
					<el-input v-model="form.username" :placeholder="t('pages.Username')" />
				</el-form-item>
				<el-form-item :label="t('pages.CompanyName')" prop="companyName">
					<el-input v-model="form.companyName" :placeholder="t('pages.CompanyName')" />
				</el-form-item>
				<el-form-item :label="t('pages.CountryRegion')" prop="countryRegion">
					<el-input v-model="form.countryRegion" :placeholder="t('pages.CountryRegion')" />
				</el-form-item>
				<el-form-item :label="t('pages.AdoptingCode')" prop="adoptingCode">
					<el-input v-model="form.adoptingCode" :placeholder="t('pages.AdoptingCode')" />
				</el-form-item>
				<el-form-item :label="t('pages.UtcPlace')" prop="utcPlace">
					<el-input v-model="form.utcPlace" :placeholder="t('pages.UtcPlace')" />
				</el-form-item>
				<el-form-item :label="t('pages.UtcOffset')" prop="utcOffset">
					<el-input v-model="form.utcOffset" :placeholder="t('pages.UtcOffset')" />
				</el-form-item>

				<template v-for="sec in addressSections" :key="sec.key">
					<h4 class="form-section">{{ t(sec.labelKey) }}</h4>
					<el-alert
						v-if="sec.key === 'returning'"
						class="form-note"
						type="info"
						:closable="false"
						show-icon
						:title="t('pages.config.site.Note')"
						:description="t('pages.config.site.ReturnAddress')"
					/>
					<el-form-item :label="t('pages.ContactName')">
						<el-input
							v-model="form[sec.key].contactName"
							:placeholder="t('pages.ContactName')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.Phone')">
						<el-input
							v-model="form[sec.key].phone"
							:placeholder="t('pages.phoneplace')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.Email')">
						<el-input
							v-model="form[sec.key].email"
							:placeholder="t('pages.emailplace')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.CountryCode')">
						<el-input
							v-model="form[sec.key].countryCode"
							:placeholder="t('pages.countrycode')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.ProvinceState')">
						<el-input
							v-model="form[sec.key].provinceState"
							:placeholder="t('pages.ProvinceStateplace')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.City')">
						<el-input
							v-model="form[sec.key].city"
							:placeholder="t('pages.Cityplace')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.ZipPostalCode')">
						<el-input
							v-model="form[sec.key].zipPostalCode"
							:placeholder="t('pages.ZipPostalCodeplace')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.StreetLine1')">
						<el-input
							v-model="form[sec.key].streetLine1"
							:placeholder="t('pages.StreetLine1place')"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.StreetLine2')">
						<el-input
							v-model="form[sec.key].streetLine2"
							:placeholder="t('pages.StreetLine2')"
						/>
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
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Search, Refresh, Plus, Edit } from '@element-plus/icons-vue';
import { sitelist, sitecreate, siteupdate, sitedisable } from '@/api/site';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface SiteRow extends Record<string, any> {
	id: string | number;
	alias?: string;
	username?: string;
	companyName?: string;
	countryRegion?: string;
	countryCode?: string;
	routes?: Array<string | Record<string, any>>;
	utcPlace?: string;
	utcOffset?: string;
	adoptingCode?: string;
	enabled?: boolean;
}

interface AddressForm {
	contactName: string;
	phone: string;
	email: string;
	countryCode: string;
	provinceState: string;
	city: string;
	zipPostalCode: string;
	streetLine1: string;
	streetLine2: string;
}

type AddressKey = 'billing' | 'shipping' | 'returning';

const addressSections: Array<{ key: AddressKey; labelKey: string }> = [
	{ key: 'billing', labelKey: 'pages.Billing' },
	{ key: 'shipping', labelKey: 'pages.config.site.ShippingInfo' },
	{ key: 'returning', labelKey: 'pages.config.site.Return' },
];

const keyword = ref('');
const routeData = ref<SiteRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const defaultAddress = (): AddressForm => ({
	contactName: '',
	phone: '',
	email: '',
	countryCode: '',
	provinceState: '',
	city: '',
	zipPostalCode: '',
	streetLine1: '',
	streetLine2: '',
});

const defaultForm = () => ({
	id: '' as string | number,
	alias: '',
	username: '',
	companyName: '',
	countryRegion: '',
	adoptingCode: '',
	utcPlace: '',
	utcOffset: '',
	billing: defaultAddress(),
	shipping: defaultAddress(),
	returning: defaultAddress(),
});

const form = reactive(defaultForm());

const rules = reactive<FormRules>({
	alias: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	username: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	companyName: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	countryRegion: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
});

const routeNames = (row: SiteRow): string[] => {
	const list = row.routes ?? row.svcRoutes ?? [];
	if (!Array.isArray(list)) return [];
	return list
		.map((r: any) => (typeof r === 'string' ? r : r?.svcName ?? r?.name ?? ''))
		.filter((n: string) => !!n);
};

const toAddress = (src: any): AddressForm => ({
	...defaultAddress(),
	contactName: src?.contactName ?? '',
	phone: src?.phone ?? '',
	email: src?.email ?? '',
	countryCode: src?.countryCode ?? '',
	provinceState: src?.provinceState ?? src?.state ?? '',
	city: src?.city ?? '',
	zipPostalCode: src?.zipPostalCode ?? src?.postalCode ?? '',
	streetLine1: src?.streetLine1 ?? '',
	streetLine2: src?.streetLine2 ?? '',
});

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
	// shippingspa 的 siteslist 仅支持分页，keyword 留作本地过滤器
	const res: ApiResponse<any> = await sitelist({
		pageIndex: pagecurrent.value - 1,
		pageSize: count.value,
	});
	if (res?.isSuccess) {
		routeData.value = (res.result ?? []) as SiteRow[];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const onCreate = () => {
	Object.assign(form, defaultForm());
	isEdit.value = false;
	dialogVisible.value = true;
};

const onEdit = (row: SiteRow) => {
	Object.assign(form, defaultForm(), {
		id: row.id,
		alias: row.alias || '',
		username: row.username || '',
		companyName: row.companyName || '',
		countryRegion: row.countryRegion || row.countryCode || '',
		adoptingCode: row.adoptingCode || '',
		utcPlace: row.utcPlace || '',
		utcOffset: row.utcOffset || '',
		billing: toAddress(row.billing),
		shipping: toAddress(row.shipping),
		returning: toAddress(row.returning),
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
		alias: form.alias,
		username: form.username,
		companyName: form.companyName,
		countryRegion: form.countryRegion,
		adoptingCode: form.adoptingCode,
		utcPlace: form.utcPlace,
		utcOffset: form.utcOffset,
		billing: { ...form.billing },
		shipping: { ...form.shipping },
		returning: { ...form.returning },
	};
	if (isEdit.value) body.id = form.id;

	submitting.value = true;
	const res: ApiResponse<any> = isEdit.value
		? await siteupdate(body as any)
		: await sitecreate(body);
	submitting.value = false;

	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
		closeDialog();
		getdata();
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const onToggleStatus = (row: SiteRow) => {
	const enable = row.enabled === false;
	const label = enable
		? t('pages.config.site.Enabled')
		: t('pages.config.site.disabled');
	ElMessageBox.confirm(`${label} ${row.alias || row.username || ''}`, label, {
		confirmButtonText: t('pages.Save'),
		cancelButtonText: t('pages.Cancel'),
		type: 'warning',
		center: true,
	})
		.then(async () => {
			const res: ApiResponse<any> = enable
				? await siteupdate({ id: row.id, enabled: true })
				: await sitedisable({ id: row.id });
			if (res?.isSuccess) {
				ElMessage.success(t('pages.Success'));
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		})
		.catch(() => {});
};

watch([count, pagecurrent], () => {
	getdata();
});

onMounted(() => {
	getdata();
});
</script>

<style lang="scss" scoped>
.config-site {
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
.route-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
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
.site-form {
	padding-right: 16px;
	max-height: 60vh;
	overflow-y: auto;
}
.form-section {
	margin: 0 0 8px;
	font-weight: 500;
	font-size: 14px;
	color: #303133;
}
.form-note {
	margin-bottom: 12px;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
@media (max-width: 768px) {
	.keyword-input {
		width: 100%;
	}
}
</style>
