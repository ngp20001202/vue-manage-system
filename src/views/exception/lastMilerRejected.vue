<template>
	<div class="lastmiler-rejected">
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
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
			>
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span>{{ scope.row.id }}</span>
					</template>
				</el-table-column>
				<el-table-column min-width="150">
					<template #header>
						<span class="copy-header" @click="() => copy('clientRefNbr')">
							{{ t('pages.order') }}
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
							{{ t('pages.lastmiler') }}
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
				<el-table-column
					property="stageText"
					:label="t('pages.Stage')"
					width="150"
				/>
				<el-table-column :label="t('pages.PostedOn')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.postedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column
					property="reasonText"
					:label="t('pages.Reason')"
					min-width="200"
				/>
				<el-table-column :label="t('pages.Action')" width="180" align="center" fixed="right">
					<template #default="scope">
						<div class="action-cell">
							<el-button
								type="warning"
								size="small"
								:icon="RefreshRight"
								:loading="resending === scope.row.id"
								@click="() => editAndResend(scope.row)"
							>
								{{ t('pages.LastMilerRejection.EditandResend') }}
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
import {
	Search,
	Refresh,
	DocumentCopy,
	RefreshRight,
} from '@element-plus/icons-vue';
import moment from 'moment';
import { formatParagraphtext } from '@/utils/format';
import { lastMilerRejectedlist, lastMilerRejectedSearch, Editrso } from '@/api/rejection';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface RejectionRow extends Record<string, any> {
	id: string | number;
	clientRefNbr?: string;
	lastMilerNbr?: string;
	svcName?: string;
	stageText?: string;
	postedStamp?: { utcTime: string };
	reasonText?: string;
}

const activeName = ref('0');
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const routeData = ref<RejectionRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const resending = ref<string | number | null>(null);

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
	const res: ApiResponse<any> = await lastMilerRejectedlist({
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
	const res: ApiResponse<any> = await lastMilerRejectedSearch({
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

const editAndResend = async (row: RejectionRow) => {
	try {
		await ElMessageBox.confirm(
			'编辑重推后将重新获取面单，是否继续？',
			'确认编辑重推',
			{
				confirmButtonText: '确认',
				cancelButtonText: t('pages.Cancel'),
				type: 'warning',
				center: true,
			},
		);
	} catch {
		return;
	}
	resending.value = row.id;
	try {
		const res: ApiResponse<any> = await Editrso({ ids: [row.id] });
		if (res?.isSuccess) {
			ElMessage.success('编辑重推成功');
			getdata();
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed'));
	} finally {
		resending.value = null;
	}
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
.lastmiler-rejected {
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
	justify-content: flex-end;
}
.op-row-pager {
	flex-shrink: 0;
}
.op-row-pager :deep(.el-pagination__sizes) {
	margin-right: 0;
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
