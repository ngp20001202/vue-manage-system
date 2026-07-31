<template>
	<div class="parcel-create">
		<el-card shadow="never" class="section-card">
			<div class="ordernbr-box">
				<el-input
					v-model="clientRefNbr"
					:placeholder="t('pages.Parcels.list.order') || '客户参考号（可选）'"
					clearable
				/>
			</div>
		</el-card>

		<!-- Shipper + Consignee (split panel: left 1/3, right 2/3) -->
		<el-card shadow="never" class="section-card">
			<div class="address-split">
				<div class="address-split-left">
					<div class="section-header">
						<h2>{{ t('pages.Shipper') || '寄件人' }}</h2>
				<el-button type="primary" link @click="openShipperEdit('')">
					<el-icon><Plus /></el-icon>
					{{ t('pages.Parcels.create.NewAddress') || '新增地址' }}
				</el-button>
			</div>
			<hr class="divider" />
			<div class="address-selector">
				<el-button
					class="address-trigger"
					plain
					@click="shipperDropdown = !shipperDropdown"
				>
					<span class="truncate">
						{{ shipper?.contact?.name || '无寄件地址' }}
					</span>
					<el-icon class="caret"><ArrowDown /></el-icon>
				</el-button>
				<div v-if="shipperDropdown" class="address-dropdown">
					<el-input
						v-model="shipperSearch"
						placeholder="搜索..."
						clearable
						class="address-search"
					/>
					<ul class="address-list">
						<li
							v-if="filteredShippers.length === 0"
							class="empty-item"
						>
							无结果
						</li>
						<li
							v-for="(item, idx) in filteredShippers"
							:key="idx"
							class="address-item"
							@click="selectShipper(item)"
						>
							<div class="address-name">{{ item.contact?.name }}</div>
							<div class="address-sub">
								{{ item.contact?.street1 }}, {{ item.contact?.city }},
								{{ item.contact?.province }}, {{ item.contact?.postalCode }}
							</div>
						</li>
					</ul>
				</div>
			</div>
			<div v-if="shipper?.contact?.name" class="selected-address">
				<div class="address-info">
					<p>
						<span class="bolder">{{ shipper.contact.name }}</span>
						<span class="ml-8">{{ shipper.contact.phone }}</span>
					</p>
					<p class="address-line">
						{{ shipper.contact.street1 }}, {{ shipper.contact.city }},
						{{ shipper.contact.province }}, {{ shipper.contact.postalCode }},
						{{ shipper.contact.countryCode }}
					</p>
				</div>
				<el-button type="primary" link @click="openShipperEdit(shipper.id)">
					{{ t('pages.Parcels.create.Edit') || '编辑' }}
				</el-button>
			</div>
				</div>

				<div class="address-split-right">
					<div class="section-header">
						<h2>{{ t('pages.Consignee') || '收件人' }}</h2>
				<el-button type="primary" link @click="addressBookVisible = true">
					<el-icon><Notebook /></el-icon>
					{{ t('pages.SelectAddress') || '选择地址簿' }}
				</el-button>
			</div>
			<el-form
				ref="cneeFormRef"
				:model="cnee"
				:rules="cneeRules"
				label-position="top"
				inline
				class="inline-form"
			>
				<el-form-item :label="t('pages.Name') || '姓名'" prop="Name">
					<el-input v-model="cnee.Name" />
				</el-form-item>
				<el-form-item :label="t('pages.company') || '公司'" prop="Company">
					<el-input v-model="cnee.Company" maxlength="50" />
				</el-form-item>
				<el-form-item :label="t('pages.Phone') || '电话'" prop="Phone">
					<el-input v-model="cnee.Phone" maxlength="20" />
				</el-form-item>
				<el-form-item :label="t('pages.Email') || '邮箱'" prop="Email">
					<el-input v-model="cnee.Email" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine1') || '地址行1'" prop="Street1">
					<el-input v-model="cnee.Street1" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine2') || '地址行2'">
					<el-input v-model="cnee.Street2" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine3') || '地址行3'">
					<el-input v-model="cnee.Street3" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.City') || '城市'" prop="City">
					<el-input v-model="cnee.City" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.ProvinceState') || '省/州'" prop="Province">
					<el-input v-model="cnee.Province" maxlength="20" />
				</el-form-item>
				<el-form-item :label="t('pages.ZipPostalCode') || '邮编'" prop="PostalCode">
					<el-input v-model="cnee.PostalCode" maxlength="10" />
				</el-form-item>
				<el-form-item :label="t('pages.countrycode') || '国家/区域'" prop="CountryCode">
					<el-select v-model="cnee.CountryCode" filterable>
						<el-option
							v-for="item in countries"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.IsSign') || '签收确认'">
					<el-radio-group v-model="isSign">
						<el-radio :label="0">{{ t('pages.no') || '否' }}</el-radio>
						<el-radio :label="1">{{ t('pages.yes') || '是' }}</el-radio>
					</el-radio-group>
				</el-form-item>
				</el-form>
				</div>
			</div>
		</el-card>

		<!-- Parcel declarations (multiple packages) -->
		<el-card shadow="never" class="section-card">
			<div
				v-for="(pkg, pkgIndex) in parcels"
				:key="pkgIndex"
				class="parcel-block"
			>
				<div class="section-header">
					<h4>包裹 {{ pkgIndex + 1 }}</h4>
					<div class="parcel-actions">
						<span
							v-if="pkgIndex === parcels.length - 1"
							class="action-link"
							@click="addPackage"
						>
							<el-icon><CirclePlus /></el-icon>
							{{ t('pages.Parcels.create.NewPackage') || '新增包裹' }}
						</span>
						<span
							v-if="parcels.length - 1 !== 0"
							class="action-link"
							@click="removePackage(pkgIndex)"
						>
							<el-icon><Remove /></el-icon>
							{{ t('pages.Parcels.create.RemovePackage') || '删除包裹' }}
						</span>
					</div>
				</div>
				<hr class="divider" />
				<el-form
					:ref="(el) => (pkgForms[pkgIndex] = el)"
					:model="pkg"
					:rules="pkgRules"
					label-position="top"
					inline
					class="inline-form"
				>
					<el-form-item :label="t('pages.Weight') || '重量'" prop="DecalaredWt">
						<el-input
							v-model="pkg.DecalaredWt"
							type="number"
							min="0"
							step="1"
							style="width: 200px"
						>
							<template #append>
								<el-select v-model="pkg.WeightUnit" style="width: 90px">
									<el-option
										v-for="val in weightOptions"
										:key="val.label"
										:label="val.label"
										:value="val.value"
									/>
								</el-select>
							</template>
						</el-input>
					</el-form-item>
					<el-form-item :label="t('pages.Length') || '长'">
						<el-input
							v-model="pkg.DeclaredLen"
							type="number"
							min="0"
							style="width: 140px"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.Width') || '宽'">
						<el-input
							v-model="pkg.DeclaredWidth"
							type="number"
							min="0"
							style="width: 140px"
						/>
					</el-form-item>
					<el-form-item :label="t('pages.Height') || '高'">
						<el-input
							v-model="pkg.DeclaredHeight"
							type="number"
							min="0"
							style="width: 140px"
						>
							<template #append>
								<el-select v-model="pkg.DimUnit" style="width: 90px">
									<el-option
										v-for="val in dimOptions"
										:key="val.label"
										:label="val.label"
										:value="val.value"
									/>
								</el-select>
							</template>
						</el-input>
					</el-form-item>
					<el-form-item :label="t('pages.PiecesCount') || '件数'" prop="Count">
						<el-input
							v-model="pkg.Count"
							type="number"
							min="1"
							style="width: 140px"
						/>
					</el-form-item>
				</el-form>

				<!-- Line items per package -->
				<div
					v-for="(item, itemIndex) in pkg.LineInfos"
					:key="itemIndex"
					class="lineinfo-block"
				>
					<el-form
						:ref="(el) => (itemForms[`${pkgIndex}_${itemIndex}`] = el)"
						:model="item"
						:rules="itemRules"
						label-position="top"
						inline
						class="inline-form"
					>
						<el-form-item
							:label="t('pages.Parcels.create.Name') || '品名'"
							prop="GoodsInfo.Name"
						>
							<el-input v-model="item.GoodsInfo.Name" />
						</el-form-item>
						<el-form-item :label="t('pages.LineTotal') || '单价'" prop="LineTotal.Value">
							<el-input
								v-model="item.LineTotal.Value"
								type="number"
								min="0"
								style="width: 180px"
							>
								<template #append>
									<el-select v-model="item.LineTotal.Unit" style="width: 100px">
										<el-option
											v-for="option in priceOptions"
											:key="option.label"
											:label="option.label"
											:value="option.value"
										/>
									</el-select>
								</template>
							</el-input>
						</el-form-item>
						<el-form-item :label="t('pages.Parcels.create.LocalName') || '本地名'">
							<el-input v-model="item.GoodsInfo.LocalName" />
						</el-form-item>
						<el-form-item :label="t('pages.Quantity') || '数量'" prop="Quantity">
							<el-input
								v-model="item.Quantity"
								type="number"
								min="1"
								style="width: 120px"
							/>
						</el-form-item>
						<el-form-item :label="t('pages.HSCode') || '海关编码'">
							<el-input v-model="item.GoodsInfo.HSCode" />
						</el-form-item>
						<div class="item-actions">
							<el-button
								type="warning"
								link
								@click="copyLineItem(pkgIndex, item)"
							>
								<el-icon><DocumentCopy /></el-icon>
							</el-button>
							<el-button
								v-if="pkg.LineInfos.length - 1 !== 0"
								type="danger"
								link
								@click="removeLineItem(pkgIndex, itemIndex)"
							>
								<el-icon><CircleClose /></el-icon>
							</el-button>
							<el-button
								v-if="itemIndex === pkg.LineInfos.length - 1"
								type="primary"
								link
								@click="addLineItem(pkgIndex)"
							>
								<el-icon><CirclePlus /></el-icon>
								{{ t('pages.Parcels.create.NewItem') || '新增品项' }}
							</el-button>
						</div>
					</el-form>
					<hr class="divider thin" />
				</div>
			</div>
		</el-card>

		<!-- Service selection & rate preview -->
		<el-card v-if="ratePreview.length" shadow="never" class="section-card">
			<div class="section-header">
				<h2>{{ t('pages.services') || '服务与报价' }}</h2>
				<el-button
					:loading="rateLoading"
					type="primary"
					plain
					@click="fetchRates"
				>
					<el-icon><Refresh /></el-icon>
					{{ t('pages.refreshrate') || '刷新报价' }}
				</el-button>
			</div>
			<el-table :data="ratePreview" v-loading="rateLoading" border>
				<el-table-column
					:label="t('pages.Channelname') || '渠道'"
					prop="name"
				/>
				<el-table-column :label="t('pages.Quote') || '报价'" width="200">
					<template #default="scope">
						<span v-if="scope.row.show" class="rate-value">
							{{ scope.row.quote }}
						</span>
						<span v-else class="rate-error">{{ scope.row.quote }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('pages.Action') || '操作'" width="180" align="center">
					<template #default="scope">
						<el-button
							v-if="scope.row.show"
							type="primary"
							size="small"
							:loading="payLoading"
							@click="confirmOrder(scope.row)"
						>
							{{ t('pages.Orderconfirmation') || '确认下单' }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- Submit actions -->
		<div class="actions-bar">
			<el-button
				type="warning"
				:loading="rateLoading"
				:icon="Search"
				@click="getQuote"
			>
				{{ t('pages.Getaquote') || '获取报价' }}
			</el-button>
			<el-button
				type="primary"
				:loading="submitLoading"
				:icon="Check"
				@click="onSubmit"
			>
				{{ t('pages.Submit') || '提交下单' }}
			</el-button>
		</div>

		<!-- Address book dialog (Amazon recipients) -->
		<el-dialog
			v-model="addressBookVisible"
			:title="t('pages.SelectAddress') || '地址簿'"
			width="50%"
		>
			<el-input
				v-model="addressBookSearch"
				:placeholder="t('pages.Pleaseinput') + (t('pages.Searchcontent') || '搜索内容')"
				clearable
			/>
			<div class="addressbook-list">
				<div
					v-if="filteredAddressBook.length === 0"
					class="empty-tip"
				>
					无结果
				</div>
				<div
					v-for="(item, idx) in filteredAddressBook"
					:key="idx"
					class="addressbook-item"
					@click="selectFromAddressBook(item)"
				>
					<h3>{{ item.name }}</h3>
				</div>
			</div>
		</el-dialog>

		<!-- Shipper edit dialog -->
		<el-dialog
			v-model="shipperEditVisible"
			:title="(t('pages.Shipper') || '寄件人') + ' - ' + (shipperEditId ? (t('pages.Edit') || '编辑') : (t('pages.Create') || '新建'))"
			width="60%"
			:close-on-click-modal="false"
		>
			<el-form
				ref="shipperEditFormRef"
				:model="shipperEditForm"
				:rules="shipperEditRules"
				label-position="top"
				inline
				class="inline-form"
			>
				<el-form-item :label="t('pages.Name') || '姓名'" prop="Name">
					<el-input v-model="shipperEditForm.Name" />
				</el-form-item>
				<el-form-item :label="t('pages.Phone') || '电话'" prop="Phone">
					<el-input v-model="shipperEditForm.Phone" maxlength="20" />
				</el-form-item>
				<el-form-item :label="t('pages.countrycode') || '国家/区域'" prop="CountryCode">
					<el-select v-model="shipperEditForm.CountryCode" filterable>
						<el-option
							v-for="item in countries"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine1') || '地址行1'" prop="Street1">
					<el-input v-model="shipperEditForm.Street1" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine2') || '地址行2'">
					<el-input v-model="shipperEditForm.Street2" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.StreetLine3') || '地址行3'">
					<el-input v-model="shipperEditForm.Street3" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.City') || '城市'" prop="City">
					<el-input v-model="shipperEditForm.City" maxlength="35" />
				</el-form-item>
				<el-form-item :label="t('pages.ProvinceState') || '省/州'" prop="Province">
					<el-input v-model="shipperEditForm.Province" maxlength="20" />
				</el-form-item>
				<el-form-item :label="t('pages.ZipPostalCode') || '邮编'" prop="PostalCode">
					<el-input v-model="shipperEditForm.PostalCode" maxlength="10" />
				</el-form-item>
				<el-form-item :label="t('pages.district') || '区'">
					<el-input v-model="shipperEditForm.District" maxlength="20" />
				</el-form-item>
				<el-form-item :label="t('pages.DefaultAddress') || '默认地址'">
					<el-switch v-model="shipperEditForm.isDefault" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="shipperEditVisible = false">
					{{ t('pages.Cancel') || '取消' }}
				</el-button>
				<el-button type="primary" :loading="shipperEditLoading" @click="saveShipper">
					{{ t('pages.Submit') || '保存' }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
	Plus,
	ArrowDown,
	Notebook,
	CirclePlus,
	Remove,
	CircleClose,
	DocumentCopy,
	Refresh,
	Search,
	Check,
} from '@element-plus/icons-vue';
import {
	createparcel,
	postrate,
	parcelsender,
	getservices,
	getAmazon,
	addressdetail,
	addresscreate,
	addressedit,
} from '@/api/parcel';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();
const router = useRouter();

// Country list (a static subset; full list provided via dropdown)
const countries = ref<Array<{ value: string; label: string }>>([
	{ value: 'CN', label: '中国 (CN)' },
	{ value: 'US', label: '美国 (US)' },
	{ value: 'CA', label: '加拿大 (CA)' },
	{ value: 'GB', label: '英国 (GB)' },
	{ value: 'DE', label: '德国 (DE)' },
	{ value: 'FR', label: '法国 (FR)' },
	{ value: 'JP', label: '日本 (JP)' },
	{ value: 'KR', label: '韩国 (KR)' },
	{ value: 'AU', label: '澳大利亚 (AU)' },
	{ value: 'SG', label: '新加坡 (SG)' },
	{ value: 'HK', label: '中国香港 (HK)' },
	{ value: 'TW', label: '中国台湾 (TW)' },
	{ value: 'MY', label: '马来西亚 (MY)' },
	{ value: 'TH', label: '泰国 (TH)' },
	{ value: 'IT', label: '意大利 (IT)' },
	{ value: 'ES', label: '西班牙 (ES)' },
	{ value: 'NL', label: '荷兰 (NL)' },
	{ value: 'MX', label: '墨西哥 (MX)' },
	{ value: 'BR', label: '巴西 (BR)' },
]);

const weightOptions = [
	{ label: 'KG', value: 2 },
	{ label: 'LB', value: 3 },
];

const dimOptions = [
	{ label: 'CM', value: 1 },
	{ label: 'IN', value: 2 },
];

const priceOptions = [
	{ label: 'USD', value: 1 },
	{ label: 'CNY', value: 2 },
	{ label: 'EUR', value: 3 },
	{ label: 'GBP', value: 4 },
	{ label: 'CAD', value: 5 },
	{ label: 'JPY', value: 6 },
	{ label: 'KRW', value: 7 },
	{ label: 'AUD', value: 8 },
	{ label: 'HKD', value: 9 },
	{ label: 'MYR', value: 10 },
	{ label: 'TWD', value: 11 },
	{ label: 'NOK', value: 12 },
];

// Order number (optional)
const clientRefNbr = ref('');

// Shipper state
interface AddressItem {
	id?: string | number;
	type?: number;
	isDefault?: boolean;
	contact?: {
		name?: string;
		phone?: string;
		email?: string;
		company?: string;
		street1?: string;
		street2?: string;
		street3?: string;
		city?: string;
		province?: string;
		postalCode?: string;
		countryCode?: string;
		district?: string;
	};
}

const shipper = ref<AddressItem>({});
const shipperList = ref<AddressItem[]>([]);
const shipperDropdown = ref(false);
const shipperSearch = ref('');
const filteredShippers = computed(() => {
	const kw = shipperSearch.value?.toLowerCase() || '';
	return shipperList.value.filter((item) => {
		if (!item.contact) return false;
		return Object.values(item.contact).some((v) =>
			String(v ?? '').toLowerCase().includes(kw),
		);
	});
});

// Consignee
interface Consignee {
	Name: string;
	Phone: string;
	Email: string;
	Company: string;
	Street1: string;
	Street2: string;
	Street3: string;
	District: string;
	City: string;
	Province: string;
	PostalCode: string;
	CountryCode: string;
}

const cnee = reactive<Consignee>({
	Name: '',
	Phone: '',
	Email: '',
	Company: '',
	Street1: '',
	Street2: '',
	Street3: '',
	District: '',
	City: '',
	Province: '',
	PostalCode: '',
	CountryCode: '',
});
const isSign = ref<0 | 1>(0);

const cneeFormRef = ref<FormInstance>();
const cneeRules = reactive<FormRules>({
	Name: [{ required: true, message: '姓名不能为空', trigger: 'change' }],
	Phone: [
		{ required: true, message: '电话不能为空', trigger: 'change' },
		{
			pattern: /^[0-9+\-\s()]{6,20}$/,
			message: '电话格式不正确',
			trigger: 'change',
		},
	],
	Email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'change' }],
	Street1: [{ required: true, message: '地址行1不能为空', trigger: 'change' }],
	City: [{ required: true, message: '城市不能为空', trigger: 'change' }],
	Province: [{ required: true, message: '省/州不能为空', trigger: 'change' }],
	PostalCode: [{ required: true, message: '邮编不能为空', trigger: 'change' }],
	CountryCode: [{ required: true, message: '请选择国家/区域', trigger: 'change' }],
});

