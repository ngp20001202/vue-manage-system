<template>
	<el-dialog
		v-model="status"
		:title="`${t('pages.messages') || '消息'} - ${props.id}`"
		width="50%"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:before-close="handleClose"
	>
		<div class="message-list">
			<ul>
				<li v-for="(item, index) in messages" :key="index" class="message">
					<div class="text_time">
						<p class="text_body text_right">
							<span class="border_radius">
								<span>{{ item.name }}</span>
								<strong class="text_danger">|</strong>
							</span>
						</p>
						<p class="text_right small">{{ item.time }}</p>
					</div>
					<div class="icon">M</div>
				</li>
			</ul>
			<el-empty v-if="!messages.length" :description="t('pages.NoData') || '暂无数据'" />
		</div>

		<el-divider />

		<div class="input-block">
			<el-input
				v-model="messagevalue"
				type="textarea"
				:rows="4"
				maxlength="200"
				show-word-limit
				:placeholder="t('pages.message') || '消息'"
			/>
			<div v-show="visited" class="error-tip">
				{{ t('pages.messageerror') || '请输入消息' }}
			</div>
		</div>

		<el-divider />

		<div class="actions">
			<el-button type="success" size="small" @click="submit">
				{{ t('pages.submit') || '提交' }}
			</el-button>
		</div>
	</el-dialog>
</template>

<script setup lang="ts" name="parcel-message">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface MessageItem {
	name: string;
	time: string;
}

const props = defineProps<{
	id: string;
}>();

const emit = defineEmits<{
	(e: 'changestatus'): void;
}>();

const { t } = useI18n();

const status = ref(false);
const messages = ref<MessageItem[]>([]);
const messagevalue = ref('');
const visited = ref(false);

watch(messagevalue, (val) => {
	visited.value = !val;
});

watch(
	() => props.id,
	(val) => {
		status.value = !!val;
		if (val) {
			messagevalue.value = '';
			visited.value = false;
		}
	},
	{ immediate: true },
);

const submit = () => {
	visited.value = !messagevalue.value;
};

const handleClose = () => {
	status.value = false;
	emit('changestatus');
};
</script>

<style lang="scss" scoped>
.message-list {
	max-height: 320px;
	overflow-y: auto;
}
.message-list ul {
	list-style: none;
	margin: 0;
	padding: 0;
}
.message {
	display: flex;
	justify-content: flex-end;
	align-items: flex-start;
	gap: 8px;
	margin-bottom: 12px;
}
.text_time {
	text-align: right;
}
.text_body {
	margin: 0;
}
.border_radius {
	display: inline-block;
	padding: 6px 10px;
	border-radius: 6px;
	background: #f4f4f5;
}
.text_danger {
	color: #dc3545;
	margin-left: 4px;
}
.small {
	margin: 4px 0 0;
	font-size: 12px;
	color: #909399;
}
.icon {
	width: 32px;
	height: 32px;
	line-height: 32px;
	text-align: center;
	border-radius: 50%;
	background: #17a2b8;
	color: #fff;
	flex-shrink: 0;
}
.input-block {
	position: relative;
}
.error-tip {
	margin-top: 4px;
	color: #f56c6c;
	font-size: 12px;
}
.actions {
	text-align: right;
}
</style>
