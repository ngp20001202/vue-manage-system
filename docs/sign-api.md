# 签名接口改造清单（给后端）

> 前端通过 `/api/Tokens/sign` 把待下载 URL 发给后端，换回一个 `token` 后拼到 URL 上访问。
> 当前 5 个调用场景里，有 2 个是**冗余**的——列表接口已经返回了完整文件 URL，前端再走签名。
>
> 目标：去掉前端对 `/api/Tokens/sign` 的依赖，列表接口直接返回已签名可访问的完整 URL。

## 后端不推荐的接口

| 端点 | 方法 | 现状 | 处理建议 |
|---|---|---|---|
| `/api/Tokens/sign` | POST | 前端用于把待下载 URL 换成签名 token，再拼 `?token=…` 访问 | 列表接口直接返回可访问 URL，**前端不再调用此接口** |

> 如果部分场景暂时无法在列表里直接返回完整 URL，可保留 `/api/Tokens/sign` 作为过渡。

## 需要后端改造的列表接口

### 1. 下载中心列表

- **端点**：`GET /api/Download?pageIndex=…&pageSize=…&Status=…&PeriodMin=…&PeriodMax=…`
- **前端问题**：列表返回的 `row.url` 已是文件直链，前端拿到后再走 `/api/Tokens/sign` 拼 token 打开
- **建议改动**：
  - 方案 A（最简）：`row.url` 直接返回**已签名可访问的完整 URL**（带 token 或临时签名），前端不再调用 `/api/Tokens/sign`
  - 方案 B：新增 `row.signedUrl` 字段返回已签名 URL，保留 `row.url` 原值
- **前端变化**：`row.url` 直接 `window.open(row.url)`，不再调 `/api/Tokens/sign`

### 2. 周期账单列表

- **端点**：`GET /api/BillingStatements?pageIndex=…&pageSize=…&Status=…&PeriodMin=…&PeriodMax=…`
- **前端问题**：列表返回的 `row.fileUrl` 已是 PDF 完整 URL，前端拿到后走 `/api/Tokens/sign` 拼 token
- **建议改动**：同方案 A/B，`row.fileUrl` 或新增字段直接返回已签名可访问 URL

## 可选改造（手拼 URL 的场景）

### 3. 清单列表

- **端点**：`GET /api/SackMfts?pageIndex=…&pageSize=…&Stage=…&PeriodMin=…&PeriodMax=…&IsUseMawbNbr=…`
- **前端现状**：列表行只有 `id`，前端用 `id` 拼 `/api/SackMfts/{id}/docs`，再走 `/api/Tokens/sign`
- **建议改动**：列表行新增字段（如 `docsUrl`）直接返回已签名的下载 URL

### 5. 账本流水列表 + 导出

- **端点**：`GET /api/accounting/ledger?pageIndex=…&pageSize=…`
- **前端现状**：导出时用筛选条件拼 `/api/accounting/ledger/export?…`，再走 `/api/Tokens/sign`
- **建议改动**：导出 URL 改为一次性签名好的完整 URL（前端不需要二次签名）

### 6. 交易记录列表 + 导出

- **端点**：`GET /api/Xacts?pageIndex=…&pageSize=…`
- **前端现状**：导出时用筛选条件拼导出 URL，再走 `/api/Tokens/sign`
- **建议改动**：同上，导出 URL 改为一次性签名好的完整 URL

## 过渡方案

如果后端无法一次性把所有列表都改成"返回已签名 URL"，可以分阶段：
1. 先改 **1（Download）** 和 **2（Invoices）**——这两个是直接拼字段，最容易改
2. 再改 **3（SackMfts）**、**5（Ledger）**、**6（Xacts）**——需要后端调整列表返回结构

## 后端改动后前端会做什么

- 删除 `SackMftsign` 的所有调用
- 同步删除 `src/api/{accounting,parcel,sackMft}.ts` 中 3 处 `SackMftsign` / `sackMftsign` 声明（已无引用）
- `/api/Tokens/sign` 调用计数从 5 降到 0
- 前端拿到的 `row.url` / `row.fileUrl` / 导出 URL 直接可访问