// Parcel items
interface LineInfo {
	GoodsInfo: {
		Sku: string;
		Name: string;
		HSCode: string;
		LocalName: string;
		Brand?: string;
		Model?: string;
	};
	LineTotal: { Value: string | number; Unit: number };
	Quantity: number;
	CmdyID: number;
}

interface Parcel {
	Count: number;
	DecalaredWt: string | number;
	WeightUnit: number;
	DimUnit: number;
	DeclaredLen: string | number;
	DeclaredWidth: string | number;
	DeclaredHeight: string | number;
	PickingInfo: string;
	LineInfos: LineInfo[];
}

const parcels = ref<Parcel[]>([
	{
		Count: 1,
		DecalaredWt: '',
		WeightUnit: 2,
		DimUnit: 1,
		DeclaredLen: '',
		DeclaredWidth: '',
		DeclaredHeight: '',
		PickingInfo: '',
		LineInfos: [
			{
				GoodsInfo: { Sku: '', Name: '', HSCode: '', LocalName: '' },
				LineTotal: { Value: '', Unit: 1 },
				Quantity: 1,
				CmdyID: 0,
			},
		],
	},
]);

const pkgForms = ref<Record<number, FormInstance | null>>({});
const itemForms = ref<Record<string, FormInstance | null>>({});

