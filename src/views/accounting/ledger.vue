<template>
	<div class="ledger-page">
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
				<el-button type="success" :icon="Download" @click="exportdata">
					{{ t('pages.Export') }}
				</el-button>
			</div>

			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.ID')" prop="id" width="180" />
				<el-table-column :label="t('pages.date')" width="180">
					<template #default="scope">
						<span>{{ formatDate(scope.row.talliedOn) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.accounting.ledger.LedgerSide')" width="120">
					<template #default="scope">
						<span>{{ formatLedgerSide(scope.row.ledgerSide) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.ChargeItem')" width="160">
					<template #default="scope">
						<span>{{ formatChargeItem(scope.row.chargeID ?? scope.row.chargeItem) }}</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.tenantalias')"
					prop="tenantAlias"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.lastmiler')"
					prop="lastMilerNbr"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column :label="t('pages.accounting.ledger.ChargeAmount')" width="160">
					<template #default="scope">
						<span>{{ scope.row.chargeAmt?.value }}{{ scope.row.chargeAmt?.unit }}</span>
					</template>
				</el-table-column>
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
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Download } from '@element-plus/icons-vue';
import moment from 'moment';
import { ledgerlist, ledgerexport, SackMftsign } from '@/api/accounting';
import { formatChargeItem } from '@/utils/charge-item';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface LedgerRow extends Record<string, any> {
	id: string | number;
	talliedOn?: string;
	ledgerSide?: string;
	chargeID?: string | number;
	chargeItem?: string | number;
	tenantAlias?: string;
	lastMilerNbr?: string;
	chargeAmt?: { value: number | string; unit?: string };
}

const dates = ref<[string, string] | null>(null);
const routeData = ref<LedgerRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const formatDate = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const formatLedgerSide = (side: string | undefined) => {
	if (!side) return '';
	if (side === 'Charge' || side === 'Credit') {
		return t(`pages.accounting.ledger.side.${side}`);
	}
	return side;
};

const datatoutc = (d: string | undefined) => {
	if (!d) return '';
	return moment.utc(d).format('YYYY-MM-DD');
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
	const res: ApiResponse<any> = await ledgerlist({
		index: pagecurrent.value - 1,
		size: count.value,
		PeriodMin: datatoutc(dates.value?.[0]),
		PeriodMax: datatoutc(dates.value?.[1]),
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const exportdata = async () => {
	const PeriodMin = datatoutc(dates.value?.[0]);
	const PeriodMax = datatoutc(dates.value?.[1]);
	const params: string[] = [];
	if (PeriodMin) params.push(`PeriodMin=${PeriodMin}`);
	if (PeriodMax) params.push(`PeriodMax=${PeriodMax}`);
	const url = `/api/Ledgers/export?` + params.join('&');
	try {
		const res: any = await SackMftsign({ url });
		if (res?.token) {
			window.open(`${url}&token=${res.token}`, '_blank');
		} else {
			const blob: any = await ledgerexport({ PeriodMin, PeriodMax });
			const blobUrl = window.URL.createObjectURL(new Blob([blob]));
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = `ledgers_${moment().format('YYYYMMDDHHmmss')}.xlsx`;
			a.click();
			window.URL.revokeObjectURL(blobUrl);
		}
	} catch (e) {
		ElMessage.error(t('pages.Failed'));
	}
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
.ledger-page {
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
