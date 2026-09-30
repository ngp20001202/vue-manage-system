# 前端 `/api/Tokens/sign` 调用点清单

> 用于评估是否去掉了的签名调用。`docs/sign-api.md` 是后端视角（要让后端改的接口）。
> 本文档是**前端视角**：每个调用点对应哪个列表接口、签名的是什么 URL、当前代码长什么样。

## 汇总

| # | 调用文件 | 函数 | 签名 URL 来源 | 对应列表接口 | 关联字段 |
|---|---|---|---|---|---|
| 1 | `src/views/accounting/invoices.vue` | `onDownload(row)` | `${row.fileUrl}` | `GET /api/BillingStatements` | `row.fileUrl` |
| 2 | `src/views/download/index.vue` | `downloads(fileurl)` | `${fileurl}` | `GET /api/Download` | `row.url` |
| 3 | `src/views/accounting/ledger.vue` | `exportdata()` | 手拼 `/api/accounting/ledger/export?...` | `GET /api/accounting/ledger` | — |
| 4 | `src/views/accounting/xacts.vue` | `exportdata()` | 手拼 `/api/accounting/xacts/export?...` | `GET /api/Xacts` | — |
| 5 | `src/views/parcel/list.vue` | `downpacking(id)` | 手拼 `/api/download/parcels/${id}/file` | `GET /api/Parcels` | — |
| 6 | `src/views/sackMft/list.vue` | `downloads(id)` | 手拼 `/api/SackMfts/${id}/docs` | `GET /api/SackMfts` | — |

## API 声明

| 文件 | 函数 | 说明 |
|---|---|---|
| `src/api/accounting.ts:36-38` | `SackMftsign` | 用于 #1 #3 #4 |
| `src/api/parcel.ts:99-101` | `SackMftsign` | 用于 #2 #5 |
| `src/api/sackMft.ts:76-78` | `sackMftsign` | 用于 #6 |

## 1. 周期账单下载（invoices）

**文件**：`src/views/accounting/invoices.vue`

```ts
// line 108
import { GetInvoices, SackMftsign } from '@/api/accounting';

// line 183-191
const onDownload = async (row: InvoiceRow) => {
    if (!row?.fileUrl) return;
    const url = new URL(row.fileUrl, getoriginurl());
    const res: any = await SackMftsign({ url: url.toString() });
    if (res?.token) {
        url.searchParams.set('token', res.token);
        window.open(url.toString(), '_blank');
    }
};
```

**签名 URL**：`row.fileUrl`（`/api/BillingStatements` 列表返回的 PDF 直链）

**判断要点**：列表已经返回了完整 URL，是冗余签名。后端方案 A：直接返回已签名的完整 URL。

## 2. 下载中心（download）

**文件**：`src/views/download/index.vue`

```ts
// line 152
import { SackMftsign } from '@/api/parcel';

// line 279-287
const downloads = async (fileurl: string) => {
    if (!fileurl) return;
    const href = new URL(fileurl, getoriginurl());
    const res: any = await SackMftsign({ url: href.toString() });
    const token = res?.result?.token ?? res?.token;
    if (token) {
        window.open(`${href}?token=${token}`, '_blank');
    }
};
```

**签名 URL**：列表返回的 `row.url`（`/api/Download`）

**判断要点**：列表已经返回了完整 URL，是冗余签名。后端方案 A：直接返回已签名 URL。

## 3. 账本流水导出（ledger）

**文件**：`src/views/accounting/ledger.vue`

```ts
// line 145
import { ledgerlist, SackMftsign } from '@/api/accounting';

// line 247-263
const exportdata = async () => {
    const params: string[] = [`ChargeID=${chargeID.value}`];
    if (dates.value) {
        params.push(`PeriodMin=${toUtcIso(dates.value[0]) || ''}`);
        params.push(`PeriodMax=${toUtcIso(dates.value[1]) || ''}`);
    }
    if (trackingNumbers.value) {
        params.push('IsUseTrackingNbr=true');
        params.push(`RefNbrs=${normalizeTrackingNumbers(trackingNumbers.value)}`);
    }
    let url = `${getoriginurl()}/api/accounting/ledger/export?${params.join('&')}`;
    const res: any = await SackMftsign({ url });
    if (res?.token) {
        url += `&token=${res.token}`;
        window.open(url, '_blank');
    }
};
```

