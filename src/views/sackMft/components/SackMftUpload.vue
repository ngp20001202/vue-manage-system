<template>
	<el-dialog
		v-model="visible"
		:title="t('pages.upload')"
		width="600px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div class="upload-body">
			<div class="file-row">
				<input
					ref="fileInput"
					type="file"
					accept=".xls,.xlsx"
					class="file-input"
					@change="onFileChange"
				/>
				<el-input
					:model-value="filename || t('pages.placechoose')"
					readonly
					:class="['file-name', { 'is-empty': !filename }]"
				/>
				<el-button type="primary" @click="triggerFile">
					{{ t('pages.ChooseFile') }}
				</el-button>
			</div>
			<div class="actions">
				<el-button type="success" :disabled="!file" @click="submit">
					{{ t('pages.Import') }}
				</el-button>
				<a href="/templates/Outgating_Template.xlsx" download>
					<el-button type="info">
						{{ t('pages.Download') }}
					</el-button>
				</a>
			</div>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
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
.file-input {
	display: none;
}
.file-row {
	display: flex;
	gap: 8px;
	align-items: center;
}
.file-name {
	flex: 1;
}
.file-name.is-empty :deep(.el-input__inner) {
	color: #a8abb2;
}
.actions {
	display: flex;
	gap: 8px;
}
</style>