const validatePositiveNumber = (_rule: any, value: any, callback: any) => {
	if (value === '' || value === null || value === undefined) {
		callback(new Error('数据不能为空'));
	} else if (isNaN(Number(value))) {
		callback(new Error('非法数字'));
	} else if (Number(value) <= 0) {
		callback(new Error('数据必须大于 0'));
	} else {
		callback();
	}
};

const pkgRules = reactive<FormRules>({
	DecalaredWt: [{ required: true, validator: validatePositiveNumber, trigger: 'change' }],
	Count: [{ required: true, validator: validatePositiveNumber, trigger: 'change' }],
});

const itemRules = reactive<FormRules>({
	'GoodsInfo.Name': [
		{ required: true, message: '品名不能为空', trigger: 'change' },
	],
	'LineTotal.Value': [
		{ required: true, validator: validatePositiveNumber, trigger: 'change' },
	],
	Quantity: [
		{ required: true, validator: validatePositiveNumber, trigger: 'change' },
	],
});

const addPackage = () => {
	parcels.value.push({
		Count: 1,
		DecalaredWt: '',
		WeightUnit: 2,
		DimUnit: 1,
		DeclaredLen: '',
		DeclaredWidth: '',
		DeclaredHeight: '',
		PickingInfo: '',
		LineInfos: [
			{
				GoodsInfo: { Sku: '', Name: '', HSCode: '', LocalName: '' },
				LineTotal: { Value: '', Unit: 1 },
				Quantity: 1,
				CmdyID: 0,
			},
		],
	});
};
const removePackage = (idx: number) => {
	parcels.value.splice(idx, 1);
};
const addLineItem = (pkgIdx: number) => {
	parcels.value[pkgIdx].LineInfos.push({
		GoodsInfo: { Sku: '', Name: '', HSCode: '', LocalName: '' },
		LineTotal: { Value: '', Unit: 1 },
		Quantity: 1,
		CmdyID: 0,
	});
};
const removeLineItem = (pkgIdx: number, itemIdx: number) => {
	parcels.value[pkgIdx].LineInfos.splice(itemIdx, 1);
};
const copyLineItem = (pkgIdx: number, item: LineInfo) => {
	parcels.value[pkgIdx].LineInfos.push({
		GoodsInfo: { ...item.GoodsInfo },
		LineTotal: { ...item.LineTotal },
		Quantity: item.Quantity,
		CmdyID: 0,
	});
};

