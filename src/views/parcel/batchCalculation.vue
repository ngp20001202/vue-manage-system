<template>
	<div class="control">
		<div class="content import">
			<div>
				<div class="header_left">
					<div class="select_box">
						<el-select
							v-model="value"
							class="m-4 import_select"
							:placeholder="t('pages.servertype') || '请选择服务'"
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
									id="BatchCalc_File"
									ref="ipt"
									accept=".xls,.xlsx"
									class="custom-file-input"
									name="Input.File"
									type="file"
									@change="onFilePick"
								>
								<label
									:class="isCyan ? 'custom-file-label cyans' : 'custom-file-label'"
									for="BatchCalc_File"
								>{{ filename || t('pages.placechoose') }}</label>
							</div>
							<button class="input_btn" @click="onUploadClick">
								<el-icon><UploadFilled /></el-icon>
							</button>
						</div>
					</div>
					<el-row>
						<el-button
							type="success"
							class="import_btn"
							:loading="loading"
							@click="submit"
						>
							{{ t('pages.Batchobtainquotes') || '批量获取报价' }}
						</el-button>
					</el-row>
					<el-button v-if="fileId" type="warning" @click="confirmOrder">
						{{ t('pages.Orderconfirmation') || '确认下单' }}
					</el-button>
				</div>
				<div class="download font_18">
					<a href="/templates/Parcel_Template.xlsx">
						<el-icon><Download /></el-icon>
						{{ t('pages.Download') || '下载模板' }}
					</a>
				</div>
				<div style="width: 100%">
					<el-table
						v-loading="loading"
						:data="data"
						style="width: 100%; margin-bottom: 15px"
						size="small"
						:empty-text="t('pages.NoData') || '暂无数据'"
					>
						<el-table-column type="index" width="50" />
						<el-table-column :label="t('pages.Errors')">
							<template #default="scope">
								<span class="size">{{ scope.row.error }}</span>
							</template>
						</el-table-column>
						<el-table-column
							property="orderNbr"
							:label="t('pages.lastorder') || '订单 #'"
						/>
						<el-table-column :label="t('pages.Weight') || '重量'">
							<template #default="scope">
								<span class="size">
									{{ scope.row.weight?.value }}{{ scope.row.weight?.unit }}
								</span>
							</template>
						</el-table-column>
						<el-table-column
							property="shipper.name"
							:label="t('pages.parcel_import.Shipper') || '寄件人'"
						/>
						<el-table-column :label="t('pages.parcel_import.Consigne') || '收件人'">
							<template #default="scope">
								<div>
									<p>{{ scope.row.consignee?.name }}</p>
									<p>{{ scope.row.consignee?.phone }}</p>
								</div>
							</template>
						</el-table-column>
						<el-table-column
							property="consignee.province"
							:label="t('pages.parcel_import.AddresseeState') || '州/省'"
						/>
						<el-table-column
							property="consignee.city"
							:label="t('pages.parcel_import.AddresseeCity') || '城市'"
						/>
						<el-table-column
							property="consignee.postalCode"
							:label="t('pages.parcel_import.AddresseePostalCode') || '邮编'"
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
							:label="t('pages.parcel_import.AddresseeStreetLine1') || '街道'"
						/>
						<el-table-column
							property="totalCharge"
							:label="t('pages.Quote') || '报价'"
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

<script setup lang="ts" name="parcel-batch-calculation">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Download, UploadFilled } from '@element-plus/icons-vue';
import {
	getservices,
	parcelCfmImport,
	parcelrateimport,
	parcelrateCfmImport,
} from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface RateRow {
	error?: string;
	orderNbr?: string;
	weight?: { value?: number | string; unit?: string | number };
	shipper?: { name?: string };
	consignee?: {
		name?: string;
		phone?: string;
		province?: string;
		city?: string;
		postalCode?: string;
		countryCode?: string;
		street1?: string;
	};
	totalCharge?: string | number;
}

const ipt = ref<HTMLInputElement | null>(null);
const isCyan = ref(false);
const fileId = ref('');
const updateFile = ref<FormData | null>(null);
const filename = ref('');
const loading = ref(false);
const data = ref<RateRow[]>([]);

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
	const res: ApiResponse<{ id: number | string; name: string; svcEntryID?: number }[]> =
		await getservices();
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

const confirmimport = async (fileid: string | number) => {
	const res: ApiResponse<RateRow[]> = await parcelrateCfmImport(fileid);
	loading.value = false;
	if (res?.isSuccess) {
		data.value = Array.isArray(res.result) ? res.result : [];
	} else {
		ElMessage.error(res?.message || t('pages.Failed') || '失败');
	}
};

const confirmOrder = async () => {
	const res: ApiResponse = await parcelCfmImport(fileId.value);
	if (res?.isSuccess) {
		ElMessage.success(res.message || t('pages.Success') || '成功');
		value.value = 0;
		filename.value = '';
		updateFile.value = new FormData();
		data.value = [];
	} else {
		ElMessage.error(res?.message || t('pages.Failed') || '失败');
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
	updateFile.value.delete('RootSvcID');
	updateFile.value.delete('SvcEntry');
	updateFile.value.append('RootSvcID', String(value.value));
	updateFile.value.append('SvcEntry', String(entry.value));
	const res: ApiResponse<{ fileId: string }> = await parcelrateimport(updateFile.value);
	if (res?.isSuccess) {
		fileId.value = res.result?.fileId ?? '';
		await confirmimport(fileId.value);
	} else {
		loading.value = false;
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
		flex: 0 0 33%;
		margin-right: 25px;
		min-width: 240px;

		.import_select {
			width: 100%;
		}
	}

	.upload {
		flex: 0 0 33%;
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
		height: 96%;
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
.size {
	font-size: 14px;
}
.size p {
	margin: 0;
	line-height: 1.4;
}
</style>