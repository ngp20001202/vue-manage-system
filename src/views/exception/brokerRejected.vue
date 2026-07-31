<template>
	<div class="broker-rejected">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="0" />
				<el-tab-pane :label="t('pages.MawbMbl')" name="mawb" />
			</el-tabs>

			<div class="tabs-content">
				<el-form v-if="activeName === '0'" :inline="true" class="filter-form">
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
						<el-select v-model="startstage" class="stage-select" :placeholder="t('pages.fromstage')">
							<el-option
								v-for="item in startsoptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
					<span class="tilde">~</span>
					<el-form-item>
						<el-select v-model="endStage" class="stage-select" :placeholder="t('pages.tostage')">
							<el-option
								v-for="item in endoptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Reset') }}
						</el-button>
					</el-form-item>
				</el-form>
				<div v-else-if="activeName === 'mawb'" class="tracking-block">
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
					<el-tooltip :content="t('pages.Import')" placement="top" :enterable="false">
						<el-button
							type="primary"
							class="import"
							@click="() => $router.push('/Exceptions/BrokerRejected/Import')"
						>
							<el-icon><Upload /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip :content="t('pages.printlabel')" placement="top" :enterable="false">
						<el-button
							type="info"
							:disabled="!selectarr.length"
							class="print"
							@click="() => printLabels(true)"
						>
							<el-icon><Printer /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip :content="t('pages.downloadlabel')" placement="top" :enterable="false">
						<el-button
							type="info"
							:disabled="!selectarr.length"
							class="download"
							@click="() => downloadLabels(true)"
						>
							<el-icon><Download /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip :content="t('pages.cancelparcel')" placement="top" :enterable="false">
						<el-button
							type="danger"
							:disabled="!selectarr.length"
							class="cancell"
							@click="() => cancel(true)"
						>
							<el-icon><Delete /></el-icon>
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
				<el-table-column :label="t('pages.ID')" width="120">
					<template #default="scope">
						<span class="cyan" @click="() => setid('detail', scope.row.id)">
							<el-icon><InfoFilled /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					property="clientRefNbr"
					:label="t('pages.PosterAlias')"
					min-width="150"
				/>
				<el-table-column
					property="lastMilerNbr"
					:label="t('pages.Broker')"
					min-width="150"
				/>
				<el-table-column
					property="svcName"
					:label="t('pages.MawbMbl')"
					min-width="150"
				/>
				<el-table-column
					property="stageText"
					:label="t('pages.POA')"
					width="150"
				/>
				<el-table-column :label="t('pages.Stage')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.statedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.PostedOn')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.statedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action')" width="280" align="left" fixed="right">
					<template #default="scope">
						<div class="action-cell">
							<el-button
								type="danger"
								size="small"
								:icon="Delete"
								@click="() => cancel(false, scope.row.id)"
							>
								{{ t('pages.cancelparcel') }}
							</el-button>
							<el-button
								type="info"
								size="small"
								:icon="Download"
								@click="() => downloadLabels(false, scope.row.id)"
							>
								{{ t('pages.downloadlabel') }}
							</el-button>
							<el-button
								type="primary"
								size="small"
								:icon="Printer"
								@click="() => printLabels(false, scope.row.id)"
							>
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

		<ParcelDetail :id="parcelDetail.id" @changestatus="changestatus" />
	</div>
</template>

<script setup lang="ts" name="broker-rejected">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
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
import { brokerRejectedlist } from '@/api/rejection';
import { parcelcancel, downloadlabel } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import ParcelDetail from '@/views/parcel/detail.vue';

const { t } = useI18n();

interface BrokerRow extends Record<string, any> {
	id: string | number;
	clientRefNbr?: string;
	lastMilerNbr?: string;
	svcName?: string;
	stageText?: string;
	statedStamp?: { utcTime: string };
}

const activeName = ref('0');
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const startstage = ref<number>(0);
const endStage = ref<number>(0);
const routeData = ref<BrokerRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const selectarr = ref<BrokerRow[]>([]);
const multipleTableRef = ref();

const parcelDetail = reactive({ id: '' });

const STAGE_OPTIONS = [
	{ value: 27150, label: 'pages.BrokerRejection.AwaitingPickup' },
	{ value: 31600, label: 'pages.BrokerRejection.BoundingWarehouseAccepted' },
	{ value: 27100, label: 'pages.BrokerRejection.BoundingWarehousePickedup' },
	{ value: 31100, label: 'pages.BrokerRejection.ExportDeclared' },
	{ value: 31510, label: 'pages.BrokerRejection.Outgated' },
	{ value: 21500, label: 'pages.BrokerRejection.SackManifestArrived' },
	{ value: 31500, label: 'pages.BrokerRejection.SackManifestBoaarded' },
	{ value: 31508, label: 'pages.BrokerRejection.SackManifestCreated' },
	{ value: 31505, label: 'pages.BrokerRejection.Surrendered' },
];

