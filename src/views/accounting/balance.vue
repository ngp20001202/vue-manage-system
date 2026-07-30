<template>
	<div class="balance-page">
		<el-card shadow="never">
			<el-table v-loading="loading" :data="balanceList" style="width: 100%" border>
				<el-table-column
					property="currencyText"
					:label="t('pages.AccountBalance.Currency')"
					min-width="120"
				/>
				<el-table-column :label="t('pages.AccountBalance.VaultBalance')" min-width="140">
					<template #default="scope">
						<span>{{ scope.row.vaultBal?.value }}{{ scope.row.vaultBal?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.AccountBalance.InvoicedAmount')" min-width="140">
					<template #default="scope">
						<span>{{ scope.row.invoicedAmt?.value }}{{ scope.row.invoicedAmt?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.AccountBalance.UninvoicedAmount')" min-width="140">
					<template #default="scope">
						<span>{{ scope.row.uninvoicedAmt?.value }}{{ scope.row.uninvoicedAmt?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.AccountBalance.CreditLimit')" min-width="140">
					<template #default="scope">
						<span>{{ scope.row.creditLimit?.value }}{{ scope.row.creditLimit?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.AccountBalance.CurrentBalance')" min-width="140">
					<template #default="scope">
						<span>{{ scope.row.curBal?.value }}{{ scope.row.curBal?.unit }}</span>
					</template>
				</el-table-column>
				<el-table-column align="center" width="120">
					<template #default="scope">
						<el-button size="small" @click="openRecharge(scope.row)">
							{{ t('pages.Recharge.Recharge') }}
						</el-button>
					</template>
				</el-table-column>
				<template #empty>
					<el-empty :description="t('pages.NoData')" />
				</template>
			</el-table>
		</el-card>

		<RechargeDialog v-model="rechargeVisible" :row="rechargeRow" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getBalance } from '@/api/accounting';
import RechargeDialog from './components/RechargeDialog.vue';

interface BalanceRow extends Record<string, any> {
	currencyText?: string;
	vaultBal?: { value: number | string; unit?: string };
	invoicedAmt?: { value: number | string; unit?: string };
	uninvoicedAmt?: { value: number | string; unit?: string };
	creditLimit?: { value: number | string; unit?: string };
	curBal?: { value: number | string; unit?: string };
}

const { t } = useI18n();
const loading = ref(false);
const balance = ref<BalanceRow | BalanceRow[]>({});
const rechargeVisible = ref(false);
const rechargeRow = ref<BalanceRow | undefined>(undefined);

const balanceList = computed(() => {
	if (Array.isArray(balance.value)) return balance.value;
	if (balance.value && Object.keys(balance.value).length) return [balance.value];
	return [];
});

const openRecharge = (row: BalanceRow) => {
	rechargeRow.value = row;
	rechargeVisible.value = true;
};

const loadBalance = async () => {
	loading.value = true;
	try {
		const res = await getBalance();
		balance.value = res.result || {};
	} finally {
		loading.value = false;
	}
};

onMounted(loadBalance);
</script>

<style scoped>
.balance-page {
	padding: 12px;
}
</style>
