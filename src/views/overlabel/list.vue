<template>
	<div class="overlabel-list">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="first" />
				<el-tab-pane :label="t('pages.tracking')" name="f" />
			</el-tabs>

			<div class="tabs-content">
				<div v-if="activeName !== 'f'" class="filter-row">
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
					<div class="stage-picker">
						<el-select v-model="startstage" class="stage-select" placeholder="Couriers">
							<el-option
								v-for="item in courierOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
						<span class="tilde">~</span>
						<el-select v-model="endStage" class="stage-select" placeholder="Status">
							<el-option
								v-for="item in statusOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</div>
					<div class="filter-actions">
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Reset') }}
						</el-button>
					</div>
				</div>
				<div v-else class="tracking-block">
					<el-input
						v-model="textarea"
						:rows="4"
						class="tracking-input"
						type="textarea"
						:placeholder="t('pages.trackplace')"
					/>
					<div class="tracking-actions">
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Reset') }}
						</el-button>
					</div>
				</div>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div v-show="routeData.length" class="op-row">
				<div class="op-row-left">
					<el-tooltip :content="t('pages.printlabel')" placement="top" :enterable="false">
						<el-button type="primary" :disabled="!selectarr.length" class="print">
							<el-icon><Printer /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip :content="t('pages.downloadlabel')" placement="top" :enterable="false">
						<el-button type="info" :disabled="!selectarr.length" class="download">
							<el-icon><Download /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip :content="t('pages.cancelparcel')" placement="top" :enterable="false">
						<el-button type="danger" :disabled="!selectarr.length" class="cancell">
							<el-icon><Delete /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip content="导入换单" placement="top" :enterable="false">
						<el-button
							type="success"
							class="import"
							@click="$router.push('/Overlabel/Import')"
						>
							<el-icon><Upload /></el-icon>
						</el-button>
					</el-tooltip>
				</div>
				<el-pagination
					class="op-row-pager"
					background
					layout="total, prev, pager, next, sizes"
					:total="availcnt"
					:current-page="pagecurrent"
					:page-size="count"
					:page-sizes="[10, 20, 50, 100]"
					@current-change="(p: number) => (pagecurrent = p)"
					@size-change="(s: number) => (count = s)"
				/>
			</div>

			<el-table
				ref="multipleTableRef"
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
				@selection-change="handleSelectionChange"
			>
				<el-table-column type="selection" width="55" />
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span class="cyan">
							<el-icon><InfoFilled /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					property="clientRefNbr"
					:label="t('pages.courier')"
					min-width="150"
				/>
				<el-table-column
					property="lastMilerNbr"
					:label="t('pages.tenantalias')"
					min-width="150"
				/>
				<el-table-column
					property="svcName"
					:label="t('pages.Stage')"
					min-width="150"
				/>
				<el-table-column
					property="stageText"
					:label="t('pages.Parcels.list.lastmiler')"
					min-width="120"
				/>
				<el-table-column :label="t('pages.Supplement')" width="160">
					<template #default="scope">
						<span>{{ formatStamp(scope.row.statedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="`${t('pages.PostedOn')} (UTC)`" width="180">
					<template #default="scope">
						<span>{{ formatStamp(scope.row.statedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action')" width="280" align="left" fixed="right">
					<template #default="scope">
						<div class="action-cell">
							<el-button type="danger" size="small" :icon="Delete">
								{{ t('pages.cancelparcel') }}
							</el-button>
							<a
								target="_blank"
								:href="`/api1/download/parcels/${scope.row.id}/labels`"
							>
								<el-button type="info" size="small" :icon="Download">
									{{ t('pages.downloadlabel') }}
								</el-button>
							</a>
							<el-button type="primary" size="small" :icon="Printer">
								{{ t('pages.printlabel') }}
							</el-button>
						</div>
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

<script setup lang="ts" name="overlabel-list">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	Search,
	Refresh,
	Upload,
	Printer,
	Download,
	Delete,
	InfoFilled,
} from '@element-plus/icons-vue';
import moment from 'moment';
import { overlabellist } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface OverlabelRow extends Record<string, any> {
	id: string | number;
	clientRefNbr?: string;
	lastMilerNbr?: string;
	svcName?: string;
	stageText?: string;
	statedStamp?: { utcTime: string };
}

const activeName = ref('first');
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const startstage = ref<string | number>(0);
const endStage = ref<string | number>(0);
const routeData = ref<OverlabelRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const selectarr = ref<OverlabelRow[]>([]);
const multipleTableRef = ref();

const courierOptions = ref<Array<{ value: string | number; label: string }>>([
	{ value: 0, label: 'Couriers' },
	{ value: 9001, label: 'FedEx' },
	{ value: 9002, label: 'Usps' },
	{ value: '9006', label: 'FedEx_Express' },
	{ value: 9007, label: 'FedEx_2Day' },
	{ value: 9008, label: 'FedEx_SmartPostOnline' },
	{ value: 9009, label: 'FedEx_GroundMtw' },
	{ value: 9017, label: 'OnePizza' },
	{ value: 9019, label: 'IB' },
	{ value: 9020, label: 'Zda' },
	{ value: 9021, label: 'DHL' },
	{ value: 9022, label: 'Huodaios' },
	{ value: 9023, label: 'Shiphubx' },
	{ value: 9024, label: 'Zda_CP' },
	{ value: 9025, label: 'Zda_GDE' },
	{ value: 9026, label: 'K5' },
	{ value: 9027, label: 'Hualei' },
	{ value: 9028, label: 'Zda_TD' },
	{ value: 9030, label: 'UPS' },
	{ value: 9032, label: 'RuiYun' },
	{ value: 9033, label: 'UPS_MI' },
	{ value: 9034, label: 'UPS_2Day_NoZone' },
	{ value: 9035, label: 'UPS_3Day_NoZone' },
	{ value: 9036, label: 'UPS_Ground_NoZone' },
	{ value: 9101, label: 'Yunda' },
	{ value: 9102, label: 'YEtk' },
	{ value: 9103, label: 'FourPx' },
	{ value: 9900, label: 'Suishouji' },
]);

const statusOptions = ref<Array<{ value: number; label: string }>>([
	{ value: 0, label: 'Status' },
	{ value: 1, label: 'Pending' },
	{ value: 2, label: 'Success' },
	{ value: 3, label: 'Fail' },
]);

const formatStamp = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const defaultRange = (): [string, string] => [
	moment().subtract(14, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const init = () => {
	dates.value = defaultRange();
	startstage.value = 0;
	endStage.value = 0;
	textarea.value = '';
};

const onReset = () => {
	init();
	pagecurrent.value = 1;
	onSearch();
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const handleSelectionChange = (rows: OverlabelRow[]) => {
	selectarr.value = rows;
};

const beforeLeave = (e: string | number) => {
	init();
	if (e === 'f') {
		routeData.value = [];
		return true;
	}
	getdata();
	return true;
};

const getdata = async () => {
	loading.value = true;
	const isTracking = activeName.value === 'f';
	// 运单号搜索时不带日期范围（与 shippingspa 一致：切到 tracking 页签会清空 dates）
	const res: ApiResponse<any> = await overlabellist({
		index: pagecurrent.value - 1,
		size: count.value,
		StageMin: startstage.value as number,
		StageMax: endStage.value as number,
		PeriodMin: !isTracking ? dates.value?.[0] : undefined,
		PeriodMax: !isTracking ? dates.value?.[1] : undefined,
		IsUseTrackingNbr: isTracking ? encodeURIComponent(textarea.value) : '',
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
	init();
	getdata();
});
</script>

<style lang="scss" scoped>
.overlabel-list {
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
	gap: 12px;
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
.stage-picker {
	display: flex;
	align-items: center;
	gap: 8px;
}
.stage-select {
	width: 180px;
}
.tilde {
	color: #909399;
	font-weight: 500;
}
.tracking-input {
	width: 70%;
	max-width: 720px;
}
.tracking-block {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.tracking-actions,
.filter-actions {
	display: flex;
	gap: 8px;
	align-items: center;
}
.op-row {
	display: flex;
	gap: 12px;
	align-items: center;
	margin-bottom: 12px;
	flex-wrap: wrap;
	justify-content: space-between;
}
.op-row-left {
	display: flex;
	gap: 8px;
	align-items: center;
}
.op-row-pager {
	flex-shrink: 0;
}
.op-row-pager :deep(.el-pagination__sizes) {
	margin-right: 0;
}
.print,
.download,
.cancell,
.import {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 33px;
	min-width: 0 !important;
	padding: 5px 4px;
	color: #fff;
	border: none;
}
.print {
	background-color: #409eff;
}
.download {
	background-color: #28a745;
}
.cancell {
	background-color: #dc3545;
}
.import {
	background-color: #28a745;
	padding: 5px;
}
.print:disabled,
.download:disabled,
.cancell:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}
.action-cell {
	display: flex;
	flex-wrap: nowrap;
	justify-content: left;
	align-items: center;
	gap: 4px;
	padding: 0;
}
.action-cell :deep(.el-button.is-small) {
	padding: 3px 6px;
	font-size: 12px;
}
.action-cell :deep(.el-button.is-small .el-icon) {
	font-size: 12px;
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
	.stage-select,
	.tracking-input {
		width: 100%;
	}
	.stage-picker {
		width: 100%;
	}
}
</style>