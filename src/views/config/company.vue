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
				<el-form-item :label="t('pages.CompanyName')" prop="tenantAlias">
					<el-input v-model="form.tenantAlias" :placeholder="t('pages.CompanyName')" disabled />
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
							:key="c.value"
							:label="c.label"
							:value="c.value"
						/>
					</el-select>
				</el-form-item>

				<el-form-item :label="t('pages.UtcPlace')" prop="utcPlace">
					<el-input v-model="form.utcPlace" :placeholder="t('pages.UtcPlace')" />
				</el-form-item>

				<el-form-item :label="t('pages.UtcOffset')" prop="utcOffset.value">
					<el-select
						v-model="form.utcOffset.value"
						:placeholder="t('pages.UtcOffset')"
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

				<div class="section-divider" />

				<el-form-item>
					<span class="section-title">
						<span class="required" />{{ t('pages.Billing') }}
					</span>
				</el-form-item>

				<el-form-item :label="t('pages.ContactName')" prop="billingInfo.name">
					<el-input v-model="form.billingInfo.name" :placeholder="t('pages.ContactName')" />
				</el-form-item>

				<el-form-item :label="t('pages.Email')" prop="billingInfo.email">
					<el-input v-model="form.billingInfo.email" :placeholder="t('pages.emailplace')" maxlength="50" />
				</el-form-item>

				<el-form-item :label="t('pages.Phone')" prop="billingInfo.phone">
					<el-input v-model="form.billingInfo.phone" :placeholder="t('pages.phoneplace')" maxlength="20" />
				</el-form-item>

				<el-form-item :label="t('pages.CountryRegion')" prop="billingInfo.countryCode">
					<el-select
						v-model="form.billingInfo.countryCode"
						:placeholder="t('pages.CountryRegion')"
						filterable
						clearable
						style="width: 100%"
					>
						<el-option
							v-for="c in countryOptions"
							:key="c.value"
							:label="c.label"
							:value="c.value"
						/>
					</el-select>
				</el-form-item>

				<el-form-item :label="t('pages.ProvinceState')" prop="billingInfo.province">
					<el-input v-model="form.billingInfo.province" :placeholder="t('pages.ProvinceStateplace')" maxlength="20" />
				</el-form-item>

				<el-form-item :label="t('pages.City')" prop="billingInfo.city">
					<el-input v-model="form.billingInfo.city" :placeholder="t('pages.Cityplace')" maxlength="35" />
				</el-form-item>

				<el-form-item :label="t('pages.district')" prop="billingInfo.district">
					<el-input v-model="form.billingInfo.district" :placeholder="t('pages.districtplace')" maxlength="20" />
				</el-form-item>

				<el-form-item :label="t('pages.StreetLine1')" prop="billingInfo.street1">
					<el-input v-model="form.billingInfo.street1" :placeholder="t('pages.StreetLine1place')" maxlength="35" />
				</el-form-item>

				<el-form-item :label="t('pages.StreetLine2')" prop="billingInfo.street2">
					<el-input v-model="form.billingInfo.street2" maxlength="35" />
				</el-form-item>

				<el-form-item :label="t('pages.StreetLine3')" prop="billingInfo.street3">
					<el-input v-model="form.billingInfo.street3" maxlength="35" />
				</el-form-item>

				<el-form-item :label="t('pages.ZipPostalCode')" prop="billingInfo.postalCode">
					<el-input v-model="form.billingInfo.postalCode" :placeholder="t('pages.ZipPostalCodeplace')" maxlength="10" />
				</el-form-item>

				<div class="form-actions">
					<el-button type="primary" :loading="submitting" :icon="Check" @click="onSubmit">
						{{ t('pages.submit') }}
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
import { countryOptions } from '@/utils/country';

const { t } = useI18n();

interface BillingInfo {
	name: string;
	email: string;
	phone: string;
	countryCode: string;
	province: string;
	city: string;
	district: string;
	street1: string;
	street2: string;
	street3: string;
	postalCode: string;
}

interface CompanyForm {
	tenantAlias: string;
	country: string;
	utcPlace: string;
	utcOffset: { value: number | '' };
	billingInfo: BillingInfo;
}

