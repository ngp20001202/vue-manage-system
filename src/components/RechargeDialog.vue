<template>
	<el-dialog
		v-model="visible"
		v-loading="loading"
		:title="t('pages.Recharge.Recharge')"
		width="450px"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		@closed="onClosed"
	>
		<el-form ref="formRef" :model="ruleForm" :rules="rules" label-position="left">
			<el-form-item :label="t('pages.Recharge.Rechargeamount')" prop="amount">
				<el-input v-model="ruleForm.amount" type="number" min="0.01">
					<template #append>{{ currency }}</template>
				</el-input>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">{{ t('pages.Recharge.Cancel') }}</el-button>
			<el-button type="primary" :loading="loading" @click="confirm">
				{{ t('pages.Recharge.Confirm') }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Paymentsdata, CashierPayments } from '@/api/accounting';
import { formartenglishcurrency } from '@/utils/format';

const { t } = useI18n();

interface BalanceCard {
	currencyText: string;
}

const props = defineProps<{
	modelValue: boolean;
	card?: BalanceCard | null;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val),
});

const loading = ref(false);
const formRef = ref<FormInstance>();
const ruleForm = reactive({ amount: 0.01 });
const currency = ref('');

const extractString = (inputString: string) => {
	const idx = inputString.indexOf('?');
	return idx === -1 ? inputString : inputString.substring(0, idx);
};

const payment = (orderid: string | number) => {
	const unit = formartenglishcurrency(currency.value);
	CashierPayments({
		subject: `充值: ${ruleForm.amount} ${unit}`,
		returnUrl: extractString(location.href),
		amount: {
			value: parseFloat(String(ruleForm.amount)),
			unit,
		},
		orderId: orderid,
		refInfo: '',
	})
		.then((order: any) => {
			if (order?.id) {
				const link = order.links?.find((x: any) => x.rel === 'Checkout');
				if (link?.href) {
					visible.value = false;
					window.open(link.href, '_blank');
				} else {
					ElMessage.error(t('pages.Failed'));
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
		Paymentsdata({
			amount: {
				value: ruleForm.amount,
				unit: formartenglishcurrency(currency.value),
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

const rules = reactive<FormRules>({
	amount: [
		{
			required: true,
			trigger: 'change',
			validator: (_rule, value, callback) => {
				if (value === '' || value === null || value === undefined) {
					callback(new Error(t('pages.required') || '金额不能为空'));
				} else if (Number(value) < 0.01) {
					callback(new Error('金额最小为0.01'));
				} else {
					callback();
				}
			},
		},
	],
});

const onClosed = () => {
	currency.value = '';
	ruleForm.amount = 0.01;
	formRef.value?.resetFields();
};

watch(
	() => props.modelValue,
	(val) => {
		if (val && props.card) {
			currency.value = props.card.currencyText;
			ruleForm.amount = 0.1;
		}
	},
);
</script>