// Address book (Amazon recipients)
const addressBookVisible = ref(false);
const addressBookList = ref<any[]>([]);
const addressBookSearch = ref('');
const filteredAddressBook = computed(() => {
	const kw = addressBookSearch.value;
	if (!kw) return addressBookList.value;
	const pattern = new RegExp(kw, 'i');
	return addressBookList.value.filter((item) => pattern.test(String(item.name || '')));
});

// Shipper edit dialog
const shipperEditVisible = ref(false);
const shipperEditId = ref<string>('');
const shipperEditLoading = ref(false);
const shipperEditFormRef = ref<FormInstance>();
const shipperEditForm = reactive({
	Name: '',
	Phone: '',
	Company: '',
	Street1: '',
	Street2: '',
	Street3: '',
	District: '',
	City: '',
	Province: '',
	PostalCode: '',
	CountryCode: '',
	isDefault: false,
});
const shipperEditRules = reactive<FormRules>({
	Name: [{ required: true, message: '姓名不能为空', trigger: 'change' }],
	Phone: [{ required: true, message: '电话不能为空', trigger: 'change' }],
	CountryCode: [{ required: true, message: '请选择国家/区域', trigger: 'change' }],
	Street1: [{ required: true, message: '地址行1不能为空', trigger: 'change' }],
	City: [{ required: true, message: '城市不能为空', trigger: 'change' }],
	Province: [{ required: true, message: '省/州不能为空', trigger: 'change' }],
	PostalCode: [{ required: true, message: '邮编不能为空', trigger: 'change' }],
});

