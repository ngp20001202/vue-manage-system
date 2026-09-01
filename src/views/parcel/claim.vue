<template>
	<div class="parcel-claim">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="0" />
				<el-tab-pane
					:label="t('pages.ClaimList.claimCreated')"
					name="Pending"
				/>
				<el-tab-pane
					:label="t('pages.ClaimList.claimUnderReview')"
					name="Processing"
				/>
				<el-tab-pane
					:label="t('pages.ClaimList.claimSucceeded')"
					name="Approved"
				/>
				<el-tab-pane
					:label="t('pages.ClaimList.claimRejected')"
					name="Rejected"
				/>
				<el-tab-pane :label="t('pages.tracking')" name="tracking" />
			</el-tabs>

			<div class="tabs-content">
				<el-form v-if="activeName !== 'tracking'" :inline="true" class="filter-form">
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
				<div v-else class="tracking-block">
					<el-input
						v-model="textarea"
						class="tracking-input"
						:placeholder="t('pages.ClaimList.trackplace')"
					/>
					<el-button type="primary" :icon="Search" @click="onSearch">
						{{ t('pages.Search') }}
					</el-button>
					<el-button :icon="Refresh" @click="onReset">
						{{ t('pages.Reset') }}
					</el-button>
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

			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span class="cyan" @click="() => setid('detail', scope.row.id)">
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Parcels.list.lastmiler')" prop="lastMilerNbr" min-width="150" />
				<el-table-column :label="t('pages.Stage')" width="160">
					<template #default="scope">
						<el-tag :type="getClaimStateTag(scope.row.state).type" size="small">
							{{ getClaimStateTag(scope.row.state).label }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.ClaimList.claimAmount')" width="160">
					<template #default="scope">
						<span>{{ formatAmount(scope.row.claimAmount) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Reason')" min-width="200">
					<template #default="scope">
						<span>{{ scope.row.reason || '-' }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.ClaimList.claimCreatedOn')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.postedOn) }}</span>
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
		<ParcelClaimUpload v-model="uploadVisible" @success="getdata" />
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, Refresh, Upload } from '@element-plus/icons-vue';
import moment from 'moment';
import { claimlist } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import ParcelDetail from './detail.vue';
import ParcelClaimUpload from './components/ParcelClaimUpload.vue';

const { t } = useI18n();

interface ClaimRow extends Record<string, any> {
	id: string | number;
	lastMilerNbr?: string;
	state?: string | number;
	claimAmount?: { value: number | string; unit?: string };
	reason?: string;
	postedOn?: string;
	submittedOn?: string;
}

const activeName = ref('0');
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const routeData = ref<ClaimRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const parcelDetail = reactive({ id: '' });
const uploadVisible = ref(false);

// 后端返回的状态字符串可能大小写不一致，统一归一到 PascalCase 键
const CLAIM_STATE_ALIAS: Record<string, string> = {
	pending: 'Pending',
	Pending: 'Pending',
	processing: 'Processing',
	Processing: 'Processing',
	Approved: 'Approved',
	approved: 'Approved',
	Rejected: 'Rejected',
	rejected: 'Rejected',
};

const CLAIM_STATE_META: Record<string, { type: string; label: string }> = {
	Pending: { type: 'info', label: 'pages.ClaimList.claimCreated' },
	Processing: { type: 'warning', label: 'pages.ClaimList.claimUnderReview' },
	Approved: { type: 'success', label: 'pages.ClaimList.claimSucceeded' },
	Rejected: { type: 'danger', label: 'pages.ClaimList.claimRejected' },
};

const getClaimStateTag = (state: string | number | undefined) => {
	if (state == null) return { type: 'info', label: '' };
	const name = CLAIM_STATE_ALIAS[String(state)];
	const meta = name && CLAIM_STATE_META[name];
	if (meta) return { type: meta.type, label: t(meta.label) };
	return { type: 'info', label: String(state) };
};

const formatPosted = (utc: string | undefined) => {
	if (!utc) return '';
	return moment(utc).format('YYYY-MM-DD HH:mm:ss');
};

const formatAmount = (amount: ClaimRow['claimAmount']) => {
	if (!amount) return '-';
	const value = amount.value;
	const unit = amount.unit ?? '';
	return `${value} ${unit}`.trim();
};

const toUtcIso = (date: string | undefined) => {
	if (!date) return undefined;
	// Claims 后端 SQL Server 不识别带 Z 的 ISO 8601，改用 'YYYY-MM-DD HH:mm:ss'
	return moment(date).utc().format();
};

const defaultRange = (): [string, string] => [
	moment().subtract(14, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const onReset = () => {
	dates.value = defaultRange();
	textarea.value = '';
	pagecurrent.value = 1;
	onSearch();
};

const setid = (_name: string, id: string | number) => {
	parcelDetail.id = String(id);
};

const changestatus = () => {
	parcelDetail.id = '';
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const beforeLeave = (e: string | number) => {
	dates.value = defaultRange();
	textarea.value = '';
	if (e === 'tracking') {
		routeData.value = [];
		return true;
	}
	// before-leave 期间 activeName 仍是旧值，把目标页签显式传给 getdata；
	// 不能在这里手动改 activeName——el-tabs 会 watch modelValue，外部改动会
	// 让 setCurrentName 重入，导致 beforeLeave 被二次调用、getdata 被重复触发
	getdata(e);
	return true;
};

const getdata = async (tabName?: string | number) => {
	loading.value = true;
	try {
		const currentTab = tabName ?? activeName.value;
		const isTracking = currentTab === 'tracking';

		const params: Record<string, any> = {
			PageIndex: pagecurrent.value - 1,
			PageSize: count.value,
		};
		if (isTracking) {
			// 单号查询：单条 + Status=Nil + 不带日期
			params.TrackingNbr = textarea.value.trim();
			params.Status = 'Nil';
		} else {
			// 接口约定：Status = "Nil" 表示不按状态过滤
			params.Status = String(currentTab) === '0' ? 'Nil' : currentTab;
			params.PeriodMin = toUtcIso(dates.value?.[0]);
			params.PeriodMax = toUtcIso(dates.value?.[1]);
		}

		const res: ApiResponse<any> = await claimlist(params as {
			Status?: string | number;
			TrackingNbr?: string;
			PageIndex: number;
			PageSize: number;
			PeriodMin?: string;
			PeriodMax?: string;
		});
		if (res?.isSuccess) {
			routeData.value = res.result ?? [];
			availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
		}
	} finally {
		loading.value = false;
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
.parcel-claim {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.filter-card,
.table-card {
	background: #fff;
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
	background-color: #17a2b8;
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
	width: 320px;
	max-width: 100%;
}
.tracking-block {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}
.cyan {
	color: #17a2b8;
	cursor: pointer;
}
.cyan:hover {
	text-decoration: underline;
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
		margin-bottom: 10px;
	}
	.tracking-input {
		width: 100%;
	}
}
</style>