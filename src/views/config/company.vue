<template>
	<div class="config-company">
		<el-card shadow="never" class="form-card">
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="160px"
				v-loading="loading"
				class="company-form"
			>
				<h4 class="form-section">
					{{ t('pages.config.company.CompanyInfo') }}
				</h4>

				<el-form-item :label="t('pages.config.company.Tenant')" prop="tenantAlias">
					<el-input
						v-model="form.tenantAlias"
						:placeholder="t('pages.config.company.Tenant')"
						disabled
					/>
				</el-form-item>

				<el-form-item :label="t('pages.CountryRegion')" prop="country">
					<el-select
						v-model="form.country"
						:placeholder="t('pages.CountryRegion')"
						filterable
						clearable
						style="width: 100%"
					>
						<el-option
							v-for="c in countryOptions"
							:key="c.code"
							:label="`${c.name} (${c.code})`"
							:value="c.code"
						/>
					</el-select>
				</el-form-item>

				<el-form-item :label="t('pages.UtcPlace')" prop="utcPlace">
					<el-input
						v-model="form.utcPlace"
						:placeholder="t('pages.UtcPlace')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.UtcOffset')" prop="utcOffset">
					<el-select
						v-model="form.utcOffset"
						:placeholder="t('pages.config.company.UtcOffset')"
						clearable
						style="width: 100%"
					>
						<el-option
							v-for="o in utcOffsetOptions"
							:key="o.value"
							:label="o.label"
							:value="o.value"
						/>
					</el-select>
				</el-form-item>

				<el-form-item :label="t('pages.Routes')" prop="routes">
					<el-select
						v-model="form.routes"
						multiple
						collapse-tags
						collapse-tags-tooltip
						:placeholder="t('pages.Routes')"
						style="width: 100%"
					>
						<el-option
							v-for="r in routeOptions"
							:key="r.value"
							:label="r.label"
							:value="r.value"
						/>
					</el-select>
				</el-form-item>

				<el-form-item :label="t('pages.ContactName')" prop="contactName">
					<el-input
						v-model="form.contactName"
						:placeholder="t('pages.ContactName')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.CompanyName')" prop="companyName">
					<el-input
						v-model="form.companyName"
						:placeholder="t('pages.CompanyName')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.AdoptingCode')" prop="adoptingCode">
					<el-input
						v-model="form.adoptingCode"
						:placeholder="t('pages.AdoptingCode')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.PosterAlias')" prop="posterAlias">
					<el-input
						v-model="form.posterAlias"
						:placeholder="t('pages.PosterAlias')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.Supplement')" prop="supplement">
					<el-input
						v-model="form.supplement"
						type="textarea"
						:rows="3"
						:placeholder="t('pages.config.company.Supplement')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.Phone')" prop="telephone">
					<el-input
						v-model="form.telephone"
						:placeholder="t('pages.phoneplace')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.Email')" prop="email">
					<el-input
						v-model="form.email"
						:placeholder="t('pages.emailplace')"
					/>
				</el-form-item>

				<h4 class="form-section">
					{{ t('pages.config.company.BillingAddress') }}
				</h4>

				<el-form-item :label="t('pages.config.company.Country')" prop="billingCountry">
					<el-input
						v-model="form.billing.country"
						:placeholder="t('pages.config.company.Country')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.ProvinceState')" prop="billingState">
					<el-input
						v-model="form.billing.state"
						:placeholder="t('pages.config.company.ProvinceState')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.City')" prop="billingCity">
					<el-input
						v-model="form.billing.city"
						:placeholder="t('pages.config.company.City')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.StreetLine1')" prop="billingStreet">
					<el-input
						v-model="form.billing.street"
						:placeholder="t('pages.config.company.StreetLine1')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.StreetLine2')" prop="billingStreet2">
					<el-input
						v-model="form.billing.street2"
						:placeholder="t('pages.config.company.StreetLine2')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.ZipPostalCode')" prop="billingZip">
					<el-input
						v-model="form.billing.zip"
						:placeholder="t('pages.config.company.ZipPostalCode')"
					/>
				</el-form-item>

				<el-form-item :label="t('pages.config.company.CountryCode')" prop="billingCountryCode">
					<el-input
						v-model="form.billing.postalCode"
						:placeholder="t('pages.countrycode')"
					/>
				</el-form-item>

				<div class="form-actions">
					<el-button
						type="primary"
						:loading="submitting"
						:icon="Check"
						@click="onSubmit"
					>
						{{ t('pages.Save') }}
					</el-button>
				</div>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import { companyDetail, companyEdit } from '@/api/company';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface BillingForm {
	country: string;
	state: string;
	city: string;
	street: string;
	street2: string;
	zip: string;
	postalCode: string;
}