// Service rate preview
interface RateRow {
	id: string | number;
	name: string;
	lastMilerID?: string | number;
	show: boolean;
	quote: string;
}
const ratePreview = ref<RateRow[]>([]);
const rateLoading = ref(false);
const payLoading = ref(false);
const submitLoading = ref(false);

// ------- API helpers -------

const fetchShippers = async () => {
	const res: ApiResponse<any[]> = await parcelsender();
	if (res?.isSuccess && Array.isArray(res.result)) {
		const list: AddressItem[] = res.result.filter((it: any) => it.type === 'Shipping' || it.type === 2);
		shipperList.value = list;
		// Auto-select default
		if (!shipper.value?.contact?.name) {
			if (list.length === 1) {
				shipper.value = list[0];
			} else {
				const def = list.find((it) => it.isDefault);
				if (def) shipper.value = def;
			}
		}
	}
};

const selectShipper = (item: AddressItem) => {
	shipper.value = item;
	shipperDropdown.value = false;
};

const openShipperEdit = async (id: string | number | '') => {
	shipperEditId.value = id ? String(id) : '';
	shipperEditFormRef.value?.resetFields();
	Object.assign(shipperEditForm, {
		Name: '',
		Phone: '',
		Company: '',
		Street1: '',
		Street2: '',
		Street3: '',
		District: '',
		City: '',
		Province: '',
		PostalCode: '',
		CountryCode: '',
		isDefault: false,
	});
	if (shipperEditId.value) {
		const res: ApiResponse<any> = await addressdetail(shipperEditId.value);
		if (res?.isSuccess && res.result?.contact) {
			const c = res.result.contact;
			Object.assign(shipperEditForm, {
				Name: c.name,
				Phone: c.phone,
				Company: c.company,
				Street1: c.street1,
				Street2: c.street2,
				Street3: c.street3,
				District: c.district,
				City: c.city,
				Province: c.province,
				PostalCode: c.postalCode,
				CountryCode: c.countryCode,
				isDefault: !!res.result.isDefault,
			});
		}
	}
	shipperEditVisible.value = true;
};

