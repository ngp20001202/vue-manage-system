<template>
	<div class="parcel-preview">
		<el-card shadow="never" class="content-card">
			<div class="head-row">
				<h3 class="summary">
					{{ t('pages.Total') || '总计' }}: {{ summary.sum }}
					<span class="ok">{{ t('pages.Success') || '成功' }}: {{ summary.success }}</span>
					<span class="fail">{{ t('pages.Failed') || '失败' }}: {{ summary.error }}</span>
				</h3>
				<div class="actions">
					<el-button
						v-if="summary.error"
						type="danger"
						:loading="exporting"
						@click="exportErrors"
					>
						{{ t('pages.ExportError') || '导出错误信息' }}
					</el-button>
					<el-button type="warning" :loading="confirming" @click="confirmImport">
						{{ t('pages.CfmImport') || '确认导入' }}
					</el-button>
				</div>
			</div>

			<el-table
				v-loading="loading"
				:data="previewList"
				style="width: 100%"
				border
				size="small"
			>
				<el-table-column type="index" width="50" />
				<el-table-column :label="t('pages.Errors') || '错误信息'" min-width="200">
					<template #default="scope">
						<span class="fail">{{ scope.row.error }}</span>
					</template>
				</el-table-column>
				<el-table-column
					property="orderNbr"
					:label="t('pages.lastorder') || '订单 #'"
					min-width="160"
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
		</el-card>
	</div>
</template>

<script setup lang="ts" name="parcel-previewPage">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';
import moment from 'moment';
import {
	parcelDetailImport,
	parcelExportImport,
	parcelCfmImport,
} from '@/api/parcel';
import { filenames } from '@/utils/filename';
import type { ApiResponse } from '@/api/types';

interface PreviewRow extends Record<string, any> {
	error?: string;
	orderNbr?: string;
	weight?: { value?: number | string; unit?: string };
	shipper?: Record<string, any>;
	consignee?: Record<string, any>;
}

const route = useRoute();
const { t } = useI18n();

const fileId = ref('');
const previewList = ref<PreviewRow[]>([]);
const summary = reactive({ sum: 0, success: 0, error: 0 });
const loading = ref(false);
const exporting = ref(false);
const confirming = ref(false);

const getDetail = async (id: string) => {
	if (!id) return;
	loading.value = true;
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
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed') || '失败');
	} finally {
		loading.value = false;
	}
};

const exportErrors = async () => {
	if (!fileId.value) return;
	exporting.value = true;
	try {
		const res: any = await parcelExportImport(fileId.value);
		const blob: Blob = res?.data ?? res;
		const name =
			filenames(res) || `parcel_import_errors_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
		saveAs(blob, name);
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed') || '失败');
	} finally {
		exporting.value = false;
	}
};

const confirmImport = async () => {
	if (!fileId.value) return;
	confirming.value = true;
	try {
		const res: ApiResponse<any> = await parcelCfmImport(fileId.value);
		if (res?.isSuccess) {
			ElMessage.success(res.message || t('pages.Success') || '成功');
		} else {
			ElMessage.error(res?.message || t('pages.Failed') || '失败');
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed') || '失败');
	} finally {
		confirming.value = false;
	}
};

onMounted(() => {
	fileId.value = (route.query.fileid as string) || '';
	getDetail(fileId.value);
});
</script>

<style lang="scss" scoped>
.parcel-preview {
	padding: 12px;
}
.content-card {
	background: #fff;
}
.head-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	margin-bottom: 12px;
}
.summary {
	margin: 0;
	font-size: 16px;
	display: flex;
	gap: 20px;
	align-items: center;
}
.ok {
	color: #67c23a;
}
.fail {
	color: #f56c6c;
}
.actions {
	display: flex;
	gap: 8px;
}
</style>
