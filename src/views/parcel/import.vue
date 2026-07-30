<template>
	<div class="parcel-import">
		<el-page-header :icon="ArrowLeft" @back="goBack">
			<template #content>
				<span class="page-title">{{ t('title.ParcelImport') || '包裹 - 批量导入' }}</span>
			</template>
		</el-page-header>

		<el-card shadow="never" class="content-card">
			<div class="upload-row">
				<el-select
					v-model="svcId"
					class="svc-select"
					:placeholder="t('pages.servertype') || '服务类型'"
				>
					<el-option
						v-for="item in svcOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
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
				<el-button
					type="success"
					:loading="submitting"
					:disabled="!file"
					@click="submitImport"
				>
					{{ t('pages.Import') || '批量导入' }}
				</el-button>
				<el-button v-if="fileId" @click="reset">
					{{ t('pages.Reset') || '重置' }}
				</el-button>
			</div>
			<div class="download-row">
				<a href="/templates/Parcel_Template.xlsx" download>
					<el-icon><Download /></el-icon>
					<span>{{ t('pages.Download') || '下载模板' }}</span>
				</a>
			</div>

			<!-- 导入结果预览 -->
			<div v-if="fileId" class="preview">
				<div class="preview-head">
					<h3 class="summary">
						{{ t('pages.Total') || '总计' }}: {{ summary.sum }}
						<span class="ok">{{ t('pages.Success') || '成功' }}: {{ summary.success }}</span>
						<span class="fail">{{ t('pages.Failed') || '失败' }}: {{ summary.error }}</span>
					</h3>
					<div class="preview-actions">
						<el-button type="warning" :loading="confirming" @click="confirmImport">
							{{ t('pages.CfmImport') || '确认导入' }}
						</el-button>
					</div>
				</div>

				<el-table
					v-loading="previewLoading"
					:data="previewList"
					style="width: 100%"
					border
					size="small"
				>
					<el-table-column type="index" width="50" />
					<el-table-column :label="t('pages.Errors') || '错误信息'" min-width="180">
						<template #default="scope">
							<span class="fail">{{ scope.row.error }}</span>
						</template>
					</el-table-column>
					<el-table-column
						property="orderNbr"
						:label="t('pages.lastorder') || '订单 #'"
						min-width="150"
					/>
					<el-table-column :label="t('pages.Weight') || '重量'" width="100">
						<template #default="scope">
							<span>{{ scope.row.weight?.value }}{{ scope.row.weight?.unit }}</span>
						</template>
					</el-table-column>
					<el-table-column
						property="shipper.name"
						:label="t('pages.parcel_import.Shipper') || '寄件人'"
						min-width="130"
					/>
					<el-table-column
						:label="t('pages.parcel_import.Consigne') || '收件人'"
						min-width="140"
					>
						<template #default="scope">
							<div>
								<p>{{ scope.row.consignee?.name }}</p>
								<p>{{ scope.row.consignee?.phone }}</p>
							</div>
						</template>
					</el-table-column>
					<el-table-column
						property="consignee.province"
						:label="t('pages.parcel_import.AddresseeState') || '收件省/州'"
						width="120"
					/>
					<el-table-column
						property="consignee.city"
						:label="t('pages.parcel_import.AddresseeCity') || '收件城市'"
						width="120"
					/>
					<el-table-column
						:label="t('pages.parcel_import.AddresseePostalCode') || '收件邮编'"
						width="110"
					>
						<template #default="scope">
							<div>
								<p>{{ scope.row.consignee?.postalCode }}</p>
								<p>{{ scope.row.consignee?.countryCode }}</p>
							</div>
						</template>
					</el-table-column>
					<el-table-column
						property="consignee.street1"
						:label="t('pages.parcel_import.AddresseeStreetLine1') || '收件地址栏一'"
						min-width="180"
					/>
					<template #empty>
						<el-empty :description="t('pages.NoData') || '暂无数据'" />
					</template>
				</el-table>
			</div>

			<!-- 模板列说明 -->
			<el-table v-else :data="columns" style="width: 100%" border size="small">
				<el-table-column :label="t('pages.ColumnName') || '列名'" min-width="160">
					<template #default="scope">
						<span class="red">{{ scope.row.columnsname }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Requiredtrue') || '是否必填'" width="160">
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

<script setup lang="ts" name="parcel-import">
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, type UploadFile } from 'element-plus';
import {
	ArrowLeft,
	Download,
	CircleCheck,
	UploadFilled,
} from '@element-plus/icons-vue';
import {
	getservices,
	parcelImportfile,
	parcelDetailImport,
	parcelCfmImport,
} from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const router = useRouter();
const { t } = useI18n();

interface SvcOption {
	value: number | string;
	label: string;
	entry: number | string;
}

interface ColumnItem {
	columnsname: string;
	required: boolean;
	desc: string;
	sl: string;
}