const saveShipper = () => {
	shipperEditFormRef.value?.validate(async (valid) => {
		if (!valid) return;
		shipperEditLoading.value = true;
		try {
			const payload: any = {
				Type: 2,
				Contact: {
					Name: shipperEditForm.Name,
					Phone: shipperEditForm.Phone,
					Email: '',
					Company: shipperEditForm.Company,
					Street1: shipperEditForm.Street1,
					Street2: shipperEditForm.Street2,
					Street3: shipperEditForm.Street3,
					District: shipperEditForm.District || '',
					City: shipperEditForm.City,
					Province: shipperEditForm.Province,
					PostalCode: shipperEditForm.PostalCode,
					CountryCode: shipperEditForm.CountryCode,
				},
				IsDefault: shipperEditForm.isDefault,
			};
			const res: ApiResponse<any> = shipperEditId.value
				? await addressedit({ ID: shipperEditId.value, ...payload })
				: await addresscreate(payload);
			if (res?.isSuccess) {
				ElMessage.success(shipperEditId.value ? '修改成功' : '创建成功');
				shipperEditVisible.value = false;
				await fetchShippers();
			} else {
				ElMessage.error(res?.message || '操作失败');
			}
		} finally {
			shipperEditLoading.value = false;
		}
	});
};

const fetchAddressBook = async () => {
	const res: ApiResponse<any[]> = await getAmazon();
	if (res?.isSuccess && Array.isArray(res.result)) {
		addressBookList.value = res.result;
	}
};

const selectFromAddressBook = (item: any) => {
	const code = item.code || item;
	cnee.Name = code.name || '';
	cnee.Phone = code.phone || '';
	cnee.Email = code.email || '';
	cnee.Company = code.company || '';
	cnee.Street1 = code.street1 || '';
	cnee.Street2 = code.street2 || '';
	cnee.Street3 = code.street3 || '';
	cnee.District = code.district || '';
	cnee.City = code.city || '';
	cnee.Province = code.province || '';
	cnee.PostalCode = code.postalCode || '';
	cnee.CountryCode = code.countryCode || '';
	addressBookVisible.value = false;
};

// ------- Quote / rate -------

const buildPackages = () =>
	parcels.value.map((p) => ({
		Count: Number(p.Count) || 1,
		Weight: {
			Value: Number(p.DecalaredWt) || 0,
			Unit: p.WeightUnit,
		},
		Dimension: {
			Length: Number(p.DeclaredLen) || 0,
			Width: Number(p.DeclaredWidth) || 0,
			Height: Number(p.DeclaredHeight) || 0,
			Unit: p.DimUnit,
		},
	}));

const fetchServices = async () => {
	const res: ApiResponse<any[]> = await getservices();
	if (res?.isSuccess && Array.isArray(res.result)) {
		return res.result;
	}
	return [];
};

const fetchRateForService = async (svc: any) => {
	try {
		const payload = {
			Id: svc.id,
			LastMilerID: svc.lastMilerID,
			ServiceOptions: { deliveryConfirmation: isSign.value },
			Shipper: {
				name: shipper.value?.contact?.name,
				phone: shipper.value?.contact?.phone,
				email: '',
				company: shipper.value?.contact?.company,
				street1: shipper.value?.contact?.street1,
				street2: shipper.value?.contact?.street2 || '',
				street3: shipper.value?.contact?.street3 || '',
				city: shipper.value?.contact?.city,
				province: shipper.value?.contact?.province,
				postalCode: shipper.value?.contact?.postalCode,
				countryCode: shipper.value?.contact?.countryCode,
			},
			Consignee: {
				name: cnee.Name,
				phone: cnee.Phone,
				company: cnee.Company || null,
				street1: cnee.Street1,
				city: cnee.City,
				province: cnee.Province,
				postalCode: cnee.PostalCode,
				countryCode: cnee.CountryCode,
			},
			Packages: buildPackages(),
		};
		const res: ApiResponse<any> = await postrate(payload);
		if (res?.isSuccess) {
			if (res.result?.totalCharge) {
				return { show: true, quote: String(res.result.totalCharge) };
			}
			return { show: false, quote: res.result?.remarks || '不可用' };
		}
		return { show: false, quote: '获取报价失败' };
	} catch (e) {
		return { show: false, quote: '获取报价失败' };
	}
};

