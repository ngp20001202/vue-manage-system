<template>
	<div class="rows" v-loading="loading">
		<el-row :gutter="20">
			<el-col
				v-for="card in cardData"
				:key="card.id ?? card.currencyText"
				:xs="24"
				:md="12"
				:lg="8"
				class="mt"
			>
				<el-card shadow="hover" class="box-card">
					<template #header>
						<div class="card-header">
							<h2>{{ card.currencyText }}</h2>
						</div>
					</template>
					<div class="item">
						<h5>
							<span class="label">{{ t('pages.AccountBalance.CurrentBalance') }}:</span>
							<span class="value">{{ card.curBal?.value }}</span>
						</h5>
						<h5>
							<span class="label">{{ t('pages.AccountBalance.VaultBalance') }}:</span>
							<span class="value">{{ card.vaultBal?.value }}</span>
						</h5>
						<h5>
							<span class="label">{{ t('pages.AccountBalance.UninvoicedAmount') }}:</span>
							<span class="value">{{ card.uninvoicedAmt?.value }}</span>
						</h5>
					</div>
					<div class="recharge-box">
						<el-button class="recharge-btn" @click="onRecharge(card)">
							{{ t('pages.Recharge.Recharge') }}
						</el-button>
					</div>
				</el-card>
			</el-col>
		</el-row>
		<el-empty v-if="!loading && !cardData.length" :description="t('pages.NoData')" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { getBalance } from '@/api/accounting';

const { t } = useI18n();
const route = useRoute();
const user = useUserStore();

interface BalanceCard {
	id?: number;
	currencyText: string;
	curBal?: { value: number; unit: string };
	vaultBal?: { value: number; unit: string };
	uninvoicedAmt?: { value: number; unit: string };
	creditLimit?: { value: number; unit: string };
	invoicedAmt?: { value: number; unit: string };
}

const cardData = ref<BalanceCard[]>([]);
const loading = ref(false);

const loadBalance = async () => {
	loading.value = true;
	try {
		const res: any = await getBalance();
		if (res?.isSuccess && Array.isArray(res.result)) {
			cardData.value = res.result;
		} else {
			cardData.value = [];
		}
	} catch (e: any) {
		cardData.value = [];
	} finally {
		loading.value = false;
	}
};

const onRecharge = (_card: BalanceCard) => {
	ElMessage.info(t('pages.Recharge.Recharge') + ' - ' + (_card.currencyText || ''));
};

onMounted(async () => {
	const tokenInQuery = route.query.token as string | undefined;
	if (tokenInQuery) {
		await user.loginByToken(tokenInQuery);
	}
	await loadBalance();
});
</script>

<style scoped>
.rows {
	padding: 8px 16px;
}
.mt {
	margin-bottom: 20px;
}
.box-card {
	border: 1px solid #e4e7ed;
}
.card-header h2 {
	margin: 0;
	color: #28a745;
	font-size: 28px;
	font-weight: 600;
	letter-spacing: 0.5px;
}
.item h5 {
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 0;
	padding: 14px 0;
	font-size: 18px;
	font-weight: 400;
	border-top: 1px solid #e4e7ed;
}
.item h5:first-child {
	border-top: none;
	padding-top: 4px;
}
.item h5 .label {
	display: inline-block;
	width: 110px;
	color: #606266;
}
.item h5 .value {
	color: #303133;
	font-weight: 500;
}
.recharge-box {
	text-align: right;
	margin-top: 14px;
}
.recharge-btn {
	color: #fff;
	background-color: #28a745;
	border: none;
	border-radius: 8px;
	padding: 10px 24px;
	font-size: 16px;
}
.recharge-btn:hover {
	background-color: #218838;
	color: #fff;
}
</style>
