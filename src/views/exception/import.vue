<template>
	<div class="exception-import">
		<el-page-header :icon="ArrowLeft" @back="goBack">
			<template #content>
				<span class="page-title">
					{{ t('title.BrokerRejectionImportParcels') }}
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
				<el-button
					type="success"
					:loading="submitting"
					:disabled="!file"
					@click="submitImport"
				>
					{{ t('pages.Import') }}
				</el-button>
			</div>

			<p class="hint">{{ t('pages.parcel_import.Shipper') }} / {{ t('pages.Parcel') }}</p>

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
				<el-table-column :label="t('pages.Description') || '描述'" min-width="240">
					<template #default="scope">
						<span>{{ scope.row.desc }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Example') || '示例'" min-width="220">
					<template #default="scope">
						<span>{{ scope.row.sl }}</span>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="exception-import">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { ArrowLeft, CircleCheck } from '@element-plus/icons-vue';
import { brokerRejectedImport } from '@/api/rejection';
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
const fileInput = ref<HTMLInputElement | null>(null);

const data = ref<ColumnItem[]>([
	{
		columnsname: 'ID',
		required: true,
		desc: t('pages.Broker_import.ID'),
		sl: '1000001',
	},
	{
		columnsname: 'ClientRefNbr',
		required: false,
		desc: t('pages.parcel_import.Order'),
		sl: '3928243370702',
	},
	{
		columnsname: 'LastMilerNbr',
		required: false,
		desc: 'Last Miler Nbr',
		sl: '9261290980199212034381',
	},
	{
		columnsname: 'CneeName',
		required: false,
		desc: t('pages.parcel_import.ConsigneName'),
		sl: 'Alex Li',
	},
	{
		columnsname: 'CneePhone',
		required: false,
		desc: t('pages.parcel_import.ConsigneePhone'),
		sl: '123-456-7890',
	},
	{
		columnsname: 'CneeEmail',
		required: false,
		desc: t('pages.Broker_import.ConsigneeEmail'),
		sl: 'AlexLi@Clippinger.com',
	},
	{
		columnsname: 'CneeCompany',
		required: false,
		desc: t('pages.Broker_import.ConsigneeCompany'),
		sl: 'Clippinger Chevrolet Oldsmobile',
	},
	{
		columnsname: 'CneeCountryCode',
		required: false,
		desc: t('pages.parcel_import.ConsigneeID'),
		sl: 'US',
	},
	{
		columnsname: 'CneeProvince',
		required: false,
		desc: t('pages.parcel_import.ConsigneeState'),
		sl: 'CA',
	},
	{
		columnsname: 'CneeCity',
		required: false,
		desc: t('pages.parcel_import.ConsigneeCity'),
		sl: 'Covina',
	},
	{
		columnsname: 'CneeDistrict',
		required: false,
		desc: t('pages.parcel_import.ConsigneeDistrict1'),
		sl: '',
	},
	{
		columnsname: 'CneeStreet1',
		required: false,
		desc: t('pages.parcel_import.ConsigneeStreetLine1'),
		sl: '137 W San Bernardino Rd.',
	},
	{
		columnsname: 'CneeStreet2',
		required: false,
		desc: t('pages.parcel_import.ConsigneeStreetLine2'),
		sl: '',
	},
	{
		columnsname: 'CneeStreet3',
		required: false,
		desc: t('pages.parcel_import.ConsigneeStreetLine3'),
		sl: '',
	},
	{
		columnsname: 'CneePostalCode',
		required: false,
		desc: t('pages.parcel_import.ConsigneePostalCode'),
		sl: '91723',
	},
	{
		columnsname: 'ShipperName',
		required: false,
		desc: t('pages.parcel_import.ShipperName'),
		sl: '',
	},
	{
		columnsname: 'ShipperPhone',
		required: false,
		desc: t('pages.parcel_import.ShipperPhone'),
		sl: '021-88888888',
	},
	{
		columnsname: 'ShipperEmail',
		required: false,
		desc: t('pages.Broker_import.ShipperEmail'),
		sl: '88888888@email.com',
	},
	{
		columnsname: 'ShipperCompany',
		required: false,
		desc: t('pages.Broker_import.ShipperCompany'),
		sl: 'aplus',
	},
	{
		columnsname: 'ShipperCountryCode',
		required: false,
		desc: t('pages.parcel_import.ShipperCountry'),
		sl: 'CN',
	},
	{
		columnsname: 'ShipperProvince',
		required: false,
		desc: t('pages.parcel_import.ShipperState'),
		sl: 'Shanghai',
	},
	{
		columnsname: 'ShipperCity',
		required: false,
		desc: t('pages.parcel_import.ShipperCity'),
		sl: 'Shanghai',
	},
	{
		columnsname: 'ShipperDistrict',
		required: false,
		desc: t('pages.parcel_import.ShipperDistrict'),
		sl: 'JingAn District',
	},
	{
		columnsname: 'ShipperStreet1',
		required: false,
		desc: t('pages.parcel_import.ShipperStreetLine1'),
		sl: 'RM 101，No. 123 Pingxing Rd.',
	},
	{
		columnsname: 'ShipperStreet2',
		required: false,
		desc: t('pages.parcel_import.ShipperStreetLine2'),
		sl: '',
	},
	{
		columnsname: 'ShipperStreet3',
		required: false,
		desc: t('pages.parcel_import.ShipperStreetLine3'),
		sl: '',
	},
	{
		columnsname: 'ShipperPostalCode',
		required: false,
		desc: t('pages.parcel_import.ShipperPostalCode'),
		sl: '',
	},
	{
		columnsname: 'Supplement',
		required: false,
		desc: t('pages.parcel_import.Supplement'),
		sl: '200040',
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
		const res: ApiResponse<any> = await brokerRejectedImport(form);
		if (res?.isSuccess) {
			ElMessage.success(res.message || t('pages.Success'));
			router.push('/Exceptions/BrokerRejected');
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
	router.push('/Exceptions/BrokerRejected');
};
</script>

<style lang="scss" scoped>
.exception-import {
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
.hint {
	color: #606266;
	margin: 4px 0 12px;
}
.red {
	color: #f56c6c;
}
.check-icon {
	color: #2ba745;
	font-size: 20px;
}
@media (max-width: 768px) {
	.file-name {
		width: 100%;
	}
}
</style>