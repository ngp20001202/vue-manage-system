# 签名接口清单

> 文件直链下载 / 导出场景使用：前端把要下载的 URL 发给后端换签名 token，拿到 token 后拼到 URL 上访问。
> 这些接口**不在 cookie 鉴权改造范围**。

## 接口端点

所有签名走同一个后端端点：

| 端点 | 方法 | 用途 |
|---|---|---|
| `/api/Tokens/sign` | POST | 用下载 URL 换 `token`，前端拼 `?token=…` 访问 |

> 三份前端声明重复指向同一端点（parcel.ts / sackMft.ts / accounting.ts），暂未合并。

## 前端声明

| 文件 | 行 | 名称 | 入参 | 返参 |
|---|---|---|---|---|
| [src/api/parcel.ts](src/api/parcel.ts) | 100 | `SackMftsign` | `{ url: string }` | `{ token: string }`（也兼容 `result.token`） |
| [src/api/sackMft.ts](src/api/sackMft.ts) | 77 | `sackMftsign` | `{ url: string }` | `{ token: string }` |
| [src/api/accounting.ts](src/api/accounting.ts) | 37 | `SackMftsign` | `{ url: string }` | `{ token: string }` |

## 调用方

| 文件 | 行 | 场景 |
|---|---|---|
| [src/views/sackMft/list.vue](src/views/sackMft/list.vue) | 387 | 清单列表 → 下载清单相关文档（`/api/SackMfts/{id}/docs`） |
| [src/views/download/index.vue](src/views/download/index.vue) | 281 | 下载中心 → 打开文件直链（`row.url`） |
| [src/views/accounting/invoices.vue](src/views/accounting/invoices.vue) | 186 | 周期账单 → 打开 `row.fileUrl` PDF |
| [src/views/accounting/ledger.vue](src/views/accounting/ledger.vue) | 258 | 账本流水 → 导出 `/api/accounting/ledger/export?…` |
| [src/views/accounting/xacts.vue](src/views/accounting/xacts.vue) | 222 | 交易记录 → 导出交易列表 |

## 典型用法

```ts
const url = `${getoriginurl()}/api/...`;
const res: any = await SackMftsign({ url });
if (res?.token) {
  url += `&token=${res.token}`;
  window.open(url, '_blank');
}
```

## 容易混淆的另两个端点**（不是文件签名）

| 端点 | 方法 | 用途 |
|---|---|---|
| `/api/Tokens` | POST | 用户名密码登录（[src/api/auth.ts](src/api/auth.ts#L4) `gettoken`） |
| `/api/Tokens/{token}` | GET | 免密登录：URL 上的 `?token=` 换 cookie（[src/api/auth.ts](src/api/auth.ts#L8) `gettokens`） |

这两个是**鉴权**链路，不是文件签名。