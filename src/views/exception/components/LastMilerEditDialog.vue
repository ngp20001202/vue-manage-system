<template>
	<el-dialog
		v-model="visible"
		:title="`${t('pages.ID')} # ${props.id}`"
		width="70%"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div v-loading="loading">
			<div v-if="form.supplement" class="supplement">{{ form.supplement }}</div>

			<h3 class="section-title">{{ t('pages.Consignee') }}</h3>
			<el-form
				ref="cneeFormRef"
				:inline="true"
				:model="form"
				:rules="cneeRules"
				label-position="top"
				class="cnee-form"
			>
				<el-form-item :label="t('pages.Name')" prop="cneeInfo.name">
					<el-input v-model="form.cneeInfo.name" />
				</el-form-item>
				<el-form-item :label="t('pages.Phone')" prop="cneeInfo.phone">
					<el-input
						v-model="form.cneeInfo.phone"
						:placeholder="t('pages.phoneplace')"
						maxlength="20"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.Email')" prop="cneeInfo.email">
					<el-input
						v-model="form.cneeInfo.email"
						:placeholder="t('pages.emailplace')"
						maxlength="50"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.CountryCode')" prop="cneeInfo.countryCode">
					<el-select v-model="form.cneeInfo.countryCode" disabled filterable>
						<el-option
							v-for="c in countryOptions"
							:key="c.value"
							:label="c.label"
							:value="c.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.ProvinceState')" prop="cneeInfo.province">
					<el-input v-model="form.cneeInfo.province" maxlength="20" />
				</el-form-item>
				<el-form-item :label="t('pages.City')" prop="cneeInfo.city">
					<el-input v-model="form.cneeInfo.city" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.district')" prop="cneeInfo.district">
					<el-input
						v-model="form.cneeInfo.district"
						:placeholder="t('pages.districtplace')"
						maxlength="20"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.ZipPostalCode')" prop="cneeInfo.postalCode">
					<el-input
						v-model="form.cneeInfo.postalCode"
						:placeholder="t('pages.ZipPostalCodeplace')"
						maxlength="10"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine1')" prop="cneeInfo.street1">
					<el-input
						v-model="form.cneeInfo.street1"
						:placeholder="t('pages.StreetLine1place')"
						maxlength="35"
					/>
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine2')" prop="cneeInfo.street2">
					<el-input v-model="form.cneeInfo.street2" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine3')" prop="cneeInfo.street3">
					<el-input v-model="form.cneeInfo.street3" maxlength="35" />
				</el-form-item>
			</el-form>

			<h3 class="section-title">{{ t('pages.DeclaredInformation') }}</h3>
			<div v-for="(val, i) in form.declaredInfos" :key="i" class="declared-row">
				<el-form
					:ref="(el: any) => setInfoForm(el, i)"
					:inline="true"
					:model="val"
					:rules="infoRules"
					label-position="top"
					class="declared-form"
				>
					<el-form-item :label="t('pages.Parcels.create.Name')" prop="goodsInfo.name">
						<el-input v-model="val.goodsInfo.name" />
					</el-form-item>
					<el-form-item :label="t('pages.Quantity')" prop="quantity">
						<el-input v-model="val.quantity" type="number" min="0" step="1" />
					</el-form-item>
					<el-form-item :label="t('pages.LineTotal')" prop="lineTotal.value">
						<div class="line-total">
							<el-input v-model="val.lineTotal.value" type="number" min="0" step="1" />
							<el-select v-model="val.lineTotal.unit" class="unit-select">
								<el-option
									v-for="p in priceOptions"
									:key="p.value"
									:label="p.label"
									:value="p.value"
								/>
							</el-select>
						</div>
					</el-form-item>
					<el-form-item :label="t('pages.Parcels.create.LocalName')">
						<el-input v-model="val.goodsInfo.localName" />
					</el-form-item>
					<el-form-item :label="t('pages.HSCode')">
						<el-input v-model="val.goodsInfo.hSCode" />
					</el-form-item>
					<el-form-item class="row-actions">
						<el-button link type="primary" :icon="DocumentCopy" @click="copyItem(val)" />
						<el-button
							v-if="form.declaredInfos.length > 1"
							link
							type="primary"
							:icon="CircleClose"
							@click="deleteItem(i)"
						/>
						<el-button
							v-if="i === form.declaredInfos.length - 1"
							link
							type="primary"
							:icon="CirclePlus"
							@click="addItem"
						>
							{{ t('pages.Parcels.create.NewItem') }}
						</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="handleClose">{{ t('pages.Cancel') }}</el-button>
				<el-button type="primary" :loading="submitting" @click="submit">
					{{ t('pages.submit') }}
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, type FormRules } from 'element-plus';
import { DocumentCopy, CircleClose, CirclePlus } from '@element-plus/icons-vue';
import { lastMilerRejectedDetail, lastMilerEdit } from '@/api/rejection';
import type { ApiResponse } from '@/api/types';
import { countryOptions } from '@/utils/country';

