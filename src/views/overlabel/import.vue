<template>
	<div class="overlabel-import">
		<el-page-header :icon="ArrowLeft" @back="goBack">
			<template #content>
				<span class="page-title">
					{{ t('title.OverlabelImport') || '换单导入' }}
				</span>
			</template>
		</el-page-header>

		<el-card shadow="never" class="content-card">
			<div class="upload-row">
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
					:class="['file-name', { 'is-empty': !filename, 'is-error': isError }]"
				/>
				<el-button type="primary" @click="triggerFile">
					{{ t('pages.ChooseFile') || '选择文件' }}
				</el-button>
				<el-select v-model="courierId" class="courier-select" placeholder="Select">
					<el-option
						v-for="item in courierOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
				<el-button
					type="success"
					:loading="submitting"
					:disabled="!file"
					@click="submitImport"
				>
					{{ t('pages.Import') }}
				</el-button>
			</div>
			<div class="download-row">
				<a href="/templates/Parcel_Template.xlsx" download>
					<el-icon><Download /></el-icon>
					<span>{{ t('pages.Download') }}</span>
				</a>
			</div>

			<el-table :data="data" style="width: 100%" border size="small">
				<el-table-column :label="t('pages.ColumnName') || '列名'" min-width="150">
					<template #default="scope">
						<span class="red">{{ scope.row.columnsname }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Required') || '必填'" width="100">
					<template #default="scope">
						<div v-if="scope.row.required">
							<el-icon class="check-icon"><CircleCheck /></el-icon>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Description') || '描述'" min-width="200">
					<template #default="scope">
						<span>{{ scope.row.desc }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Example') || '示例'" min-width="200">
					<template #default="scope">
						<span>{{ scope.row.sl }}</span>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="overlabel-import">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import {
	ArrowLeft,
	Download,
	CircleCheck,
} from '@element-plus/icons-vue';
import { overlabelImport } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const router = useRouter();
const { t } = useI18n();

interface ColumnItem {
	columnsname: string;
	required: boolean;
	desc: string;
	sl: string;
}

const file = ref<File | null>(null);
const filename = ref('');
const submitting = ref(false);
const isError = ref(false);
const courierId = ref<number | string>(0);
const fileInput = ref<HTMLInputElement | null>(null);

const courierOptions = ref<Array<{ value: number | string; label: string }>>([
	{ value: 0, label: ' ' },
	{ value: 9001, label: 'FedEx' },
	{ value: 9002, label: 'Usps' },
	{ value: 9006, label: 'FedEx_Express' },
	{ value: 9007, label: 'FedEx_2Day' },
	{ value: 9008, label: 'FedEx_SmartPostOnline' },
	{ value: 9009, label: 'FedEx_GroundMtw' },
	{ value: 9017, label: 'OnePizza' },
	{ value: 9019, label: 'IB' },
	{ value: 9020, label: 'Zda' },
	{ value: 9021, label: 'DHL' },
	{ value: 9022, label: 'Huodaios' },
	{ value: 9023, label: 'Shiphubx' },
	{ value: 9024, label: 'Zda_CP' },
	{ value: 9025, label: 'Zda_GDE' },
	{ value: 9026, label: 'K5' },
	{ value: 9027, label: 'Hualei' },
	{ value: 9028, label: 'Zda_TD' },
	{ value: 9030, label: 'UPS' },
	{ value: 9032, label: 'RuiYun' },
	{ value: 9033, label: 'UPS_MI' },
	{ value: 9034, label: 'UPS_2Day_NoZone' },
	{ value: 9035, label: 'UPS_3Day_NoZone' },
	{ value: 9036, label: 'UPS_Ground_NoZone' },
	{ value: 9101, label: 'Yunda' },
	{ value: 9102, label: 'Etk' },
	{ value: 9103, label: 'FourPx' },
	{ value: 9900, label: 'Suishouji' },
]);

const data = ref<ColumnItem[]>([
	{
		columnsname: 'TrackingNbr',
		required: true,
		desc: '运单号',
		sl: '2329384718884938479',
	},
]);

const triggerFile = () => {
	fileInput.value?.click();
};

const onFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const f = target.files?.[0];
	if (f) {
		file.value = f;
		filename.value = f.name;
		isError.value = false;
	}
};

const submitImport = async () => {
	if (!file.value) {
		isError.value = true;
		ElMessage.warning(t('pages.placechoose'));
		return;
	}
	submitting.value = true;
	try {
		const form = new FormData();
		form.append('file', file.value);
		form.append('CourierID', String(courierId.value));
		const res: ApiResponse<any> = await overlabelImport(form);
		if (res?.isSuccess) {
			ElMessage.success(res.message || t('pages.Success'));
			router.push('/Overlabel/List');
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed'));
	} finally {
		submitting.value = false;
	}
};

const goBack = () => {
	router.push('/Overlabel/List');
};
</script>

<style lang="scss" scoped>
.overlabel-import {
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
.file-input {
	display: none;
}
.upload-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
	margin-bottom: 12px;
}
.file-name {
	flex: 1;
	min-width: 240px;
}
.file-name.is-empty :deep(.el-input__inner) {
	color: #a8abb2;
}
.file-name.is-error :deep(.el-input__inner) {
	color: #f56c6c;
}
.courier-select {
	width: 200px;
}
.download-row {
	margin: 4px 0 16px;
}
.download-row a {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	color: #409eff;
	text-decoration: none;
}
.download-row a:hover {
	text-decoration: underline;
}
.red {
	color: #f56c6c;
}
.check-icon {
	color: #2ba745;
	font-size: 20px;
}
@media (max-width: 768px) {
	.courier-select,
	.file-name {
		width: 100%;
	}
}
</style>