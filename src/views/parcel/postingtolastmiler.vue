<template>
	<div class="posting-lastmiler">
		<el-page-header :icon="ArrowLeft" @back="goBack">
			<template #content>
				<span class="page-title">
					{{ t('title.PostingtoLastMilerImport') || '推送入网 - 批量导入' }}
				</span>
			</template>
		</el-page-header>

		<el-card shadow="never" class="content-card">
			<el-radio-group v-model="mode" class="mode-group">
				<el-radio-button value="text">{{ t('pages.tracking') || '运单号或者订单号' }}</el-radio-button>
				<el-radio-button value="file">{{ t('pages.Template') || '文件' }}</el-radio-button>
			</el-radio-group>

			<div v-if="mode === 'text'" class="text-block">
				<el-input
					v-model="textarea"
					class="tracking-input"
					type="textarea"
					:rows="6"
					:placeholder="t('pages.trackplace') || '一行一个运单号或订单号'"
				/>
			</div>

			<div v-else class="upload-row">
				<el-upload
					class="upload-inline"
					action="#"
					:auto-upload="false"
					:show-file-list="false"
					:on-change="onFileChange"
					accept=".xls,.xlsx,.csv"
				>
					<el-input
						:model-value="filename || t('pages.placechoose')"
						readonly
						:class="['file-name', { 'is-empty': !filename, 'is-error': isError }]"
					>
						<template #append>
							<el-icon><UploadFilled /></el-icon>
						</template>
					</el-input>
				</el-upload>
			</div>

			<div class="actions">
				<el-button type="success" :loading="submitting" @click="submitImport">
					{{ t('pages.Import') || '批量导入' }}
				</el-button>
				<el-button v-if="fileId" type="warning" :loading="confirming" @click="confirmImport">
					{{ t('pages.CfmImport') || '确认导入' }}
				</el-button>
				<el-button @click="reset">{{ t('pages.Reset') || '重置' }}</el-button>
				<a class="download-link" href="/templates/PostingToLastMiler_Template.xlsx" download>
					<el-icon><Download /></el-icon>
					<span>{{ t('pages.Download') || '下载模板' }}</span>
				</a>
			</div>

			<!-- 导入结果 -->
			<div v-if="resultList.length" class="preview">
				<h3 class="summary">
					{{ t('pages.Total') || '总计' }}: {{ sum }}
					<span class="ok">{{ t('pages.Success') || '成功' }}: {{ success }}</span>
					<span class="fail">{{ t('pages.Failed') || '失败' }}: {{ failed }}</span>
				</h3>
				<el-table
					v-loading="resultLoading"
					:data="resultList"
					style="width: 100%"
					border
					size="small"
				>
					<el-table-column type="index" width="50" />
					<el-table-column :label="t('pages.Errors') || '错误信息'" min-width="240">
						<template #default="scope">
							<span class="fail">{{ scope.row.errors?.join('，') }}</span>
						</template>
					</el-table-column>
					<el-table-column
						property="trackingNbr"
						:label="t('pages.lastorder') || '订单 #'"
						min-width="180"
					/>
					<template #empty>
						<el-empty :description="t('pages.NoData') || '暂无数据'" />
					</template>
				</el-table>
			</div>

			<!-- 模板列说明 -->
			<el-table v-else :data="columns" style="width: 100%" border size="small">
				<el-table-column :label="t('pages.ColumnName') || '列名'" min-width="180">
					<template #default="scope">
						<span class="red">{{ scope.row.columnsname }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Required') || '是否必填'" width="120">
					<template #default="scope">
						<el-icon v-if="scope.row.required" class="check-icon"><CircleCheck /></el-icon>
					</template>
				</el-table-column>
				<el-table-column
					property="desc"
					:label="t('pages.Description') || '描述'"
					min-width="240"
				/>
				<el-table-column
					property="sl"
					:label="t('pages.Example') || '示例'"
					min-width="200"
				/>
			</el-table>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="parcel-postingtolastmiler">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, type UploadFile } from 'element-plus';
import {
	ArrowLeft,
	Download,
	CircleCheck,
	UploadFilled,
} from '@element-plus/icons-vue';
import { postingfile, CfmPosting } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const router = useRouter();
const { t } = useI18n();

interface ColumnItem {
	columnsname: string;
	required: boolean;
	desc: string;
	sl: string;
}

interface ResultRow {
	trackingNbr?: string;
	errors?: string[];
}

const mode = ref<'text' | 'file'>('text');
const textarea = ref('');
const file = ref<File | null>(null);
const filename = ref('');
const isError = ref(false);
const submitting = ref(false);
const confirming = ref(false);
const resultLoading = ref(false);
const fileId = ref('');
const resultList = ref<ResultRow[]>([]);

