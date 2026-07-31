<template>
	<div class="sackmft-list">
		<el-card shadow="never" class="filter-card">
			<div class="tabs-header">
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
					<el-tab-pane :label="t('pages.MawbMbl')" name="tracking" />
				</el-tabs>
			</div>

			<div class="tabs-content">
				<template v-if="activeName === '0'">
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
						<div class="stage-picker">
							<el-select v-model="startStage" class="stage-select">
								<el-option
									v-for="opt in startOptions"
									:key="opt.value"
									:label="opt.label"
									:value="opt.value"
								/>
							</el-select>
							<span class="stage-sep">~</span>
							<el-select v-model="endStage" class="stage-select">
								<el-option
									v-for="opt in endOptions"
									:key="opt.value"
									:label="opt.label"
									:value="opt.value"
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
				</template>
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
			<div class="op-row">
				<div class="op-row-left">
					<el-tooltip :content="t('pages.upload')" placement="top" :enterable="false">
						<el-button type="info" class="upload" @click="uploadVisible = true">
							<el-icon><Upload /></el-icon>
						</el-button>
					</el-tooltip>
				</div>
				<el-pagination
					v-show="routeData.length"
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
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
			>
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span class="id-text">
							<el-icon><InfoFilled /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					property="brokerAlias"
					:label="t('pages.SackMfts.brokerAlias')"
					min-width="150"
				/>
				<el-table-column
					property="clrMethodID"
					:label="t('pages.SackMfts.clrMethod')"
					min-width="150"
				/>
				<el-table-column
					property="mawbNbr"
					:label="t('pages.MawbMbl')"
					width="150"
				/>
				<el-table-column
					property="flightNbr"
					:label="t('pages.FlightVessel')"
					width="150"
				/>
				<el-table-column property="poa" :label="t('pages.POA')" width="150" />
				<el-table-column
					property="stageText"
					:label="t('pages.Stage')"
					width="150"
				>
					<template #default="scope">
						<span>
							<el-icon><List /></el-icon>
							{{ scope.row.stage }}
						</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.PostedOn')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.postedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action')" width="380" align="left" fixed="right">
					<template #default="scope">
						<div class="action-cell">
							<el-button
								type="info"
								size="small"
								@click="downloads(scope.row.id)"
							>
								{{ t('pages.SackMfts.download') }}
							</el-button>
							<el-button
								type="primary"
								size="small"
								@click="openScanForm(scope.row.id)"
							>
								{{ t('pages.SackMfts.SCANFORM') }}
							</el-button>
							<el-button
								v-for="code in scope.row.roledActions"
								:key="code"
								:type="actionType(code)"
								size="small"
								@click="handleRoledAction()"
							>
								{{ actionTitle(code) }}
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

		<SackMftUpload v-model="uploadVisible" @success="getdata" />
		<ScanFormDialog v-model="scanFormVisible" :id="scanFormId" @success="downloads" />
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import {
	Upload,
	Search,
	Refresh,
	InfoFilled,
	List,
} from '@element-plus/icons-vue';
import moment from 'moment';
import {
	sackMftlist,
	sackMftsign,
	getSackMftdashtab,
} from '@/api/sackMft';
import { parcelstage } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import { getoriginurl } from '@/utils/originurl';
import SackMftUpload from './components/SackMftUpload.vue';
import ScanFormDialog from './components/ScanFormDialog.vue';

const { t } = useI18n();

interface SackMftRow extends Record<string, any> {
	id: string | number;
	brokerAlias?: string;
	clrMethodID?: string | number;
	mawbNbr?: string;
	flightNbr?: string;
	poa?: string;
	stageText?: string;
	postedStamp?: { utcTime: string };
	roledActions?: number[];
}

const activeName = ref('0');
const tablist = ref<Array<{ stage: number | string; label: string; count: number }>>([]);
const dates = ref<[string, string] | null>(null);
const startStage = ref(0);
const endStage = ref(0);
const startOptions = ref<Array<{ value: number | string; label: string }>>([
	{ value: 0, label: t('pages.fromstage') },
]);
const endOptions = ref<Array<{ value: number | string; label: string }>>([
	{ value: 0, label: t('pages.tostage') },
]);
const textarea = ref('');
const routeData = ref<SackMftRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const uploadVisible = ref(false);
const scanFormVisible = ref(false);
const scanFormId = ref<string | number>('');

const stageObj: Record<string, string> = {
	SackMftCreated: t('pages.SackMfts.SackMftCreated'),
	Outgated: t('pages.SackMfts.Outgated'),
	AwaitingPickup: t('pages.SackMfts.AwaitingPickup'),
};

