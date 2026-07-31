<template>
	<el-dialog
		v-model="visible"
		:title="`${t('pages.ID')} # ${props.id}`"
		width="860px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div class="sender-header">
			<span class="sender-title">{{ t('pages.Shipper') }}</span>
			<el-button type="primary" plain size="small" @click="senderSearchVisible = true">
				{{ t('pages.SelectAddress') }}
			</el-button>
		</div>
		<el-form
			ref="formRef"
			:inline="true"
			:model="form"
			label-position="top"
			label-width="80px"
			class="sender-form"
		>
			<el-form-item :label="t('pages.Name')" prop="Contact.Name">
				<el-input v-model="form.Contact.Name" />
			</el-form-item>
			<el-form-item :label="t('pages.company')" prop="Contact.Company">
				<el-input v-model="form.Contact.Company" maxlength="50" />
			</el-form-item>
			<el-form-item :label="t('pages.Phone')" prop="Contact.Phone">
				<el-input v-model="form.Contact.Phone" maxlength="20" />
			</el-form-item>
			<el-form-item :label="t('pages.StreetLine1')" prop="Contact.Street1">
				<el-input v-model="form.Contact.Street1" maxlength="35" />
			</el-form-item>
			<el-form-item :label="t('pages.StreetLine2')" prop="Contact.Street2">
				<el-input v-model="form.Contact.Street2" maxlength="35" />
			</el-form-item>
			<el-form-item :label="t('pages.StreetLine3')" prop="Contact.Street3">
				<el-input v-model="form.Contact.Street3" maxlength="35" />
			</el-form-item>
			<el-form-item :label="t('pages.City')" prop="Contact.City">
				<el-input v-model="form.Contact.City" maxlength="35" />
			</el-form-item>
			<el-form-item :label="t('pages.ProvinceState')" prop="Contact.Province">
				<el-input v-model="form.Contact.Province" maxlength="20" />
			</el-form-item>
			<el-form-item :label="t('pages.ZipPostalCode')" prop="Contact.PostalCode">
				<el-input v-model="form.Contact.PostalCode" maxlength="10" />
			</el-form-item>
			<el-form-item :label="t('pages.countrycode')" prop="Contact.CountryCode">
				<el-select v-model="form.Contact.CountryCode" filterable>
					<el-option
						v-for="c in countryOptions"
						:key="c.value"
						:label="c.label"
						:value="c.value"
					/>
				</el-select>
			</el-form-item>
		</el-form>
		<div class="mailing">
			<h3 class="mailing-title">{{ t('pages.mailingdate') }}</h3>
			<el-date-picker
				v-model="form.mailingDate"
				type="date"
				value-format="YYYY-MM-DD"
				style="width: 200px"
			/>
		</div>

		<SenderSearchDialog v-model="senderSearchVisible" @select="applySender" />

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="handleClose">{{ t('pages.Cancel') }}</el-button>
				<el-button type="primary" :loading="loading" @click="submit">
					{{ t('pages.address.create.confirm') }}
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
import { countryOptions } from '@/utils/country';
import SenderSearchDialog, { type SenderAddress } from './SenderSearchDialog.vue';

const props = defineProps<{ modelValue: boolean; id: string | number }>();
const emit = defineEmits(['update:modelValue', 'success']);

const { t } = useI18n();
const visible = ref(false);
const loading = ref(false);
const senderSearchVisible = ref(false);
const formRef = ref();
const form = ref({
	Contact: {
		Name: '',
		Phone: '',
		Company: '',
		Street1: '',
		Street2: '',
		Street3: '',
		District: '',
		City: '',
		Province: '',
		PostalCode: '',
		CountryCode: '',
	},
	mailingDate: '',
});

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (v) {
			form.value = {
				Contact: {
					Name: '',
					Phone: '',
					Company: '',
					Street1: '',
					Street2: '',
					Street3: '',
					District: '',
					City: '',
					Province: '',
					PostalCode: '',
					CountryCode: '',
				},
				mailingDate: moment().format('YYYY-MM-DD'),
			};
		}
	},
);

const handleClose = () => {
	emit('update:modelValue', false);
};

// 从地址簿选中发件人后回填表单
const applySender = (row: SenderAddress) => {
	const c = row?.Contact ?? row?.contact;
	if (!c) return;
	form.value.Contact = {
		...form.value.Contact,
		Name: c.Name ?? c.name ?? '',
		Company: c.Company ?? c.company ?? '',
		Phone: c.Phone ?? c.phone ?? '',
		CountryCode: c.CountryCode ?? c.countryCode ?? '',
		Province: c.Province ?? c.province ?? '',
		City: c.City ?? c.city ?? '',
		District: c.District ?? c.district ?? '',
		Street1: c.Street1 ?? c.street1 ?? '',
		Street2: c.Street2 ?? c.street2 ?? '',
		Street3: c.Street3 ?? c.street3 ?? '',
		PostalCode: c.PostalCode ?? c.postalCode ?? '',
	};
};

const submit = async () => {
	loading.value = true;
	const body = {
		shipper: form.value.Contact,
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
.sender-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}
.sender-title {
	font-size: 15px;
	font-weight: 600;
}
.sender-form {
	display: flex;
	flex-wrap: wrap;
	gap: 12px 16px;
	:deep(.el-form-item) {
		margin: 0;
		flex: 0 0 calc(50% - 8px);
		max-width: calc(50% - 8px);
	}
	:deep(.el-input),
	:deep(.el-select) {
		width: 100%;
	}
}
.mailing {
	padding: 15px 0 0;
	.mailing-title {
		font-size: 15px;
		font-weight: 600;
		margin: 0 0 12px;
	}
}
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
</style>