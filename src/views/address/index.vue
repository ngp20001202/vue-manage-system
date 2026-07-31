<template>
  <div class="address-list">
    <el-card shadow="never" class="filter-card">
      <div class="filter-row">
        <el-select
          v-model="type"
          class="type-select"
          :placeholder="t('pages.type')"
        >
          <el-option
            v-for="opt in typeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-button type="primary" :icon="Search" @click="onSearch">
          {{ t("pages.Search") }}
        </el-button>
        <el-button :icon="Refresh" @click="onReset">
          {{ t("pages.Reset") }}
        </el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div v-show="routeData.length" class="op-row">
        <el-button type="success" class="create-btn" :icon="Plus" @click="openCreate">
          {{ t("pages.address.create.title") }}
        </el-button>
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
        v-loading="loading"
        :data="routeData"
        style="width: 100%"
        border
        size="small"
      >
        <el-table-column :label="t('pages.ID')" width="120">
          <template #default="scope">
            <span class="cyan" @click="() => openEdit(scope.row)">
              <el-icon><Edit /></el-icon>{{ scope.row.id }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('pages.type')" width="120">
          <template #default="scope">
            {{ formatType(scope.row.Type ?? scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="t('pages.CountryCode')"
          :prop="addressProp('CountryCode')"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.company')"
          :prop="addressProp('Company')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.Name')"
          :prop="addressProp('Name')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.Phone')"
          :prop="addressProp('Phone')"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.Email')"
          :prop="addressProp('Email')"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.ProvinceState')"
          :prop="addressProp('Province')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.City')"
          :prop="addressProp('City')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.district')"
          :prop="addressProp('District')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.StreetLine1')"
          :prop="addressProp('Street1')"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.StreetLine2')"
          :prop="addressProp('Street2')"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.StreetLine3')"
          :prop="addressProp('Street3')"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.ZipPostalCode')"
          :prop="addressProp('PostalCode')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          :label="t('pages.Action')"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="() => onDelete(scope.row)"
            >
              {{ t("pages.Delete") }}
            </el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="
        dialogMode === 'create'
          ? t('pages.address.create.title')
          : t('pages.address.edit.title')
      "
      width="50%"
      destroy-on-close
      :close-on-click-modal="false"
      @closed="onDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        class="address-form"
      >
        <el-form-item :label="t('pages.type')" prop="Type">
          <el-select v-model="form.Type" style="width: 100%">
            <el-option
              v-for="opt in typeOptions.filter((o) => o.value !== 0)"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('pages.ContactName')" prop="Contact.Name">
          <el-input
            v-model="form.Contact.Name"
            :placeholder="t('pages.ContactName')"
          />
        </el-form-item>
        <el-form-item :label="t('pages.company')" prop="Contact.Company">
          <el-input
            v-model="form.Contact.Company"
            maxlength="50"
            :placeholder="t('pages.company')"
          />
        </el-form-item>
        <el-form-item :label="t('pages.Email')" prop="Contact.Email">
          <el-input
            v-model="form.Contact.Email"
            maxlength="50"
            :placeholder="t('pages.emailplace')"
          />
        </el-form-item>
        <el-form-item :label="t('pages.Phone')" prop="Contact.Phone">
          <el-input
            v-model="form.Contact.Phone"
            maxlength="20"
            :placeholder="t('pages.phoneplace')"
          />
        </el-form-item>
        <el-form-item
          :label="t('pages.CountryCode')"
          prop="Contact.CountryCode"
        >
          <el-select
            v-model="form.Contact.CountryCode"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in countries"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('pages.ProvinceState')" prop="Contact.Province">
          <el-input
            v-model="form.Contact.Province"
            :placeholder="t('pages.ProvinceStateplace')"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item :label="t('pages.City')" prop="Contact.City">
          <el-input
            v-model="form.Contact.City"
            :placeholder="t('pages.Cityplace')"
            maxlength="35"
          />
        </el-form-item>
        <el-form-item :label="t('pages.district')" prop="Contact.District">
          <el-input
            v-model="form.Contact.District"
            :placeholder="t('pages.districtplace')"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item :label="t('pages.StreetLine1')" prop="Contact.Street1">
          <el-input
            v-model="form.Contact.Street1"
            :placeholder="t('pages.StreetLine1place')"
            maxlength="35"
          />
        </el-form-item>
        <el-form-item :label="t('pages.StreetLine2')" prop="Contact.Street2">
          <el-input v-model="form.Contact.Street2" maxlength="35" />
        </el-form-item>
        <el-form-item :label="t('pages.StreetLine3')" prop="Contact.Street3">
          <el-input v-model="form.Contact.Street3" maxlength="35" />
        </el-form-item>
        <el-form-item
          :label="t('pages.ZipPostalCode')"
          prop="Contact.PostalCode"
        >
          <el-input
            v-model="form.Contact.PostalCode"
            :placeholder="t('pages.ZipPostalCodeplace')"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item
          :label="t('pages.address.create.default')"
          prop="IsDefault"
        >
          <el-switch v-model="form.IsDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{
          t("pages.Cancel")
        }}</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">
          {{ t("pages.address.create.confirm") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { Search, Refresh, Plus, Edit, Delete } from "@element-plus/icons-vue";
import {
  addresslist,
  addressdetail,
  addresscreate,
  addressupdate,
  addressdelete,
} from "@/api/address";
import type { ApiResponse } from "@/api/types";

const { t } = useI18n();

interface ContactBody {
  Name?: string;
  Phone?: string;
  Email?: string;
  Company?: string;
  Street1?: string;
  Street2?: string;
  Street3?: string;
  District?: string;
  City?: string;
  Province?: string;
  PostalCode?: string;
  CountryCode?: string;
}

interface AddressRow extends Record<string, any> {
  id: string | number;
  Type: string | number;
  IsDefault?: boolean;
  Contact?: ContactBody;
}

interface AddressFormState {
  id?: string | number;
  Type: number;
  IsDefault: boolean;
  Contact: ContactBody;
}

const typeOptions = [
  { value: 0, label: t("pages.type") },
  { value: 1, label: t("pages.address.type.Billing") },
  { value: 2, label: t("pages.address.type.Shipping") },
  { value: 3, label: t("pages.address.type.Returning") },
  { value: 4, label: t("pages.address.type.Amazon") },
  { value: 5, label: t("pages.address.type.Consignee") },
];

const typeKeyMap: Record<string, number> = {
  Billing: 1,
  Shipping: 2,
  Returning: 3,
  Amazon: 4,
  Consignee: 5,
};

const formatType = (value?: string | number) => {
  const num = typeof value === "string" ? typeKeyMap[value] ?? Number(value) : value;
  const found = typeOptions.find((o) => o.value === num);
  return found?.label || String(value || "");
};

const countries = ref<Array<{ value: string; label: string }>>([
  { value: "CN", label: "中国 (CN)" },
  { value: "US", label: "美国 (US)" },
  { value: "CA", label: "加拿大 (CA)" },
  { value: "GB", label: "英国 (GB)" },
  { value: "DE", label: "德国 (DE)" },
  { value: "FR", label: "法国 (FR)" },
  { value: "JP", label: "日本 (JP)" },
  { value: "KR", label: "韩国 (KR)" },
  { value: "AU", label: "澳大利亚 (AU)" },
  { value: "SG", label: "新加坡 (SG)" },
  { value: "HK", label: "中国香港 (HK)" },
  { value: "TW", label: "中国台湾 (TW)" },
  { value: "MY", label: "马来西亚 (MY)" },
  { value: "TH", label: "泰国 (TH)" },
  { value: "IT", label: "意大利 (IT)" },
  { value: "ES", label: "西班牙 (ES)" },
  { value: "NL", label: "荷兰 (NL)" },
  { value: "MX", label: "墨西哥 (MX)" },
  { value: "BR", label: "巴西 (BR)" },
]);

const type = ref<string | number>(0);
const routeData = ref<AddressRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const submitting = ref(false);
const formRef = ref<FormInstance>();

const emptyForm = (): AddressFormState => ({
  Type: 1,
  IsDefault: false,
  Contact: {
    Name: "",
    Phone: "",
    Email: "",
    Company: "",
    Street1: "",
    Street2: "",
    Street3: "",
    District: "",
    City: "",
    Province: "",
    PostalCode: "",
    CountryCode: "",
  },
});

const form = reactive<AddressFormState>(emptyForm());

// 表头 prop 兼容旧接口（contact.name / Contact.Name 等）
const addressProp = (field: string) => `Contact.${field}`;

const validateEmail = (
  _rule: any,
  value: string,
  callback: (err?: Error) => void,
) => {
  const mailReg =
    /^([a-zA-Z0-9_.\-])+\@(([a-zA-Z0-9_.\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!value) {
    callback();
    return;
  }
  setTimeout(() => {
    if (mailReg.test(value)) callback();
    else callback(new Error(t("pages.InvalidEmail") || "邮箱格式不正确"));
  }, 100);
};

const rules = reactive<FormRules>({
  Type: [{ required: true, message: t("pages.required"), trigger: "change" }],
  "Contact.Name": [
    { required: true, message: t("pages.required"), trigger: "change" },
  ],
  "Contact.Company": [{ required: false }],
  "Contact.Email": [{ required: false, validator: validateEmail }],
  "Contact.Phone": [
    { required: true, message: t("pages.required"), trigger: "change" },
  ],
  "Contact.CountryCode": [
    { required: true, message: t("pages.required"), trigger: "change" },
  ],
  "Contact.Province": [
    { required: true, message: t("pages.required"), trigger: "change" },
  ],
  "Contact.City": [
    { required: true, message: t("pages.required"), trigger: "change" },
  ],
  "Contact.District": [{ required: false }],
  "Contact.Street1": [
    { required: true, message: t("pages.required"), trigger: "change" },
  ],
  "Contact.Street2": [{ required: false }],
  "Contact.Street3": [{ required: false }],
  "Contact.PostalCode": [
    { required: true, message: t("pages.required"), trigger: "change" },
  ],
  IsDefault: [{ required: false }],
});

const onSearch = () => {
  pagecurrent.value = 1;
  getdata();
};

const onReset = () => {
  type.value = 0;
  pagecurrent.value = 1;
  getdata();
};

const getdata = async () => {
  loading.value = true;
  const res: ApiResponse<any> = await addresslist({
    index: pagecurrent.value - 1,
    size: count.value,
    Type: type.value || undefined,
  });
  if (res?.isSuccess) {
    routeData.value = res.result ?? [];
    availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
  }
  loading.value = false;
};

const openCreate = () => {
  dialogMode.value = "create";
  Object.assign(form, emptyForm());
  dialogVisible.value = true;
};

const openEdit = async (row: AddressRow) => {
  dialogMode.value = "edit";
  Object.assign(form, emptyForm(), {
    id: row.id,
    Type: row.Type,
    IsDefault: !!row.IsDefault,
  });
  try {
    const res: ApiResponse<any> = await addressdetail(row.id);
    if (res?.isSuccess && res.result) {
      const c = res.result.contact ?? res.result.Contact ?? {};
      const numericType =
        typeof res.result.Type === "string"
          ? typeKeyMap[res.result.Type] ?? res.result.Type
          : res.result.Type ?? row.Type;
      Object.assign(form, {
        id: row.id,
        Type: numericType,
        IsDefault: !!(res.result.IsDefault ?? res.result.isDefault),
        Contact: {
          Name: c.Name ?? c.name ?? "",
          Phone: c.Phone ?? c.phone ?? "",
          Email: c.Email ?? c.email ?? "",
          Company: c.Company ?? c.company ?? "",
          Street1: c.Street1 ?? c.street1 ?? "",
          Street2: c.Street2 ?? c.street2 ?? "",
          Street3: c.Street3 ?? c.street3 ?? "",
          District: c.District ?? c.district ?? "",
          City: c.City ?? c.city ?? "",
          Province: c.Province ?? c.province ?? "",
          PostalCode: c.PostalCode ?? c.postalCode ?? "",
          CountryCode: c.CountryCode ?? c.countryCode ?? "",
        },
      });
    }
  } catch (e: any) {
    ElMessage.error(e?.message || t("pages.Failed"));
  }
  dialogVisible.value = true;
};

const onDialogClosed = () => {
  formRef.value?.resetFields();
};

const onSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    const payload: any = {
      Type: form.Type,
      IsDefault: !!form.IsDefault,
      Contact: { ...form.Contact },
    };
    let res: ApiResponse<any>;
    if (dialogMode.value === "create") {
      res = await addresscreate(payload);
    } else {
      res = await addressupdate({ ID: form.id as string | number, ...payload });
    }
    if (res?.isSuccess) {
      ElMessage.success(t("pages.Success"));
      dialogVisible.value = false;
      getdata();
    } else {
      ElMessage.error(res?.message || t("pages.Failed"));
    }
  } finally {
    submitting.value = false;
  }
};

const onDelete = async (row: AddressRow) => {
  try {
    await ElMessageBox.confirm("", t("pages.Delete"), {
      confirmButtonText: t("pages.address.create.confirm"),
      cancelButtonText: t("pages.Cancel"),
      type: "warning",
      center: true,
    });
  } catch {
    return;
  }
  const res: ApiResponse<any> = await addressdelete({ IDS: [row.id] });
  if (res?.isSuccess) {
    ElMessage.success(t("pages.Success"));
    getdata();
  } else {
    ElMessage.error(res?.message || t("pages.Failed"));
  }
};

watch([count, pagecurrent], () => {
  getdata();
});

onMounted(() => {
  getdata();
});
</script>

<style lang="scss" scoped>
.address-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.filter-card,
.table-card {
  background: #fff;
}
.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 60px;
}
.type-select {
  width: 220px;
}
.action-cell {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 0;
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
.op-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
}
.op-row-pager {
  flex-shrink: 0;
}
.create-btn{
	margin-bottom: 12px;
}
@media (max-width: 768px) {
  .type-select {
    width: 100%;
  }
}
</style>
