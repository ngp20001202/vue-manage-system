<template>
	<div class="config-site">
		<el-card shadow="never" class="table-card">
			<div v-show="routeData.length" class="operation">
				<el-button type="success" size="small" class="export mr10" :icon="Plus" @click="onCreate" />
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

			<el-table v-loading="loading" :data="routeData" style="width: 100%; margin-bottom: 15px" border size="small">
				<el-table-column :label="t('pages.ID')">
					<template #default="scope">
						<span class="cyan" @click="() => onEdit(scope.row)">
							<el-icon><Edit /></el-icon>{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="alias" :label="t('pages.Alias')" min-width="140" />
				<el-table-column prop="utcPlace" :label="t('pages.UtcPlace')" min-width="140" />
				<el-table-column :label="t('pages.UtcOffset')" min-width="140">
					<template #default="scope">
						{{ scope.row.utcOffset?.value ?? scope.row.utcOffset ?? '-' }}
					</template>
				</el-table-column>
				<el-table-column prop="adoptingCode" :label="t('pages.AdoptingCode')" min-width="140" />
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
			:title="isEdit ? `${t('pages.Edit')}#${form.id}` : t('pages.Create')"
			width="50%"
			destroy-on-close
			:close-on-click-modal="false"
			@close="closeDialog"
		>
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="180px"
				class="site-form"
			>
				<el-form-item :label="t('pages.Alias')" prop="alias">
					<el-input
						v-model="form.alias"
						:disabled="isEdit"
						:placeholder="t('pages.config.site.Aliasplace')"
					/>
				</el-form-item>
				<el-form-item v-if="!isEdit" :label="t('pages.AdoptingCode')" prop="adoptingCode">
					<el-input v-model="form.adoptingCode" :placeholder="t('pages.AdoptingCode')" />
				</el-form-item>
				<el-form-item :label="t('pages.CountryRegion')" prop="countryCode">
					<el-select
						v-model="form.countryCode"
						style="width: 100%"
						filterable
						:disabled="isEdit"
					>
						<el-option
							v-for="c in countryOptions"
							:key="c.value"
							:label="c.label"
							:value="c.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.UtcPlace')" prop="utcPlace">
					<el-input v-model="form.utcPlace" :disabled="isEdit" :placeholder="t('pages.UtcPlace')" />
				</el-form-item>
				<el-form-item :label="t('pages.UtcOffset')" prop="utcOffset.value">
					<el-select v-model="form.utcOffset.value" style="width: 100%" :disabled="isEdit">
						<el-option
							v-for="u in utcOffsetOptions"
							:key="u.value"
							:label="u.label"
							:value="u.value"
						/>
					</el-select>
				</el-form-item>

				<el-divider />

				<div v-if="!isEdit" class="site-note">
					<el-icon class="note-icon"><WarningFilled /></el-icon>
					{{ t('pages.config.site.Note') }}:
					<span class="note-text">{{ t('pages.config.site.ReturnAddress') }}</span>
				</div>

				<div class="col-head" :class="{ 'is-single': isEdit }">
					<div class="col-head__item">
						<span class="req">*</span>{{ t('pages.config.site.ShippingInfo') }}
					</div>
					<div v-if="!isEdit" class="col-head__item">
						{{ t('pages.config.site.Return') }}
						<el-icon class="copy-icon" @click="copyToReturning"><DocumentCopy /></el-icon>
					</div>
				</div>

				<el-form-item
					v-for="f in addressFields"
					:key="f.key"
					:label="t(f.labelKey)"
					:prop="`shippingInfo.${f.key}`"
				>
					<div class="flex" :class="{ 'is-single': isEdit }">
						<el-select
							v-if="f.type === 'select'"
							v-model="form.shippingInfo[f.key]"
							class="flex_item"
							filterable
						>
							<el-option
								v-for="c in countryOptions"
								:key="c.value"
								:label="c.label"
								:value="c.value"
							/>
						</el-select>
						<el-input
							v-else
							v-model="form.shippingInfo[f.key]"
							class="flex_item"
							:maxlength="f.maxlength"
							:placeholder="f.placeholderKey ? t(f.placeholderKey) : ''"
						/>
						<template v-if="!isEdit">
							<el-select
								v-if="f.type === 'select'"
								v-model="form.returningInfo[f.key]"
								class="flex_item"
								filterable
							>
								<el-option
									v-for="c in countryOptions"
									:key="c.value"
									:label="c.label"
									:value="c.value"
								/>
							</el-select>
							<el-input
								v-else
								v-model="form.returningInfo[f.key]"
								class="flex_item"
								:maxlength="f.maxlength"
								:placeholder="f.placeholderKey ? t(f.placeholderKey) : ''"
							/>
						</template>
					</div>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="closeDialog">{{ t('pages.Cancel') }}</el-button>
				<el-button type="primary" :loading="submitting" @click="onSubmit">
					{{ t('pages.submit') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Plus, Edit, DocumentCopy, WarningFilled } from '@element-plus/icons-vue';
import { sitelist, sitedetail, sitecreate, siteupdate } from '@/api/site';
import type { ApiResponse } from '@/api/types';
import { countryOptions } from '@/utils/country';
import { utcOffsetOptions } from '@/utils/utc-offset';

const { t } = useI18n();

interface SiteRow extends Record<string, any> {
	id: string | number;
	alias?: string;
	utcPlace?: string;
	utcOffset?: number | { value?: number };
	adoptingCode?: string;
}

type AddressKey =
	| 'name'
	| 'company'
	| 'email'
	| 'phone'
	| 'countryCode'
	| 'province'
	| 'city'
	| 'district'
	| 'street1'
	| 'street2'
	| 'street3'
	| 'postalCode';

const addressFields: Array<{
	key: AddressKey;
	labelKey: string;
	placeholderKey?: string;
	maxlength?: number;
	type?: 'select';
}> = [
	{ key: 'name', labelKey: 'pages.ContactName', placeholderKey: 'pages.ContactName' },
	{ key: 'company', labelKey: 'pages.company', placeholderKey: 'pages.company', maxlength: 50 },
	{ key: 'email', labelKey: 'pages.Email', placeholderKey: 'pages.emailplace', maxlength: 50 },
	{ key: 'phone', labelKey: 'pages.Phone', placeholderKey: 'pages.phoneplace', maxlength: 20 },
	{ key: 'countryCode', labelKey: 'pages.CountryRegion', type: 'select' },
	{ key: 'province', labelKey: 'pages.ProvinceState', placeholderKey: 'pages.ProvinceStateplace', maxlength: 20 },
	{ key: 'city', labelKey: 'pages.City', placeholderKey: 'pages.Cityplace', maxlength: 35 },
	{ key: 'district', labelKey: 'pages.district', placeholderKey: 'pages.districtplace', maxlength: 20 },
	{ key: 'street1', labelKey: 'pages.StreetLine1', placeholderKey: 'pages.StreetLine1place', maxlength: 35 },
	{ key: 'street2', labelKey: 'pages.StreetLine2', maxlength: 35 },
	{ key: 'street3', labelKey: 'pages.StreetLine3', maxlength: 35 },
	{ key: 'postalCode', labelKey: 'pages.ZipPostalCode', placeholderKey: 'pages.ZipPostalCodeplace', maxlength: 10 },
];

const routeData = ref<SiteRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const defaultAddress = (): Record<AddressKey, string> => ({
	name: '',
	company: '',
	email: '',
	phone: '',
	countryCode: '',
	province: '',
	city: '',
	district: '',
	street1: '',
	street2: '',
	street3: '',
	postalCode: '',
});

const defaultForm = () => ({
	id: '' as string | number,
	alias: '',
	adoptingCode: '',
	countryCode: '',
	utcPlace: '',
	utcOffset: { value: 0 as number | undefined },
	shippingInfo: defaultAddress(),
	returningInfo: defaultAddress(),
});

const form = reactive(defaultForm());

const validateEmail = (_r: unknown, value: string, cb: (e?: Error) => void) => {
	const mailReg = /^([a-zA-Z0-9_.\-])+\@(([a-zA-Z0-9_.\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (!value || mailReg.test(value)) cb();
	else cb(new Error(t('pages.invalidEmail')));
};

const req = { required: true, message: t('pages.required'), trigger: 'change' };

const rules: any = reactive({
	alias: [req],
	countryCode: [req],
	utcPlace: [req],
	utcOffset: { value: [req] },
	shippingInfo: {
		name: [req],
		company: [req],
		email: [{ required: false, validator: validateEmail, trigger: 'blur' }],
		phone: [req],
		countryCode: [req],
		province: [req],
		city: [req],
		street1: [req],
		postalCode: [req],
	},
	returningInfo: {
		email: [{ required: false, validator: validateEmail, trigger: 'blur' }],
	},
});

const toAddress = (src: any): Record<AddressKey, string> => {
	const target = defaultAddress();
	(Object.keys(target) as AddressKey[]).forEach((k) => {
		target[k] = src?.[k] ?? '';
	});
	return target;
};

const copyToReturning = () => {
	Object.assign(form.returningInfo, form.shippingInfo);
};

const getdata = async () => {
	loading.value = true;
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

const onEdit = async (row: SiteRow) => {
	Object.assign(form, defaultForm(), { id: row.id });
	isEdit.value = true;
	dialogVisible.value = true;
	const res: ApiResponse<any> = await sitedetail(row.id);
	if (!res?.isSuccess) return;
	const d = res.result ?? {};
	Object.assign(form, {
		alias: d.siteAlias ?? d.alias ?? '',
		adoptingCode: d.adoptingCode ?? '',
		countryCode: d.country ?? d.countryCode ?? '',
		utcPlace: d.utcPlace ?? '',
		utcOffset: { value: d.utcOffset?.value ?? d.utcOffset ?? 0 },
		shippingInfo: toAddress(d.shippingInfo),
	});
};

const closeDialog = () => {
	dialogVisible.value = false;
	isEdit.value = false;
	formRef.value?.resetFields();
};

const toPascalAddress = (src: Record<AddressKey, string>) => ({
	Name: src.name,
	Company: src.company,
	Email: src.email,
	Phone: src.phone,
	CountryCode: src.countryCode,
	Province: src.province,
	City: src.city,
	District: src.district,
	Street1: src.street1,
	Street2: src.street2,
	Street3: src.street3,
	PostalCode: src.postalCode,
});

const onSubmit = async () => {
	if (!formRef.value) return;
	const valid = await formRef.value.validate().catch(() => false);
	if (!valid) return;

	submitting.value = true;
	const res: ApiResponse<any> = isEdit.value
		? await siteupdate({
				ID: form.id,
				UtcPlace: form.utcPlace,
				CountryCode: form.countryCode,
				UtcOffset: { Value: form.utcOffset.value },
				ShippingInfo: toPascalAddress(form.shippingInfo),
			})
		: await sitecreate({
				Alias: form.alias,
				AdoptingCode: form.adoptingCode,
				CountryCode: form.countryCode,
				UtcPlace: form.utcPlace,
				UtcOffset: { value: form.utcOffset.value },
				ShippingInfo: toPascalAddress(form.shippingInfo),
				ReturningInfo: toPascalAddress(form.returningInfo),
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
.table-card {
	background: #fff;
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
.mr10 {
	margin-right: 10px;
}
.cyan {
	color: #17a2b8;
	cursor: pointer;
}
.cyan .el-icon {
	margin-right: 4px;
}
.site-form {
	padding-right: 16px;
	max-height: 60vh;
	overflow-y: auto;
}
.site-note {
	margin-bottom: 12px;
	font-size: 14px;
	font-weight: bold;
}
.note-icon {
	color: #ffc107;
	vertical-align: -2px;
}
.note-text {
	font-style: italic;
	color: #dc3545;
}
.col-head {
	display: flex;
	margin: 0 0 12px 180px;
	font-size: 14px;
	font-weight: bold;
}
.col-head__item {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 6px;
}
.req {
	color: #dc3545;
	margin-right: 2px;
}
.copy-icon {
	color: #2cb2ce;
	cursor: pointer;
}
.flex {
	display: flex;
	width: 100%;
}
.flex .flex_item:nth-of-type(1) {
	padding-right: 20px;
}
.flex.is-single .flex_item:nth-of-type(1) {
	padding-right: 0;
}
.flex_item {
	flex: 1;
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
	.col-head {
		margin-left: 0;
	}
}
</style>
