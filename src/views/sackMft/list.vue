<template>
	<div class="sackmft-list">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="0" />
				<el-tab-pane
					v-for="item in tablist"
					:key="item.stage"
					:name="String(item.stage)"
				>
					<template #label>
						<div>
							{{ item.label }}
							<el-badge :value="item.count" class="item" type="primary" />
						</div>
					</template>
				</el-tab-pane>
				<el-tab-pane :label="t('pages.tracking')" name="tracking" />
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
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Reset') }}
						</el-button>
					</el-form-item>
				</el-form>
				<div v-else-if="activeName === 'tracking'" class="tracking-block">
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
					<el-tooltip :content="t('pages.SackMfts.download')" placement="top" :enterable="false">
						<el-button
							type="info"
							:disabled="!selectarr.length"
							class="download"
							@click="() => download(true)"
						>
							<el-icon><Download /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip :content="t('pages.Export')" placement="top" :enterable="false">
						<el-button
							type="success"
							class="export"
							@click="sackMftexportaction"
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
				<el-table-column
					type="selection"
					width="55"
					:selectable="(row) => canAction(row)"
				/>
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span class="cyan" @click="setid(scope.row.id)">
							<el-icon><InfoFilled /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					property="brokerAlias"
					:label="t('pages.SackMfts.brokerAlias')"
					width="150"
				/>
				<el-table-column
					property="clrMethod"
					:label="t('pages.SackMfts.clrMethod')"
					width="150"
				/>
				<el-table-column min-width="180">
					<template #header>
						<span class="copy-header" @click="() => copy('lastMilerNbr')">
							{{ t('pages.lastmiler') }}
							<el-icon><DocumentCopy /></el-icon>
						</span>
					</template>
					<template #default="scope">
						{{ scope.row.lastMilerNbr }}
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.date')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.postedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Postedon')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.postedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action')" width="420" align="center" fixed="right">
					<template #default="scope">
						<div class="action-cell">
							<el-button
								v-if="scope.row.canOutgated"
								type="primary"
								size="small"
								@click="() => cfmAction('cfmOutgated', scope.row.id)"
							>
								{{ t('pages.SackMfts.CfmOutgated') }}
							</el-button>
							<el-button
								v-if="scope.row.canFlightDeparted"
								type="warning"
								size="small"
								@click="() => cfmAction('cfmFlightDeparted', scope.row.id)"
							>
								{{ t('pages.SackMfts.CfmFlightDeparted') }}
							</el-button>
							<el-button
								v-if="scope.row.canFlightArrived"
								type="success"
								size="small"
								@click="() => cfmAction('cfmFlightArrived', scope.row.id)"
							>
								{{ t('pages.SackMfts.CfmFlightArrived') }}
							</el-button>
							<el-button
								v-if="scope.row.canPickup"
								type="danger"
								size="small"
								@click="() => cfmAction('cfmPickup', scope.row.id)"
							>
								{{ t('pages.SackMfts.CfmPickup') }}
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

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download, Upload, Search, Refresh, InfoFilled, DocumentCopy } from '@element-plus/icons-vue';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { formatParagraphtext } from '@/utils/format';
import {
	sackMftlist,
	sackMftSearchlist,
	sackMftCfmOutgated,
	sackMftCfmFlightDeparted,
	sackMftCfmFlightArrived,
	sackMftCfmPickup,
	sackMftexport,
	getSackMftdashtab,
} from '@/api/sackMft';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface SackMftRow extends Record<string, any> {
	id: string | number;
	brokerAlias?: string;
	clrMethod?: string;
	lastMilerNbr?: string;
	postedStamp?: { utcTime: string };
	stageID?: number;
	canOutgated?: boolean;
	canFlightDeparted?: boolean;
	canFlightArrived?: boolean;
	canPickup?: boolean;
}

const activeName = ref('0');
const tablist = ref<Array<{ stage: number | string; label: string; count: number }>>([]);
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const routeData = ref<SackMftRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const selectarr = ref<SackMftRow[]>([]);
const multipleTableRef = ref();

const formatPosted = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const copy = (key: string) => {
	const text = formatParagraphtext(routeData.value, key);
	if (text === ' ') {
		ElMessage.warning('当前页没有可复制的数据');
		return;
	}
	try {
		navigator.clipboard.writeText(text);
		ElMessage.success('复制成功');
	} catch {
		ElMessage.error('复制失败');
	}
};

