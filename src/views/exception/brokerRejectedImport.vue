<template>
	<div class="broker-rejected-import">
		<el-page-header :icon="ArrowLeft" @back="goBack">
			<template #content>
				<span class="page-title">
					{{ t('title.BrokerRejectionImportParcels') }}
				</span>
			</template>
		</el-page-header>

		<el-card shadow="never" class="content-card">
			<p class="hint">{{ t('pages.parcel_import.Shipper') }} / {{ t('pages.Parcel') }}</p>

			<el-upload
				class="upload-area"
				drag
				:auto-upload="false"
				:limit="1"
				:on-change="handleFileChange"
				:on-exceed="handleExceed"
				accept=".xlsx,.xls,.csv"
			>
				<el-icon class="upload-icon"><UploadFilled /></el-icon>
				<div class="el-upload__text">
					{{ t('pages.placechoose') }}
				</div>
				<template #tip>
					<div class="el-upload__tip">
						{{ fileName || t('pages.Template') }}
					</div>
				</template>
			</el-upload>

			<el-alert
				:title="t('pages.Thedataisincorrect')"
				type="warning"
				show-icon
				:closable="false"
				class="mt"
			/>

			<div class="actions">
				<el-button type="primary" :loading="submitting" :disabled="!file" @click="submitImport">
					{{ t('pages.upload') }}
				</el-button>
				<el-button @click="reset">{{ t('pages.Reset') }}</el-button>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="broker-rejected-import">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox, UploadRawFile, UploadFile } from 'element-plus';
import { ArrowLeft, UploadFilled } from '@element-plus/icons-vue';
import { brokerRejectedImport } from '@/api/rejection';
import type { ApiResponse } from '@/api/types';

const router = useRouter();
const { t } = useI18n();

const file = ref<File | null>(null);
const fileName = ref('');
const submitting = ref(false);

const handleFileChange = (uploadFile: UploadFile) => {
	if (!uploadFile.raw) return;
	file.value = uploadFile.raw;
	fileName.value = uploadFile.name;
};

const handleExceed = () => {
	ElMessage.warning('仅支持上传一个文件');
};

const submitImport = async () => {
	if (!file.value) {
		ElMessage.warning(t('pages.placechoose'));
		return;
	}
	try {
		await ElMessageBox.confirm(
			'确认导入清关失败的订单?',
			'导入订单',
			{
				confirmButtonText: t('pages.Save'),
				cancelButtonText: t('pages.Cancel'),
				type: 'warning',
				center: true,
			},
		);
	} catch {
		return;
	}
	submitting.value = true;
	try {
		const form = new FormData();
		form.append('file', file.value);
		const res: ApiResponse<any> = await brokerRejectedImport(form);
		if (res?.isSuccess) {
			ElMessage.success(t('pages.Success'));
			router.push('/exception/brokerRejected');
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed'));
	} finally {
		submitting.value = false;
	}
};

const reset = () => {
	file.value = null;
	fileName.value = '';
};

const goBack = () => {
	router.push('/exception/brokerRejected');
};
</script>

<style lang="scss" scoped>
.broker-rejected-import {
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
.hint {
	color: #606266;
	margin: 0 0 12px;
}
.upload-area {
	display: flex;
	justify-content: center;
}
.upload-area :deep(.el-upload-dragger) {
	width: 100%;
	max-width: 520px;
	height: 180px;
}
.upload-icon {
	font-size: 56px;
	color: #c0c4cc;
	margin-bottom: 8px;
}
.mt {
	margin-top: 12px;
}
.actions {
	margin-top: 16px;
	display: flex;
	gap: 8px;
	justify-content: flex-end;
}
</style>
