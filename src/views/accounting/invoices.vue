<template>
	<div class="invoices-page">
		<el-card shadow="never" class="filter-card">
			<div class="filter-bar">
				<div class="filter-item">
					<span class="filter-label Billgenerationtime">{{ t('pages.Invoice.Billgenerationtime') }}：</span>
					<el-date-picker
						v-model="dates"
						type="daterange"
						unlink-panels
						:start-placeholder="t('pages.startpicker')"
						:end-placeholder="t('pages.endpicker')"
						value-format="YYYY-MM-DD"
					/>
				</div>
				<div class="filter-actions">
					<el-button :icon="Refresh" @click="onReset">
						{{ t('pages.Invoice.Reset') }}
					</el-button>
					<el-button type="primary" :icon="Search" @click="onSearch">
						{{ t('pages.Invoice.Search') }}
					</el-button>
				</div>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<el-pagination
				v-if="routeData.length"
				class="pager-top"
				background
				layout="total, prev, pager, next, sizes"
				:total="availcnt"
				:current-page="pagecurrent"
				:page-size="count"
				:page-sizes="[10, 20, 50, 100]"
				@current-change="(p: number) => (pagecurrent = p)"
				@size-change="(s: number) => (count = s)"
			/>

			<el-table
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
			>
				<el-table-column :label="t('pages.ID')" prop="id" width="180" />
				<el-table-column
					:label="t('pages.Invoice.name')"
					prop="name"
					min-width="180"
					show-overflow-tooltip
				/>
				<el-table-column :label="t('pages.Invoice.billamount')" width="180">
					<template #default="scope">
						<span>{{ scope.row.totalChargeAmt?.value }}{{ scope.row.totalChargeAmt?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.Invoice.Billgenerationtime')"
					width="180"
				>
					<template #default="scope">
						<span>{{ formatDate(scope.row.issuedOn) }}</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.Invoice.Action')"
					width="120"
					align="center"
				>
					<template #default="scope">
						<el-link
							type="primary"
							:underline="false"
							@click.stop.prevent="() => onDownload(scope.row)"
						>
							{{ t('pages.Invoice.Download') }}
						</el-link>
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
import { Search, Refresh } from '@element-plus/icons-vue';
import moment from 'moment';
import { GetInvoices, SackMftsign } from '@/api/accounting';
import { datatoutc } from '@/utils/format';
import { getoriginurl } from '@/utils/originurl';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface InvoiceRow extends Record<string, any> {
	id: string | number;
	name?: string;
	totalChargeAmt?: { value: number | string; unit?: string };
	issuedOn?: string;
	fileUrl?: string;
}

const dates = ref<[string, string] | null>(null);
const routeData = ref<InvoiceRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const formatDate = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const fmt = (d: Date) => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
};

const defaultRange = (): [string, string] => {
	const end = new Date();
	const start = new Date();
	start.setDate(start.getDate() - 30);
	return [fmt(start), fmt(end)];
};

const onReset = () => {
	dates.value = defaultRange();
	pagecurrent.value = 1;
	getdata();
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const getdata = async () => {
	loading.value = true;
	let start = '';
	let end = '';
	if (dates.value && dates.value.length === 2) {
		start = datatoutc(dates.value[0]);
		end = datatoutc(dates.value[1]);
	}
	const res: ApiResponse<any> = await GetInvoices({
		index: pagecurrent.value - 1,
		size: count.value,
		PeriodMin: start,
		PeriodMax: end,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		const total = res.pagination?.availCnt ?? res.availcnt ?? 0;
		availcnt.value = total;
	}
	loading.value = false;
};

const onDownload = async (row: InvoiceRow) => {
	if (!row?.fileUrl) return;
	const url = new URL(row.fileUrl, getoriginurl());
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
.invoices-page {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.filter-card,
.table-card {
	background: #fff;
}
.filter-bar {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	align-items: center;
	justify-content: space-between;
	padding: 0 0 8px;
}
.filter-item {
	display: flex;
	align-items: center;
}
.filter-label {
	margin-right: 8px;
	color: #606266;
	font-size: 14px;
	white-space: nowrap;
}
.filter-actions {
	display: flex;
	gap: 8px;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
.pager-top {
	margin-bottom: 12px;
	justify-content: flex-end;
	display: flex;
}
@media (max-width: 768px) {
	.filter-item,
	.filter-actions {
		width: 100%;
	}
}
</style>