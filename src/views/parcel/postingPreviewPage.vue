<template>
	<div class="posting-preview">
		<el-card shadow="never" class="content-card">
			<div class="head-row">
				<h3 class="summary">
					{{ t('pages.Total') || '总计' }}: {{ summary.sum }}
					<span class="ok">{{ t('pages.Success') || '成功' }}: {{ summary.success }}</span>
					<span class="fail">{{ t('pages.Failed') || '失败' }}: {{ summary.error }}</span>
				</h3>
			</div>

			<el-table
				v-loading="loading"
				:data="previewList"
				style="width: 100%"
				border
				size="small"
			>
				<el-table-column type="index" width="50" />
				<el-table-column :label="t('pages.Errors') || '错误信息'" min-width="240">
					<template #default="scope">
						<span class="fail">{{ scope.row.errors?.join('，') }}</span>
					</template>
				</el-table-column>
				<el-table-column
					property="trackingNbr"
					:label="t('pages.lastorder') || '订单 #'"
					min-width="180"
				/>
				<template #empty>
					<el-empty :description="t('pages.NoData') || '暂无数据'" />
				</template>
			</el-table>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="parcel-postingPreviewPage">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { CfmPosting } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

interface PostingRow extends Record<string, any> {
	errors?: string[];
	trackingNbr?: string;
}

const route = useRoute();
const { t } = useI18n();

const previewList = ref<PostingRow[]>([]);
const summary = reactive({ sum: 0, success: 0, error: 0 });
const loading = ref(false);

const confirmPosting = async (fileid: string) => {
	if (!fileid) return;
	loading.value = true;
	try {
		const res: ApiResponse<PostingRow[]> = await CfmPosting(fileid);
		if (res?.isSuccess && Array.isArray(res.result)) {
			previewList.value = res.result;
			summary.sum = res.result.length;
			summary.error = res.result.filter(
				(item) => item.errors && item.errors.length > 0,
			).length;
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

onMounted(() => {
	confirmPosting((route.query.fileid as string) || '');
});
</script>

<style lang="scss" scoped>
.posting-preview {
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
</style>
