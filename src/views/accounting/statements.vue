<template>
	<div class="statements-page">
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
			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.ID')" prop="id" width="180" />
				<el-table-column :label="t('pages.date')" width="180">
					<template #default="scope">
						<span>{{ formatDate(scope.row.talliedOn) }}</span>
					</template>
				</el-table-column>
				<el-table-column
					:label="t('pages.Reference')"
					prop="clientRefNbr"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.lastmiler')"
					prop="lastMilerNbr"
					min-width="160"
					show-overflow-tooltip
				/>
				<el-table-column :label="t('pages.svcName')" width="160">
					<template #default="scope">
						<span>{{ scope.row.svcName || scope.row.svcID }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.amount')" width="160">
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
import { Search, Refresh } from '@element-plus/icons-vue';
import moment from 'moment';
import { statementlist } from '@/api/accounting';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface StatementRow extends Record<string, any> {
	id: string | number;
	talliedOn?: string;
	clientRefNbr?: string;
	lastMilerNbr?: string;
	svcName?: string;
	svcID?: string | number;
	chargeAmt?: { value: number | string; unit?: string };
}

const dates = ref<[string, string] | null>(null);
const routeData = ref<StatementRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const formatDate = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
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
	const res: ApiResponse<any> = await statementlist({
		index: pagecurrent.value - 1,
		size: count.value,
		PeriodMin: dates.value?.[0],
		PeriodMax: dates.value?.[1],
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
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
.statements-page {
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