const formatPosted = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const toUtcIso = (date: string | undefined) => {
	if (!date) return undefined;
	return moment(date).utc().format();
};

const defaultRange = (): [string, string] => [
	moment().subtract(14, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const init = () => {
	dates.value = null;
	startStage.value = 0;
	endStage.value = 0;
	textarea.value = '';
};

const onReset = () => {
	init();
	dates.value = defaultRange();
	pagecurrent.value = 1;
	onSearch();
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const beforeLeave = (e: string | number) => {
	init();
	if (e === 'tracking') {
		routeData.value = [];
		activeName.value = 'tracking';
		return true;
	}
	activeName.value = String(e);
	if (Number(e) !== 0) {
		getdata();
	} else {
		dates.value = defaultRange();
		getdata();
	}
	return true;
};

const getdata = async () => {
	loading.value = true;
	const isTracking = activeName.value === 'tracking';
	const currentStage = isTracking ? 0 : Number(activeName.value) || 0;
	const encodedTracking = isTracking ? encodeURIComponent(textarea.value) : undefined;

	const res: ApiResponse<any> = await sackMftlist({
		index: pagecurrent.value - 1,
		size: count.value,
		Stage: currentStage,
		StageMin: startStage.value || undefined,
		StageMax: endStage.value || undefined,
		PeriodMin: !isTracking ? toUtcIso(dates.value?.[0]) : undefined,
		PeriodMax: !isTracking ? toUtcIso(dates.value?.[1]) : undefined,
		// MAWB 搜索仅在 tracking 页签生效，IsUseTrackingNbr 同时充当开关与取值
		IsUseTrackingNbr: encodedTracking,
	} as any);
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const tabs = async () => {
	const res: ApiResponse<any[]> = await getSackMftdashtab();
	if (res?.isSuccess && Array.isArray(res.result)) {
		tablist.value = res.result.map((item: any) => ({
			stage: item.stage ?? item.id ?? 0,
			label: stageObj[item.stage] ?? item.label ?? item.stage ?? '',
			count: item.count ?? 0,
		}));
	}
};

const stages = async () => {
	const res: ApiResponse<any[]> = await parcelstage();
	if (res?.isSuccess && Array.isArray(res.result)) {
		const mapped = res.result.map((item: any) => ({
			value: item.value ?? item.stage ?? item.id,
			label: item.text ?? item.label ?? String(item.value ?? ''),
		}));
		startOptions.value = [{ value: 0, label: t('pages.fromstage') }, ...mapped];
		endOptions.value = [{ value: 0, label: t('pages.tostage') }, ...mapped];
	}
};

const downloads = async (id: string | number) => {
	const url = `${getoriginurl()}/api/SackMfts/${id}/docs`;
	try {
		const res: any = await sackMftsign({ url });
		if (res?.token) {
			window.open(`${url}?token=${res.token}`, '_blank');
		} else {
			ElMessage.error(t('pages.Failed'));
		}
	} catch {
		ElMessage.error(t('pages.Failed'));
	}
};

const openScanForm = (id: string | number) => {
	scanFormId.value = id;
	scanFormVisible.value = true;
};

const actionTitle = (code: number | string) => {
	const map: Record<number | string, string> = {
		31100: t('pages.SackMfts.Board'),
		27100: t('pages.SackMfts.CfmOutgated'),
		31300: t('pages.SackMfts.CfmFlightDeparted'),
		31400: t('pages.SackMfts.CfmFlightArrived'),
		31900: t('pages.SackMfts.CfmPickup'),
	};
	return map[code] ?? String(code);
};

const actionType = (code: number | string) => {
	const map: Record<number | string, string> = {
		31100: 'success',
		27100: 'info',
		31300: 'danger',
		31400: 'warning',
		31900: 'primary',
	};
	return map[code] ?? 'primary';
};

const handleRoledAction = () => {
	// shippingspa 侧这些角色动作均未开发，统一给出同样的提示
	ElMessage.error(t('pages.SackMfts.Error'));
};

watch([count, pagecurrent], () => {
	getdata();
});

onMounted(() => {
	dates.value = defaultRange();
	tabs();
	stages();
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
.tabs-header {
	display: flex;
	align-items: flex-start;
	gap: 12px;
}
.tabs-header :deep(.el-tabs) {
	flex: 1;
}
.tab-search {
	flex-shrink: 0;
	min-width: 0;
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
	margin-right: 20px;
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
	width: 140px;
}
.stage-sep {
	color: #909399;
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
.upload {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 33px;
	min-width: 0 !important;
	padding: 5px 4px;
	color: #fff;
	border: none;
}
.upload {
	background-color: #17a2b8;
}
.id-text {
	color: #606266;
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
.action-cell {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	justify-content: left;
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
