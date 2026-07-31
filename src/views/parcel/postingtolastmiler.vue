<template>
	<div class="control">
		<div class="content import">
			<div>
				<div class="flex wrap flex_start alignitems">
					<div class="mt">
						<div class="input-group">
							<div class="custom-file">
								<input
									id="Input_File"
									accept=".xls,.xlsx"
									class="custom-file-input"
									name="Input.File"
									type="file"
									@change="onFilePick"
								>
								<label
									:class="isCyan ? 'custom-file-label cyans' : 'custom-file-label'"
									for="Input_File"
								>{{ filename || t('pages.placechoose') }}</label>
							</div>
							<button class="input_btn" @click="submit">
								<el-icon><UploadFilled /></el-icon>
							</button>
						</div>
					</div>
					<el-row class="mb-4 mt">
						<el-button
							type="success"
							class="import_btn"
							:loading="loading"
							@click="submit"
						>
							{{ t('pages.Import') }}
						</el-button>
					</el-row>
					<div class="download font_18 marginleft20">
						<a href="/templates/PostingToLastMiler_Template.xlsx">
							<el-icon><Download /></el-icon>
							{{ t('pages.Download') }}
						</a>
					</div>
				</div>

				<div v-if="prevList.length > 0" style="width: 100%">
					<div class="flex jus_con">
						<h1>
							{{ t('pages.Total') }}:&nbsp;{{ sum }}&emsp;
							<span>{{ t('pages.Success') }}:&nbsp;{{ success }}&emsp;</span>
							<span>{{ t('pages.Failed') }}:&nbsp;{{ error }}</span>
						</h1>
					</div>
					<el-table :data="prevList" style="width: 100%; margin-bottom: 15px" size="small">
						<el-table-column type="index" width="50" />
						<el-table-column :label="t('pages.Errors')">
							<template #default="scope">
								<span class="size">{{ scope.row.errors?.join() }}</span>
							</template>
						</el-table-column>
						<el-table-column
							property="trackingNbr"
							:label="t('pages.lastorder')"
						/>
						<template #empty>
							<el-empty :description="t('pages.NoData')" />
						</template>
					</el-table>
				</div>
				<div v-else style="width: 100%">
					<el-table :data="columns" style="width: 100%; margin-bottom: 15px" size="small">
						<el-table-column :label="t('pages.ColumnName')">
							<template #default="scope">
								<span class="red">{{ scope.row.columnsname }}</span>
							</template>
						</el-table-column>
						<el-table-column :label="t('pages.Required')">
							<template #default="scope">
								<div :class="scope.row.required ? 'display' : 'none'">
									<el-icon class="check-icon"><CircleCheck /></el-icon>
								</div>
							</template>
						</el-table-column>
						<el-table-column
							property="desc"
							:label="t('pages.Description')"
						/>
						<el-table-column
							property="sl"
							:label="t('pages.Example')"
						/>
					</el-table>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="parcel-postingtolastmiler">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Download, CircleCheck, UploadFilled } from '@element-plus/icons-vue';
import { CfmPosting, postingfile } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface ColumnItem {
	columnsname: string;
	required: boolean;
	desc: string;
	sl: string;
}

interface ResultRow {
	trackingNbr?: string;
	errors?: string[];
}

const isCyan = ref(false);
const loading = ref(false);
const updateFile = ref<FormData | null>(null);
const filename = ref('');
const prevList = ref<ResultRow[]>([]);

const columns = ref<ColumnItem[]>([
	{
		columnsname: 'Tracking# or Order#',
		required: true,
		desc: t('pages.tracking'),
		sl: '9261290986237901819419',
	},
]);

watch(
	() => filename.value,
	() => {
		if (filename.value) isCyan.value = false;
	},
);

const sum = computed(() => prevList.value.length);
const success = computed(() =>
	prevList.value.reduce((acc, item) => {
		if (!item.errors || item.errors.length === 0) acc += 1;
		return acc;
	}, 0),
);
const error = computed(() =>
	prevList.value.reduce((acc, item) => {
		if (item.errors && item.errors.length > 0) acc += 1;
		return acc;
	}, 0),
);

const loadDetail = async (fileId: string) => {
	const res: ApiResponse<ResultRow[]> = await CfmPosting(fileId);
	loading.value = false;
	if (res?.isSuccess) {
		prevList.value = Array.isArray(res.result) ? res.result : [];
	} else {
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const submit = async () => {
	if (!filename.value) isCyan.value = true;
	if (!updateFile.value) return;
	loading.value = true;
	const res: ApiResponse<{ fileId: string }> = await postingfile(updateFile.value);
	if (res?.isSuccess) {
		filename.value = '';
		updateFile.value = null;
		await loadDetail(res.result?.fileId ?? '');
	} else {
		loading.value = false;
		ElMessage.error(res?.message || t('pages.Failed'));
	}
};

const onFilePick = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;
	filename.value = file.name;
	const form = new FormData();
	form.append('file', file);
	updateFile.value = form;
};
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
		margin-top: 0;
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

	.input-group {
		position: relative;
		display: flex;
		align-items: stretch;
		width: 100%;
		height: 35px;
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
			line-height: 33px;
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
		width: 150px;
		height: 30px;
		min-height: 36px;
		margin-left: 25px;
		font-size: 16px;
		line-height: 0;
		background-color: #28a745;
		border-color: #28a745;
	}

	.import_btn:hover {
		background-color: #218838 !important;
		border-color: #218838 !important;
	}
}
.flex {
	display: flex;
}
.wrap {
	flex-wrap: wrap;
}
.flex_start {
	justify-content: flex-start !important;
}
.alignitems {
	align-items: center;
}
.justify-between {
	justify-content: space-between;
}
.marginleft20 {
	margin-left: 20px;
}
.font_18 {
	font-size: 18px !important;
}
.mt {
	margin-bottom: 8px;
}
.mb-4 {
	margin-bottom: 16px;
}
.jus_con {
	justify-content: space-between;
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
.size {
	font-size: 14px;
}
.check-icon {
	font-size: 20px;
	color: #2ba745;
}
</style>