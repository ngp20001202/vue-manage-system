<template>
	<div class="printing-page">
		<el-card shadow="never" class="filter-card">
			<el-form :inline="true" class="filter-form">
				<el-form-item>
					<el-select
						v-model="serviceId"
						class="service-select"
						:placeholder="t('pages.servertype') || '选择服务'"
						@change="onServiceChange"
					>
						<el-option
							v-for="item in serviceOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :icon="Search" @click="onSearch">
						{{ t('pages.Search') }}
					</el-button>
					<el-button :icon="Refresh" @click="onReset">
						{{ t('pages.Reset') }}
					</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div v-show="routeData.length" class="op-row">
				<el-button
					type="primary"
					:icon="Printer"
					:disabled="!selectarr.length"
					class="print"
					@click="printLabels"
				>
					<span class="btn-text">{{ t('pages.printlabel') }}</span>
				</el-button>
			</div>

			<el-table
				ref="multipleTableRef"
				v-loading="loading"
				:data="routeData"
				style="width: 100%"
				border
				@selection-change="handleSelectionChange"
			>
				<el-table-column type="selection" width="55" />
				<el-table-column :label="t('pages.ID')" prop="id" width="180" />
				<el-table-column :label="t('pages.lastorder')" prop="clientRef" min-width="150" />
				<el-table-column :label="t('pages.lastmiler')" prop="lastMilerNbr" min-width="150" />
				<template #empty>
					<el-empty :description="t('pages.NoData')" />
				</template>
			</el-table>

			<el-pagination
				v-if="routeData.length"
				class="pager"
				background
				layout="total, prev, pager, next, sizes"
				:total="availcnt"
				:current-page="pagecurrent"
				:page-size="count"
				:page-sizes="[10, 20, 50, 100]"
				@current-change="(p: number) => (pagecurrent = p)"
				@size-change="(s: number) => (count = s)"
			/>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="printing">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Printer } from '@element-plus/icons-vue';
import { getservices, parcellist } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface PrintingRow extends Record<string, any> {
	id: string | number;
	clientRef?: string;
	lastMilerNbr?: string;
}

const serviceId = ref<string | number>(0);
const serviceOptions = ref<Array<{ value: string | number; label: string }>>([]);
const routeData = ref<PrintingRow[]>([]);
const loading = ref(false);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const selectarr = ref<PrintingRow[]>([]);
const multipleTableRef = ref();

const onReset = () => {
	serviceId.value = 0;
	pagecurrent.value = 1;
	routeData.value = [];
	availcnt.value = 0;
};

const onSearch = () => {
	pagecurrent.value = 1;
	getdata();
};

const onServiceChange = () => {
	pagecurrent.value = 1;
	getdata();
};

const loadServices = async () => {
	const res: ApiResponse<any[]> = await getservices();
	if (res?.isSuccess && Array.isArray(res.result)) {
		serviceOptions.value = res.result.map((item: any) => ({
			value: item.id ?? item.svcId ?? item.value,
			label: item.name ?? item.svcName ?? String(item.id ?? ''),
		}));
	}
};

const handleSelectionChange = (rows: PrintingRow[]) => {
	selectarr.value = rows;
};

const getdata = async () => {
	if (!serviceId.value) {
		routeData.value = [];
		availcnt.value = 0;
		return;
	}
	loading.value = true;
	const res: ApiResponse<any> = await parcellist({
		index: pagecurrent.value - 1,
		size: count.value,
		Stage: 0,
		StageMin: 0,
		StageMax: 0,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const printLabels = () => {
	ElMessage.info(t('pages.FeatureInDev') || '功能开发中');
	multipleTableRef.value?.clearSelection();
};

watch([count, pagecurrent], () => {
	if (serviceId.value) getdata();
});

onMounted(() => {
	loadServices();
});
</script>

<style lang="scss" scoped>
.printing-page {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.filter-card,
.table-card {
	background: #fff;
}
.filter-form {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	min-height: 60px;
}
.filter-form :deep(.el-form-item) {
	margin-right: 0;
	margin-bottom: 0;
}
.service-select {
	width: 220px;
}
.op-row {
	display: flex;
	gap: 12px;
	align-items: center;
	margin-bottom: 12px;
	flex-wrap: wrap;
}
.print {
	background-color: #409eff;
	border-color: #409eff;
}
.print:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}
.btn-text {
	margin-left: 4px;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
@media (max-width: 768px) {
	.service-select {
		width: 100%;
	}
}
</style>