const startsoptions = computed(() => [
	{ value: 0, label: t('pages.fromstage') },
	...STAGE_OPTIONS.map((item) => ({ value: item.value, label: t(item.label) })),
]);

const endoptions = computed(() => [
	{ value: 0, label: t('pages.tostage') },
	...STAGE_OPTIONS.map((item) => ({ value: item.value, label: t(item.label) })),
]);

const formatPosted = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const defaultRange = (): [string, string] => [
	moment().subtract(14, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const init = () => {
	dates.value = defaultRange();
	textarea.value = '';
	startstage.value = 0;
	endStage.value = 0;
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

const setid = (_name: 'detail', id: string | number) => {
	parcelDetail.id = String(id);
};

const handleSelectionChange = (rows: BrokerRow[]) => {
	selectarr.value = rows;
};

const changestatus = () => {
	parcelDetail.id = '';
};

const beforeLeave = (e: string | number) => {
	init();
	if (e === 'mawb') {
		routeData.value = [];
		return true;
	}
	getdata();
	return true;
};

const getdata = async () => {
	loading.value = true;
	const isMawb = activeName.value === 'mawb';
	// MAWB 搜索时不带日期范围（与 shippingspa 一致：切到 mawb 页签会清空 dates）
	const res: ApiResponse<any> = await brokerRejectedlist({
		index: pagecurrent.value - 1,
		size: count.value,
		StageMin: startstage.value || undefined,
		StageMax: endStage.value || undefined,
		PeriodMin: !isMawb ? dates.value?.[0] : undefined,
		PeriodMax: !isMawb ? dates.value?.[1] : undefined,
		MawbNbr: isMawb ? encodeURIComponent(textarea.value) : undefined,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const cancel = async (isBatch: boolean, id?: string | number) => {
	const list = isBatch
		? selectarr.value.map((r) => r.id)
		: [id as string | number];
	ElMessageBox.confirm(
		'取消后无法撤销该包裹',
		'确认取消该包裹?',
		{
			confirmButtonText: '确认取消',
			cancelButtonText: t('pages.Cancel'),
			type: 'warning',
			center: true,
		},
	)
		.then(async () => {
			const res: ApiResponse<any> = await parcelcancel({ ids: list as string[] });
			if (res?.isSuccess) {
				ElMessage.success('取消成功');
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		})
		.catch(() => {
			multipleTableRef.value?.clearSelection();
		});
};

const getLabelUrl = async (id: string | number): Promise<string | null> => {
	const res: ApiResponse<any> = await downloadlabel(String(id));
	return res?.result || null;
};

const downloadLabels = async (isBatch: boolean, id?: string | number) => {
	const ids = isBatch
		? selectarr.value.map((r) => r.id)
		: [id as string | number];
	for (const item of ids) {
		const url = await getLabelUrl(item);
		if (url) {
			const a = document.createElement('a');
			a.target = '_blank';
			a.href = url;
			a.click();
		}
	}
};

const printLabels = async (isBatch: boolean, id?: string | number) => {
	const ids = isBatch
		? selectarr.value.map((r) => r.id)
		: [id as string | number];
	for (const item of ids) {
		const url = await getLabelUrl(item);
		if (url) {
			const win = window.open(url, '_blank');
			win?.print();
		}
	}
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
.broker-rejected {
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
.stage-select {
	width: 180px;
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
.tracking-input {
	width: 70%;
	max-width: 720px;
}
.tracking-block {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.tracking-actions {
	display: flex;
	gap: 8px;
	align-items: center;
}
.tilde {
	color: #909399;
	font-weight: 500;
	margin-right: 8px;
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
.import,
.print,
.download,
.cancell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 33px;
	min-width: 0 !important;
	padding: 5px 4px;
	color: #fff;
	border: none;
}
.import {
	background-color: #409eff;
}
.print {
	background-color: #17a2b8;
}
.download {
	background-color: #28a745;
}
.cancell {
	background-color: #dc3545;
}
.import:disabled,
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
	.stage-select {
		width: 100%;
	}
	.tracking-input {
		width: 100%;
	}
}
</style>
