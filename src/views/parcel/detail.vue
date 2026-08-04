<template>
	<el-dialog
		v-model="status"
		:title="t('pages.Parcels.list.detail.detail') + id"
		width="860px"
		:before-close="handleClose"
	>
		<div v-loading="loading" class="parcel-detail">
			<el-row :gutter="16">
				<el-col :xs="24" :md="12">
					<dl class="detail-row">
						<dt>{{ t('pages.Parcels.list.detail.mic') }}</dt>
						<dd>{{ order.mic }}</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.Parcels.list.detail.lastmiler') }}</dt>
						<dd>
							<span class="text-warning">
								{{ order.lastMilerNbr || '## Master ##' }}
							</span>
						</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.Parcels.list.order') }}</dt>
						<dd>{{ order.clientRefNbr }}</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.Parcels.list.detail.sack') }}</dt>
						<dd>{{ order.sackNbr }}</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.MawbMbl') }}</dt>
						<dd>{{ order.mawbNbr }}</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.FlightVessel') }}</dt>
						<dd>{{ order.flightNbr }}</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.IsSign') }}</dt>
						<dd>{{ order.signature ? t('pages.yes') : t('pages.no') }}</dd>
					</dl>
				</el-col>
				<el-col :xs="24" :md="12">
					<dl class="detail-row">
						<dt>{{ t('pages.servertype') }}</dt>
						<dd>{{ order.svcName }}</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.Stage') }}</dt>
						<dd>
							{{ order.stageText || order.stage }}
							<span v-if="order?.postedStamp?.utcTime" class="muted">
								({{ formatTime(order.postedStamp.utcTime) }})
							</span>
						</dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.Weight') }}</dt>
						<dd v-html="order.weightText"></dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.Parcels.list.detail.dimension') }}</dt>
						<dd v-html="order.dimensionText"></dd>
					</dl>
					<dl class="detail-row">
						<dt>{{ t('pages.PostedOn') }}</dt>
						<dd>{{ formatTime(order?.postedStamp?.utcTime) }}</dd>
					</dl>
				</el-col>
			</el-row>

			<hr />

			<el-row :gutter="16">
				<el-col :xs="24" :md="12">
					<h4>{{ t('pages.Shipper') }}</h4>
					<div class="addr-line">
						<span class="mr-2">{{ order?.shipper?.name }}</span>
						<span>{{ order?.shipper?.phone }}</span>
					</div>
					<div class="addr-block">
						<div>{{ order?.shipper?.addressLine1 }}</div>
						<div>{{ order?.shipper?.addressLine2 }}</div>
						<div>{{ order?.shipper?.addressLine3 }}</div>
						<div>{{ order?.shipper?.countryCode }}</div>
					</div>
				</el-col>
				<el-col :xs="24" :md="12">
					<h4>{{ t('pages.Consignee') }}</h4>
					<div class="addr-line">
						<span class="mr-2">{{ order?.consignee?.name }}</span>
						<span>{{ order?.consignee?.phone }}</span>
					</div>
					<div class="addr-block">
						<div>{{ order?.consignee?.addressLine1 }}</div>
						<div>{{ order?.consignee?.addressLine2 }}</div>
						<div>{{ order?.consignee?.addressLine3 }}</div>
						<div>{{ order?.consignee?.countryCode }}</div>
					</div>
				</el-col>
			</el-row>

			<hr />

			<div v-if="lineInfos.length">
				<div class="section-head">
					<h4>{{ t('pages.DeclaredInformation') }}</h4>
					<dl class="inline-dl">
						<dt>{{ t('pages.GrandTotal') }}:</dt>
						<dd>{{ totals[0] }} {{ unit }}</dd>
					</dl>
					<dl class="inline-dl">
						<dt>{{ t('pages.TotalQty') }}:</dt>
						<dd>{{ totals[1] }}</dd>
					</dl>
				</div>
				<el-table :data="lineInfos" border size="small" style="width: 100%">
					<el-table-column :label="t('pages.Name1')" prop="goodsInfo.name" />
					<el-table-column :label="t('pages.LineTotal')">
						<template #default="scope">
							{{ scope.row.lineTotal?.value }}{{ scope.row.lineTotal?.unit }}
						</template>
					</el-table-column>
					<el-table-column :label="t('pages.Quantity')" prop="quantity" />
					<el-table-column :label="t('pages.Parcels.list.detail.hscode')" prop="goodsInfo.hsCode" />
				</el-table>
			</div>

			<div>
				<h4>{{ t('pages.Parcels.detail.Ledger') }}</h4>
				<el-table :data="order.ledgers || []" border size="small" style="width: 100%">
					<el-table-column :label="t('pages.Parcels.detail.ChargeItem')">
						<template #default="scope">
							{{ formatChargeItem(scope.row?.chargeID) }}
						</template>
					</el-table-column>
					<el-table-column :label="t('pages.Parcels.detail.LedgerSide')" prop="ledgerSide" />
					<el-table-column :label="t('pages.Parcels.detail.ChargeAmount')">
						<template #default="scope">
							{{ scope.row?.chargeAmt?.value }}{{ scope.row?.chargeAmt?.unit }}
						</template>
					</el-table-column>
					<el-table-column :label="t('pages.Parcels.detail.TalliedOn')">
						<template #default="scope">
							{{ formatTime(scope.row?.talliedOn) }}
						</template>
					</el-table-column>
				</el-table>
			</div>

			<div v-if="mps_data.length">
				<div class="section-head">
					<h4>{{ t('pages.ParcelList') }}</h4>
					<el-tooltip :content="t('pages.Export')" placement="top" :enterable="false">
						<el-button type="success" size="small" class="export-green" @click="exportmps">
							<el-icon><Upload /></el-icon>
							{{ t('pages.Export') }}
						</el-button>
					</el-tooltip>
				</div>
				<p class="muted">第一个是主单号</p>
				<el-table
					ref="multipleTableRef"
					:data="mps_data"
					show-summary
					:summary-method="getSummaries"
					border
					size="small"
					style="width: 100%"
				>
					<el-table-column
						property="clientRefNbr"
						:label="t('pages.Parcels.list.order')"
					/>
					<el-table-column
						property="lastMilerNbr"
						:label="t('pages.Parcels.list.lastmiler')"
					/>
					<el-table-column :label="t('pages.Weight')">
						<template #default="scope">
							{{ scope.row.weight?.value }} {{ scope.row.weight?.unit }}
						</template>
					</el-table-column>
					<el-table-column :label="t('pages.Parcels.list.detail.dimension')">
						<template #default="scope">
							{{ scope.row.dimension?.length }}X{{ scope.row.dimension?.width }}X{{ scope.row.dimension?.height }}
							{{ scope.row.dimension?.unit }}
						</template>
					</el-table-column>
					<el-table-column align="center">
						<template #header>
							<el-icon><Setting /></el-icon>
						</template>
						<template #default="scope">
							<div v-if="scope.row.lastMilerNbr">
								<el-button
									type="success"
									size="small"
									class="download-green"
									@click="() => downloadDetail(scope.row.id)"
								>
									{{ t('pages.downloadlabel') }}
								</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Setting, Upload } from '@element-plus/icons-vue';
