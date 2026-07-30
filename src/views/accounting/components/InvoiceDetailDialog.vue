<template>
	<el-dialog
		v-model="visible"
		:title="t('pages.InvoiceDetail') + id"
		width="860px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<el-table
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
			<el-table-column
				property="mic"
				:label="t('pages.Parcels.list.detail.mic')"
			/>
			<el-table-column
				property="chargeID"
				:label="t('pages.Parcels.detail.ChargeItem')"
			>
				<template #default="scope">
					<span>{{ formatChargeItem(scope.row.chargeID) }}</span>
				</template>
			</el-table-column>
			<el-table-column property="chargeAmt.value" :label="t('pages.amount')">
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
import moment from 'moment';
import { GetInvoicesDetail } from '@/api/accounting';
import type { ApiResponse } from '@/api/types';
import { formatChargeItem } from '@/utils/charge-item';

const props = defineProps<{
	modelValue: boolean;
	id?: string | number;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', v: boolean): void;
}>();

const { t } = useI18n();
const visible = ref(false);
const loading = ref(false);
const id = ref<string | number>('');
const data = ref<any[]>([]);

const formatTime = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const loadDetail = async () => {
	loading.value = true;
	try {
		const res: ApiResponse<any> = await GetInvoicesDetail(id.value);
		if (res?.isSuccess) {
			data.value = res.result?.ledgers ?? [];
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch {
		ElMessage.error(t('pages.Failed'));
	} finally {
		loading.value = false;
	}
};

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (v) {
			id.value = props.id ?? '';
			data.value = [];
			loadDetail();
		}
	},
);

const handleClose = () => {
	emit('update:modelValue', false);
};
</script>
