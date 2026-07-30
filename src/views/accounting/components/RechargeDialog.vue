<template>
	<el-dialog
		v-model="visible"
		v-loading="loading"
		:title="t('pages.Recharge.Recharge')"
		width="450px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<el-form ref="formRef" :model="form" :rules="rules" label-position="left">
			<el-form-item :label="t('pages.Recharge.Rechargeamount')" prop="amount">
				<el-input v-model="form.amount" type="number" min="0.01">
					<template #append>{{ currency }}</template>
				</el-input>
			</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="handleClose">{{ t('pages.Recharge.Cancel') }}</el-button>
					<el-button type="primary" :loading="loading" @click="confirm">
						{{ t('pages.Recharge.Confirm') }}
					</el-button>
				</div>
			</template>
			</el-dialog>
			</template>

			<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Paymentsdata, CashierPayments } from '@/api/accounting';
import { formartenglishcurrency } from '@/utils/format';

interface BalanceRow {
	currencyText?: string;
}

const props = defineProps<{ modelValue: boolean; row?: BalanceRow }>();
const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();
const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();
const currency = ref('');
const form = ref({ amount: 0.01 });

const rules: FormRules = {
	amount: [
		{
			required: true,
			trigger: 'change',
			validator: (_rule: any, value: any, callback: any) => {
				if (value === '' || value == null) {
					callback(new Error(t('pages.Recharge.Rechargeamount')));
				} else if (Number(value) < 0.01) {
					callback(new Error('min 0.01'));
				} else {
					callback();
				}
			},
		},
	],
};

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (v) {
			currency.value = props.row?.currencyText || '';
			form.value.amount = 0.1;
			formRef.value?.resetFields?.();
		}
	},
);

const extractBaseUrl = (url: string) => (url.includes('?') ? url.split('?')[0] : url);

const payment = (orderid: string) => {
	const unit = formartenglishcurrency(currency.value);
	CashierPayments({
		subject: `Recharge: ${form.value.amount} ${unit}`,
		returnUrl: extractBaseUrl(location.href),
		amount: {
			value: Number(form.value.amount),
			unit,
		},
		orderId: orderid,
		refInfo: '',
	})
		.then((order: any) => {
			if (order?.id) {
				const link = order.links?.find((x: any) => x.rel === 'Checkout');
				if (link?.href) {
					emit('update:modelValue', false);
					window.open(link.href, '_blank');
				}
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const confirm = () => {
	formRef.value?.validate((valid) => {
		if (!valid) return;
		loading.value = true;
		const unit = formartenglishcurrency(currency.value);
		Paymentsdata({
			amount: {
				value: Number(form.value.amount),
				unit,
			},
		})
			.then((res: any) => {
				if (res?.isSuccess && res.result?.paymentID) {
					payment(res.result.paymentID);
				} else {
					loading.value = false;
					ElMessage.error(res?.message || t('pages.Failed'));
				}
			})
			.catch(() => {
				loading.value = false;
			});
	});
};

const handleClose = () => {
	emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
</style>