interface PreviewRow extends Record<string, any> {
	error?: string;
	orderNbr?: string;
	weight?: { value?: number | string; unit?: string };
	shipper?: Record<string, any>;
	consignee?: Record<string, any>;
}

const file = ref<File | null>(null);
const filename = ref('');
const isError = ref(false);
const submitting = ref(false);
const confirming = ref(false);
const previewLoading = ref(false);

const svcId = ref<number | string>(0);
const svcEntry = ref<number | string>(0);
const svcOptions = ref<SvcOption[]>([]);

const fileId = ref('');
const previewList = ref<PreviewRow[]>([]);
const summary = reactive({ sum: 0, success: 0, error: 0 });

watch(svcId, (val) => {
	const hit = svcOptions.value.find((item) => item.value === val);
	svcEntry.value = hit?.entry ?? 0;
});

watch(filename, (val) => {
	if (val) isError.value = false;
});

const fetchServices = async () => {
	const base: SvcOption = {
		value: 0,
		label: `~ ${t('pages.servertype') || '服务类型'} ~`,
		entry: 0,
	};
	svcOptions.value = [base];
	const res: ApiResponse<any[]> = await getservices();
	if (res?.isSuccess && Array.isArray(res.result)) {
		svcOptions.value = [
			base,
			...res.result.map((item: any) => ({
				value: item.id,
				label: item.name,
				entry: item.svcEntryID,
			})),
		];
	}
};

const onFileChange = (uploadFile: UploadFile) => {
	if (!uploadFile.raw) return;
	file.value = uploadFile.raw;
	filename.value = uploadFile.name;
};

const loadPreview = async (id: string) => {
	previewLoading.value = true;
	try {
		const res: ApiResponse<PreviewRow[]> = await parcelDetailImport(id);
		if (res?.isSuccess && Array.isArray(res.result)) {
			previewList.value = res.result;
			summary.sum = res.result.length;
			summary.error = res.result.filter((item) => item.error).length;
			summary.success = summary.sum - summary.error;
		} else {
			ElMessage.error(res?.message || t('pages.Failed') || '失败');
		}
	} finally {
		previewLoading.value = false;
	}
};

