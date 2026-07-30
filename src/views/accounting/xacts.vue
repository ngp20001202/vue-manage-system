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
			>
				<el-table-column :label="t('pages.ID')" prop="id" width="180" />
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
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import moment from 'moment';
import { xactslist, xactsexport, SackMftsign } from '@/api/accounting';
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

const datatoutc = (d: string | undefined) => {
	if (!d) return '';
	const m = moment.utc(d);
	return m.format('YYYY-MM-DD');
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
	const PeriodMin = dates.value ? datatoutc(dates.value[0]) : '';
	const PeriodMax = dates.value ? datatoutc(dates.value[1]) : '';
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
	const PeriodMin = dates.value ? datatoutc(dates.value[0]) : '';
	const PeriodMax = dates.value ? datatoutc(dates.value[1]) : '';
	const params: string[] = [];
	if (PeriodMin) params.push(`PeriodMin=${PeriodMin}`);
	if (PeriodMax) params.push(`PeriodMax=${PeriodMax}`);
	const url = `/api/accounting/xacts/export?` + params.join('&');
	try {
		const res: any = await SackMftsign({ url });
		if (res?.token) {
			const sep = url.includes('?') ? '&' : '?';
			window.open(`${url}${sep}token=${res.token}`, '_blank');
		} else {
			const blob: any = await xactsexport({ PeriodMin, PeriodMax });
			const blobUrl = window.URL.createObjectURL(new Blob([blob]));
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = `xacts_${moment().format('YYYYMMDDHHmmss')}.xlsx`;
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
