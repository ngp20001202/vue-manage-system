# Cookie 鉴权改造清单

> 分支：`feature/auth-refactor`（基于 release）
> 目标：登录态改为 cookie（后端 Set-Cookie），前端不再保存 / 读取 token
> 保留范围：文件直链的临时签名 `SackMftsign({ url })` 拼 `?token=` 下载 —— 这部分属于"URL 获取签名"，**不在本次改造范围**

## 状态

- [ ] 待用户确认
- [ ] 改造中
- [ ] 已完成

## 1. 鉴权 store

**src/store/user.ts**

- [ ] 删除 `state.token: localStorage.getItem('token') || ''`（line 13）
- [ ] 删除 `setToken(t)` action
- [ ] `loginByToken(urlToken)` 保留 action，只去掉内部 `setToken(token)` 和 `localStorage.setItem('token', …)`，免密登录流程本身保留
- [ ] 调整 `init()` 注释 / 内容

> 已完成的改动：
> - `login()` 改为不存 token，凭 `res.isSuccess` 判断成功
> - `logout()` 改为 `localStorage.clear() + usePermissStore().reset() + window.location.href = '/Account/Logout'`

## 2. 请求拦截

**src/utils/request.ts**

- [ ] 删除请求拦截器中 `config.headers['Authorization'] = 'Bearer ' + token`（line 11-14）
- [ ] 401 处理改为读取响应头 `Location`，拼 `RedirectUri=当前路径` 后整页跳转；无 Location 则走 `userStore.logout()` 兜底（复用已有 logout 即可，不再单独导出 loginOut）：
  ```ts
  if (error.response?.status === 401) {
    const loginUrl = error.response.headers['Location'] || error.response.headers['location'];
    const redirectUri = window.location.pathname + window.location.search;
    if (loginUrl) {
      const url = new URL(loginUrl, window.location.origin);
      url.searchParams.set('RedirectUri', redirectUri);
      import('@/store/user').then(({ useUserStore }) => useUserStore().logout()).catch(() => {});
      window.location.href = url.toString();
    } else {
      import('@/store/user').then(({ useUserStore }) => useUserStore().logout());
    }
  }
  ```
- [ ] 如需 cookie 自动随请求发送，axios 需 `withCredentials: true`（待确认）

## 3. 路由守卫

**src/router/index.ts**

- [ ] **保留** `beforeEach` 里 `?token=` 免密登录拦截块（line 237-254）—— 其它站点跳转过来测试时仍走这条

## 4. 接口

**src/api/auth.ts**

- [ ] **保留** `gettokens(token)` —— 其它站点带 `?token=` 跳转过来时，`loginByToken` 仍要调它换 cookie，不能删
- [ ] `gettoken({ username, password })` 保留 —— 登录仍 POST，后端响应 Set-Cookie
- store/user.ts 中 `gettokens` 的 import 保留

## 5. 消费 `user.token` / `useUserStore` 的位置

**src/main.ts**

- [ ] `user.init()` 现在无 token 可恢复，可移除或保留为空函数（line 21-22）

**src/components/header.vue**

- [ ] line 153：`if (userStore.token)` → `if (userStore.user.name)`
- [ ] line 123：`localStorage.removeItem('vuems_name")` 已包含在 logout 的 localStorage.clear()，删除
- [ ] line 124：`userStore.logout()` 无需改动（与 401 兜底共用同一登出）

**src/views/pages/login.vue**

- [x] 已改：line 114 `if (!user.token)` → `if (!res?.isSuccess)`

**src/views/pages/login2.vue**

- [ ] line 154 `if (!user.token)` → `if (!res?.isSuccess)`

## 不动的部分

- `SackMftsign({ url })` → 拿 `res.token` 拼到下载 URL（sackMft/list.vue、download/index.vue、accounting/invoices.vue）
- axios baseURL、timeout
- 后端 `/Account/Logout` 入口

## 已完成（dev/prod 切换）

- src/api/auth.ts：原 `gettokens` 增加了 `import.meta.env.DEV` 分支（dev 走 `/api/Users/signIn`，prod 走 `/api/Tokens/{token}`）。在本次删除 `gettokens` 后，整段一起移除