const defaultRange = (): [string, string] => [
	moment().subtract(14, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const init = () => {
	dates.value = defaultRange();
	textarea.value = '';
};

const onReset = () => {
	init();
	pagecurrent.value = 1;
	onSearch();
};

const setid = (id: string | number) => {
	ElMessage.info(`${t('pages.ID')}: ${id}`);
};

const handleSelectionChange = (rows: SackMftRow[]) => {
	selectarr.value = rows;
};

const clearselect = () => {
	multipleTableRef.value?.clearSelection();
	selectarr.value = [];
};

const canAction = (row: SackMftRow) =>
	Boolean(
		row.canOutgated ||
			row.canFlightDeparted ||
			row.canFlightArrived ||
			row.canPickup,
	);

const onSearch = () => {
	if (activeName.value === 'tracking') {
		postdata();
	} else {
		getdata();
	}
};

const beforeLeave = (e: string | number) => {
	init();
	if (e === 'tracking') {
		routeData.value = [];
		return true;
	}
	getdata();
	return true;
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await sackMftlist({
		index: pagecurrent.value - 1,
		size: count.value,
		Stage: 0,
		PeriodMin: dates.value?.[0],
		PeriodMax: dates.value?.[1],
	} as any);
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const postdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await sackMftSearchlist({
		pageIndex: pagecurrent.value - 1,
		pageSize: count.value,
		trackingNbrs: textarea.value
			.split(/[\n,]+/)
			.filter((s) => s.trim() !== ''),
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const tabs = async () => {
	const res: ApiResponse<any[]> = await getSackMftdashtab();
	if (res?.isSuccess && Array.isArray(res.result)) {
		const labellist = [
			t('pages.SackMfts.SackMftCreated'),
			t('pages.SackMfts.Outgated'),
			t('pages.SackMfts.AwaitingPickup'),
		];
		tablist.value = res.result.map((item: any, idx: number) => ({
			stage: item.stage ?? item.id ?? idx,
			label: labellist[idx] ?? item.label ?? '',
			count: item.count ?? 0,
		}));
	}
};

const cfmAction = async (
	type: 'cfmOutgated' | 'cfmFlightDeparted' | 'cfmFlightArrived' | 'cfmPickup',
	id: string | number,
) => {
	const isBatch = id === undefined;
	const list = isBatch
		? selectarr.value
				.filter((r) => canAction(r))
				.map((r) => r.id)
		: [id];

	if (!list.length) {
		ElMessage.warning(t('pages.NoData'));
		return;
	}

	const confirmLabel: Record<typeof type, string> = {
		cfmOutgated: t('pages.SackMfts.CfmOutgated'),
		cfmFlightDeparted: t('pages.SackMfts.CfmFlightDeparted'),
		cfmFlightArrived: t('pages.SackMfts.CfmFlightArrived'),
		cfmPickup: t('pages.SackMfts.CfmPickup'),
	};

	ElMessageBox.confirm(
		`${confirmLabel[type]}?`,
		t('pages.attention') as string,
		{
			confirmButtonText: t('pages.Save') as string,
			cancelButtonText: t('pages.Cancel') as string,
			type: 'warning',
			center: true,
		},
	)
		.then(async () => {
			const apiMap = {
				cfmOutgated: sackMftCfmOutgated,
				cfmFlightDeparted: sackMftCfmFlightDeparted,
				cfmFlightArrived: sackMftCfmFlightArrived,
				cfmPickup: sackMftCfmPickup,
			};
			const res: ApiResponse<any> = await apiMap[type]({ ids: list });
			if (res?.isSuccess) {
				ElMessage.success(t('pages.Success'));
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		})
		.catch(() => {
			clearselect();
		});
};

const download = (isBatch: boolean) => {
	ElMessage.success(t('pages.SackMfts.download'));
	clearselect();
};

const sackMftexportaction = async () => {
	if (availcnt.value > 20000) {
		ElMessage.error('导出文件过大，调整一下查询条件');
		return;
	}
	const blob: any = await sackMftexport(
		{
			Stage: 0,
			PeriodMin: dates.value?.[0],
			PeriodMax: dates.value?.[1],
		},
		{
			trackingNbrs: textarea.value
				.split(/[\n,]+/)
				.filter((s) => s.trim() !== ''),
		},
	);
	const filename = `sackMfts_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
	saveAs(blob, filename);
	ElMessage.success(t('pages.Success'));
};

watch([count, pagecurrent], () => {
	if (activeName.value === 'tracking') {
		postdata();
	} else {
		getdata();
	}
});

onMounted(() => {
	dates.value = defaultRange();
	tabs();
	getdata();
});
</script>

<style lang="scss" scoped>
.sackmft-list {
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
.download,
.export {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 33px;
	min-width: 0 !important;
	padding: 5px 4px;
	color: #fff;
	border: none;
}
.download {
	background-color: #17a2b8;
}
.export {
	background-color: #28a745;
	padding: 5px;
}
.download:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}
.action-cell {
	display: flex;
	flex-wrap: nowrap;
	justify-content: center;
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
.copy-header {
	cursor: pointer;
	color: #606266;
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
.copy-header:hover {
	color: #409eff;
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
:deep(.el-badge__content) {
	transform: translateY(-2px);
}
@media (max-width: 768px) {
	.date-picker {
		width: 100%;
	}
	.tracking-input {
		width: 100%;
	}
}
</style>