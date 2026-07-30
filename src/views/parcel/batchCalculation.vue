<template>
	<div class="batch-calculation">
		<el-page-header :icon="ArrowLeft" @back="goBack">
			<template #content>
				<span class="page-title">
					{{ t('title.Batchcalculation') || '包裹 - 批量试算' }}
				</span>
			</template>
		</el-page-header>

		<!-- 寄件人 / 收件人 / 服务 -->
		<el-card shadow="never" class="content-card">
			<el-form :inline="true" class="filter-form" label-position="top">
				<el-form-item :label="t('pages.parcel_import.Shipper') || '寄件人'">
					<el-select
						v-model="shipperId"
						class="wide-select"
						filterable
						:placeholder="t('pages.parcel_import.Shipper') || '寄件人'"
					>
						<el-option
							v-for="item in shipperList"
							:key="item.id"
							:label="addressLabel(item.contact)"
							:value="item.id as string | number"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.parcel_import.Consigne') || '收件人'">
					<el-select
						v-model="cneeIndex"
						class="wide-select"
						filterable
						:placeholder="t('pages.parcel_import.Consigne') || '收件人'"
					>
						<el-option
							v-for="(item, idx) in cneeList"
							:key="item.name ?? idx"
							:label="`${item.name} - ${addressLabel(item.code)}`"
							:value="idx"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.servertype') || '服务类型'">
					<el-select
						v-model="svcIds"
						class="wide-select"
						multiple
						collapse-tags
						collapse-tags-tooltip
						:placeholder="t('pages.servertype') || '服务类型'"
					>
						<el-option
							v-for="item in svcOptions"
							:key="item.id"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.IsSign') || '是否签名'">
					<el-switch v-model="isSign" />
				</el-form-item>
			</el-form>

			<el-descriptions v-if="cnee" :column="2" border size="small" class="cnee-desc">
				<el-descriptions-item :label="t('pages.parcel_import.ConsigneName') || '收件人姓名'">
					{{ cnee.name }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.parcel_import.ConsigneePhone') || '收件人电话'">
					{{ cnee.phone }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.parcel_import.AddresseeStreetLine1') || '收件地址栏一'">
					{{ cnee.street1 }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.parcel_import.AddresseeCity') || '收件城市'">
					{{ cnee.city }} / {{ cnee.province }} / {{ cnee.postalCode }} /
					{{ cnee.countryCode }}
				</el-descriptions-item>
			</el-descriptions>
		</el-card>

		<!-- 包裹明细 -->
		<el-card shadow="never" class="content-card">
			<div class="card-head">
				<span class="card-title">{{ t('pages.Parcel') || '包裹' }}</span>
				<el-button type="primary" plain :icon="Plus" size="small" @click="addRow">
					{{ t('pages.Parcels.create.NewPackage') || '添加包裹' }}
				</el-button>
			</div>

			<el-table :data="parcels" style="width: 100%" border size="small">
				<el-table-column type="index" width="50" />
				<el-table-column :label="t('pages.Weight') || '重量'" min-width="190">
					<template #default="scope">
						<div class="cell-inline">
							<el-input v-model="scope.row.weight" class="num-input" />
							<el-select v-model="scope.row.weightUnit" class="unit-select">
								<el-option
									v-for="item in weightOptions"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								/>
							</el-select>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.parcel_import.ParcelLength') || '包裹长度'" width="110">
					<template #default="scope">
						<el-input v-model="scope.row.length" />
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.parcel_import.ParcelWidth') || '包裹宽度'" width="110">
					<template #default="scope">
						<el-input v-model="scope.row.width" />
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.parcel_import.ParcelHeigth') || '包裹高度'" width="110">
					<template #default="scope">
						<el-input v-model="scope.row.height" />
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.parcel_import.DimensionUnit') || '长度单位'" width="100">
					<template #default="scope">
						<el-select v-model="scope.row.dimUnit" class="unit-select">
							<el-option
								v-for="item in dimOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.parcel_import.ParcelCount') || '包裹数量'" width="110">
					<template #default="scope">
						<el-input v-model="scope.row.count" />
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action') || '操作'" width="90" align="center">
					<template #default="scope">
						<el-button
							type="danger"
							size="small"
							:icon="Delete"
							:disabled="parcels.length === 1"
							@click="removeRow(scope.$index)"
						/>
					</template>
				</el-table-column>
			</el-table>

			<div class="actions">
				<el-button type="success" :loading="rateLoading" @click="calculate">
					{{ t('pages.Batchobtainquotes') || '批量获取报价' }}
				</el-button>
				<el-button @click="reset">{{ t('pages.Reset') || '重置' }}</el-button>
			</div>
		</el-card>

		<!-- 试算结果 -->
		<el-card v-if="rateRows.length" shadow="never" class="content-card">
			<el-table
				v-loading="rateLoading"
				:data="rateRows"
				style="width: 100%"
				border
				size="small"
			>
				<el-table-column type="index" width="50" />
				<el-table-column
					property="name"
					:label="t('pages.servertype') || '服务类型'"
					min-width="180"
				/>
				<el-table-column :label="t('pages.Quote') || '报价'" min-width="150">
					<template #default="scope">
						<span :class="scope.row.show ? 'ok' : 'fail'">{{ scope.row.quote }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.TotalPieces') || '总件数'" width="110">
					<template #default>{{ totalCount }}</template>
				</el-table-column>
				<template #empty>
					<el-empty :description="t('pages.NoData') || '暂无数据'" />
				</template>
			</el-table>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="parcel-batch-calculation">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue';
import { getservices, parcelsender, getAmazon, postrate } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const router = useRouter();
const { t } = useI18n();

interface Contact {
	name?: string;
	phone?: string;
	email?: string;
	company?: string;
	street1?: string;
	street2?: string;
	street3?: string;
	district?: string;
	city?: string;
	province?: string;
	postalCode?: string;
	countryCode?: string;
}

interface AddressItem {
	id?: string | number;
	type?: string | number;
	isDefault?: boolean;
	contact?: Contact;
}

interface AmazonItem {
	name?: string;
	code?: Contact;
}

interface SvcItem {
	id: string | number;
	name: string;
	lastMilerID?: string | number;
}

interface ParcelRow {
	weight: string | number;
	weightUnit: number;
	length: string | number;
	width: string | number;
	height: string | number;
	dimUnit: number;
	count: string | number;
}

interface RateRow {
	id: string | number;
	name: string;
	show: boolean;
	quote: string;
}

const weightOptions = [
	{ label: 'KG', value: 2 },
	{ label: 'LB', value: 3 },
];
const dimOptions = [
	{ label: 'CM', value: 1 },
	{ label: 'IN', value: 2 },
];

const shipperList = ref<AddressItem[]>([]);
const shipperId = ref<string | number | undefined>(undefined);
const cneeList = ref<AmazonItem[]>([]);
const cneeIndex = ref<number | undefined>(undefined);
const svcOptions = ref<SvcItem[]>([]);
const svcIds = ref<Array<string | number>>([]);
const isSign = ref(false);
const rateLoading = ref(false);
const rateRows = ref<RateRow[]>([]);

const newRow = (): ParcelRow => ({
	weight: '',
	weightUnit: 2,
	length: '',
	width: '',
	height: '',
	dimUnit: 1,
	count: 1,
});
const parcels = ref<ParcelRow[]>([newRow()]);

const shipper = computed(
	() => shipperList.value.find((item) => item.id === shipperId.value)?.contact,
);
const cnee = computed(() =>
	cneeIndex.value === undefined ? undefined : cneeList.value[cneeIndex.value]?.code,
);
const totalCount = computed(() =>
	parcels.value.reduce((acc, item) => acc + (Number(item.count) || 0), 0),
);

const addressLabel = (contact?: Contact) => {
	if (!contact) return '';
	return [contact.name, contact.street1, contact.city, contact.province, contact.postalCode]
		.filter(Boolean)
		.join(', ');
};

const addRow = () => {
	parcels.value.push(newRow());
};

const removeRow = (index: number) => {
	if (parcels.value.length === 1) return;
	parcels.value.splice(index, 1);
};

const fetchShippers = async () => {
	const res: ApiResponse<AddressItem[]> = await parcelsender();
	if (res?.isSuccess && Array.isArray(res.result)) {
		const list = res.result.filter(
			(item) => item.type === 'Shipping' || item.type === 2,
		);
		shipperList.value = list;
		const def = list.find((item) => item.isDefault) ?? list[0];
		if (def) shipperId.value = def.id;
	}
};

const fetchCneeList = async () => {
	const res: ApiResponse<AmazonItem[]> = await getAmazon();
	if (res?.isSuccess && Array.isArray(res.result)) {
		cneeList.value = res.result;
	}
};

const fetchServices = async () => {
	const res: ApiResponse<SvcItem[]> = await getservices();
	if (res?.isSuccess && Array.isArray(res.result)) {
		svcOptions.value = res.result;
		svcIds.value = res.result.map((item) => item.id);
	}
};

const buildPackages = () =>
	parcels.value.map((item) => ({
		Count: Number(item.count) || 1,
		Weight: {
			Value: Number(item.weight) || 0,
			Unit: item.weightUnit,
		},
		Dimension: {
			Length: Number(item.length) || 0,
			Width: Number(item.width) || 0,
			Height: Number(item.height) || 0,
			Unit: item.dimUnit,
		},
	}));

const rateForService = async (svc: SvcItem) => {
	try {
		const res: ApiResponse<any> = await postrate({
			Id: svc.id,
			LastMilerID: svc.lastMilerID,
			ServiceOptions: { deliveryConfirmation: isSign.value },
			Shipper: {
				name: shipper.value?.name,
				phone: shipper.value?.phone,
				email: '',
				company: shipper.value?.company,
				street1: shipper.value?.street1,
				street2: shipper.value?.street2 || '',
				street3: shipper.value?.street3 || '',
				city: shipper.value?.city,
				province: shipper.value?.province,
				postalCode: shipper.value?.postalCode,
				countryCode: shipper.value?.countryCode,
			},
			Consignee: {
				name: cnee.value?.name,
				phone: cnee.value?.phone,
				company: cnee.value?.company || null,
				street1: cnee.value?.street1,
				city: cnee.value?.city,
				province: cnee.value?.province,
				postalCode: cnee.value?.postalCode,
				countryCode: cnee.value?.countryCode,
			},
			Packages: buildPackages(),
		});
		if (res?.isSuccess) {
			if (res.result?.totalCharge) {
				return { show: true, quote: String(res.result.totalCharge) };
			}
			return { show: false, quote: res.result?.remarks || (t('pages.NoData') || '不可用') };
		}
		return { show: false, quote: res?.message || '获取报价失败' };
	} catch {
		return { show: false, quote: '获取报价失败' };
	}
};

const validate = () => {
	if (!shipper.value?.name) {
		ElMessage.error('请先选择寄件人');
		return false;
	}
	if (!cnee.value?.name) {
		ElMessage.error('请先选择收件人');
		return false;
	}
	if (!svcIds.value.length) {
		ElMessage.error(t('pages.Serviceisrequired') || '服务是必填项');
		return false;
	}
	const invalid = parcels.value.some(
		(item) => !Number(item.weight) || !Number(item.count),
	);
	if (invalid) {
		ElMessage.error('请填写包裹重量和数量');
		return false;
	}
	return true;
};

const calculate = async () => {
	if (!validate()) return;
	rateLoading.value = true;
	rateRows.value = [];
	try {
		const services = svcOptions.value.filter((svc) => svcIds.value.includes(svc.id));
		for (const svc of services) {
			const r = await rateForService(svc);
			rateRows.value = [
				...rateRows.value,
				{ id: svc.id, name: svc.name, show: r.show, quote: r.quote },
			];
		}
		rateRows.value.sort((a, b) => (a.show === b.show ? 0 : a.show ? -1 : 1));
	} finally {
		rateLoading.value = false;
	}
};

const reset = () => {
	parcels.value = [newRow()];
	rateRows.value = [];
	cneeIndex.value = undefined;
};

const goBack = () => {
	router.push('/parcel/list');
};

onMounted(() => {
	fetchShippers();
	fetchCneeList();
	fetchServices();
});
</script>

<style lang="scss" scoped>
.batch-calculation {
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
.filter-form {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}
.filter-form :deep(.el-form-item) {
	margin-right: 0;
	margin-bottom: 0;
}
.wide-select {
	width: 260px;
}
.cnee-desc {
	margin-top: 12px;
}
.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}
.card-title {
	font-size: 15px;
	font-weight: 500;
}
.cell-inline {
	display: flex;
	gap: 4px;
	align-items: center;
}
.num-input {
	flex: 1;
	min-width: 80px;
}
.unit-select {
	width: 90px;
}
.actions {
	margin-top: 16px;
	display: flex;
	gap: 8px;
}
.ok {
	color: #2ba745;
}
.fail {
	color: #f56c6c;
}
@media (max-width: 768px) {
	.wide-select {
		width: 100%;
	}
}
</style>