const props = defineProps<{ modelValue: boolean; id: string | number }>();
const emit = defineEmits(['update:modelValue', 'success']);

const { t } = useI18n();

interface DeclaredInfo {
	goodsInfo: { sku: string; name: string; hSCode: string; localName: string };
	lineTotal: { value: string | number; unit: number };
	quantity: string | number;
}

const priceOptions = [
	{ label: 'USD', value: 1 },
	{ label: 'CNY', value: 2 },
	{ label: 'EUR', value: 3 },
	{ label: 'GBP', value: 4 },
	{ label: 'CAD', value: 5 },
	{ label: 'JPY', value: 6 },
	{ label: 'KRW', value: 7 },
	{ label: 'AUD', value: 8 },
	{ label: 'HKD', value: 9 },
	{ label: 'MYR', value: 10 },
	{ label: 'TWD', value: 11 },
	{ label: 'NOK', value: 12 },
];

const emptyDeclared = (): DeclaredInfo => ({
	goodsInfo: { sku: '', name: '', hSCode: '', localName: '' },
	lineTotal: { value: '', unit: 1 },
	quantity: 0,
});

const emptyForm = () => ({
	supplement: '',
	cneeInfo: {
		name: '',
		phone: '',
		email: '',
		company: '',
		street1: '',
		street2: '',
		street3: '',
		district: '',
		city: '',
		province: '',
		postalCode: '',
		countryCode: '',
	},
	declaredInfos: [emptyDeclared()],
});

const visible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const cneeFormRef = ref();
const infoForms = ref<Record<number, any>>({});
const form = ref(emptyForm());

const setInfoForm = (el: any, i: number) => {
	if (el) infoForms.value[i] = el;
};

const validateCount = (_rule: any, value: any, callback: (err?: Error) => void) => {
	if (value === '' || value === null || value === undefined) {
		callback(new Error(t('pages.required')));
	} else if (isNaN(Number(value))) {
		callback(new Error(t('pages.required')));
	} else if (Number(value) <= 0) {
		callback(new Error(t('pages.required')));
	} else {
		callback();
	}
};

