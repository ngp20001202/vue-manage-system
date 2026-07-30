<template>
	<el-dialog
		v-model="visible"
		:title="t('pages.InvoiceDetail') + id"
		width="860px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div v-if="invoiceID && !paymentID" style="text-align: right; margin-bottom: 15px">
			<el-button
				type="success"
				size="small"
				class="export-green"
				:loading="exporting"
				@click="exportmps"
			>
				<span class="iconfont icon-daochun" style="font-size: 16px">
					{{ t('pages.Export') }}</span
				>
			</el-button>
		</div>

		<el-table
			v-if="paymentID"
			ref="multipleTableRef"
			v-loading="loading"
			:data="data"
			style="width: 100%; margin-bottom: 15px"
			size="small"
			border
		>
			<el-table-column property="id" :label="t('pages.ID')">
				<template #default="scope">
					<span>{{ scope.row.id }}</span>
				</template>
			</el-table-column>
			<el-table-column property="paymentID" :label="t('pages.PaymentID')">
				<template #default="scope">
					<span>{{ scope.row.paymentID }}</span>
				</template>
			</el-table-column>
			<el-table-column property="amount" :label="t('pages.amount')">
				<template #default="scope">
					<span
						>{{ scope.row.amount?.value }}{{ scope.row.amount?.unit }}</span
					>
				</template>
			</el-table-column>
			<el-table-column
				property="currencyText"
				:label="t('pages.AccountBalance.Currency')"
			/>
			<el-table-column property="payMethod" :label="t('pages.type1')">
				<template #default="scope">
					<span>{{ scope.row.payMethod }}</span>
				</template>
			</el-table-column>
			<el-table-column property="postedOn" :label="t('pages.PostedOn')">
				<template #default="scope">
					<span>{{ formatTime(scope.row.postedOn) }}</span>
				</template>
			</el-table-column>
			<el-table-column
				property="clientRefNbr"
				:label="t('pages.Reference')"
			/>
			<template #empty>
				<el-empty :description="t('pages.NoData')" />
			</template>
		</el-table>

		<el-table
			v-else
			ref="multipleTableRef"
			v-loading="loading"
			:data="data"
			style="width: 100%; margin-bottom: 15px"
			size="small"
			border
		>
			<el-table-column property="id" :label="t('pages.ID')">
				<template #default="scope">
					<span>{{ scope.row.id }}</span>
				</template>
			</el-table-column>
			<el-table-column property="invoiceID" :label="t('pages.InvoiceID')">
				<template #default="scope">
					<span>{{ scope.row.invoiceID }}</span>
				</template>
			</el-table-column>
			<el-table-column
				property="chargeItem"
				:label="t('pages.Parcels.detail.ChargeItem')"
			>
				<template #default="scope">
					<span>{{ formatChargeItem(scope.row.chargeItem ?? scope.row.chargeID) }}</span>
				</template>
			</el-table-column>
			<el-table-column property="chargeAmt" :label="t('pages.amount')">
				<template #default="scope">
					<span
						>{{ scope.row.chargeAmt?.value
						}}{{ scope.row.chargeAmt?.unit }}</span
					>
				</template>
			</el-table-column>
			<el-table-column property="talliedOn" :label="t('pages.date')">
				<template #default="scope">
					<span>{{ formatTime(scope.row.talliedOn) }}</span>
				</template>
			</el-table-column>
			<template #empty>
				<el-empty :description="t('pages.NoData')" />
			</template>
		</el-table>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';
import moment from 'moment';
import {
	getPayment,
	getInvoice,
	Invoiceexport,
} from '@/api/accounting';
import type { ApiResponse } from '@/api/types';
import { formatChargeItem } from '@/utils/charge-item';

const props = defineProps<{
	modelValue: boolean;
	id?: string | number;
	invoiceID?: string | number;
	paymentID?: string | number;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', v: boolean): void;
}>();

const { t } = useI18n();
const visible = ref(false);
const loading = ref(false);
const exporting = ref(false);
const id = ref<string | number>('');
const invoiceID = ref<string | number>('');
const paymentID = ref<string | number>('');
const data = ref<any[]>([]);

const formatTime = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const loadDetail = async () => {
	loading.value = true;
	try {
		if (parseInt(String(paymentID.value || 0), 10) > 0) {
			const res: ApiResponse<any> = await getPayment(String(paymentID.value));
			if (res?.isSuccess) {
				data.value = Array.isArray(res.result) ? res.result : [res.result];
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		} else {
			const res: ApiResponse<any> = await getInvoice(
				String(id.value),
				String(invoiceID.value),
			);
			if (res?.isSuccess) {
				data.value = Array.isArray(res.result) ? res.result : [res.result];
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		}
	} catch {
		ElMessage.error(t('pages.Failed'));
	} finally {
		loading.value = false;
	}
};

const exportmps = async () => {
	exporting.value = true;
	try {
		const blob: any = await Invoiceexport(String(id.value), String(invoiceID.value));
		const filename = `xact_${id.value}_${invoiceID.value}_${moment().format(
			'YYYYMMDD_HHmmss',
		)}.xlsx`;
		saveAs(blob, filename);
		ElMessage.success(t('pages.Success'));
	} catch {
		ElMessage.error(t('pages.Failed'));
	} finally {
		exporting.value = false;
	}
};

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (v) {
			id.value = props.id ?? '';
			invoiceID.value = props.invoiceID ?? '';
			paymentID.value = props.paymentID ?? '';
			data.value = [];
			loadDetail();
		}
	},
);

const handleClose = () => {
	emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.export-green {
	background-color: #28a745;
	border-color: #28a745;
	color: #fff;
}
</style>
