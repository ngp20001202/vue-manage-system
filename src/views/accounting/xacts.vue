<template>
	<div class="xacts-page">
		<el-card shadow="never" class="filter-card">
			<div class="filter-row">
				<div class="date-picker">
					<el-date-picker
						v-model="dates"
						type="daterange"
						unlink-panels
						:start-placeholder="t('pages.startpicker')"
						:end-placeholder="t('pages.endpicker')"
						value-format="YYYY-MM-DD"
					/>
				</div>
				<el-button type="primary" :icon="Search" @click="onSearch">
					{{ t('pages.Search') }}
				</el-button>
				<el-button :icon="Refresh" @click="onReset">
					{{ t('pages.Reset') }}
				</el-button>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div v-show="routeData.length" class="op-row">
				<div class="op-row-left">
					<el-tooltip :content="t('pages.Export')" placement="top" :enterable="false">
						<el-button
							type="success"
							class="export"
							@click="exportdata"
						>
							<span class="iconfont icon-daochun" style="font-size: 16px" />
						</el-button>
					</el-tooltip>
				</div>
			</div>

			<el-table
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
				@row-click="onRowClick"
			>
				<el-table-column :label="t('pages.ID')" prop="id" width="180">
					<template #default="scope">
						<span class="cyan">
							<el-icon style="margin-right: 4px"><InfoFilled /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.date')" width="180">
					<template #default="scope">
						<span>{{ formatDate(scope.row.xactedOn) }}</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.tenantalias')"
					prop="tenantAlias"
					min-width="160"
				/>
				<el-table-column :label="t('pages.type1')" width="120">
					<template #default="scope">
						<span>{{ formatXactType(scope.row.type) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.amount')" width="160">
					<template #default="scope">
						<span>{{ scope.row.xactAmt?.value }}{{ scope.row.xactAmt?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.nextbalance')" width="160">
					<template #default="scope">
						<span>{{ scope.row.nextBal?.value }}{{ scope.row.nextBal?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.remark')"
					prop="supplement"
					min-width="200"
					show-overflow-tooltip
				/>
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

		<XactDetailDialog
			v-model="detailVisible"
			:id="detailId"
			:invoiceID="detailInvoiceId"
			:paymentID="detailPaymentId"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, Refresh, InfoFilled } from '@element-plus/icons-vue';
import moment from 'moment';
import { xactslist, SackMftsign } from '@/api/accounting';
import { getoriginurl } from '@/utils/originurl';
import XactDetailDialog from './components/XactDetailDialog.vue';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface XactsRow extends Record<string, any> {
	id: string | number;
	xactedOn?: string;
	tenantAlias?: string;
	tenantID?: string | number;
	type?: string;
	xactAmt?: { value: number | string; unit?: string };
	nextBal?: { value: number | string; unit?: string };
	supplement?: string;
	paymentID?: string;
	invoiceID?: string;
}

const routeData = ref<XactsRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const dates = ref<[string, string] | null>(null);
const detailVisible = ref(false);
const detailId = ref<string | number>('');
const detailInvoiceId = ref<string | number>('');
const detailPaymentId = ref<string | number>('');

const formatDate = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const formatXactType = (type: string | undefined) => {
	if (!type) return '';
	if (type === 'Deduct' || type === 'Deposit') {
		return t(`pages.accounting.xacts.${type}`);
	}
	return type;
};

const toUtcIso = (date: string | undefined) => {
	if (!date) return '';
	return moment(date).utc().format();
};

const defaultRange = (): [string, string] => [
	moment().subtract(30, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const onReset = () => {
	dates.value = defaultRange();
	pagecurrent.value = 1;
	getdata();
};

const getdata = async () => {
	loading.value = true;
	const PeriodMin = dates.value ? toUtcIso(dates.value[0]) : '';
	const PeriodMax = dates.value ? toUtcIso(dates.value[1]) : '';
	const res: ApiResponse<any> = await xactslist({
		index: pagecurrent.value - 1,
		size: count.value,
		PeriodMin,
		PeriodMax,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const exportdata = async () => {
	const url = new URL(`${getoriginurl()}/api/accounting/xacts/export`);
	if (dates.value) {
		url.searchParams.set('PeriodMin', toUtcIso(dates.value[0]) || '');
		url.searchParams.set('PeriodMax', toUtcIso(dates.value[1]) || '');
	}
	const res: any = await SackMftsign({ url: url.toString() });
	if (res?.token) {
		url.searchParams.set('token', res.token);
		window.open(url.toString(), '_blank');
	}
};

const onRowClick = (row: XactsRow) => {
	detailId.value = row?.id ?? '';
	detailInvoiceId.value = row?.invoiceID ?? '';
	detailPaymentId.value = row?.paymentID ?? '';
	detailVisible.value = true;
};

watch([count, pagecurrent], () => {
	getdata();
});

onMounted(() => {
	dates.value = defaultRange();
	getdata();
});
</script>

<style lang="scss" scoped>
.xacts-page {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.filter-card,
.table-card {
	background: #fff;
}
.filter-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8px;
	min-height: 60px;
}
.date-picker {
	width: 100%;
	max-width: 320px;
	min-width: 0;
}
.date-picker :deep(.el-date-editor) {
	width: 100%;
}
.op-row {
	display: flex;
	gap: 12px;
	align-items: center;
	margin-bottom: 12px;
	flex-wrap: wrap;
	justify-content: flex-end;
}
.op-row-left {
	display: flex;
	gap: 8px;
	align-items: center;
}
.export {
	min-width: 0 !important;
	padding: 5px 8px;
	color: #fff;
	border: none;
}
.cyan {
	color: #17a2b8;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
.cyan:hover {
	text-decoration: underline;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
@media (max-width: 768px) {
	.date-picker {
		width: 100%;
	}
}
</style>