**签名 URL**：手拼的导出 URL，参数 `ChargeID / PeriodMin / PeriodMax / IsUseTrackingNbr / RefNbrs` 来自当前筛选条件。

**判断要点**：导出 URL 是手拼的，不在列表字段里。要去掉签名有两条路：
- 后端：导出接口本身接收筛选条件参数，POST 而不是 GET（无需 token）
- 后端：列表接口额外返回一个 `exportUrl`（一次性签名好的完整 URL）

## 4. 交易记录导出（xacts）

**文件**：`src/views/accounting/xacts.vue`

```ts
// line 129
import { xactslist, SackMftsign } from '@/api/accounting';

// line 212-227
const exportdata = async () => {
    const params: string[] = [];
    if (dates.value) {
        params.push(`PeriodMin=${toUtcIso(dates.value[0]) || ''}`);
        params.push(`PeriodMax=${toUtcIso(dates.value[1]) || ''}`);
    }
    let url = `${getoriginurl()}/api/accounting/xacts/export`;
    if (params.length) {
        url += `?${params.join('&')}`;
    }
    const res: any = await SackMftsign({ url });
    if (res?.token) {
        url += `${params.length ? '&' : '?'}token=${res.token}`;
        window.open(url, '_blank');
    }
};
```

**签名 URL**：手拼的导出 URL，参数 `PeriodMin / PeriodMax` 来自日期筛选。

**判断要点**：同 #3，导出 URL 手拼，需要后端配合（导出接口改 POST、或返回 `exportUrl`）。

## 5. 包裹打包文件下载（parcel list）

**文件**：`src/views/parcel/list.vue`

```ts
// line 272
SackMftsign,

// line 493-500
const downpacking = async (id: string | number) => {
    const url = new URL(`/api/download/parcels/${id}/file`, getoriginurl());
    const res: any = await SackMftsign({ url: url.toString() });
    if (res?.result?.token || res?.token) {
        const token = res?.result?.token ?? res?.token;
        window.open(`${url}?token=${token}`, '_blank');
    }
};
```

**签名 URL**：手拼的 `/api/download/parcels/${id}/file`，由行 ID 拼出。

**判断要点**：URL 来自行 ID，不在列表字段里。要去掉签名有两条路：
- 后端：列表行新增 `packingFileUrl` 字段直接返回已签名 URL
- 后端：`/api/download/parcels/${id}/file` 改 POST 接收 id

## 6. 清单文档下载（sackMft list）

**文件**：`src/views/sackMft/list.vue`

```ts
// line 231
sackMftsign,

// line 398-410
const downloads = async (id: string | number) => {
    const url = `${getoriginurl()}/api/SackMfts/${id}/docs`;
    try {
        const res: any = await sackMftsign({ url });
        if (res?.token) {
            window.open(`${url}?token=${res.token}`, '_blank');
        } else {
            ElMessage.error(t('pages.Failed'));
        }
    } catch {
        ElMessage.error(t('pages.Failed'));
    }
};
```

**签名 URL**：手拼的 `/api/SackMfts/${id}/docs`，由行 ID 拼出。

**判断要点**：同 #5，URL 来自行 ID。后端方案：列表行新增 `docsUrl` 字段直接返回已签名 URL，或 `/api/SackMfts/{id}/docs` 改 POST。

## 决策表（待勾选）

| # | 调用点 | 类别 | 是否去掉签名 | 备注 |
|---|---|---|---|---|
| 1 | invoices `onDownload` | 冗余（列表已返回 URL） | ☐ | |
| 2 | download `downloads` | 冗余（列表已返回 URL） | ☐ | |
| 3 | ledger `exportdata` | 手拼 URL | ☐ | |
| 4 | xacts `exportdata` | 手拼 URL | ☐ | |
| 5 | parcel `downpacking` | 手拼 URL | ☐ | |
| 6 | sackMft `downloads` | 手拼 URL | ☐ | |