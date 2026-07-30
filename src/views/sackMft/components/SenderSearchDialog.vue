<template>
	<el-dialog
		v-model="visible"
		:title="t('pages.SenderSearch.Title')"
		width="820px"
		:close-on-click-modal="false"
		@closed="handleClose"
	>
		<div class="sender-search">
			<el-input
				v-model="keyword"
				clearable
				:placeholder="t('pages.Pleaseinput') + t('pages.Searchcontent')"
				@keyup.enter="onSearch"
			>
				<template #append>
					<el-button :loading="loading" @click="onSearch">
						{{ t('pages.SenderSearch.Search') }}
					</el-button>
				</template>
			</el-input>

			<el-table
				v-loading="loading"
				:data="showList"
				height="380"
				highlight-current-row
				class="sender-search__table"
				@row-click="onSelect"
			>
				<el-table-column :label="t('pages.Name')" min-width="120">
					<template #default="scope">{{ scope.row.contact?.name }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.company')" min-width="120">
					<template #default="scope">{{ scope.row.contact?.company }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.Phone')" min-width="110">
					<template #default="scope">{{ scope.row.contact?.phone }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.StreetLine1')" min-width="220">
					<template #default="scope">{{ addressLine(scope.row) }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.ZipPostalCode')" min-width="100">
					<template #default="scope">{{ scope.row.contact?.postalCode }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.SenderSearch.Select')" width="90" align="center">
					<template #default="scope">
						<el-button type="primary" link @click.stop="onSelect(scope.row)">
							{{ t('pages.SenderSearch.Select') }}
						</el-button>
					</template>
				</el-table-column>
				<template #empty>
					<span>{{ t('pages.SenderSearch.NoResults') }}</span>
				</template>
			</el-table>
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="handleClose">{{ t('pages.Cancel') }}</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { addresslist } from '@/api/address';
import type { ApiResponse } from '@/api/types';

export interface SenderContact {
	name?: string;
	company?: string;
	phone?: string;
	email?: string;
	countryCode?: string;
	province?: string;
	city?: string;
	district?: string;
	street1?: string;
	street2?: string;
	street3?: string;
	postalCode?: string;
	[key: string]: any;
}
export interface SenderAddress {
	id?: string | number;
	type?: string;
	isDefault?: boolean;
	contact?: SenderContact;
	[key: string]: any;
}

const props = withDefaults(
	defineProps<{ modelValue: boolean; type?: string }>(),
	{ type: 'Shipping' },
);
const emit = defineEmits<{
	(e: 'update:modelValue', v: boolean): void;
	(e: 'select', row: SenderAddress): void;
}>();

const { t } = useI18n();
const visible = ref(false);
const loading = ref(false);
const keyword = ref('');
const list = ref<SenderAddress[]>([]);

// 与 shippingspa 一致：在已加载的列表上按关键字做全字段匹配
const showList = computed(() => {
	const kw = keyword.value.trim().toLowerCase();
	if (!kw) return list.value;
	return list.value.filter((item) => {
		if (!item.contact) return true;
		return Object.keys(item.contact).some((key) =>
			String(item.contact?.[key] ?? '').toLowerCase().includes(kw),
		);
	});
});

const addressLine = (row: SenderAddress) => {
	const c = row.contact || {};
	return [c.street1, c.street2, c.street3, c.city, c.province, c.countryCode]
		.filter(Boolean)
		.join(' ');
};

const getdata = async () => {
	loading.value = true;
	try {
		const res: ApiResponse<SenderAddress[]> = await addresslist({
			index: 0,
			size: 200,
			Type: props.type,
			Keyword: keyword.value.trim() || undefined,
		});
		if (res?.isSuccess) {
			list.value = (res.result ?? []).filter(
				(item) => !props.type || !item.type || item.type === props.type,
			);
		} else {
			list.value = [];
			ElMessage.error(res?.message || t('pages.Failed'));
		}
	} catch {
		list.value = [];
		ElMessage.error(t('pages.Failed'));
	} finally {
		loading.value = false;
	}
};

const onSearch = () => {
	getdata();
};

const onSelect = (row: SenderAddress) => {
	if (!row?.contact) return;
	emit('select', row);
	emit('update:modelValue', false);
};

const handleClose = () => {
	emit('update:modelValue', false);
};

watch(
	() => props.modelValue,
	(v) => {
		visible.value = v;
		if (v) {
			keyword.value = '';
			getdata();
		}
	},
);
</script>

<style lang="scss" scoped>
.sender-search__table {
	margin-top: 12px;
	cursor: pointer;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
</style>
