<template>
	<el-dialog
		v-model="status"
		:title="t('pages.Parcels.list.tracking') + id"
		width="50%"
		:before-close="handleClose"
	>
		<div v-loading="loading" class="parcel-tracking">
			<el-empty
				v-if="!loading && !tracking.eventItems?.length"
				:description="t('pages.Notrack')"
			/>
			<ul v-else class="timeline timeline-single-column">
				<li
					v-for="item in tracking.eventItems"
					:key="item.id"
					class="timeline-item"
				>
					<div class="timeline-point timeline-point-danger" />
					<div class="timeline-event">
						<div class="timeline-heading">
							<div class="timeline-row">
								<div class="timeline-time">
									<h6>{{ formatTime(item.utcTime) }}</h6>
								</div>
								<div class="timeline-content">
									<h6>
										<span v-if="item.utcPlace" class="text-danger">[{{ item.utcPlace }}]</span>
										{{ item.content }}
									</h6>
								</div>
							</div>
							<div class="timeline-row">
								<div class="timeline-operator">
									<el-icon><User /></el-icon>
									<span class="ml-3">{{ item.operator }}</span>
								</div>
							</div>
						</div>
					</div>
				</li>
				<li class="timeline-label">
					<button class="truck-btn" type="button">
						<el-icon><Van /></el-icon>
					</button>
				</li>
			</ul>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { User, Van } from '@element-plus/icons-vue';
import moment from 'moment';
import { trackingdetail } from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const props = defineProps<{
	id: string;
}>();

const emit = defineEmits<{
	(e: 'changestatus'): void;
}>();

const { t } = useI18n();
const status = ref(false);
const loading = ref(false);
const tracking = ref<any>({ eventItems: [] });

const formatTime = (utc: string | undefined) => {
	if (!utc) return '';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const loadTracking = async (id: string) => {
	loading.value = true;
	try {
		const res: ApiResponse<any> = await trackingdetail(id);
		if (res?.isSuccess) {
			tracking.value = res.result || { eventItems: [] };
		} else {
			tracking.value = { eventItems: [] };
		}
	} finally {
		loading.value = false;
	}
};

watch(
	() => props.id,
	(newId) => {
		if (newId) {
			status.value = true;
			tracking.value = { eventItems: [] };
			loadTracking(newId);
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
.parcel-tracking {
	padding: 0 8px;
}
.timeline {
	list-style: none;
	margin: 0;
	padding: 0;
	position: relative;
}
.timeline::before {
	content: '';
	position: absolute;
	left: 7px;
	top: 0;
	bottom: 0;
	width: 2px;
	background: #e4e7ed;
}
.timeline-item {
	position: relative;
	padding: 0 0 16px 28px;
	min-height: 32px;
}
.timeline-point {
	position: absolute;
	left: 0;
	top: 6px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #fff;
	box-shadow: 0 0 0 2px #f56c6c;
}
.timeline-point-danger {
	background: #f56c6c;
}
.timeline-heading h6 {
	margin: 0;
	font-size: 14px;
	font-weight: 500;
	color: #303133;
	line-height: 1.6;
}
.timeline-row {
	display: flex;
	gap: 12px;
}
.timeline-time {
	flex: 0 0 150px;
	color: #606266;
}
.timeline-content {
	flex: 1;
}
.text-danger {
	color: #f56c6c;
	margin-right: 4px;
}
.timeline-operator {
	color: #909399;
	font-size: 12px;
	display: inline-flex;
	align-items: center;
	gap: 4px;
	margin-top: 4px;
}
.ml-3 {
	margin-left: 12px;
}
.timeline-label {
	display: flex;
	justify-content: left;
	padding-top: 8px;
	position:relative;
}
.truck-btn {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: #f56c6c;
	color: #fff;
	border: none;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	margin-left: -10px;
}
.truck-btn:hover {
	background: #dd6161;
}
</style>