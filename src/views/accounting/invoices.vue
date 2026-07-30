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
				<el-table-column
					:label="t('pages.tenantalias')"
					prop="tenantAlias"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column :label="t('pages.Invoice.period')" min-width="200">
					<template #default="scope">
						<span>{{ formatPeriod(scope.row) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Invoice.billamount')" width="180">
					<template #default="scope">
						<span>{{ formatAmount(scope.row.billAmount) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Invoice.status')" width="120">
					<template #default="scope">
						<el-tag v-if="isPaid(scope.row)" type="success">{{ t('pages.Invoice.paid') }}</el-tag>
						<el-tag v-else-if="isUnpaid(scope.row)" type="danger">{{ t('pages.Invoice.unpaid') }}</el-tag>
						<span v-else>{{ getStatusText(scope.row) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Invoice.Action')" width="180" fixed="right">
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
						<el-button
							v-if="isUnpaid(scope.row)"
							type="primary"
							link
							:loading="payingId === scope.row.id"
							@click="() => onPay(scope.row)"
						>
							{{ t('pages.Invoice.pay') }}
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
import {
	GetInvoices,
	ExportBillingStatement,
	Paymentsdata,
	CashierPayments,
	SackMftsign,
} from '@/api/accounting';
import { formartenglishcurrency } from '@/utils/format';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface AmountValue {
	value?: number | string;
	unit?: string;
}

interface InvoiceRow extends Record<string, any> {
	id: string | number;
	tenantAlias?: string;
	period?: string;
	periodStart?: string;
	periodEnd?: string;
	billAmount?: number | string | AmountValue;
	status?: string | number;
	state?: string | number;
	currencyText?: string;
}

const activeName = ref('all');
const dates = ref<[string, string] | null>(null);
const routeData = ref<InvoiceRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const downloadingId = ref<string | number | null>(null);
const payingId = ref<string | number | null>(null);

const STATUS_MAP: Record<string, string> = {
	all: '',
	paid: 'Paid',
	unpaid: 'Unpaid',
};

const toUtcIso = (date: string | undefined) => {
	if (!date) return '';
	return moment(date).utc().format();
};

const formatDate = (utc: string | undefined) => {
	if (!utc) return '-';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const formatPeriod = (row: InvoiceRow) => {
	if (row.period) return row.period;
	if (row.periodStart || row.periodEnd) {
		return `${formatDate(row.periodStart)} ~ ${formatDate(row.periodEnd)}`;
	}
	return '-';
};

const formatAmount = (v: number | string | AmountValue | undefined) => {
	if (v == null) return '-';
	if (typeof v === 'object') {
		const val = v.value;
		const num = typeof val === 'number' ? val : Number(val);
		if (Number.isNaN(num)) return String(val);
		return `${num.toFixed(2)}${v.unit || ''}`;
	}
	const num = typeof v === 'number' ? v : Number(v);
	if (Number.isNaN(num)) return String(v);
	return num.toFixed(2);
};

const getRawStatus = (row: InvoiceRow) => {
	const raw = row.status ?? row.state ?? '';
	return String(raw).trim();
};

const isPaid = (row: InvoiceRow) => {
	const status = getRawStatus(row).toLowerCase();
	return status === 'paid' || status === '1' || status === 'true';
};

const isUnpaid = (row: InvoiceRow) => {
	const status = getRawStatus(row).toLowerCase();
	return status === 'unpaid' || status === '0' || status === 'false' || status === '';
};

const getStatusText = (row: InvoiceRow) => {
	const status = getRawStatus(row);
	if (!status) return t('pages.Invoice.unpaid');
	return status;
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
		PeriodMin: toUtcIso(dates.value?.[0]),
		PeriodMax: toUtcIso(dates.value?.[1]),
		Status: STATUS_MAP[activeName.value],
	});
	if (res?.isSuccess) {
		let rows: InvoiceRow[] = res.result ?? [];
		const filterState = STATUS_MAP[activeName.value];
		if (filterState) {
			rows = rows.filter(
				(r) => String(r.status ?? r.state ?? '').toLowerCase() === filterState.toLowerCase(),
			);
		}
		routeData.value = rows;
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? rows.length;
	}
	loading.value = false;
};

const extractBaseUrl = (url: string) => (url.includes('?') ? url.split('?')[0] : url);

const onPay = async (row: InvoiceRow) => {
	if (row.id == null) return;
	const amount = typeof row.billAmount === 'object' ? row.billAmount : { value: Number(row.billAmount), unit: '' };
	if (!amount.value || Number.isNaN(Number(amount.value))) {
		ElMessage.warning(t('pages.Invoice.billamount'));
		return;
	}
	payingId.value = row.id;
	try {
		const unit = amount.unit || formartenglishcurrency(row.currencyText || '');
		const paymentRes: any = await Paymentsdata({
			amount: {
				value: Number(amount.value),
				unit,
			},
			billingStatementID: row.id,
		});
		if (!paymentRes?.isSuccess || !paymentRes.result?.paymentID) {
			ElMessage.error(paymentRes?.message || t('pages.Failed'));
			return;
		}
		const orderRes: any = await CashierPayments({
			subject: `Invoice ${row.id}`,
			returnUrl: extractBaseUrl(location.href),
			amount: {
				value: Number(amount.value),
				unit,
			},
			orderId: paymentRes.result.paymentID,
			refInfo: '',
		});
		if (orderRes?.id) {
			const link = orderRes.links?.find((x: any) => x.rel === 'Checkout');
			if (link?.href) {
				window.open(link.href, '_blank');
			} else {
				ElMessage.error(t('pages.Error'));
			}
		} else {
			ElMessage.error(orderRes?.message || t('pages.Error'));
		}
	} catch {
		ElMessage.error(t('pages.Error'));
	} finally {
		payingId.value = null;
	}
};

const onDownload = async (row: InvoiceRow) => {
	if (row.id == null) return;
	downloadingId.value = row.id;
	try {
		const apiBase = (import.meta.env.VITE_APP_BASE as string) || '/api1';
		const url = new URL(`${window.location.origin}${apiBase}/api/BillingStatements/${row.id}/export`);
		const res: any = await SackMftsign({ url: url.toString() });
		if (res?.token) {
			url.searchParams.set('token', res.token);
			window.open(url.toString(), '_blank');
		} else {
			const blob: any = await ExportBillingStatement(row.id);
			const blobUrl = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement('a');
			link.href = blobUrl;
			link.setAttribute('download', `BillingStatement-${row.id}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(blobUrl);
		}
		ElMessage.success(t('pages.Success'));
	} catch {
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
		margin-right: 0;
	}
}
</style>