const columns = ref<ColumnItem[]>([
	{
		columnsname: 'Tracking# or Order#',
		required: true,
		desc: t('pages.tracking') || '运单号或者订单号',
		sl: '9261290986237901819419',
	},
]);

const sum = computed(() => resultList.value.length);
const failed = computed(
	() => resultList.value.filter((item) => item.errors && item.errors.length > 0).length,
);
const success = computed(() => sum.value - failed.value);

watch(filename, (val) => {
	if (val) isError.value = false;
});

const onFileChange = (uploadFile: UploadFile) => {
	if (!uploadFile.raw) return;
	file.value = uploadFile.raw;
	filename.value = uploadFile.name;
};

const trackingNbrs = computed(() =>
	textarea.value
		.split(/[\n,;\s]+/)
		.map((s) => s.trim())
		.filter((s) => s !== ''),
);

// 文本模式下把运单号拼成一个 csv 文件提交，复用同一个导入接口
const buildTextFile = () => {
	const content = `Tracking# or Order#\n${trackingNbrs.value.join('\n')}\n`;
	return new File([content], 'postingToLastMiler.csv', { type: 'text/csv' });
};

const loadResult = async (id: string) => {
	resultLoading.value = true;
	try {
		const res: ApiResponse<ResultRow[]> = await CfmPosting(id);
		if (res?.isSuccess && Array.isArray(res.result)) {
			resultList.value = res.result;
		} else {
			ElMessage.error(res?.message || t('pages.Failed') || '失败');
		}
	} finally {
		resultLoading.value = false;
	}
};

const submitImport = async () => {
	let payloadFile: File | null = null;
	if (mode.value === 'file') {
		if (!file.value) {
			isError.value = true;
			ElMessage.warning(t('pages.placechoose') || '请选择文件');
			return;
		}
		payloadFile = file.value;
	} else {
		if (!trackingNbrs.value.length) {
			ElMessage.warning(t('pages.trackplace') || '请输入运单号或订单号');
			return;
		}
		payloadFile = buildTextFile();
	}
	submitting.value = true;
	try {
		const form = new FormData();
		form.append('file', payloadFile);
		const res: ApiResponse<any> = await postingfile(form);
		if (res?.isSuccess && res.result?.fileId) {
			fileId.value = String(res.result.fileId);
			await loadResult(fileId.value);
		} else {
			ElMessage.error(res?.message || t('pages.Failed') || '失败');
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed') || '失败');
	} finally {
		submitting.value = false;
	}
};

const confirmImport = async () => {
	if (!fileId.value) return;
	confirming.value = true;
	try {
		const res: ApiResponse<ResultRow[]> = await CfmPosting(fileId.value);
		if (res?.isSuccess) {
			resultList.value = Array.isArray(res.result) ? res.result : resultList.value;
			ElMessage.success(res.message || t('pages.Success') || '成功');
		} else {
			ElMessage.error(res?.message || t('pages.Failed') || '失败');
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed') || '失败');
	} finally {
		confirming.value = false;
	}
};

const reset = () => {
	textarea.value = '';
	file.value = null;
	filename.value = '';
	fileId.value = '';
	resultList.value = [];
};

const goBack = () => {
	router.push('/parcel/list');
};
</script>

<style lang="scss" scoped>
.posting-lastmiler {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.page-title {
	font-size: 16px;
	font-weight: 500;
}
.content-card {
	background: #fff;
}
.mode-group {
	margin-bottom: 12px;
}
.text-block {
	margin-bottom: 12px;
}
.tracking-input {
	width: 100%;
	max-width: 640px;
}
.upload-row {
	display: flex;
	gap: 8px;
	align-items: center;
	margin-bottom: 12px;
}
.upload-inline {
	flex: 1;
	max-width: 640px;
}
.upload-inline :deep(.el-upload) {
	width: 100%;
}
.file-name.is-empty :deep(.el-input__inner) {
	color: #a8abb2;
}
.file-name.is-error :deep(.el-input__inner) {
	color: #f56c6c;
}
.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
	margin-bottom: 16px;
}
.download-link {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	margin-left: 8px;
	color: #409eff;
	text-decoration: none;
}
.download-link:hover {
	text-decoration: underline;
}
.summary {
	font-size: 16px;
	font-weight: 500;
	margin: 0 0 12px;
	display: flex;
	gap: 16px;
	align-items: center;
}
.ok {
	color: #2ba745;
}
.fail {
	color: #f56c6c;
}
.red {
	color: #f56c6c;
}
.check-icon {
	color: #2ba745;
	font-size: 20px;
}
@media (max-width: 768px) {
	.tracking-input,
	.upload-inline {
		width: 100%;
		max-width: none;
	}
}
</style>