const validateEmail = (_rule: any, value: string, callback: (err?: Error) => void) => {
	const mailReg = /^([a-zA-Z0-9_.\-])+@(([a-zA-Z0-9_.\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (!value) return callback();
	if (mailReg.test(value)) callback();
	else callback(new Error(t('pages.InvalidEmail')));
};

const cneeRules: FormRules = {
	'cneeInfo.name': [{ required: true, message: '姓名不能为空', trigger: 'change' }],
	'cneeInfo.phone': [{ required: true, message: '手机号码不能为空', trigger: 'change' }],
	'cneeInfo.email': [{ validator: validateEmail, trigger: 'change' }],
	'cneeInfo.countryCode': [{ required: true, message: '', trigger: 'change' }],
	'cneeInfo.province': [{ required: true, message: '省/州不能为空', trigger: 'change' }],
	'cneeInfo.city': [{ required: true, message: '城市不能为空', trigger: 'change' }],
	'cneeInfo.street1': [{ required: true, message: '街址1不能为空', trigger: 'change' }],
	'cneeInfo.postalCode': [{ required: true, message: '邮编不能为空', trigger: 'change' }],
};

const infoRules: FormRules = {
	quantity: [{ required: true, validator: validateCount, trigger: 'change' }],
	'goodsInfo.name': [{ required: true, message: '英文名不能为空', trigger: 'change' }],
	'lineTotal.value': [{ required: true, validator: validateCount, trigger: 'change' }],
};

const addItem = () => {
	form.value.declaredInfos.push(emptyDeclared());
};

const deleteItem = (i: number) => {
	form.value.declaredInfos.splice(i, 1);
	infoForms.value = {};
};

const copyItem = (item: DeclaredInfo) => {
	form.value.declaredInfos.push({
		goodsInfo: { ...item.goodsInfo },
		lineTotal: { ...item.lineTotal },
		quantity: item.quantity,
	});
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await lastMilerRejectedDetail(props.id);
	if (res?.isSuccess && res.result) {
		form.value = {
			...emptyForm(),
			...res.result,
			cneeInfo: { ...emptyForm().cneeInfo, ...res.result.cneeInfo },
			declaredInfos: res.result.declaredInfos?.length
				? res.result.declaredInfos
				: [emptyDeclared()],
		};
	}
	loading.value = false;
};

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (v) {
			form.value = emptyForm();
			infoForms.value = {};
			cneeFormRef.value?.clearValidate();
			getdata();
		}
	},
);

const handleClose = () => {
	emit('update:modelValue', false);
};

const submit = async () => {
	const results = [await cneeFormRef.value?.validate().catch(() => false)];
	for (let i = 0; i < form.value.declaredInfos.length; i++) {
		const el = infoForms.value[i];
		results.push(el ? await el.validate().catch(() => false) : false);
	}
	if (!results.every(Boolean)) return;

	submitting.value = true;
	const c = form.value.cneeInfo;
	const res: ApiResponse<any> = await lastMilerEdit({
		id: props.id,
		cneeInfo: {
			Name: c.name,
			Phone: c.phone,
			Email: c.email,
			Company: c.company,
			Street1: c.street1,
			Street2: c.street2,
			Street3: c.street3,
			District: c.district,
			City: c.city,
			Province: c.province,
			PostalCode: c.postalCode,
			CountryCode: c.countryCode,
		},
		declaredInfos: form.value.declaredInfos,
	});
	submitting.value = false;
	if (res?.isSuccess) {
		ElMessage.success(res.message || t('pages.Success'));
		emit('success');
		emit('update:modelValue', false);
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};
</script>

<style lang="scss" scoped>
.supplement {
	color: #dc3545;
	margin-bottom: 12px;
	word-break: break-word;
}
.section-title {
	font-size: 15px;
	font-weight: 600;
	margin: 0 0 12px;
}
.cnee-form {
	display: flex;
	flex-wrap: wrap;
	gap: 12px 16px;
	:deep(.el-form-item) {
		margin: 0;
		flex: 0 0 calc(25% - 12px);
		max-width: calc(25% - 12px);
	}
	:deep(.el-input),
	:deep(.el-select) {
		width: 100%;
	}
}
.declared-row {
	padding: 12px 0;
	border-bottom: 1px solid #ebeef5;
}
.declared-form {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	gap: 12px 16px;
	:deep(.el-form-item) {
		margin: 0;
		flex: 0 0 calc(20% - 13px);
		max-width: calc(20% - 13px);
	}
	:deep(.el-input),
	:deep(.el-select) {
		width: 100%;
	}
}
.line-total {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	:deep(.el-input) {
		flex: 1;
	}
}
.unit-select {
	width: 100px;
	flex-shrink: 0;
}
.row-actions {
	flex: 1 1 100% !important;
	max-width: 100% !important;
}
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
@media (max-width: 992px) {
	.cnee-form :deep(.el-form-item),
	.declared-form :deep(.el-form-item) {
		flex: 0 0 100%;
		max-width: 100%;
	}
}
</style>
