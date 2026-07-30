<template>
	<div class="invoices-page">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="all" />
				<el-tab-pane :label="t('pages.Invoice.paid')" name="paid" />
				<el-tab-pane :label="t('pages.Invoice.unpaid')" name="unpaid" />
			</el-tabs>

			<div class="tabs-content">
				<el-form :inline="true" class="filter-form">
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
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Invoice.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Invoice.Reset') }}
						</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.ID')" prop="id" width="180" />
				<el-table-column :label="t('pages.Invoice.name')" min-width="200" prop="name" show-overflow-tooltip />
				<el-table-column :label="t('pages.Invoice.billamount')" width="180">
					<template #default="scope">
						<span>{{ formatAmount(scope.row.billAmount) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Invoice.Billgenerationtime')" width="200">
					<template #default="scope">
						<span>{{ formatDate(scope.row.timeofgeneration) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Invoice.timeofpayment')" width="200">
					<template #default="scope">
						<span>{{ formatDate(scope.row.timeofpayment) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Invoice.Thelatestpaymenttime')" width="200">
					<template #default="scope">
						<span>{{ formatDate(scope.row.Thelatestpaymenttime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Invoice.Action')" width="120" fixed="right">
					<template #default="scope">
						<el-button
							type="primary"
							link
							:icon="Download"
							:loading="downloadingId === scope.row.id"
							@click="() => onDownload(scope.row)"
						>
							{{ t('pages.Invoice.Download') }}
						</el-button>
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
import { GetInvoices, ExportInvoices } from '@/api/accounting';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface InvoiceRow extends Record<string, any> {
	id: string | number;
	name?: string;
	billAmount?: number | string;
	timeofgeneration?: string;
	timeofpayment?: string;
	Thelatestpaymenttime?: string;
	state?: string | number;
}

const activeName = ref('all');
const dates = ref<[string, string] | null>(null);
const routeData = ref<InvoiceRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const downloadingId = ref<string | number | null>(null);

// 账单状态本地过滤：0=全部 1=已付款 2=未付款
const STATE_MAP: Record<string, string | number> = {
	all: '',
	paid: 'Paid',
	unpaid: 'Unpaid',
};

const formatDate = (utc: string | undefined) => {
	if (!utc) return '-';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const formatAmount = (v: number | string | undefined) => {
	if (v == null) return '-';
	const num = typeof v === 'number' ? v : Number(v);
	if (Number.isNaN(num)) return String(v);
	return num.toFixed(2);
};

const defaultRange = (): [string, string] => [
	moment().subtract(30, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const onReset = () => {
	dates.value = defaultRange();
	pagecurrent.value = 1;
	getdata();
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const beforeLeave = (e: string | number) => {
	dates.value = defaultRange();
	pagecurrent.value = 1;
	activeName.value = String(e);
	getdata();
	return true;
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await GetInvoices({
		index: pagecurrent.value - 1,
		size: count.value,
		PeriodMin: dates.value?.[0],
		PeriodMax: dates.value?.[1],
	});
	if (res?.isSuccess) {
		let rows: InvoiceRow[] = res.result ?? [];
		const filterState = STATE_MAP[activeName.value];
		if (filterState) {
			rows = rows.filter((r) => String(r.state ?? '').toLowerCase() === String(filterState).toLowerCase());
		}
		routeData.value = rows;
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? rows.length;
	}
	loading.value = false;
};

const onDownload = async (row: InvoiceRow) => {
	if (row.id == null) return;
	downloadingId.value = row.id;
	try {
		const blob: any = await ExportInvoices(row.id);
		const url = window.URL.createObjectURL(new Blob([blob]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `Invoice-${row.id}.pdf`);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
		ElMessage.success(t('pages.Success'));
	} catch (e) {
		ElMessage.error(t('pages.Error'));
	} finally {
		downloadingId.value = null;
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
.tabs-content {
	margin-top: 12px;
}
.filter-form {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	min-height: 60px;
}
.filter-form :deep(.el-form-item) {
	margin-right: 8px;
	margin-bottom: 0;
}
.date-picker {
	width: 100%;
	max-width: 320px;
	min-width: 0;
	margin-right: 28px;
}
.date-picker :deep(.el-date-editor) {
	width: 100%;
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
	.date-picker {
		width: 100%;
	}
}
</style>