const fetchRates = async () => {
	// Validate consignee + shipper
	if (!shipper.value?.contact?.name) {
		ElMessage.error('请先选择寄件人');
		return;
	}
	const validCnee = await cneeFormRef.value?.validate().catch(() => false);
	if (!validCnee) {
		ElMessage.error('请完善收件人信息');
		return;
	}
	rateLoading.value = true;
	ratePreview.value = [];
	try {
		const services = await fetchServices();
		const rows: RateRow[] = [];
		for (const svc of services) {
			const r = await fetchRateForService(svc);
			rows.push({
				id: svc.id,
				name: svc.name,
				lastMilerID: svc.lastMilerID,
				show: r.show,
				quote: r.quote,
			});
		}
		// sort: show=true first
		rows.sort((a, b) => (a.show === b.show ? 0 : a.show ? -1 : 1));
		ratePreview.value = rows;
	} finally {
		rateLoading.value = false;
	}
};

const getQuote = () => {
	fetchRates();
};

// ------- Submit / confirm order -------

const buildPayload = (svcId?: string | number, lastMilerID?: string | number) => ({
	POA: null,
	ClientRefNbr: clientRefNbr.value || '',
	RootSvcID: svcId,
	ServiceOptions: { deliveryConfirmation: isSign.value },
	Cnee: {
		Name: cnee.Name,
		Phone: cnee.Phone,
		Email: cnee.Email || null,
		Company: cnee.Company || null,
		Street1: cnee.Street1,
		Street2: cnee.Street2 || null,
		Street3: cnee.Street3 || null,
		District: cnee.District || null,
		City: cnee.City,
		Province: cnee.Province,
		PostalCode: cnee.PostalCode,
		CountryCode: cnee.CountryCode,
	},
	Shipper: {
		Name: shipper.value?.contact?.name,
		Phone: shipper.value?.contact?.phone,
		Email: '',
		Company: shipper.value?.contact?.company,
		Street1: shipper.value?.contact?.street1,
		Street2: shipper.value?.contact?.street2 || '',
		Street3: shipper.value?.contact?.street3 || '',
		District: shipper.value?.contact?.district || '',
		City: shipper.value?.contact?.city,
		Province: shipper.value?.contact?.province,
		PostalCode: shipper.value?.contact?.postalCode,
		CountryCode: shipper.value?.contact?.countryCode,
	},
	Volumeweights: parcels.value.map((p) => ({
		DecalaredWt: Number(p.DecalaredWt) || 0,
		WeightUnit: p.WeightUnit,
		DeclaredLen: Number(p.DeclaredLen) || 0,
		DeclaredWidth: Number(p.DeclaredWidth) || 0,
		DeclaredHeight: Number(p.DeclaredHeight) || 0,
		DimUnit: p.DimUnit,
		PickingInfo: p.PickingInfo,
		Count: Number(p.Count) || 1,
	})),
	LineInfos: parcels.value.flatMap((p) =>
		p.LineInfos.map((it) => ({
			GoodsInfo: {
				Sku: it.GoodsInfo.Sku || '',
				Spec: '',
				Name: it.GoodsInfo.Name,
				Brand: it.GoodsInfo.Brand || '',
				Model: it.GoodsInfo.Model || '',
				HSCode: it.GoodsInfo.HSCode,
				LocalName: it.GoodsInfo.LocalName,
			},
			LineTotal: {
				Value: Number(it.LineTotal.Value) || 0,
				Unit: it.LineTotal.Unit,
			},
			Quantity: Number(it.Quantity) || 1,
			CmdyID: it.CmdyID,
		})),
	),
	LastMilerID: lastMilerID,
});

const confirmOrder = async (row: RateRow) => {
	if (payLoading.value) return;
	payLoading.value = true;
	try {
		const payload: any = buildPayload(row.id, row.lastMilerID);
		const res: ApiResponse<any> = await createparcel(payload);
		if (res?.isSuccess) {
			ElMessage.success('创建成功');
			setTimeout(() => {
				router.push('/parcel/list').catch(() => {
					router.go(0);
				});
			}, 800);
		} else {
			ElMessage.error(res?.message || '创建失败');
		}
	} finally {
		payLoading.value = false;
	}
};

const validateAllParcels = async (): Promise<boolean> => {
	// validate packages
	for (let i = 0; i < parcels.value.length; i++) {
		const form = pkgForms.value[i];
		if (!form) continue;
		const ok = await form.validate().catch(() => false);
		if (!ok) {
			ElMessage.error(`包裹 ${i + 1} 信息不完整`);
			return false;
		}
		for (let j = 0; j < parcels.value[i].LineInfos.length; j++) {
			const itemForm = itemForms.value[`${i}_${j}`];
			if (!itemForm) continue;
			const okItem = await itemForm.validate().catch(() => false);
			if (!okItem) {
				ElMessage.error(`包裹 ${i + 1} 品项 ${j + 1} 信息不完整`);
				return false;
			}
		}
	}
	return true;
};