interface CompanyForm {
	tenantAlias: string;
	country: string;
	utcPlace: string;
	utcOffset: string;
	routes: string[];
	contactName: string;
	companyName: string;
	adoptingCode: string;
	posterAlias: string;
	supplement: string;
	telephone: string;
	email: string;
	billing: BillingForm;
}

const defaultBilling = (): BillingForm => ({
	country: '',
	state: '',
	city: '',
	street: '',
	street2: '',
	zip: '',
	postalCode: '',
});

const defaultForm = (): CompanyForm => ({
	tenantAlias: '',
	country: '',
	utcPlace: '',
	utcOffset: '',
	routes: [],
	contactName: '',
	companyName: '',
	adoptingCode: '',
	posterAlias: '',
	supplement: '',
	telephone: '',
	email: '',
	billing: defaultBilling(),
});

const form = reactive<CompanyForm>(defaultForm());
const loading = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

// Common ISO-3166 country codes used in shipping integrations.
const countryOptions: Array<{ code: string; name: string }> = [
	{ code: 'CN', name: 'China' },
	{ code: 'US', name: 'United States' },
	{ code: 'HK', name: 'Hong Kong' },
	{ code: 'TW', name: 'Taiwan' },
	{ code: 'JP', name: 'Japan' },
	{ code: 'KR', name: 'Korea' },
	{ code: 'SG', name: 'Singapore' },
	{ code: 'MY', name: 'Malaysia' },
	{ code: 'TH', name: 'Thailand' },
	{ code: 'AU', name: 'Australia' },
	{ code: 'CA', name: 'Canada' },
	{ code: 'GB', name: 'United Kingdom' },
	{ code: 'DE', name: 'Germany' },
	{ code: 'FR', name: 'France' },
];

const utcOffsetOptions: Array<{ value: string; label: string }> = [
	{ value: 'UTC-12:00', label: 'UTC-12:00' },
	{ value: 'UTC-11:00', label: 'UTC-11:00' },
	{ value: 'UTC-10:00', label: 'UTC-10:00' },
	{ value: 'UTC-09:00', label: 'UTC-09:00' },
	{ value: 'UTC-08:00', label: 'UTC-08:00' },
	{ value: 'UTC-07:00', label: 'UTC-07:00' },
	{ value: 'UTC-06:00', label: 'UTC-06:00' },
	{ value: 'UTC-05:00', label: 'UTC-05:00' },
	{ value: 'UTC-04:00', label: 'UTC-04:00' },
	{ value: 'UTC-03:00', label: 'UTC-03:00' },
	{ value: 'UTC-02:00', label: 'UTC-02:00' },
	{ value: 'UTC-01:00', label: 'UTC-01:00' },
	{ value: 'UTC+00:00', label: 'UTC+00:00' },
	{ value: 'UTC+01:00', label: 'UTC+01:00' },
	{ value: 'UTC+02:00', label: 'UTC+02:00' },
	{ value: 'UTC+03:00', label: 'UTC+03:00' },
	{ value: 'UTC+04:00', label: 'UTC+04:00' },
	{ value: 'UTC+05:00', label: 'UTC+05:00' },
	{ value: 'UTC+06:00', label: 'UTC+06:00' },
	{ value: 'UTC+07:00', label: 'UTC+07:00' },
	{ value: 'UTC+08:00', label: 'UTC+08:00' },
	{ value: 'UTC+09:00', label: 'UTC+09:00' },
	{ value: 'UTC+10:00', label: 'UTC+10:00' },
	{ value: 'UTC+11:00', label: 'UTC+11:00' },
	{ value: 'UTC+12:00', label: 'UTC+12:00' },
];