const submitImport = async () => {
	if (!file.value) {
		isError.value = true;
		ElMessage.warning(t('pages.placechoose') || '请选择文件');
		return;
	}
	if (!Number(svcId.value)) {
		ElMessage.error(t('pages.Serviceisrequired') || '服务是必填项');
		return;
	}
	submitting.value = true;
	try {
		const form = new FormData();
		form.append('file', file.value);
		form.append('RootSvcID', String(svcId.value));
		form.append('SvcEntry', String(svcEntry.value));
		const res: ApiResponse<any> = await parcelImportfile(form);
		if (res?.isSuccess && res.result?.fileId) {
			fileId.value = String(res.result.fileId);
			await loadPreview(fileId.value);
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
		const res: ApiResponse<any> = await parcelCfmImport(fileId.value);
		if (res?.isSuccess) {
			ElMessage.success(res.message || t('pages.Success') || '成功');
			reset();
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
	file.value = null;
	filename.value = '';
	fileId.value = '';
	previewList.value = [];
	summary.sum = 0;
	summary.success = 0;
	summary.error = 0;
	svcId.value = 0;
};

const goBack = () => {
	router.push('/parcel/list');
};

const columns = ref<ColumnItem[]>([
	{ columnsname: 'Order #', required: false, desc: t('pages.parcel_import.Order'), sl: '9274890986238402794805' },
	{ columnsname: 'First Miler #', required: false, desc: t('pages.parcel_import.FirstMiler'), sl: '4005689786238555' },
	{ columnsname: 'Item Name', required: false, desc: t('pages.parcel_import.ItemName'), sl: 'Macbook Pro' },
	{ columnsname: 'Item Local Name', required: false, desc: t('pages.parcel_import.ItemLocalName'), sl: '苹果笔记本' },
	{ columnsname: 'Item Brand', required: false, desc: t('pages.parcel_import.ItemBrand'), sl: 'Apple' },
	{ columnsname: 'Item Model', required: false, desc: t('pages.parcel_import.ItemModel'), sl: 'MR942CH/A' },
	{ columnsname: 'Item Spec', required: false, desc: t('pages.parcel_import.ItemSpec'), sl: '13Inch, TouchBar' },
	{ columnsname: 'Item Sku', required: false, desc: t('pages.parcel_import.ItemSku'), sl: '' },
	{ columnsname: 'Item HSCode', required: false, desc: t('pages.parcel_import.ItemHSCode'), sl: '165390' },
	{ columnsname: 'Item Quantity', required: false, desc: t('pages.parcel_import.ItemQuantity'), sl: '10' },
	{ columnsname: 'Line Total', required: false, desc: t('pages.parcel_import.LineTotal'), sl: '17900.00' },
	{ columnsname: 'Currency', required: false, desc: t('pages.parcel_import.CurrencymustbeaThreelettercode'), sl: 'CNY' },
	{ columnsname: 'Weight', required: false, desc: t('pages.parcel_import.ParcelWeight'), sl: '2000' },
	{ columnsname: 'Weight Unit', required: false, desc: t('pages.parcel_import.WeightUnit'), sl: 'kg' },
	{ columnsname: 'Length', required: false, desc: t('pages.parcel_import.ParcelLength'), sl: '30' },
	{ columnsname: 'Width', required: false, desc: t('pages.parcel_import.ParcelWidth'), sl: '25' },
	{ columnsname: 'Height', required: false, desc: t('pages.parcel_import.ParcelHeigth'), sl: '10' },
	{ columnsname: 'Dimension Unit', required: false, desc: t('pages.parcel_import.DimensionUnit'), sl: 'cm' },
	{ columnsname: 'Shipper Name', required: false, desc: t('pages.parcel_import.ShipperName'), sl: '' },
	{ columnsname: 'Shipper Phone', required: false, desc: t('pages.parcel_import.ShipperPhone'), sl: '021-88888888' },
	{ columnsname: 'Shipper Street Line1', required: false, desc: t('pages.parcel_import.ShipperStreetLine1'), sl: 'RM 101，No. 123 Pingxing Rd' },
	{ columnsname: 'Shipper Street Line2', required: false, desc: t('pages.parcel_import.ShipperStreetLine2'), sl: '' },
	{ columnsname: 'Shipper Street Line3', required: false, desc: t('pages.parcel_import.ShipperStreetLine3'), sl: '' },
	{ columnsname: 'Shipper District', required: false, desc: t('pages.parcel_import.ShipperDistrict'), sl: 'JingAn District' },
	{ columnsname: 'Shipper City', required: false, desc: t('pages.parcel_import.ShipperCity'), sl: 'Shanghai' },
	{ columnsname: 'Shipper Province', required: false, desc: t('pages.parcel_import.ShipperState'), sl: 'Shanghai' },
	{ columnsname: 'Shipper PostalCode', required: false, desc: t('pages.parcel_import.ShipperPostalCode'), sl: '200040' },
	{ columnsname: 'Shipper CountryCode', required: false, desc: t('pages.parcel_import.ShipperCountry'), sl: 'CN' },
	{ columnsname: 'Consignee Name', required: false, desc: t('pages.parcel_import.ConsigneName'), sl: 'X-Man' },
	{ columnsname: 'Consignee Phone', required: false, desc: t('pages.parcel_import.ConsigneePhone'), sl: '123-456-7890' },
	{ columnsname: 'Consignee Street Line1', required: false, desc: t('pages.parcel_import.ConsigneeStreetLine1'), sl: '12345 Business Oneway' },
	{ columnsname: 'Consignee Street Line2', required: false, desc: t('pages.parcel_import.ConsigneeStreetLine2'), sl: '' },
	{ columnsname: 'Consignee Street Line3', required: false, desc: t('pages.parcel_import.ConsigneeStreetLine3'), sl: '' },
	{ columnsname: 'Consignee District', required: false, desc: t('pages.parcel_import.ConsigneeDistrict1'), sl: '' },
	{ columnsname: 'Consignee City', required: false, desc: t('pages.parcel_import.ConsigneeCity'), sl: 'City Of Industry' },
	{ columnsname: 'Consignee Province', required: false, desc: t('pages.parcel_import.ConsigneeState'), sl: 'CA' },
	{ columnsname: 'Consignee PostalCode', required: false, desc: t('pages.parcel_import.ConsigneePostalCode'), sl: '91789' },
	{ columnsname: 'Consignee CountryCode', required: false, desc: t('pages.parcel_import.ConsigneeID'), sl: 'US' },
	{ columnsname: 'Consignee ID Card #', required: false, desc: t('pages.parcel_import.ConsigneeDistrict'), sl: '329123197812124788' },
	{ columnsname: 'Distribution Information', required: false, desc: t('pages.parcel_import.DistributionInformation'), sl: '72 BJCA' },
	{ columnsname: 'Parcel Count', required: false, desc: t('pages.parcel_import.ParcelCount'), sl: '2' },
]);

onMounted(() => {
	fetchServices();
});
</script>

<style lang="scss" scoped>
.parcel-import {
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
.upload-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
	margin-bottom: 12px;
}
.svc-select {
	width: 240px;
}
.upload-inline {
	flex: 1;
	min-width: 240px;
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
.preview-head {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}
.summary {
	font-size: 16px;
	font-weight: 500;
	margin: 0;
	display: flex;
	gap: 16px;
	align-items: center;
}
.preview-actions {
	display: flex;
	gap: 8px;
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
	.svc-select,
	.upload-inline {
		width: 100%;
	}
}
</style>
