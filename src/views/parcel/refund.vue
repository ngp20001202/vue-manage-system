<template>
	<div class="parcel-refund">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="0" />
				<el-tab-pane
					:label="t('pages.RefundList.refundApproved')"
					name="10005"
				/>
				<el-tab-pane
					:label="t('pages.RefundList.refundUnderReview')"
					name="11010"
				/>
				<el-tab-pane
					:label="t('pages.RefundList.refundRejected')"
					name="11020"
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
						<el-tag :type="getRefundStateTag(scope.row.state).type" size="small">
							{{ getRefundStateTag(scope.row.state).label }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Reason')" min-width="200">
					<template #default="scope">
						<span>{{ scope.row.reason || '-' }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.PostedOn')" width="180">
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
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import moment from 'moment';
import { refundlist } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import ParcelDetail from './detail.vue';

const { t } = useI18n();

interface RefundRow extends Record<string, any> {
	id: string | number;
	lastMilerNbr?: string;
	state?: string | number;
	reason?: string;
	postedOn?: string;
}

const activeName = ref('0');
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const routeData = ref<RefundRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const parcelDetail = reactive({ id: '' });

const REFUND_STATE_ALIAS: Record<string, string> = {
	'10005': 'Refunded',
	Refunded: 'Refunded',
	'11010': 'Refunding',
	Refunding: 'Refunding',
	'11020': 'Rejected',
	Rejected: 'Rejected',
	'11040': 'Cancelled',
	Cancelled: 'Cancelled',
};

const REFUND_STATE_META: Record<string, { type: string; label: string }> = {
	Refunded: { type: 'success', label: 'pages.RefundList.refundApproved' },
	Refunding: { type: 'warning', label: 'pages.RefundList.refundUnderReview' },
	Rejected: { type: 'danger', label: 'pages.RefundList.refundRejected' },
	Cancelled: { type: 'info', label: 'pages.RefundList.cancelled' },
};

const getRefundStateTag = (state: string | number | undefined) => {
	if (state == null) return { type: 'info', label: '' };
	const name = REFUND_STATE_ALIAS[String(state)];
	const meta = name && REFUND_STATE_META[name];
	if (meta) return { type: meta.type, label: t(meta.label) };
	return { type: 'info', label: String(state) };
};

const formatPosted = (utc: string | undefined) => {
	if (!utc) return '';
	return moment(utc).format('YYYY-MM-DD HH:mm:ss');
};

const toUtcIso = (date: string | undefined) => {
	if (!date) return undefined;
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
	if (activeName.value === 'tracking') {
		getdata(1);
	} else {
		getdata();
	}
};

const beforeLeave = (e: string | number) => {
	dates.value = defaultRange();
	textarea.value = '';
	if (e === 'tracking') {
		routeData.value = [];
		activeName.value = String(e);
		return true;
	}
	activeName.value = String(e);
	getdata();
	return true;
};

const getdata = async (type?: number, tabName?: string | number) => {
	loading.value = true;
	const currentTab = tabName ?? activeName.value;
	const isTracking = currentTab === 'tracking';

	const rawTrackingNbrs = textarea.value
		.split(/[\n\r,,，]+/)
		.map((s) => s.trim())
		.filter(Boolean);
	if (rawTrackingNbrs.length > 200) {
		ElMessage.info(t('pages.trackingPage.limitInfo'));
	}
	const trackingNbrs = rawTrackingNbrs.slice(0, 200).join('\n');

	const params: Record<string, any> = {
		pageIndex: pagecurrent.value - 1,
		pageSize: count.value,
	};
	if (type || isTracking) {
		params.RefNbrs = trackingNbrs;
	} else {
		params.stateID = currentTab;
		params.periodMin = toUtcIso(dates.value?.[0]);
		params.periodMax = toUtcIso(dates.value?.[1]);
	}

	const res: ApiResponse<any> = await refundlist(params as {
		pageIndex: number;
		pageSize: number;
		RefNbrs?: string;
		stateID?: string | number;
		periodMin?: string;
		periodMax?: string;
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

watch([count, pagecurrent], () => {
	if (activeName.value === 'tracking') {
		getdata(1);
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
.parcel-refund {
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
