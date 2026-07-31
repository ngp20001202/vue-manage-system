<template>
	<div class="services-page">
		<el-card shadow="never" class="table-card">
			<el-pagination
				v-if="routeData.length"
				class="pager-top"
				background
				layout="total, prev, pager, next, sizes"
				:total="availcnt"
				:current-page="pagecurrent"
				:page-size="count"
				:page-sizes="[10, 20, 50, 100]"
				@current-change="(p: number) => (pagecurrent = p)"
				@size-change="(s: number) => (count = s)"
			/>

			<el-table v-loading="loading" :data="routeData" style="width: 100%" border>
				<el-table-column :label="t('pages.Services.id')" prop="id" width="120" />
				<el-table-column
					:label="t('pages.Services.name')"
					prop="name"
					min-width="200"
					show-overflow-tooltip
				/>
				<el-table-column
					:label="t('pages.Services.minWeight')"
					prop="minWeight"
					width="150"
				/>
				<el-table-column
					:label="t('pages.Services.maxWeight')"
					prop="maxWeight"
					width="150"
				/>
				<el-table-column
					:label="t('pages.Services.maxLength')"
					prop="maxLength"
					width="150"
				/>
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

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { servicelistdata } from '@/api/services';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface ServiceRow extends Record<string, any> {
	id: string | number;
	name?: string;
	minWeight?: string;
	maxWeight?: string;
	maxLength?: string;
}

const routeData = ref<ServiceRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await servicelistdata({
		index: pagecurrent.value - 1,
		size: count.value,
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

watch([count, pagecurrent], () => {
	getdata();
});

onMounted(() => {
	getdata();
});
</script>

<style lang="scss" scoped>
.services-page {
	padding: 12px;
}
.table-card {
	background: #fff;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
.pager-top {
	margin-bottom: 12px;
	justify-content: flex-end;
	display: flex;
}
</style>
