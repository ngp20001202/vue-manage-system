<template>
	<el-dialog
		v-model="visible"
		:title="`${t('pages.ID')} # ${props.id}`"
		width="650px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<el-form :model="form" label-width="130px">
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item :label="t('pages.SackMfts.Address.FromName')">
						<el-input v-model="form.name" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.SackMfts.Address.FromCompany')">
						<el-input v-model="form.company" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.Phone')">
						<el-input v-model="form.phone" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.Email')">
						<el-input v-model="form.email" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.CountryCode')">
						<el-input v-model="form.countryCode" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.ProvinceState')">
						<el-input v-model="form.province" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.City')">
						<el-input v-model="form.city" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.district')">
						<el-input v-model="form.district" />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item :label="t('pages.StreetLine1')">
						<el-input v-model="form.street1" />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item :label="t('pages.StreetLine2')">
						<el-input v-model="form.street2" />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item :label="t('pages.StreetLine3')">
						<el-input v-model="form.street3" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.ZipPostalCode')">
						<el-input v-model="form.postalCode" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="t('pages.mailingdate')">
						<el-date-picker
							v-model="form.mailingDate"
							type="date"
							value-format="YYYY-MM-DD"
							style="width: 100%"
						/>
					</el-form-item>
				</el-col>
				</el-row>
				</el-form>
				<template #footer>
					<div class="dialog-footer">
						<el-button @click="handleClose">{{ t('pages.Cancel') }}</el-button>
						<el-button type="primary" :loading="loading" @click="submit">
							{{ t('pages.Save') }}
						</el-button>
					</div>
				</template>
				</el-dialog>
				</template>

				<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import { sackMftScanform } from '@/api/sackMft';

const props = defineProps<{ modelValue: boolean; id: string | number }>();
const emit = defineEmits(['update:modelValue', 'success']);

const { t } = useI18n();
const visible = ref(false);
const loading = ref(false);
const form = ref({
	name: '',
	company: '',
	phone: '',
	email: '',
	countryCode: '',
	province: '',
	city: '',
	district: '',
	street1: '',
	street2: '',
	street3: '',
	postalCode: '',
	mailingDate: '',
});

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (v) {
			form.value = {
				name: '',
				company: '',
				phone: '',
				email: '',
				countryCode: '',
				province: '',
				city: '',
				district: '',
				street1: '',
				street2: '',
				street3: '',
				postalCode: '',
				mailingDate: moment().format('YYYY-MM-DD'),
			};
		}
	},
);

const handleClose = () => {
	emit('update:modelValue', false);
};

const submit = async () => {
	loading.value = true;
	const body = {
		shipper: {
			name: form.value.name,
			company: form.value.company,
			phone: form.value.phone,
			email: form.value.email,
			countryCode: form.value.countryCode,
			province: form.value.province,
			city: form.value.city,
			district: form.value.district,
			street1: form.value.street1,
			street2: form.value.street2,
			street3: form.value.street3,
			postalCode: form.value.postalCode,
		},
		submissionID: '',
		mailingDate: form.value.mailingDate,
	};
	const res = await sackMftScanform(String(props.id), body);
	loading.value = false;
	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
		emit('success', props.id);
		emit('update:modelValue', false);
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};
</script>

<style lang="scss" scoped>
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
</style>
