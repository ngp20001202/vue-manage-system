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
					<template #default="scope">{{ pickContact(scope.row, 'name') }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.company')" min-width="120">
					<template #default="scope">{{ pickContact(scope.row, 'company') }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.Phone')" min-width="110">
					<template #default="scope">{{ pickContact(scope.row, 'phone') }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.StreetLine1')" min-width="220">
					<template #default="scope">{{ addressLine(scope.row) }}</template>
				</el-table-column>
				<el-table-column :label="t('pages.ZipPostalCode')" min-width="100">
					<template #default="scope">{{ pickContact(scope.row, 'postalCode') }}</template>
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
		const c = item.Contact ?? item.contact;
		if (!c) return true;
		return Object.keys(c).some((key) =>
			String((c as Record<string, any>)?.[key] ?? '').toLowerCase().includes(kw),
		);
	});
});

// 兼容 shippingspa PascalCase 与旧小写接口
const pickContact = (row: SenderAddress, field: string) => {
	const c = row.Contact ?? row.contact;
	if (!c) return '';
	const camel = field.charAt(0).toLowerCase() + field.slice(1);
	return (c as Record<string, any>)[field] ?? (c as Record<string, any>)[camel] ?? '';
};

const addressLine = (row: SenderAddress) => {
	const c = row.Contact ?? row.contact;
	if (!c) return '';
	return [c.Street1 ?? c.street1, c.Street2 ?? c.street2, c.Street3 ?? c.street3, c.City ?? c.city, c.Province ?? c.province, c.CountryCode ?? c.countryCode]
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
				(item) => !props.type || !item.Type || !item.type || item.Type === props.type || item.type === props.type,
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