const defaultBilling = (): BillingInfo => ({
	name: '',
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

const defaultForm = (): CompanyForm => ({
	tenantAlias: '',
	country: '',
	utcPlace: '',
	utcOffset: { value: '' },
	billingInfo: defaultBilling(),
});

const form = reactive<CompanyForm>(defaultForm());
const loading = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const utcOffsetOptions = Array.from({ length: 27 }, (_, i) => {
	const value = i - 12;
	const sign = value >= 0 ? '+' : '-';
	const abs = Math.abs(value);
	return {
		value,
		label: `(UTC${sign}${String(abs).padStart(2, '0')}:00)`,
	};
});

const validateEmail = (_rule: any, value: string, callback: Function) => {
	const mailReg = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9_-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (!value) {
		return callback();
	}
	if (mailReg.test(value)) {
		callback();
	} else {
		callback(new Error('请输入正确的邮箱格式'));
	}
};

const rules = reactive<FormRules>({
	country: [{ required: true, message: t('pages.required'), trigger: 'change' }],
	utcPlace: [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'utcOffset.value': [{ required: true, message: t('pages.required'), trigger: 'change' }],
	'billingInfo.name': [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'billingInfo.phone': [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'billingInfo.countryCode': [{ required: true, message: t('pages.required'), trigger: 'change' }],
	'billingInfo.province': [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'billingInfo.city': [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'billingInfo.district': [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'billingInfo.street1': [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'billingInfo.postalCode': [{ required: true, message: t('pages.required'), trigger: 'blur' }],
	'billingInfo.email': [{ validator: validateEmail, trigger: 'blur' }],
});

const loadDetail = async () => {
	loading.value = true;
	try {
		const res = await companyDetail();
		if (res?.isSuccess && res.result) {
			const data = res.result;
			Object.assign(form, {
				tenantAlias: data.tenantAlias ?? '',
				country: data.country ?? '',
				utcPlace: data.utcPlace ?? '',
				utcOffset: {
					value: typeof data.utcOffset === 'number'
						? data.utcOffset
						: (data.utcOffset?.value ?? ''),
				},
				billingInfo: {
					...defaultBilling(),
					...(data.billingInfo || {}),
				},
			});
		}
	} finally {
		loading.value = false;
	}
};

const onSubmit = async () => {
	if (!formRef.value) return;
	const valid = await formRef.value.validate().catch(() => false);
	if (!valid) return;

	const body = {
		CountryCode: form.country,
		UtcPlace: form.utcPlace,
		UtcOffset: { Value: form.utcOffset.value },
		BillingInfo: {
			Name: form.billingInfo.name,
			Phone: form.billingInfo.phone,
			Email: form.billingInfo.email,
			Company: null,
			Street1: form.billingInfo.street1,
			Street2: form.billingInfo.street2,
			Street3: form.billingInfo.street3,
			District: form.billingInfo.district,
			City: form.billingInfo.city,
			Province: form.billingInfo.province,
			PostalCode: form.billingInfo.postalCode,
			CountryCode: form.billingInfo.countryCode,
		},
	};

	submitting.value = true;
	try {
		const res = await companyEdit(body);
		if (res?.isSuccess) {
			ElMessage.success(res.message || t('pages.config.company.SaveSuccess'));
			loadDetail();
		} else {
			ElMessage.error(res?.message || t('pages.config.company.SaveFailed'));
		}
	} finally {
		submitting.value = false;
	}
};

onMounted(loadDetail);
</script>

<style lang="scss" scoped>
.config-company {
	padding: 12px;
	background: #f0f2f5;
	min-height: calc(100vh - 70px);
}
.form-card {
	background: #fff;
}
.company-form {
	padding-right: 16px;
	max-width: 880px;
}
.section-divider {
	height: 1px;
	background: #dcdfe6;
	margin: 16px 0;
}
.section-title {
	font-weight: 500;
	font-size: 14px;
	color: #303133;
}
.section-title .required {
	color: #f56c6c;
	margin-right: 4px;
}
.section-title .required::before {
	content: '*';
}
.form-actions {
	margin-top: 16px;
	display: flex;
	justify-content: flex-end;
}
</style>