// Service / route options. The backend may provide a richer list later; this is a
// reasonable default for the multi-select picker.
const routeOptions: Array<{ value: string; label: string }> = [
	{ value: 'DHL', label: 'DHL' },
	{ value: 'FedEx', label: 'FedEx' },
	{ value: 'UPS', label: 'UPS' },
	{ value: 'USPS', label: 'USPS' },
	{ value: 'ePacket', label: 'ePacket' },
	{ value: 'EMS', label: 'EMS' },
	{ value: 'SF-Express', label: 'SF Express' },
	{ value: 'YunExpress', label: 'Yun Express' },
];

const rules = reactive<FormRules>({
	country: [{ required: true, message: t('pages.required'), trigger: 'change' }],
	companyName: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	contactName: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
});

const toBilling = (src: any): BillingForm => ({
	country: src?.country ?? '',
	state: src?.state ?? src?.provinceState ?? '',
	city: src?.city ?? '',
	street: src?.street ?? src?.streetLine1 ?? '',
	street2: src?.street2 ?? src?.streetLine2 ?? '',
	zip: src?.zip ?? src?.zipPostalCode ?? '',
	postalCode: src?.postalCode ?? src?.countryCode ?? '',
});

const toRoutes = (val: any): string[] => {
	if (!Array.isArray(val)) return [];
	return val
		.map((r: any) => (typeof r === 'string' ? r : r?.svcName ?? r?.name ?? r?.code ?? ''))
		.filter((s: string) => !!s);
};

const loadDetail = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await companyDetail();
	loading.value = false;
	if (!res?.isSuccess) {
		ElMessage.error(res?.message || t('pages.config.company.LoadFailed'));
		return;
	}
	const data = res.result || {};
	Object.assign(form, defaultForm(), {
		tenantAlias: data.tenantAlias ?? '',
		country: data.country ?? '',
		utcPlace: data.utcPlace ?? '',
		utcOffset: data.utcOffset ?? '',
		routes: toRoutes(data.routes),
		contactName: data.contactName ?? '',
		companyName: data.companyName ?? '',
		adoptingCode: data.adoptingCode ?? data.adoptCode ?? '',
		posterAlias: data.posterAlias ?? '',
		supplement: data.supplement ?? data.remark ?? '',
		telephone: data.telephone ?? data.phone ?? '',
		email: data.email ?? '',
		billing: toBilling(data.billingAddress ?? data.billing ?? {}),
	});
};

const onSubmit = async () => {
	if (!formRef.value) return;
	const valid = await formRef.value.validate().catch(() => false);
	if (!valid) return;

	const body: Record<string, any> = {
		country: form.country,
		utcPlace: form.utcPlace,
		utcOffset: form.utcOffset,
		routes: form.routes,
		contactName: form.contactName,
		companyName: form.companyName,
		adoptingCode: form.adoptingCode,
		posterAlias: form.posterAlias,
		supplement: form.supplement,
		telephone: form.telephone,
		email: form.email,
		billingAddress: { ...form.billing },
	};

	submitting.value = true;
	const res: ApiResponse<any> = await companyEdit(body);
	submitting.value = false;

	if (res?.isSuccess) {
		ElMessage.success(t('pages.config.company.SaveSuccess'));
		loadDetail();
	} else {
		ElMessage.error(res?.message || t('pages.config.company.SaveFailed'));
	}
};

onMounted(() => {
	loadDetail();
});
</script>

<style lang="scss" scoped>
.config-company {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.form-card {
	background: #fff;
}
.company-form {
	padding-right: 16px;
	max-width: 880px;
}
.form-section {
	margin: 0 0 8px;
	font-weight: 500;
	font-size: 14px;
	color: #303133;
}
.form-section:not(:first-child) {
	margin-top: 16px;
}
.form-actions {
	margin-top: 16px;
	display: flex;
	justify-content: flex-end;
}
</style>
