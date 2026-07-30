<template>
	<div class="download-page">
		<el-card shadow="never" class="filter-card">
			<el-form :inline="true" class="filter-form">
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
					<el-select v-model="startstage" class="stage-select">
						<el-option
							v-for="item in startsoptions"
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
		</el-card>

		<el-card shadow="never" class="table-card">
			<div v-show="routeData.length" class="op-row">
				<div class="op-row-left">
					<el-tooltip :content="t('pages.deleteinbatches')" placement="top" :enterable="false">
						<el-button
							type="danger"
							:disabled="!selectarr.length"
							class="cancell"
							@click="() => deleteitem('')"
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
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span>{{ scope.row.id }}</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="name"
					:label="t('pages.DownloadPage.filename')"
					show-overflow-tooltip
				/>
				<el-table-column :label="t('pages.DownloadPage.state')" width="120">
					<template #default="scope">
						<span>{{ scope.row.status }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.DownloadPage.creationtime')" width="180">
					<template #default="scope">
						<span>{{ formatCreated(scope.row.createdOn) }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action')" width="320" align="center">
					<template #default="scope">
						<div class="action-cell">
							<el-button
								v-if="scope.row.status !== 'Created'"
								type="primary"
								size="small"
								@click="() => downloads(scope.row.url)"
							>
								{{ t('pages.DownloadPage.download') }}
							</el-button>
							<el-button
								v-if="scope.row.status !== 'Created'"
								type="info"
								size="small"
								@click="() => Combinedsheet(scope.row.id, scope.row.url)"
							>
								{{ t('pages.DownloadPage.Combinedsheet') }}
							</el-button>
							<el-button
								type="danger"
								size="small"
								@click="() => deleteitem(scope.row.id)"
							>
								{{ t('pages.Delete') }}
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
import { Delete, Search, Refresh } from '@element-plus/icons-vue';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { downloadlist, DELETEDownload, Downloadpdf } from '@/api/download';
import { SackMftsign } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import { filenames } from '@/utils/filename';

const { t } = useI18n();

interface DownloadRow extends Record<string, any> {
	id: string | number;
	name?: string;
	url?: string;
	status?: string;
	createdOn?: string;
}

const dates = ref<[string, string] | null>(null);
const startstage = ref<string>('');
const startsoptions = ref<Array<{ value: string; label: string }>>([
	{ value: '', label: t('pages.fromstage') },
	{ value: 'Created', label: t('pages.DownloadPage.created') },
	{ value: 'Succeeded', label: t('pages.DownloadPage.completed') },
	{ value: 'Failed', label: t('pages.DownloadPage.failed') },
]);

const routeData = ref<DownloadRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const selectarr = ref<DownloadRow[]>([]);
const multipleTableRef = ref();

const defaultRange = (): [string, string] => [
	moment().subtract(30, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const formatCreated = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const toUtcIso = (date: string | undefined) => {
	if (!date) return '';
	return moment(date).utc().format();
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const onReset = () => {
	dates.value = defaultRange();
	startstage.value = '';
	pagecurrent.value = 1;
	getdata();
};

const handleSelectionChange = (rows: DownloadRow[]) => {
	selectarr.value = rows;
};

const clearselect = () => {
	multipleTableRef.value?.clearSelection();
	selectarr.value = [];
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await downloadlist({
		index: pagecurrent.value - 1,
		size: count.value,
		Status: startstage.value,
		PeriodMin: toUtcIso(dates.value?.[0]),
		PeriodMax: toUtcIso(dates.value?.[1]),
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const deleteitem = (id: string | number) => {
	const list: Array<string | number> = !id && selectarr.value.length
		? selectarr.value.map((r) => r.id)
		: id
			? [id]
			: [];
	if (!list.length) return;
	ElMessageBox.confirm(
		'删除后无法恢复该下载任务',
		'确认删除该下载任务?',
		{
			confirmButtonText: '确认删除',
			cancelButtonText: t('pages.Cancel'),
			type: 'warning',
			center: true,
		},
	)
		.then(async () => {
			const res: ApiResponse<any> = await DELETEDownload({ ids: list });
			if (res?.isSuccess) {
				ElMessage.success(t('pages.Success'));
				clearselect();
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		})
		.catch(() => {
			clearselect();
		});
};

const downloads = async (url: string) => {
	if (!url) return;
	const origin = window.location.origin;
	const href = `${origin}${url}`;
	const res: any = await SackMftsign({ url: href });
	const token = res?.result?.token ?? res?.token;
	if (token) {
		window.open(`${href}?token=${token}`, '_blank');
	}
};

const Combinedsheet = async (id: string | number, url: string) => {
	const res: any = await Downloadpdf(id, { url });
	const filename = filenames(res) || `download_${id}.pdf`;
	saveAs(res, filename);
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
.download-page {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.filter-card,
.table-card {
	background: #fff;
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
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
@media (max-width: 768px) {
	.date-picker,
	.stage-select {
		width: 100%;
	}
}
</style>