const onSubmit = async () => {
	if (!shipper.value?.contact?.name) {
		ElMessage.error('请先选择寄件人');
		return;
	}
	const validCnee = await cneeFormRef.value?.validate().catch(() => false);
	if (!validCnee) {
		ElMessage.error('请完善收件人信息');
		return;
	}
	const parcelsOk = await validateAllParcels();
	if (!parcelsOk) return;

	submitLoading.value = true;
	try {
		// If user has fetched rates, use the first available service.
		// Otherwise, fetch rates then submit the first available.
		let svc = ratePreview.value.find((r) => r.show);
		if (!svc) {
			await fetchRates();
			svc = ratePreview.value.find((r) => r.show);
		}
		if (!svc) {
			ElMessage.error('暂无可用的服务渠道');
			return;
		}
		await confirmOrder(svc);
	} finally {
		submitLoading.value = false;
	}
};

// Close dropdown on outside click
const onDocClick = (e: MouseEvent) => {
	const target = e.target as HTMLElement;
	if (!target.closest('.address-selector')) {
		shipperDropdown.value = false;
	}
};

onMounted(async () => {
	await nextTick();
	document.addEventListener('mousedown', onDocClick);
	fetchShippers();
});
</script>

<style lang="scss" scoped>
.parcel-create {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.section-card {
	background: #fff;
}
.address-split {
	display: flex;
	gap: 20px;
}
.address-split-left {
	flex: 0 0 33.3333%;
	min-width: 0;
}
.address-split-right {
	flex: 1;
	min-width: 0;
	border-left: 1px solid #ebeef5;
	padding-left: 20px;
}
.address-split-right .inline-form {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 0 16px;
}
.address-split-right .inline-form .el-form-item {
	margin-right: 0;
}
@media (max-width: 1100px) {
	.address-split-right .inline-form {
		grid-template-columns: repeat(2, 1fr);
	}
}
@media (max-width: 720px) {
	.address-split {
		flex-direction: column;
	}
	.address-split-right {
		border-left: none;
		padding-left: 0;
		border-top: 1px solid #ebeef5;
		padding-top: 16px;
	}
	.address-split-right .inline-form {
		grid-template-columns: 1fr;
	}
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 10px;
	h2,
	h4 {
		margin: 0;
		font-weight: 600;
	}
}

.divider {
	border: 0;
	border-top: 1px solid #e5e5e5;
	margin: 10px 0;
	&.thin {
		margin: 6px 0;
		opacity: 0.5;
	}
}

.ordernbr-box {
	max-width: 360px;
}

.address-selector {
	position: relative;
	margin-bottom: 8px;
}

.address-trigger {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #fff;
}

.address-dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: #fff;
	border: 1px solid #ebeef5;
	border-radius: 4px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	z-index: 10;
	max-height: 320px;
	overflow: auto;
}

.address-search {
	margin: 8px;
}

.address-list {
	list-style: none;
	margin: 0;
	padding: 0;
	max-height: 240px;
	overflow: auto;
}

.address-item {
	padding: 10px 14px;
	cursor: pointer;
	background: #fafafa;
	border-bottom: 1px solid #f0f0f0;
	&:hover {
		background: #ecf5ff;
	}
}

.address-name {
	font-weight: 500;
	color: #303133;
}

.address-sub {
	font-size: 12px;
	color: #909399;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.empty-item {
	padding: 10px 14px;
	color: #909399;
}

.selected-address {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 10px 12px;
	background: #f5f7fa;
	border-radius: 4px;
	margin-top: 8px;
}

.address-info {
	flex: 1;
	p {
		margin: 4px 0;
	}
}

.address-line {
	color: #606266;
	font-size: 13px;
	line-height: 1.5;
}

.bolder {
	font-weight: 600;
}

.ml-8 {
	margin-left: 8px;
}

.inline-form {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.parcel-block {
	margin-bottom: 12px;
}

.parcel-actions {
	display: flex;
	gap: 12px;
}

.action-link {
	color: #409eff;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
}

.lineinfo-block {
	margin-top: 8px;
}

.item-actions {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-top: 30px;
}

.rate-value {
	color: #67c23a;
	font-weight: 600;
}

.rate-error {
	color: #909399;
}

.actions-bar {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 12px;
	background: #fff;
	border-radius: 4px;
}

.addressbook-list {
	margin-top: 12px;
	max-height: 400px;
	overflow: auto;
}

.addressbook-item {
	padding: 10px 12px;
	border-bottom: 1px solid #ebeef5;
	cursor: pointer;
	h3 {
		margin: 0;
		font-size: 14px;
	}
	&:hover {
		background: #ecf5ff;
	}
}

.empty-tip {
	color: #909399;
	padding: 12px;
	text-align: center;
}

@media (max-width: 768px) {
	.inline-form {
		flex-direction: column;
	}
	.address-trigger,
	.address-dropdown {
		width: 100%;
	}
}
</style>