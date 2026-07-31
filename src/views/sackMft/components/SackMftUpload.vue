<template>
	<el-dialog
		v-model="visible"
		title="UploadFile"
		width="600px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div class="sackmft-upload">
			<div class="import">
				<div class="header-left">
					<div class="upload-wrap">
						<div class="input-group">
							<div class="custom-file">
								<input
									id="sackmft_input_file"
									ref="fileInput"
									accept=".xls,.xlsx"
									class="custom-file-input"
									name="Input.File"
									type="file"
									@change="onFileChange"
								/>
								<label
									:class="[
										'custom-file-label',
										{ cyans: isEmpty },
									]"
									for="sackmft_input_file"
								>
									{{ filename || t('pages.placechoose') }}
								</label>
							</div>
							<button class="input-btn" @click="triggerFile">
								<el-icon><Upload /></el-icon>
							</button>
						</div>
					</div>
					<el-button type="success" class="import-btn" @click="submit">
						{{ t('pages.Import') }}
					</el-button>
				</div>
				<div class="download">
					<a href="/templates/Outgating_Template.xlsx" download>
						<el-icon><Download /></el-icon>
						{{ t('pages.Download') }}
					</a>
				</div>
			</div>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Upload, Download } from '@element-plus/icons-vue';
import { sackMftimport } from '@/api/sackMft';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'success']);

const { t } = useI18n();
const visible = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const filename = ref('');
const file = ref<File | null>(null);

const isEmpty = computed(() => !filename.value);

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (!v) {
			filename.value = '';
			file.value = null;
			if (fileInput.value) fileInput.value.value = '';
		}
	},
);

const triggerFile = () => {
	fileInput.value?.click();
};

const onFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const f = target.files?.[0];
	if (f) {
		file.value = f;
		filename.value = f.name;
	}
};

const submit = async () => {
	if (!file.value) {
		ElMessage.warning(t('pages.placechoose'));
		return;
	}
	const formdata = new FormData();
	formdata.append('file', file.value);
	const res = await sackMftimport(formdata);
	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
		emit('success');
		emit('update:modelValue', false);
		filename.value = '';
		file.value = null;
		if (fileInput.value) fileInput.value.value = '';
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const handleClose = () => {
	emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.sackmft-upload {
	.import {
		padding: 15px 25px 0;
	}
	.header-left {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}
	.upload-wrap {
		flex: 1;
		min-width: 0;
	}
	.input-group {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		width: 100%;
		height: 35px;
	}
	.custom-file {
		position: relative;
		flex: 1 1 0%;
		min-width: 0;
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;
	}
	.custom-file-input {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
	}
	.custom-file-label {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 1;
		height: 100%;
		padding: 0 12px;
		color: #495057;
		font-size: 15px;
		line-height: 33px;
		text-indent: 1em;
		background: #fff;
		border: 1px solid #ced4da;
		border-right: transparent;
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		&.cyans {
			border-color: #80bdff;
		}
	}
	.input-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 0 12px;
		background: #fff;
		color: #495057;
		border: 1px solid #ced4da;
		border-radius: 0 5px 5px 0;
		box-shadow: none !important;
		cursor: pointer;
	}
	.input-btn:hover,
	.input-btn:active {
		background-color: #e9ecef;
		border-color: #ced4da;
	}
	.import-btn {
		width: 150px;
		min-height: 36px;
		margin-left: 25px;
		font-size: 16px;
		background-color: #28a745;
		border-color: #28a745;
	}
	.import-btn:hover {
		background-color: #218838 !important;
		border-color: #1e7e34 !important;
	}
	.download {
		margin-top: 30px;
		margin-bottom: 12px;
		padding-right: 35px;
		text-align: right;
		font-size: 18px;
		a {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			color: #007bff;
			text-decoration: none;
		}
		a:hover {
			text-decoration: underline;
		}
	}
}
</style>
