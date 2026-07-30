<template>
	<div class="lastmiler-rejected">
		<el-card shadow="never" class="filter-card">
			<el-tabs
				v-model="activeName"
				type="border-card"
				class="demo-tabs"
				:before-leave="beforeLeave"
			>
				<el-tab-pane :label="t('pages.all')" name="0" />
				<el-tab-pane :label="t('pages.tracking')" name="tracking" />
			</el-tabs>

			<div class="tabs-content">
				<el-form v-if="activeName === '0'" :inline="true" class="filter-form">
					<div class="date-picker">
						<el-date-picker
							v-model="dates"
							type="daterange"
							unlink-panels
							:start-placeholder="t('pages.startpicker')"
							:end-placeholder="t('pages.endpicker')"
							value-format="YYYY-MM-DD"
						/>
					</div>
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Reset') }}
						</el-button>
					</el-form-item>
				</el-form>
				<div v-else-if="activeName === 'tracking'" class="tracking-block">
					<el-input
						v-model="textarea"
						:rows="4"
						class="tracking-input"
						type="textarea"
						:placeholder="t('pages.trackplace')"
					/>
					<div class="tracking-actions">
						<el-button type="primary" :icon="Search" @click="onSearch">
							{{ t('pages.Search') }}
						</el-button>
						<el-button :icon="Refresh" @click="onReset">
							{{ t('pages.Reset') }}
						</el-button>
					</div>
				</div>
			</div>
		</el-card>

		<el-card shadow="never" class="table-card">
			<div v-show="routeData.length" class="op-row">
				<div class="op-row-left">
					<el-tooltip :content="t('pages.LastMilerRejection.EditandResend')" placement="top" :enterable="false">
						<el-button
							type="warning"
							:disabled="!selectarr.length || requeueing"
							class="requeue"
							@click="() => batchRequeue()"
						>
							<el-icon><RefreshRight /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip :content="t('pages.cancelparcel')" placement="top" :enterable="false">
						<el-button
							type="danger"
							:disabled="!selectarr.length"
							class="cancell"
							@click="() => cancel(true)"
						>
							<el-icon><Delete /></el-icon>
						</el-button>
					</el-tooltip>
				</div>
				<el-pagination
					class="op-row-pager"
					background
					layout="total, prev, pager, next, sizes"
					:total="availcnt"
					:current-page="pagecurrent"
					:page-size="count"
					:page-sizes="[10, 20, 50, 100]"
					@current-change="(p: number) => (pagecurrent = p)"
					@size-change="(s: number) => (count = s)"
				/>
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
				<el-table-column :label="t('pages.ID')" width="150">
					<template #default="scope">
						<span class="cyan" @click="() => setid('detail', scope.row.id)">
							<el-icon><InfoFilled /></el-icon>
							{{ scope.row.id }}
						</span>
					</template>
				</el-table-column>
				<el-table-column min-width="150">
					<template #header>
						<span class="copy-header" @click="() => copy('clientRefNbr')">
							{{ t('pages.order') }}
							<el-icon><DocumentCopy /></el-icon>
						</span>
					</template>
					<template #default="scope">
						{{ scope.row.clientRefNbr }}
					</template>
				</el-table-column>
				<el-table-column min-width="150">
					<template #header>
						<span class="copy-header" @click="() => copy('lastMilerNbr')">
							{{ t('pages.lastmiler') }}
							<el-icon><DocumentCopy /></el-icon>
						</span>
					</template>
					<template #default="scope">
						{{ scope.row.lastMilerNbr }}
					</template>
				</el-table-column>
				<el-table-column
					property="svcName"
					:label="t('pages.servertype')"
					width="150"
				/>
				<el-table-column
					property="stageText"
					:label="t('pages.Stage')"
					width="150"
				/>
				<el-table-column :label="t('pages.PostedOn')" width="180">
					<template #default="scope">
						<span>{{ formatPosted(scope.row.postedStamp?.utcTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column
					property="reasonText"
					:label="t('pages.Reason')"
					min-width="200"
				/>
				<el-table-column :label="t('pages.Action')" width="320" align="center" fixed="right">
					<template #default="scope">
						<div class="action-cell">
							<el-button
								type="primary"
								size="small"
								:icon="Edit"
								@click="() => openEdit(scope.row)"
							>
								{{ t('pages.Edit') }}
							</el-button>
							<el-button
								type="warning"
								size="small"
								:icon="RefreshRight"
								:loading="resending === scope.row.id"
								@click="() => resend(scope.row)"
							>
								{{ t('pages.LastMilerRejection.EditandResend') }}
							</el-button>
							<el-button
								type="danger"
								size="small"
								:icon="Delete"
								@click="() => cancel(false, scope.row.id)"
							>
								{{ t('pages.cancelparcel') }}
							</el-button>
						</div>
					</template>
				</el-table-column>
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

		<ParcelDetail :id="parcelDetail.id" @changestatus="changestatus" />

		<el-dialog
			v-model="editVisible"
			:title="t('pages.LastMilerRejection.EditandResend')"
			width="860px"
			destroy-on-close
			:close-on-click-modal="false"
			@close="closeEdit"
		>
			<el-form
				ref="editFormRef"
				v-loading="editLoading"
				:model="editForm"
				label-width="120px"
				class="edit-form"
			>
				<el-row :gutter="16">
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.servertype')">
							<el-input v-model="editForm.svcName" disabled />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.order')">
							<el-input v-model="editForm.clientRefNbr" disabled />
						</el-form-item>
					</el-col>
				</el-row>
				<el-divider />
				<h4>{{ t('pages.Shipper') }}</h4>
				<el-row :gutter="16">
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.Name')">
							<el-input v-model="editForm.shipper.name" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.Phone')">
							<el-input v-model="editForm.shipper.phone" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="t('pages.StreetLine1')">
							<el-input v-model="editForm.shipper.addressLine1" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="t('pages.StreetLine2')">
							<el-input v-model="editForm.shipper.addressLine2" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="8">
						<el-form-item :label="t('pages.City')">
							<el-input v-model="editForm.shipper.city" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="8">
						<el-form-item :label="t('pages.ProvinceState')">
							<el-input v-model="editForm.shipper.state" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="8">
						<el-form-item :label="t('pages.ZipPostalCode')">
							<el-input v-model="editForm.shipper.postalCode" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.CountryCode')">
							<el-input v-model="editForm.shipper.countryCode" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-divider />
				<h4>{{ t('pages.Consignee') }}</h4>
				<el-row :gutter="16">
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.Name')">
							<el-input v-model="editForm.consignee.name" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.Phone')">
							<el-input v-model="editForm.consignee.phone" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="t('pages.StreetLine1')">
							<el-input v-model="editForm.consignee.addressLine1" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item :label="t('pages.StreetLine2')">
							<el-input v-model="editForm.consignee.addressLine2" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="8">
						<el-form-item :label="t('pages.City')">
							<el-input v-model="editForm.consignee.city" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="8">
						<el-form-item :label="t('pages.ProvinceState')">
							<el-input v-model="editForm.consignee.state" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="8">
						<el-form-item :label="t('pages.ZipPostalCode')">
							<el-input v-model="editForm.consignee.postalCode" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-form-item :label="t('pages.CountryCode')">
							<el-input v-model="editForm.consignee.countryCode" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<el-button @click="closeEdit">{{ t('pages.Cancel') }}</el-button>
				<el-button type="primary" :loading="editSaving" @click="submitEdit">
					{{ t('pages.Save') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="lastmiler-rejected">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import {
	Search,
	Refresh,
	DocumentCopy,
	RefreshRight,
	Delete,
	InfoFilled,
	Edit,
} from '@element-plus/icons-vue';
import moment from 'moment';
import { formatParagraphtext } from '@/utils/format';
import {
	lastMilerRejectedlist,
	lastMilerRejectedSearch,
	lastMilerRequeue,
	lastMilerCancel,
	lastMilerEdit,
} from '@/api/rejection';
import { parcellistdetail } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';
import ParcelDetail from '@/views/parcel/detail.vue';

const { t } = useI18n();

interface RejectionRow extends Record<string, any> {
	id: string | number;
	clientRefNbr?: string;
	lastMilerNbr?: string;
	svcName?: string;
	stageText?: string;
	postedStamp?: { utcTime: string };
	reasonText?: string;
}

interface AddressForm {
	name: string;
	phone: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	postalCode: string;
	countryCode: string;
}

interface EditForm {
	id: string | number;
	clientRefNbr?: string;
	svcName?: string;
	shipper: AddressForm;
	consignee: AddressForm;
}

const activeName = ref('0');
const dates = ref<[string, string] | null>(null);
const textarea = ref('');
const routeData = ref<RejectionRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const resending = ref<string | number | null>(null);
const requeueing = ref(false);
const selectarr = ref<RejectionRow[]>([]);
const multipleTableRef = ref();

const parcelDetail = reactive({ id: '' });

const editVisible = ref(false);
const editLoading = ref(false);
const editSaving = ref(false);
const editFormRef = ref<FormInstance>();
const emptyAddress = (): AddressForm => ({
	name: '',
	phone: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	state: '',
	postalCode: '',
	countryCode: '',
});
const editForm = ref<EditForm>({
	id: '',
	shipper: emptyAddress(),
	consignee: emptyAddress(),
});

const formatPosted = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const copy = (key: string) => {
	const text = formatParagraphtext(routeData.value, key);
	if (text === ' ') {
		ElMessage.warning('当前页没有可复制的数据');
		return;
	}
	try {
		navigator.clipboard.writeText(text);
		ElMessage.success('复制成功');
	} catch {
		ElMessage.error('复制失败');
	}
};

const defaultRange = (): [string, string] => [
	moment().subtract(14, 'days').format('YYYY-MM-DD'),
	moment().format('YYYY-MM-DD'),
];

const init = () => {
	dates.value = defaultRange();
	textarea.value = '';
};

const onReset = () => {
	init();
	pagecurrent.value = 1;
	onSearch();
};

const onSearch = () => {
	pagecurrent.value = 1;
	if (activeName.value === 'tracking') {
		postdata();
	} else {
		getdata();
	}
};

const setid = (name: 'detail', id: string | number) => {
	if (name === 'detail') {
		parcelDetail.id = String(id);
	}
};

const handleSelectionChange = (rows: RejectionRow[]) => {
	selectarr.value = rows;
};

const changestatus = () => {
	parcelDetail.id = '';
};

const beforeLeave = (e: string | number) => {
	init();
	if (e === 'tracking') {
		routeData.value = [];
		return true;
	}
	getdata();
	return true;
};

const getdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await lastMilerRejectedlist({
		index: pagecurrent.value - 1,
		size: count.value,
		PeriodMin: dates.value?.[0],
		PeriodMax: dates.value?.[1],
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const postdata = async () => {
	loading.value = true;
	const res: ApiResponse<any> = await lastMilerRejectedSearch({
		pageIndex: pagecurrent.value - 1,
		pageSize: count.value,
		trackingNbrs: textarea.value
			.split(/[\n,]+/)
			.filter((s) => s.trim() !== ''),
	});
	if (res?.isSuccess) {
		routeData.value = res.result ?? [];
		availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
	}
	loading.value = false;
};

const batchRequeue = async () => {
	const ids = selectarr.value.map((r) => r.id);
	if (!ids.length) return;
	try {
		await ElMessageBox.confirm(
			'重推后将重新获取面单，是否继续？',
			'确认批量编辑重推',
			{
				confirmButtonText: '确认',
				cancelButtonText: t('pages.Cancel'),
				type: 'warning',
				center: true,
			},
		);
	} catch {
		return;
	}
	requeueing.value = true;
	try {
		const res: ApiResponse<any> = await lastMilerRequeue({ ids });
		if (res?.isSuccess) {
			ElMessage.success('批量编辑重推成功');
			getdata();
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed'));
	} finally {
		requeueing.value = false;
	}
};

const resend = async (row: RejectionRow) => {
	try {
		await ElMessageBox.confirm(
			'重推后将重新获取面单，是否继续？',
			'确认重推',
			{
				confirmButtonText: '确认',
				cancelButtonText: t('pages.Cancel'),
				type: 'warning',
				center: true,
			},
		);
	} catch {
		return;
	}
	resending.value = row.id;
	try {
		const res: ApiResponse<any> = await lastMilerRequeue({ ids: [row.id] });
		if (res?.isSuccess) {
			ElMessage.success('重推成功');
			getdata();
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed'));
	} finally {
		resending.value = null;
	}
};

const cancel = async (isBatch: boolean, id?: string | number) => {
	const list = isBatch
		? selectarr.value.map((r) => r.id)
		: [id as string | number];
	ElMessageBox.confirm(
		'取消后无法撤销该包裹',
		'确认取消该包裹?',
		{
			confirmButtonText: '确认取消',
			cancelButtonText: t('pages.Cancel'),
			type: 'warning',
			center: true,
		},
	)
		.then(async () => {
			const res: ApiResponse<any> = await lastMilerCancel({ ids: list });
			if (res?.isSuccess) {
				ElMessage.success('取消成功');
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		})
		.catch(() => {
			multipleTableRef.value?.clearSelection();
		});
};

const openEdit = async (row: RejectionRow) => {
	editVisible.value = true;
	editLoading.value = true;
	try {
		const res: ApiResponse<any> = await parcellistdetail({ id: String(row.id) });
		if (res?.isSuccess && res.result) {
			const detail = res.result;
			editForm.value = {
				id: row.id,
				clientRefNbr: detail.clientRefNbr || '',
				svcName: detail.svcName || '',
				shipper: { ...emptyAddress(), ...detail.shipper },
				consignee: { ...emptyAddress(), ...detail.consignee },
			};
		} else {
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch (e: any) {
		ElMessage.error(e?.message || t('pages.Failed'));
	} finally {
		editLoading.value = false;
	}
};

const closeEdit = () => {
	editVisible.value = false;
	editForm.value = {
		id: '',
		clientRefNbr: '',
		svcName: '',
		shipper: emptyAddress(),
		consignee: emptyAddress(),
	};
};

const submitEdit = async () => {
	if (!editFormRef.value) return;
	editFormRef.value.validate(async (valid) => {
		if (!valid) return;
		editSaving.value = true;
		try {
			const res: ApiResponse<any> = await lastMilerEdit({
				id: editForm.value.id,
				shipper: editForm.value.shipper,
				consignee: editForm.value.consignee,
			});
			if (res?.isSuccess) {
				ElMessage.success('编辑提交成功');
				closeEdit();
				getdata();
			} else {
				ElMessage.error(res?.message || t('pages.Failed'));
			}
		} catch (e: any) {
			ElMessage.error(e?.message || t('pages.Failed'));
		} finally {
			editSaving.value = false;
		}
	});
};

watch([count, pagecurrent], () => {
	if (activeName.value === 'tracking') {
		postdata();
	} else {
		getdata();
	}
});

onMounted(() => {
	dates.value = defaultRange();
	getdata();
});
</script>

<style lang="scss" scoped>
.lastmiler-rejected {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.filter-card,
.table-card {
	background: #fff;
}
.tabs-content {
	margin-top: 12px;
}
.filter-form {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	min-height: 60px;
}
.filter-form :deep(.el-form-item) {
	margin-right: 8px;
	margin-bottom: 0;
}
.date-picker {
	width: 100%;
	max-width: 320px;
	min-width: 0;
	margin-right: 28px;
}
.date-picker :deep(.el-date-editor) {
	width: 100%;
}
.tracking-input {
	width: 70%;
	max-width: 720px;
}
.tracking-block {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.tracking-actions {
	display: flex;
	gap: 8px;
	align-items: center;
}
.op-row {
	display: flex;
	gap: 12px;
	align-items: center;
	margin-bottom: 12px;
	flex-wrap: wrap;
	justify-content: space-between;
}
.op-row-left {
	display: flex;
	gap: 8px;
	align-items: center;
}
.op-row-pager {
	flex-shrink: 0;
}
.op-row-pager :deep(.el-pagination__sizes) {
	margin-right: 0;
}
.requeue,
.cancell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 33px;
	min-width: 0 !important;
	padding: 5px 4px;
	color: #fff;
	border: none;
}
.requeue {
	background-color: #e6a23c;
}
.cancell {
	background-color: #dc3545;
}
.requeue:disabled,
.cancell:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}
.action-cell {
	display: flex;
	flex-wrap: nowrap;
	justify-content: center;
	align-items: center;
	gap: 4px;
	padding: 0;
}
.action-cell :deep(.el-button.is-small) {
	padding: 3px 6px;
	font-size: 12px;
}
.action-cell :deep(.el-button.is-small .el-icon) {
	font-size: 12px;
}
.copy-header {
	cursor: pointer;
	color: #606266;
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
.copy-header:hover {
	color: #409eff;
}
.cyan {
	color: #17a2b8;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
.cyan:hover {
	text-decoration: underline;
}
.pager {
	margin-top: 16px;
	justify-content: flex-end;
	display: flex;
}
.edit-form :deep(.el-form-item) {
	margin-bottom: 12px;
}
:deep(.el-tabs--border-card) {
	box-shadow: none;
	border: 1px solid #ebeef5;
}
:deep(.el-tabs__content) {
	display: none !important;
}
:deep(.el-tabs__item) {
	height: 40px;
	line-height: 40px;
}
@media (max-width: 768px) {
	.date-picker,
	.stage-select {
		width: 100%;
	}
	.tracking-input {
		width: 100%;
	}
}
</style>
