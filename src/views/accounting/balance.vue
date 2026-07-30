<template>
	<div class="balance-page">
		<el-card shadow="never">
			<template #header>
				<span>{{ t('menu.Accounting.AccountBalance') }}</span>
			</template>

			<el-descriptions v-loading="loading" :column="2" border>
				<el-descriptions-item :label="t('pages.AccountBalance.Currency')">
					{{ balance.currency }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.AccountBalance.VaultBalance')">
					{{ balance.vaultBalance }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.AccountBalance.InvoicedAmount')">
					{{ balance.invoicedAmount }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.AccountBalance.UninvoicedAmount')">
					{{ balance.uninvoicedAmount }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.AccountBalance.CreditLimit')">
					{{ balance.creditLimit }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.AccountBalance.CurrentBalance')">
					{{ balance.currentBalance }}
				</el-descriptions-item>
				<el-descriptions-item :label="t('pages.AccountBalance.LastUpdatedOn')" :span="2">
					{{ formatDate(balance.lastUpdatedOn) }}
				</el-descriptions-item>
			</el-descriptions>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { getBalance } from '@/api/accounting';

const { t } = useI18n();
const loading = ref(false);
const balance = ref<Record<string, any>>({});

const formatDate = (utc: string | undefined) => {
	if (!utc) return '-';
	return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
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
	padding: 20px;
}
</style>
