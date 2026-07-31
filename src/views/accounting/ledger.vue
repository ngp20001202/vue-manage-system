<template>
	<div class="ledger-page">
		<el-card shadow="never" class="filter-card">
			<el-tabs v-model="activeTab" type="border-card" @tab-change="onTabChange">
				<el-tab-pane :label="t('pages.all')" name="all" />
				<el-tab-pane :label="t('pages.tracking')" name="tracking" />
			</el-tabs>

			<div class="tabs-content">
				<div v-if="activeTab === 'all'" class="filter-row">
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
					<div class="charge-select">
						<el-select v-model="chargeID" clearable :placeholder="t('pages.ChargeItem')">
							<el-option
								v-for="opt in chargeOptions"
								:key="opt.value"
								:label="opt.label"
								:value="opt.value"
							/>
						</el-select>
					</div>
					<el-button type="primary" :icon="Search" @click="onSearch">
						{{ t('pages.Search') }}
					</el-button>
					<el-button :icon="Refresh" @click="onReset">
						{{ t('pages.Reset') }}
					</el-button>
				</div>
				<div v-else class="filter-row tracking-row">
					<el-input
						v-model="trackingNumbers"
						type="textarea"
						:rows="3"
						:placeholder="t('pages.trackplace')"
						class="tracking-input"
					/>
					<el-button type="primary" :icon="Search" @click="onSearch">
						{{ t('pages.Search') }}
					</el-button>
					<el-button :icon="Refresh" @click="onReset">
						{{ t('pages.Reset') }}
					</el-button>
				</div>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div v-show="routeData.length" class="op-row">
				<el-button
					v-if="activeTab === 'all'"
					type="success"
					:icon="Download"
					@click="exportdata"
				>
					{{ t('pages.Export') }}
				</el-button>
			</div>

			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.ID')" prop="id" width="180" />
				<el-table-column
					:label="t('pages.clientRef')"
					prop="clientRef"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.lastmiler')"
					prop="lastMilerNbr"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.tenantalias')"
					prop="tenantAlias"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.accounting.accountreceivable.SvcName')"
					prop="svcName"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column :label="t('pages.ChargeItem')" width="160">
					<template #default="scope">
						<span>{{ formatChargeItem(scope.row.chargeID ?? scope.row.chargeItem) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.accounting.ledger.ChargeAmount')" width="160">
					<template #default="scope">
						<span>{{ scope.row.total?.value }}{{ scope.row.total?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.date')" width="180">
					<template #default="scope">
						<span>{{ formatDate(scope.row.talliedOn) }}</span>
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
import { Search, Refresh, Download } from '@element-plus/icons-vue';
import moment from 'moment';
import { ledgerlist, SackMftsign } from '@/api/accounting';
import { formatChargeItem, CHARGE_OPTIONS } from '@/utils/charge-item';
import { getoriginurl } from '@/utils/originurl';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface LedgerRow extends Record<string, any> {
	id: string | number;
	clientRef?: string;
	lastMilerNbr?: string;
	tenantAlias?: string;
	svcName?: string;
	chargeID?: string | number;
	chargeItem?: string | number;
	total?: { value: number | string; unit?: string };
	talliedOn?: string;
}

type TabName = 'all' | 'tracking';

const activeTab = ref<TabName>('all');
const dates = ref<[string, string] | null>(null);
const chargeID = ref<string | number>('');
const trackingNumbers = ref('');
const routeData = ref<LedgerRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const chargeOptions = CHARGE_OPTIONS;

const formatDate = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const toUtcIso = (date: string | undefined) => {
	if (!date) return '';
	return moment(date).utc().format();
};

const defaultRange = (): [string, string] => [
	moment().subtract(30, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const parseTrackingNumbers = (text: string) => {
	const list = text
		.split(/[\n,，]/)
		.map((s) => s.trim())
		.filter(Boolean);
	return list.slice(0, 200).join(',');
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const onReset = () => {
	if (activeTab.value === 'all') {
		dates.value = defaultRange();
		chargeID.value = '';
	} else {
		trackingNumbers.value = '';
	}
	pagecurrent.value = 1;
	getdata();
};

const onTabChange = () => {
	if (activeTab.value === 'all') {
		dates.value = defaultRange();
		chargeID.value = '';
	} else {
		trackingNumbers.value = '';
	}
	pagecurrent.value = 1;
	getdata();
};

const getdata = async () => {
	loading.value = true;
	const params: {
		index: number;
		size: number;
		PeriodMin?: string;
		PeriodMax?: string;
		ChargeID?: string | number;
		TrackingNbr?: string;
	} = {
		index: pagecurrent.value - 1,
		size: count.value,
	};

	if (activeTab.value === 'all') {
		params.PeriodMin = toUtcIso(dates.value?.[0]);
		params.PeriodMax = toUtcIso(dates.value?.[1]);
		if (chargeID.value !== '' && chargeID.value != null) {
			params.ChargeID = chargeID.value;
		}
	} else {
		const nbrs = parseTrackingNumbers(trackingNumbers.value);
		if (nbrs) {
			params.TrackingNbr = nbrs;
		}
	}

	const res: ApiResponse<any> = await ledgerlist(params);
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const exportdata = async () => {
	const url = new URL(`${getoriginurl()}/api/accounting/ledger/export`);

	let trackingNbr: string | undefined;
	if (activeTab.value === 'all') {
		if (dates.value) {
			url.searchParams.set('PeriodMin', toUtcIso(dates.value[0]) || '');
			url.searchParams.set('PeriodMax', toUtcIso(dates.value[1]) || '');
		}
		if (chargeID.value !== '' && chargeID.value != null) {
			url.searchParams.set('ChargeID', String(chargeID.value));
		}
	} else {
		trackingNbr = parseTrackingNumbers(trackingNumbers.value) || undefined;
		if (trackingNbr) {
			url.searchParams.set('IsUseTrackingNbr', 'true');
			url.searchParams.set('RefNbrs', trackingNbr);
		}
	}

	const res: any = await SackMftsign({ url: url.toString() });
	if (res?.token) {
		url.searchParams.set('token', res.token);
		window.open(url.toString(), '_blank');
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
.tabs-content {
	margin-top: 12px;
}
.filter-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8px;
	min-height: 60px;
}
.tracking-row {
	align-items: flex-start;
}
.date-picker {
	width: 100%;
	max-width: 320px;
	min-width: 0;
}
.date-picker :deep(.el-date-editor) {
	width: 100%;
}
.charge-select {
	width: 100%;
	max-width: 200px;
	min-width: 0;
}
.charge-select :deep(.el-select) {
	width: 100%;
}
.tracking-input {
	width: 100%;
	max-width: 480px;
	min-width: 0;
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
:deep(.el-tabs--border-card) {
	box-shadow: none;
	border: 1px solid #ebeef5;
}
:deep(.el-tabs__content) {
	display: none !important;
}
:deep(.el-tabs__item) {
	height: 40px;
	line-height: 40px;
}
@media (max-width: 768px) {
	.date-picker,
	.charge-select,
	.tracking-input {
		width: 100%;
		max-width: none;
	}
}
</style>
