<template>
	<div class="control">
		<div class="content import">
			<div>
				<div class="header_left">
					<div class="select_box">
						<el-select
							v-model="value"
							class="m-4 import_select"
							:placeholder="t('pages.servertype') || '服务类型'"
							size="large"
						>
							<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
						<span :class="req ? 'req_block' : 'req_none'">
							{{ t('pages.Required') || '必填项,请填写' }}
						</span>
					</div>
					<div class="upload mt">
						<div class="input-group">
							<div class="custom-file">
								<input
									id="ParcelImport_File"
									ref="ipt"
									accept=".xls,.xlsx"
									class="custom-file-input"
									name="Input.File"
									type="file"
									@change="onFilePick"
								>
								<label
									:class="isCyan ? 'custom-file-label cyans' : 'custom-file-label'"
									for="ParcelImport_File"
								>{{ filename || t('pages.placechoose') }}</label>
							</div>
							<button class="input_btn" @click="onUploadClick">
								<el-icon><UploadFilled /></el-icon>
							</button>
						</div>
					</div>
					<el-row class="mb-4">
						<el-button
							type="success"
							class="import_btn"
							:loading="loading"
							@click="submit"
						>
							{{ t('pages.Import') || '批量导入' }}
						</el-button>
					</el-row>
				</div>
				<div class="download font_18">
					<a href="/templates/Parcel_Template.xlsx">
						<el-icon><Download /></el-icon>
						{{ t('pages.Download') || '下载模板' }}
					</a>
				</div>
				<div style="width: 100%">
					<el-table
						:data="columns"
						style="width: 100%; margin-bottom: 15px"
						size="small"
					>
						<el-table-column :label="t('pages.ColumnName') || '列名'">
							<template #default="scope">
								<span class="red">{{ scope.row.columnsname }}</span>
							</template>
						</el-table-column>
						<el-table-column
							property="required"
							:label="t('pages.Requiredtrue') || '是否必填'"
						>
							<template #default="scope">
								<div :class="scope.row.required ? 'display' : 'none'">
									<el-icon class="check-icon"><CircleCheck /></el-icon>
								</div>
							</template>
						</el-table-column>
						<el-table-column
							property="desc"
							:label="t('pages.Description') || '描述'"
						/>
						<el-table-column
							property="sl"
							:label="t('pages.Example') || '示例'"
						/>
						<template #empty>
							<el-empty :description="t('pages.NoData') || '暂无数据'" />
						</template>
					</el-table>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="parcel-import">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Download, UploadFilled, CircleCheck } from '@element-plus/icons-vue';
import { getservices, parcelImportfile } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const router = useRouter();
const { t } = useI18n();

interface ColumnItem {
	columnsname: string;
	required: boolean;
	desc: string;
	sl: string;
}

interface SvcItem {
	id: number | string;
	name: string;
	svcEntryID?: number | string;
}

const ipt = ref<HTMLInputElement | null>(null);
const isCyan = ref(false);
const updateFile = ref<FormData | null>(null);
const filename = ref('');
const loading = ref(false);

const value = ref(0);
const entry = ref(0);
const req = ref(false);

const options = ref<{ value: number; label: string; entry: number }[]>([]);

watch(value, (newValue) => {
	req.value = !(newValue * 1);
	options.value.forEach((item) => {
		if (item.value === newValue) entry.value = item.entry;
	});
});

watch(filename, () => {
	if (filename.value) isCyan.value = false;
});

const getserviceslist = async () => {
	options.value = [
		{
			value: 0,
			label: `~ ${t('pages.servertype') || '服务类型'} ~`,
			entry: 0,
		},
	];
	const res: ApiResponse<SvcItem[]> = await getservices();
	if (res?.isSuccess && Array.isArray(res.result)) {
		res.result.forEach((item) => {
			options.value.push({
				value: Number(item.id),
				label: item.name,
				entry: Number(item.svcEntryID ?? 0),
			});
		});
	}
};

const submit = async () => {
	if (!filename.value) isCyan.value = true;
	if (!value.value) {
		ElMessage.error(t('pages.Serviceisrequired') || '服务是必填项');
		return;
	}
	if (!updateFile.value) return;
	loading.value = true;
	updateFile.value.append('RootSvcID', String(value.value));
	updateFile.value.append('SvcEntry', String(entry.value));
	const res: ApiResponse<{ fileId: string }> = await parcelImportfile(updateFile.value);
	loading.value = false;
	if (res?.isSuccess) {
		filename.value = '';
		updateFile.value = new FormData();
		router.push({
			path: '/Parcels/Import/Preview',
			query: { fileid: res.result?.fileId ?? '' },
		});
	} else {
		ElMessage.error(res?.message || t('pages.Failed') || '失败');
	}
};

const onUploadClick = () => {
	if (!filename.value) isCyan.value = true;
};

const onFilePick = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;
	filename.value = file.name;
	const form = new FormData();
	form.append('file', file);
	updateFile.value = form;
	target.value = '';
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
	getserviceslist();
});
</script>

<style lang="scss" scoped>
.control {
	width: 100%;
}
.content {
	min-height: calc(100vh - 60px - 60px - 60px);
	background-color: #ffffff;
}
.import {
	padding-top: 15px;
	padding-right: 25px;
	padding-left: 25px;

	.red {
		color: #e0355d;
	}

	.download {
		margin-top: 30px;
		margin-bottom: 12px;
		padding-right: 35px;
		text-align: right;

		a {
			color: #007bff;
			text-decoration: none;
			display: inline-flex;
			align-items: center;
			gap: 4px;
		}
	}
}
.header_left {
	display: flex;
	flex-wrap: wrap;
	align-items: center;

	.select_box {
		position: relative;
		flex: 0 0 30%;
		margin-right: 30px;
		min-width: 240px;

		.import_select {
			width: 100%;
		}
	}

	.upload {
		flex: 0 0 30%;
		margin-right: 25px;
		min-width: 240px;
	}
}
.req_block {
	position: absolute;
	top: 100%;
	left: 0;
	display: block;
	color: #dc3747;
	font-size: 12px;
}
.req_none {
	display: none;
}
.input-group {
	position: relative;
	display: flex;
	align-items: stretch;
	width: 100%;
	height: 40px;
	margin-left: 0;
	border-top-left-radius: 8px;

	.custom-file {
		position: relative;
		flex: 1 1 0%;
		min-width: 0;
		margin-bottom: 0;
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
		cursor: pointer;
	}

	.custom-file-label {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 1;
		height: 100%;
		padding: 0;
		color: #495057;
		font-size: 15px;
		line-height: 38px;
		text-indent: 1em;
		border: 1px solid #ced4da;
		border-right: transparent;
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
		background-color: #fff;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.input_btn {
		padding: 0 12px;
		border: 1px solid #ced4da;
		border-left: 1px solid #ced4da;
		border-radius: 0 5px 5px 0;
		background: #fff;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.input_btn:hover,
	.input_btn:active {
		background-color: #e9ecef;
		border: 1px solid #ced4da;
	}
}
.import_btn {
	height: 40px;
	margin-right: 25px;
	margin-left: 0;
}
.mb-4 {
	margin-bottom: 16px;
}
.mt {
	margin-top: 0;
}
.cyans {
	border-color: #80bdff !important;
}
.display {
	display: block;
}
.none {
	display: none;
}
.check-icon {
	color: #2ba745;
	font-size: 20px;
}
.font_18 {
	font-size: 18px !important;
}
</style>