import moment from 'moment';
import { saveAs } from 'file-saver';
import {
	parcellistdetail,
	parcellistdetailmps,
	downloaddetaillabel,
	mpsexport,
	parcelstage,
} from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import { formatChargeItem } from '@/utils/charge-item';

const props = defineProps<{
	id: string;
}>();

const emit = defineEmits<{
	(e: 'changestatus'): void;
}>();

const { t } = useI18n();
const status = ref(false);
const loading = ref(false);
const order = ref<any>({});
const lineInfos = ref<any[]>([]);
const mps_data = ref<any[]>([]);
const stagelist = ref<any[]>([]);
const unit = ref('');
const totals = ref<[number, number]>([0, 0]);

const formatTime = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm');
};

const getSummaries = (param: { columns: any[]; data: any[] }) => {
	const { columns, data } = param;
	const sums: (string | number)[] = [];
	columns.forEach((column, index) => {
		if (index === 0) {
			sums[index] = '合计';
			return;
		}
		if (index === 2) {
			sums[2] = data
				.reduce((prev: number, curr: any) => {
					if (curr.weight?.value) return prev + Number(curr.weight.value);
					return prev;
				}, 0)
				.toFixed(3);
		} else {
			sums[index] = '';
		}
	});
	return sums;
};

const reduce = (res: any) => {
	totals.value = (res.lineInfos ? res.lineInfos : []).reduce(
		(prev: [number, number], cur: any) => [
			prev[0] + Number(cur.lineTotal?.value ?? 0),
			prev[1] + Number(cur.quantity ?? 0),
		],
		[0, 0],
	);
};

