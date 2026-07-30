<template>
	<el-dialog
		v-model="status"
		:title="t('pages.downloadlabel')"
		width="800px"
		:before-close="handleClose"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
	>
		<div class="parcel-download">
			<p class="yellow">{{ t('pages.Downloads.ChromeEdge') }}</p>
			<div class="download-stats">
				<dl>
					<dt>{{ t('pages.Total') }}:</dt>
					<dd>{{ labels.length }}</dd>
				</dl>
				<dl>
					<dt>{{ t('pages.Success') }}:</dt>
					<dd>{{ success }}</dd>
				</dl>
				<dl>
					<dt>{{ t('pages.Failed') }}:</dt>
					<dd>{{ failed }}</dd>
				</dl>
				<el-button type="primary" class="download-retry" @click="retry">
					{{ t('pages.Downloads.tautology') }}
				</el-button>
			</div>
			<el-table :data="labels" border size="small" style="width: 100%">
				<el-table-column :label="t('pages.Downloads.odd')" prop="key" />
				<el-table-column :label="t('pages.Stage')">
					<template #default="scope">
						<span :class="isFailed(scope.row) ? 'text-danger' : 'text-success'">
							{{ scope.row.value ? scope.row.status : t('pages.Failed') }}
						</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Downloads.operation')">
					<template #default="scope">
						<span
							v-if="scope.row.value"
							class="manual-download"
							@click="() => manualDownload(scope.row)"
						>
							{{ t('pages.Downloads.Manualdownload') }}
						</span>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { POSTparcelslabels } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

interface LabelItem {
	key: string;
	value: string;
	status: string;
	blob?: Blob;
}

const props = defineProps<{
	ids: Array<string | number>;
}>();

const emit = defineEmits<{
	(e: 'changestatus'): void;
	(e: 'clearselect'): void;
}>();

const { t } = useI18n();
const status = ref(false);
const labels = ref<LabelItem[]>([]);

const success = computed(
	() => labels.value.filter((i) => i.status === '下载成功').length,
);
const failed = computed(
	() =>
		labels.value.filter((i) => i.status === '下载失败' || !i.value).length,
);

const isFailed = (item: LabelItem) =>
	item.status === '下载失败' || !item.value;

const splitArray = <T,>(array: T[], chunkSize: number): T[][] => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		result.push(array.slice(i, i + chunkSize));
	}
	return result;
};

const saveLabel = (element: { key: string; blob?: Blob }) => {
	try {
		if (element.blob) {
			saveAs(element.blob, `${element.key}.pdf`);
			return true;
		}
		return false;
	} catch {
		return false;
	}
};

const fetchElement = async (element: LabelItem) => {
	const idx = labels.value.findIndex((x) => x.value === element.value);
	if (idx === -1) return element;
	if (element.status === '下载成功' && element.blob) {
		const ok = saveLabel(element);
		labels.value[idx].status = ok ? '下载成功' : '下载失败';
	} else {
		labels.value[idx].status = '下载失败';
	}
	return element;
};

const processArrayInChunks = async (arr: LabelItem[], chunkSize: number) => {
	const chunks = splitArray(arr, chunkSize);
	const processChunk = async (index: number) => {
		if (index >= chunks.length) return;
		await Promise.all(
			chunks[index].map(async (element) => {
				await fetchElement(element);
			}),
		);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await processChunk(index + 1);
	};
	await processChunk(0);
};

const downloadLabel = async (label: LabelItem) => {
	const target = labels.value.find((x) => x.value === label.value);
	if (!target) return;
	if (label.value) {
		try {
			const x = await axios.get(label.value, { responseType: 'blob' });
			const ok = saveLabel({ blob: x.data, key: label.key });
			if (target.status === '下载成功' && !ok) {
				target.status = '下载失败';
			} else if (ok && target.status === '下载失败') {
				target.status = '下载成功';
			}
		} catch {
			if (target.status === '下载成功') {
				target.status = '下载失败';
			}
		}
	} else {
		target.status = '下载失败';
	}
};

const manualDownload = (item: LabelItem) => {
	downloadLabel(item);
};

const errorParcel = (item: any): LabelItem => ({
	key: item.key,
	status: '下载失败',
	value: item.value,
});

const downloadLabels = async () => {
	const lists = labels.value.map(async (item): Promise<LabelItem> => {
		if (!item.value) return errorParcel(item);
		try {
			const x = await axios.get(item.value, { responseType: 'blob' });
			return {
				key: item.key,
				status: '下载成功',
				blob: x.data,
				value: item.value,
			};
		} catch {
			return errorParcel(item);
		}
	});
	const results = await Promise.all(lists);
	processArrayInChunks(results, 10);
};

const loadLabels = async () => {
	const res: ApiResponse<any[]> = await POSTparcelslabels({
		ids: props.ids as any,
	});
	if (res?.isSuccess && Array.isArray(res.result)) {
		labels.value = res.result.map((y) => ({ ...y, status: '正在下载' }));
		downloadLabels();
	}
};

const retry = () => {
	loadLabels();
};

watch(
	() => props.ids,
	(newIds) => {
		if (newIds && newIds.length) {
			status.value = true;
			labels.value = [];
			loadLabels();
		}
	},
	{ immediate: true, deep: true },
);

const handleClose = () => {
	status.value = false;
	emit('changestatus');
	emit('clearselect');
};
</script>

<style lang="scss" scoped>
.parcel-download {
	padding: 0 8px;
}
.yellow {
	color: #e6a23c;
	margin: 0 0 12px;
}
.download-stats {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 12px;
	flex-wrap: wrap;
	dl {
		display: inline-flex;
		margin: 0;
		align-items: baseline;
		dt {
			color: #606266;
			margin-right: 4px;
		}
		dd {
			margin: 0;
			font-weight: 500;
		}
	}
}
.download-retry {
	margin-left: auto;
}
.text-danger {
	color: #f56c6c;
}
.text-success {
	color: #67c23a;
}
.manual-download {
	color: #409eff;
	cursor: pointer;
}
.manual-download:hover {
	text-decoration: underline;
}
</style>