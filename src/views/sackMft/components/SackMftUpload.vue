<template>
	<el-dialog
		v-model="visible"
		title="UploadFile"
		width="600px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div class="upload-body">
			<div class="input-group">
				<input
					ref="fileInput"
					type="file"
					accept=".xls,.xlsx"
					class="custom-file-input"
					@change="onFileChange"
				/>
				<label
					:class="['custom-file-label', { 'is-empty': !filename }]"
					for="upload-input"
				>
					{{ filename || t('pages.placechoose') }}
				</label>
				<button class="upload-btn" @click="triggerFile">
					<el-icon><Upload /></el-icon>
				</button>
			</div>
			<el-button type="success" class="import-btn" @click="submit">
				{{ t('pages.Import') }}
			</el-button>
			<div class="download-link">
				<a href="/templates/Outgating_Template.xlsx" download>
					<el-icon><Download /></el-icon>
					{{ t('pages.Download') }}
				</a>
			</div>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
.upload-body {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
.custom-file-input {
	display: none;
}
.input-group {
	display: flex;
	align-items: stretch;
	gap: 0;
}
.custom-file-label {
	flex: 1;
	padding: 0 12px;
	border: 1px solid #dcdfe6;
	border-right: none;
	border-radius: 4px 0 0 4px;
	background: #fff;
	color: #606266;
	line-height: 32px;
	min-height: 32px;
	cursor: pointer;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	&.is-empty {
		color: #a8abb2;
	}
}
.upload-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0 12px;
	background: #17a2b8;
	color: #fff;
	border: 1px solid #17a2b8;
	border-radius: 0 4px 4px 0;
	cursor: pointer;
}
.import-btn {
	align-self: flex-start;
}
.download-link {
	a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #17a2b8;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
}
</style>