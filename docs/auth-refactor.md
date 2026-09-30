# Cookie 鉴权改造清单

> 分支：`feature/auth-refactor`（基于 release）
> 目标：登录态改为 cookie（后端 Set-Cookie），前端不再保存 / 读取 token
> 保留范围：文件直链的临时签名 `SackMftsign({ url })` 拼 `?token=` 下载 —— 这部分属于"URL 获取签名"，**不在本次改造范围**

## 状态

- [x] 待用户确认 → 已确认
- [x] 改造中 → 已完成
- [x] 已完成

## 1. 鉴权 store

**src/store/user.ts**

- [x] 删除 `state.token: localStorage.getItem('token') || ''`
- [x] 删除 `setToken(t)` action
- [x] `loginByToken(urlToken)` 保留 action，去掉内部 `setToken(token)` 与 `localStorage.setItem('token', …)`，改为凭 `res.isSuccess` 判断
- [x] 删除 `init()` action

> 已完成：
> - `login()` 不再存 token，凭 `res.isSuccess` 判断成功
> - `logout()` = `localStorage.clear() + usePermissStore().reset() + window.location.href = '/Account/Logout'`

## 2. 请求拦截

**src/utils/request.ts**

- [x] 删除请求拦截器中 `Authorization: Bearer …` 头注入
- [x] 401 处理改为读取响应头 `Location`，拼 `RedirectUri=当前路径` 后整页跳转；无 Location 时调 `userStore.logout()` 兜底
- [x] 开启 `withCredentials: true` —— 后端 Set-Cookie 需要前端请求携带 cookie

## 3. 路由守卫

**src/router/index.ts**

- [x] **保留** `beforeEach` 里 `?token=` 免密登录拦截块 —— 其它站点跳转过来测试时仍走这条
- [ ] 待清理：路由 `/login` 和 `/login2` 都指向 `login2.vue`；`/login2` 是冗余路由，待决定是否移除

## 4. 接口

**src/api/auth.ts**

- [x] **保留** `gettokens(token)` —— `loginByToken` 仍要调它换 cookie
  - dev：`POST /api/Users/signIn?RedirectUri=/`，`application/x-www-form-urlencoded`，body `Token=<urlencoded>`
  - prod：`GET /api/Tokens/{token}`
- [x] `gettoken({ username, password })` 保留 —— 登录仍 POST，后端响应 Set-Cookie

## 5. 消费 `user.token` / `useUserStore` 的位置

**src/main.ts**

- [x] 删除 `user.init()` 调用及 import

**src/components/header.vue**

- [x] line 153：`if (userStore.token)` → `if (userStore.user.name)`
- [x] line 123：删除冗余 `localStorage.removeItem('vuems_name")`
- [x] line 124：`userStore.logout()` 无需改动（与 401 兜底共用）

**src/views/pages/login2.vue**（实际登录页）

- [x] line 154 `if (!user.token)` → `if (!res?.isSuccess)`

**src/views/pages/login.vue**

- [x] 删除 —— 没有任何路由引用，是未使用文件

## 不动的部分

- `SackMftsign({ url })` → 拿 `res.token` 拼到下载 URL（sackMft/list.vue、download/index.vue、accounting/invoices.vue）
- axios baseURL、timeout
- 后端 `/Account/Logout` 入口
- 路由 `/login` → login2.vue 的配置（暂不动，待决定 `/login2` 路由去留）

## 提交记录

- `6d6d51e` refactor: 切换为 cookie 鉴权（store、request、main、header、auth、login/login2 改造）
- `6d205fe` chore: 删除未使用的 login.vue