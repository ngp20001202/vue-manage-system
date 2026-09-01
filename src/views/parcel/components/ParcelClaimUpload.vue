<template>
	<el-dialog
		v-model="visible"
		:title="dialogTitle"
		width="440px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div class="parcel-claim-upload">
			<div class="import">
				<div v-if="!attachmentOnly" class="file-row">
					<label class="file-label">{{ t('pages.ClaimList.claimInfoFile') }}</label>
					<div class="header-left">
						<div class="upload-wrap">
							<div class="input-group">
								<div class="custom-file">
									<input
										id="parcel_claim_info_file"
										ref="infoInput"
										accept=".xls,.xlsx"
										class="custom-file-input"
										type="file"
										@change="(e) => onFileChange(e, 'info')"
									/>
									<label
										:class="[
											'custom-file-label',
											{ cyans: !filenameInfo },
										]"
										for="parcel_claim_info_file"
									>
										{{ filenameInfo || t('pages.placechoose') }}
									</label>
								</div>
								<button class="input-btn" @click="triggerFile('info')">
									<el-icon><Upload /></el-icon>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div class="file-row">
					<label class="file-label">{{ t('pages.ClaimList.evidenceFile') }}</label>
					<div class="header-left">
						<div class="upload-wrap">
							<div class="input-group">
								<div class="custom-file">
									<input
										id="parcel_claim_evidence_file"
										ref="evidenceInput"
										accept=".zip,.rar"
										class="custom-file-input"
										type="file"
										@change="(e) => onFileChange(e, 'evidence')"
									/>
									<label
										:class="[
											'custom-file-label',
											{ cyans: !filenameEvidence },
										]"
										for="parcel_claim_evidence_file"
									>
										{{ filenameEvidence || t('pages.placechoose') }}
									</label>
								</div>
								<button class="input-btn" @click="triggerFile('evidence')">
									<el-icon><Upload /></el-icon>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div class="actions-row">
					<el-button type="success" class="import-btn" @click="submit">
						{{ t('pages.Import') }}
					</el-button>
					<div class="download">
						<a href="/templates/Claim_Template.xlsx" download>
							<el-icon><Download /></el-icon>
							{{ t('pages.ClaimList.downloadClaimTemplate') }}
						</a>
					</div>
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
import { claimImport } from '@/api/parcel';

const props = defineProps<{
	modelValue: boolean;
	orderId?: string;
	attachmentOnly?: boolean;
}>();
const emit = defineEmits(['update:modelValue', 'success']);

const { t } = useI18n();
const visible = ref(false);

const dialogTitle = computed(() =>
	props.orderId ? `提交 ${props.orderId} 的索赔` : t('pages.ClaimList.submitClaim'),
);
const infoInput = ref<HTMLInputElement | null>(null);
const evidenceInput = ref<HTMLInputElement | null>(null);
const filenameInfo = ref('');
const filenameEvidence = ref('');
const fileInfo = ref<File | null>(null);
const fileEvidence = ref<File | null>(null);

const resetForm = () => {
	filenameInfo.value = '';
	filenameEvidence.value = '';
	fileInfo.value = null;
	fileEvidence.value = null;
	if (infoInput.value) infoInput.value.value = '';
	if (evidenceInput.value) evidenceInput.value.value = '';
};

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (!v) resetForm();
	},
);

const triggerFile = (which: 'info' | 'evidence') => {
	(which === 'info' ? infoInput.value : evidenceInput.value)?.click();
};

const onFileChange = (e: Event, which: 'info' | 'evidence') => {
	const target = e.target as HTMLInputElement;
	const f = target.files?.[0];
	if (!f) return;
	if (which === 'info') {
		fileInfo.value = f;
		filenameInfo.value = f.name;
	} else {
		fileEvidence.value = f;
		filenameEvidence.value = f.name;
	}
};

const submit = async () => {
	if (!props.attachmentOnly && !fileInfo.value) {
		ElMessage.warning(t('pages.ClaimList.claimInfoFile'));
		return;
	}
	if (!fileEvidence.value) {
		ElMessage.warning(t('pages.ClaimList.evidenceFile'));
		return;
	}
	const formdata = new FormData();
	if (fileInfo.value) formdata.append('excel', fileInfo.value);
	formdata.append('zip', fileEvidence.value);
	const res = await claimImport(formdata);
	if (res?.isSuccess) {
		ElMessage.success(t('pages.Success'));
		emit('success');
		emit('update:modelValue', false);
		resetForm();
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const handleClose = () => {
	emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.parcel-claim-upload {
	.import {
		padding: 15px 25px 0;
	}
	.file-row {
		margin-bottom: 16px;
	}
	.file-label {
		display: block;
		margin-bottom: 6px;
		font-size: 14px;
		color: #606266;
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
		height: 96%;
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
	.actions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		align-items: center;
		justify-content: space-between;
		margin-top: 8px;
	}
	.import-btn {
		width: 150px;
		min-height: 36px;
		font-size: 16px;
		background-color: #28a745;
		border-color: #28a745;
	}
	.import-btn:hover {
		background-color: #218838 !important;
		border-color: #1e7e34 !important;
	}
	.download {
		text-align: right;
		font-size: 14px;
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
