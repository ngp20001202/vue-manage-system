<template>
	<div class="parcel-cancel">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="0" />
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
					<el-tooltip :content="t('pages.undo')" placement="top" :enterable="false">
						<el-button
							type="danger"
							:disabled="!selectarr.length"
							class="cancell"
							@click="() => undo(true)"
						>
							<el-icon><RefreshLeft /></el-icon>
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
					:selectable="(row) => show(row)"
				/>
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span class="cyan" @click="() => setid('detail', scope.row.id)">
							<el-icon><InfoFilled /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column min-width="150">
					<template #header>
						<span class="copy-header" @click="() => copy('clientRefNbr')">
							{{ t('pages.Parcels.list.order') }}
							<el-icon><DocumentCopy /></el-icon>
						</span>
					</template>
					<template #default="scope">
						{{ scope.row.clientRefNbr }}
					</template>
				</el-table-column>
				<el-table-column min-width="150">
					<template #header>
						<span class="copy-header" @click="() => copy('lastMilerNbr')">
							{{ t('pages.Parcels.list.lastmiler') }}
							<el-icon><DocumentCopy /></el-icon>
						</span>
					</template>
					<template #default="scope">
						{{ scope.row.lastMilerNbr }}
					</template>
				</el-table-column>
				<el-table-column
					property="svcName"
					:label="t('pages.servertype')"
					width="150"
				/>
				<el-table-column :label="t('pages.Stage')" width="150">
					<template #default="scope">
						<span class="cyan" @click="() => setid('tracking', scope.row.id)">
							<el-icon><List /></el-icon>
							{{ scope.row.stageText }}
						</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.PostedOn')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.postedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action')" width="200" align="left" fixed="right">
					<template #default="scope">
						<div class="action-cell">
							<el-button
								v-if="show(scope.row)"
								type="warning"
								size="small"
								:icon="RefreshLeft"
								@click="() => undo(false, scope.row.id)"
							>
								{{ t('pages.undo') }}
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
		<ParcelTracking :id="trackingDialog.id" @changestatus="changestatus" />
		<ParcelDownload
			:ids="parcelDownload.ids"
			@changestatus="changestatus"
			@clearselect="clearselect"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { RefreshLeft, Search, Refresh, InfoFilled, DocumentCopy, List } from '@element-plus/icons-vue';
import moment from 'moment';
import { formatParagraphtext, datatoutc } from '@/utils/format';
import { parcellist, parcelSearchlist, parcelUndo } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import ParcelDetail from './detail.vue';
import ParcelTracking from './tracking.vue';
import ParcelDownload from './download.vue';

const { t } = useI18n();

interface ParcelRow extends Record<string, any> {
	id: string | number;
	clientRefNbr?: string;
	lastMilerNbr?: string;
	svcName?: string;
	stageText?: string;
	postedStamp?: { utcTime: string };
}

const activeName = ref('0');
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const routeData = ref<ParcelRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const selectarr = ref<ParcelRow[]>([]);
const multipleTableRef = ref();

const parcelDetail = reactive({ id: '' });
const parcelDownload = reactive<{ ids: Array<string | number> }>({ ids: [] });
const trackingDialog = reactive({ id: '' });

const formatPosted = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const show = (row: ParcelRow) =>
	row.stageText === '订单已取消' || row.stageText === 'Parcel Voided';

const copy = (key: string) => {
	const text = formatParagraphtext(routeData.value, key);
	if (text === ' ') {
		ElMessage.warning(t('pages.noCopyData'));
		return;
	}
	try {
		navigator.clipboard.writeText(text);
		ElMessage.success(t('pages.copySuccess'));
	} catch {
		ElMessage.error(t('pages.copyFailed'));
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

const setid = (name: 'detail' | 'tracking', id: string | number) => {
	if (name === 'detail') {
		parcelDetail.id = String(id);
	} else {
		trackingDialog.id = String(id);
	}
};

const handleSelectionChange = (rows: ParcelRow[]) => {
	selectarr.value = rows;
};

const clearselect = () => {
	multipleTableRef.value?.clearSelection();
	selectarr.value = [];
};

const changestatus = () => {
	parcelDetail.id = '';
	trackingDialog.id = '';
	parcelDownload.ids = [];
};

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
	const isTracking = activeName.value === 'tracking';
	// 运单号搜索时不带日期范围（与 shippingspa 一致：切到 tracking 页签会清空 dates）
	const res: ApiResponse<any> = await parcellist({
		index: pagecurrent.value - 1,
		size: count.value,
		StageMin: 10005,
		StageMax: 10005,
		PeriodMin: !isTracking ? datatoutc(dates.value?.[0]) : undefined,
		PeriodMax: !isTracking ? datatoutc(dates.value?.[1]) : undefined,
		IsUseTrackingNbr: isTracking ? encodeURIComponent(textarea.value) : undefined,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const postdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await parcelSearchlist({
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

const undo = async (isBatch: boolean, id?: string | number) => {
	const list = isBatch
		? selectarr.value.map((r) => r.id)
		: [id as string | number];
	ElMessageBox.confirm(
		t('pages.undoWarning'),
		t('pages.undoConfirm'),
		{
			confirmButtonText: t('pages.undoConfirmBtn'),
			cancelButtonText: t('pages.Cancel'),
			type: 'warning',
			center: true,
		},
	)
		.then(async () => {
			const res: ApiResponse<any> = await parcelUndo({ ids: list });
			if (res?.isSuccess) {
				ElMessage.success(t('pages.undoSuccess'));
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		})
		.catch(() => {
			multipleTableRef.value?.clearSelection();
		});
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
	getdata();
});
</script>

<style lang="scss" scoped>
.parcel-cancel {
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
.cancell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 33px;
	min-width: 0 !important;
	padding: 5px 4px;
	color: #fff;
	border: none;
	background-color: #dc3545;
}
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
@media (max-width: 768px) {
	.date-picker {
		width: 100%;
	}
	.tracking-input {
		width: 100%;
	}
}
</style>
