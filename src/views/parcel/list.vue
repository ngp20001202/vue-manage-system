<template>
  <div class="parcel-list">
    <el-card shadow="never" class="filter-card">
      <el-tabs
        v-model="activeName"
        type="border-card"
        class="demo-tabs"
        :before-leave="beforeLeave"
      >
        <el-tab-pane :label="t('pages.all')" name="0" />
        <el-tab-pane
          v-for="item in tablist"
          :key="item.stage"
          :name="String(item.stage)"
        >
          <template #label>
            <div>
              {{ item.label }}
              <el-badge :value="item.count" class="item" type="primary" />
            </div>
          </template>
        </el-tab-pane>
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
            <el-select
              v-model="startstage"
              class="stage-select"
              :placeholder="t('pages.fromstage')"
            >
              <el-option
                v-for="item in startsoptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <span class="tilde">~</span>
          <el-form-item>
            <el-select
              v-model="endStage"
              class="stage-select"
              :placeholder="t('pages.tostage')"
            >
              <el-option
                v-for="item in endoptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onSearch">
              {{ t("pages.Search") }}
            </el-button>
            <el-button :icon="Refresh" @click="onReset">
              {{ t("pages.Reset") }}
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
              {{ t("pages.Search") }}
            </el-button>
            <el-button :icon="Refresh" @click="onReset">
              {{ t("pages.Reset") }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div v-show="routeData.length" class="op-row">
        <div class="op-row-left">
          <el-tooltip
            :content="t('pages.downloadlabel')"
            placement="top"
            :enterable="false"
          >
            <el-button
              type="info"
              :disabled="!isDownload"
              class="load download"
              @click="download"
            >
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip
            :content="t('pages.Parcels.list.batchdownload')"
            placement="top"
            :enterable="false"
          >
            <el-button
              type="info"
              :disabled="!isDownload"
              class="load"
              @click="batchdownload"
            >
              <el-icon><FolderAdd /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip
            :content="t('pages.cancelparcel')"
            placement="top"
            :enterable="false"
          >
            <el-button
              type="danger"
              :disabled="disabled"
              class="cancell"
              @click="() => cancell(true)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip
            :content="t('pages.Parcels.list.exportInfo')"
            placement="top"
            :enterable="false"
          >
            <el-button type="success" class="export" @click="parcelsexport">
              <el-icon><Upload /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip
            :content="t('pages.ClaimList.submitClaim')"
            placement="top"
            :enterable="false"
          >
            <el-button
              type="warning"
              :disabled="!selectarr.length"
              class="claim"
              @click="() => submitClaim()"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <el-pagination
          class="op-row-pager"
          background
          layout="total, prev, pager, next, sizes"
          :total="availcnt"
          :current-page="pagecurrent"
          pager-count="5"
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
              {{ t("pages.Parcels.list.order") }}
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
              {{ t("pages.Parcels.list.lastmiler") }}
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
        <el-table-column :label="t('pages.Stage')" width="150">
          <template #default="scope">
            <span class="cyan" @click="() => setid('tracking', scope.row.id)">
              <el-icon><List /></el-icon>
              {{ scope.row.stageText }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('pages.PostedOn')" width="180">
          <template #default="scope">
            <span>{{ formatPosted(scope.row.postedStamp?.utcTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('pages.Action')"
          width="360"
          align="left"
          :fixed="isDesktop ? 'right' : false"
        >
          <template #default="scope">
            <div v-if="showoption(scope.row)" class="action-cell">
              <el-button
                v-if="scope.row.canPrintLabel"
                type="primary"
                size="small"
                :icon="Download"
                @click="() => downloads(scope.row.id)"
              >
                {{ t("pages.downloadlabel") }}
              </el-button>
              <a
                v-if="scope.row.canPrintLabel"
                target="_blank"
                class="action-link"
                @click="() => downpacking(scope.row.id)"
              >
                <el-button type="success" size="small" plain>
                  {{ t("pages.downloadpackinglist") }}
                </el-button>
              </a>
              <el-button
                v-if="scope.row.canParcelCancel"
                type="danger"
                size="small"
                :icon="Delete"
                @click="() => cancell(false, scope.row.id)"
              >
                {{ t("pages.cancelparcel") }}
              </el-button>
              <el-button
                type="warning"
                size="small"
                :icon="Edit"
                plain
                @click="() => submitClaim(scope.row)"
              >
                {{ t("pages.ClaimList.submitClaim") }}
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
    <ParcelTracking :id="trackingDialog.id" @changestatus="changestatus" />
    <ParcelDownload
      :ids="parcelDownload.ids"
      @changestatus="changestatus"
      @clearselect="clearselect"
    />
    <ParcelClaimUpload
      v-model="uploadVisible"
      :attachment-only="true"
      :order-id="currentOrderId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useViewport } from "@/composables/useViewport";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Download,
  Delete,
  Search,
  Refresh,
  InfoFilled,
  DocumentCopy,
  List,
  FolderAdd,
  Upload,
  Edit,
} from "@element-plus/icons-vue";
import moment from "moment";
import { saveAs } from "file-saver";
import { formatParagraphtext, datatoutc } from "@/utils/format";
import {
  parcellist,
  parcelstage,
  parcelcancel,
  parcelexport,
  getdashtab,
  SackMftsign,
  parceldownloadfile,
  parcelSearchlist,
  downloadlabel,
} from "@/api/parcel";
import { getoriginurl } from "@/utils/originurl";
import type { ApiResponse } from "@/api/types";
import ParcelDetail from "./detail.vue";
import ParcelTracking from "./tracking.vue";
import ParcelDownload from "./download.vue";
import ParcelClaimUpload from "./components/ParcelClaimUpload.vue";

const { t } = useI18n();
const { isDesktop } = useViewport();

interface ParcelRow extends Record<string, any> {
  id: string | number;
  clientRefNbr?: string;
  lastMilerNbr?: string;
  svcName?: string;
  stageText?: string;
  stageID?: number;
  postedStamp?: { utcTime: string };
  canPrintLabel?: boolean;
  canParcelCancel?: boolean;
}

const activeName = ref("0");
const tablist = ref<
  Array<{ stage: number | string; label: string; count: number }>
>([]);
const dates = ref<[string, string] | null>(null);
const textarea = ref("");
const startstage = ref<string | number>(0);
const endStage = ref<string | number>(0);
const startsoptions = ref<Array<{ value: string | number; label: string }>>([
  { value: 0, label: "" },
]);
const endoptions = ref<Array<{ value: string | number; label: string }>>([
  { value: 0, label: "" },
]);
const labellist = ref<string[]>([]);
const Stage = ref<string | number>(0);
const routeData = ref<ParcelRow[]>([]);
const loading = ref(true);
const availcnt = ref(0);
const count = ref(10);
const pagecurrent = ref(1);
const disabled = ref(true);
const isDownload = ref(false);
const selectarr = ref<ParcelRow[]>([]);
const multipleTableRef = ref();

const parcelDetail = reactive({ id: "" });
const parcelDownload = reactive<{ ids: Array<string | number> }>({ ids: [] });
const trackingDialog = reactive({ id: "" });
const uploadVisible = ref(false);
const currentOrderId = ref("");

const submitClaim = (row?: ParcelRow) => {
  currentOrderId.value = row?.lastMilerNbr ?? "";
  uploadVisible.value = true;
};

const commonHidden = [10005, 11040, 11020, 11010];

const show = (row: ParcelRow) =>
  !(
    commonHidden.includes(Number(row.stageID)) ||
    Number(row.stageText) === 11030
  );

// 行操作菜单可见性：已取消 / 已拒收等终态不展示操作
const showoption = (row: ParcelRow) =>
  !commonHidden.includes(Number(row.stageID));

const formatPosted = (utc: string | undefined) => {
  if (!utc) return "";
  return moment.utc(utc).local().format("YYYY-MM-DD HH:mm:ss");
};

const copy = (key: string) => {
  const text = formatParagraphtext(routeData.value, key);
  if (text === " ") {
    ElMessage.warning(t("pages.noCopyData"));
    return;
  }
  try {
    navigator.clipboard.writeText(text);
    ElMessage.success(t("pages.copySuccess"));
  } catch {
    ElMessage.error(t("pages.copyFailed"));
  }
};

const defaultRange = (): [string, string] => [
  moment().subtract(14, "days").format("YYYY-MM-DD"),
  moment().format("YYYY-MM-DD"),
];

const init = () => {
  dates.value = defaultRange();
  startstage.value = 0;
  endStage.value = 0;
  textarea.value = "";
};

const onReset = () => {
  init();
  pagecurrent.value = 1;
  onSearch();
};

const setid = (name: "detail" | "tracking", id: string | number) => {
  if (name === "detail") {
    parcelDetail.id = String(id);
  } else {
    trackingDialog.id = String(id);
  }
};

const handleSelectionChange = (rows: ParcelRow[]) => {
  selectarr.value = rows;
};

const clearselect = () => {
  multipleTableRef.value?.clearSelection();
  selectarr.value = [];
};

const changestatus = () => {
  parcelDetail.id = "";
  trackingDialog.id = "";
  parcelDownload.ids = [];
};

const tabs = async () => {
  const res: ApiResponse<any[]> = await getdashtab();
  if (res?.isSuccess && Array.isArray(res.result)) {
    labellist.value = [
      t("pages.pengding"),
      t("pages.measured"),
      t("pages.manifested"),
    ];
    tablist.value = res.result.map((item: any, idx: number) => ({
      stage: item.stage ?? item.id ?? idx,
      label: labellist.value[idx] ?? item.label ?? "",
      count: item.count ?? 0,
    }));
  }
};

const stages = async () => {
  const res: ApiResponse<any[]> = await parcelstage();
  if (res?.isSuccess && Array.isArray(res.result)) {
    const list = res.result.map((item: any) => ({
      value: item.value ?? item.stage ?? item.id,
      label: item.text ?? item.label ?? String(item.value ?? ""),
    }));
    startsoptions.value = [{ value: 0, label: t("pages.fromstage") }, ...list];
    endoptions.value = [{ value: 0, label: t("pages.tostage") }, ...list];
  }
};

const onSearch = () => {
  if (activeName.value === "tracking") {
    postdata();
  } else {
    getdata();
  }
};

const beforeLeave = (e: string | number) => {
  init();
  if (e === "tracking") {
    routeData.value = [];
    Stage.value = 0;
    return true;
  }
  if (Number(e) !== 0) {
    Stage.value = e as string | number;
  } else {
    Stage.value = 0;
  }
  getdata();
  return true;
};

const getdata = async () => {
  loading.value = true;
  const isTracking = activeName.value === "tracking";
  // 运单号搜索时不带日期范围（与 shippingspa 一致：切到 tracking 页签会清空 dates）
  const res: ApiResponse<any> = await parcellist({
    index: pagecurrent.value - 1,
    size: count.value,
    Stage: Stage.value as any,
    StageMin: startstage.value as any,
    StageMax: endStage.value as any,
    PeriodMin: !isTracking ? datatoutc(dates.value?.[0]) : undefined,
    PeriodMax: !isTracking ? datatoutc(dates.value?.[1]) : undefined,
    IsUseTrackingNbr: isTracking
      ? encodeURIComponent(textarea.value)
      : undefined,
  });
  if (res?.isSuccess) {
    routeData.value = res.result ?? [];
    availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
  }
  loading.value = false;
};

const postdata = async () => {
  loading.value = true;
  const res: ApiResponse<any> = await parcelSearchlist({
    pageIndex: pagecurrent.value - 1,
    pageSize: count.value,
    trackingNbrs: textarea.value.split(/[\n,]+/).filter((s) => s.trim() !== ""),
  });
  if (res?.isSuccess) {
    routeData.value = res.result ?? [];
    availcnt.value = res.pagination?.availCnt ?? res.availcnt ?? 0;
  }
  loading.value = false;
};

const parcelsexport = async () => {
  if (availcnt.value > 20000) {
    ElMessage.error(t("pages.Parcels.list.exportTooLarge"));
    return;
  }
  try {
    const blob: any = await parcelexport(
      {
        Stage: Stage.value as any,
        StageMin: startstage.value as any,
        StageMax: endStage.value as any,
        PeriodMin: datatoutc(dates.value?.[0]),
        PeriodMax: datatoutc(dates.value?.[1]),
      },
      {
        trackingNbrs: textarea.value
          .split(/[\n,]+/)
          .filter((s) => s.trim() !== ""),
      },
    );
    const filename = `parcels_${moment().format("YYYYMMDD_HHmmss")}.xlsx`;
    saveAs(blob, filename);
    ElMessage.success(t("pages.Success"));
  } catch {
    ElMessage.error(t("pages.Failed"));
  }
};

const downloads = (id: string | number) => {
  downloadlabel(String(id)).then((res: any) => {
    if (res?.result) {
      const a = document.createElement("a");
      a.target = "_blank";
      a.href = res.result;
      a.click();
    }
  });
};

const downpacking = async (id: string | number) => {
  const url = new URL(`/api/download/parcels/${id}/file`, getoriginurl());
  const res: any = await SackMftsign({ url: url.toString() });
  if (res?.result?.token || res?.token) {
    const token = res?.result?.token ?? res?.token;
    window.open(`${url}?token=${token}`, "_blank");
  }
};

const cancell = async (isBatch: boolean, id?: string | number) => {
  const list = isBatch
    ? selectarr.value.filter((r) => show(r)).map((r) => r.id)
    : [id as string | number];
  ElMessageBox.confirm(t("pages.cancelWarning"), t("pages.cancelConfirm"), {
    confirmButtonText: t("pages.confirmCancel"),
    cancelButtonText: t("pages.Cancel"),
    type: "warning",
    center: true,
  })
    .then(async () => {
      const res: ApiResponse<any> = await parcelcancel({ ids: list as any });
      if (res?.isSuccess) {
        ElMessage.success(t("pages.cancelSuccess"));
        getdata();
      } else {
        ElMessage.error(res?.message || t("pages.Failed"));
      }
    })
    .catch(() => {
      multipleTableRef.value?.clearSelection();
    });
};

const download = () => {
  const list = selectarr.value
    .filter((r) => show(r))
    .filter((r) => r.lastMilerNbr)
    .map((r) => r.id);
  parcelDownload.ids = list;
};

const batchdownloadbool = ref(false);
const batchdownload = async () => {
  if (batchdownloadbool.value) return;
  batchdownloadbool.value = true;
  const list = selectarr.value
    .filter((r) => show(r))
    .filter((r) => r.lastMilerNbr)
    .map((r) => r.id);
  const res: ApiResponse<any> = await parceldownloadfile({ ids: list as any });
  if (res?.isSuccess) {
    ElMessage.success(
      `合并下载${list.length}个面单,已添加至下载任务,请到下载中心查看下载状态`,
    );
  } else {
    ElMessage.error(res?.message || t("pages.Failed"));
  }
  batchdownloadbool.value = false;
  clearselect();
};

watch([count, pagecurrent], () => {
  if (activeName.value === "tracking") {
    postdata();
  } else {
    getdata();
  }
});

watch(
  () => selectarr.value.length,
  () => {
    const showvalue = selectarr.value.filter((r) => show(r));
    disabled.value = showvalue.length === 0;
    const hasLastMiler = showvalue.some((r) => r.lastMilerNbr);
    isDownload.value = hasLastMiler;
  },
);

onMounted(() => {
  dates.value = defaultRange();
  tabs();
  stages();
  getdata();
});
</script>

<style lang="scss" scoped>
.parcel-list {
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
.stage-select {
  width: 180px;
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
.tilde {
  color: #909399;
  font-weight: 500;
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
.load,
.cancell,
.export,
.claim {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 33px;
  min-width: 0 !important;
  padding: 5px 4px;
  color: #fff;
  border: none;
}
.load {
  background-color: #17a2b8;
}
.load.download {
  background-color: #28a745;
}
.cancell {
  background-color: #dc3545;
}
.export {
  background-color: #28a745;
  padding: 5px;
}
.claim {
  background-color: #e6a23c;
  padding: 5px;
}
.load:disabled,
.cancell:disabled,
.claim:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.action-cell {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  align-items: flex-start;
  gap: 4px;
  padding: 0;
}
:deep(.action-cell .el-button + .el-button) {
  margin-left: 0;
}
.action-link {
  color: inherit;
  text-decoration: none;
}
.action-link:hover {
  text-decoration: none;
}
.action-cell :deep(.el-button.is-small) {
  padding: 3px 6px;
  font-size: 12px;
}
.action-cell :deep(.el-button.is-small .el-icon) {
  font-size: 12px;
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
.pager {
  margin-top: 16px;
  justify-content: flex-end;
  display: flex;
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
:deep(.el-badge__content) {
  transform: translateY(-2px);
}
@media (max-width: 768px) {
  .date-picker,
  .stage-select {
    width: 100%;
    margin-bottom: 10px;
  }
  .tracking-input {
    width: 100%;
  }
}
</style>