const disposeStage = () => {
	stagelist.value.forEach((item: any) => {
		if (item.value == order.value.stage || item.value === order.value.stage) {
			order.value.stage = item.text;
		}
	});
};

const loadStage = async () => {
	try {
		const res: ApiResponse<any[]> = await parcelstage();
		if (res?.isSuccess && Array.isArray(res.result)) {
			stagelist.value = res.result;
			disposeStage();
		}
	} catch {
		// noop
	}
};

const loadMps = async () => {
	const res: ApiResponse<any> = await parcellistdetailmps({ id: props.id });
	if (res?.isSuccess) {
		mps_data.value = res.result ?? [];
	}
};

const loadDetail = async () => {
	loading.value = true;
	try {
		const res: ApiResponse<any> = await parcellistdetail({ id: props.id });
		if (res?.isSuccess) {
			order.value = res.result || {};
			lineInfos.value = res.result?.lineInfos ?? [];
			unit.value = res.result?.lineInfos?.[0]?.lineTotal?.unit ?? '';
			reduce(res.result || {});
			if (res.result?.subtype != null && res.result.subtype !== 0) {
				loadMps();
			} else {
				mps_data.value = [];
			}
			await loadStage();
		}
	} finally {
		loading.value = false;
	}
};

const downloadDetail = async (id: string | number) => {
	const res: ApiResponse<any> = await downloaddetaillabel(String(id));
	if (res?.isSuccess && res.result) {
		const a = document.createElement('a');
		a.target = '_blank';
		a.href = res.result;
		a.click();
	}
};

const exportmps = async () => {
	try {
		const blob: any = await mpsexport(props.id);
		const filename = `mps_${props.id}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
		saveAs(blob, filename);
		ElMessage.success(t('pages.Success'));
	} catch {
		ElMessage.error(t('pages.Failed'));
	}
};

watch(
	() => props.id,
	(newId) => {
		if (newId) {
			status.value = true;
			order.value = {};
			lineInfos.value = [];
			mps_data.value = [];
			loadDetail();
		}
	},
	{ immediate: true },
);

const handleClose = () => {
	status.value = false;
	emit('changestatus');
};
</script>

<style lang="scss" scoped>
.parcel-detail {
	padding: 0 8px;
}
.detail-row {
	display: flex;
	margin: 0;
	padding: 6px 0;
	border-bottom: 1px dashed #ebeef5;
	dt {
		flex: 0 0 110px;
		color: #606266;
	}
	dd {
		flex: 1;
		margin: 0;
		color: #303133;
		word-break: break-all;
		overflow-wrap: break-word;
	}
}
.text-warning {
	color: #ffc87a;
}
.muted {
	color: #909399;
	font-size: 12px;
}
.mr-2 {
	margin-right: 8px;
}
h4 {
	margin: 12px 0 8px;
	color: #303133;
}
hr {
	border: none;
	border-top: 1px solid #ebeef5;
	margin: 16px 0;
}
.addr-line {
	margin-bottom: 6px;
}
.addr-block div {
	margin-bottom: 4px;
}
.section-head {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 8px;
	flex-wrap: wrap;
}
.section-head h4 {
	margin: 0;
}
.inline-dl {
	display: inline-flex;
	margin: 0 8px 0 0;
	align-items: baseline;
	dt {
		color: #606266;
		margin-right: 4px;
	}
	dd {
		margin: 0;
		font-weight: 500;
	}
}
.download-green {
	background-color: #28a745;
	border-color: #28a745;
	color: #fff;
}
.export-green {
	background-color: #28a745;
	border-color: #28a745;
	color: #fff;
}
</style>