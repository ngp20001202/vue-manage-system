# Shipping SPA 项目交接文档

> 编写日期：2026-06-22
> 文档版本：v1.0
> 目标读者：下一位接手该项目的前端开发同事
> 阅读时间：约 30 分钟（含代码定位约 1 小时）

---

## 0. 一句话项目简介

本项目是 **「随手寄」物流系统** 的客户端 SPA（Single Page Application），面向货主/客户使用，提供包裹下单、批量导入、追踪查询、面单换单、异常处理、账务管理（账户余额/账本流水/周期账单）等功能。

- **代码仓库名**：`shippingspa`
- **package.json name**：`ssj`（即「随手寄」拼音首字母）
- **本地路径**：`E:\工作\cnb\shippingspa`
- **技术栈**：Vue 3 + Vue Router 4 + Vuex 4 + Element Plus + Vue CLI 4 + Less

---

## 1. 快速上手（30 分钟跑起来）

### 1.1 环境要求

| 依赖 | 版本 | 备注 |
|------|------|------|
| Node.js | **16.16.0 / 16.20.0**（CI 使用） | 高版本可能因 OpenSSL 报错，必要时加 `NODE_OPTIONS=--openssl-legacy-provider` |
| Yarn | 1.x（推荐） | CI 使用 yarn |
| npm | 8.x（备选） | husky 钩子用 npm 调用脚本 |
| Git | 2.x+ | |

### 1.2 三步启动

```bash
# 1) 安装依赖（如卡住可切淘宝镜像：yarn config set registry https://registry.npmmirror.com）
yarn

# 2) 启动开发服务器（默认连 sandbox 沙箱后端，通过 /api1 代理）
yarn serve

# 3) 浏览器访问 http://localhost:8080
```

默认账户：**需要找产品/后端拿沙箱账号**（前端代码内没有内置账号）。

### 1.3 所有可用脚本

```bash
yarn serve         # 开发模式（mode=dev，请求走 /api1 代理）
yarn dev:test      # 测试模式（mode=test，直连 sandbox.golads.com）
yarn dev:prod      # 本地用生产配置启动（直连 apparcel.com，慎用）
yarn build:test    # 构建测试包（输出到 dist/）
yarn build         # 构建生产包（输出到 dist/，无 sourcemap）
yarn lint          # ESLint 自动修复 .vue/.js
yarn lint:stylelint# Stylelint 自动修复 .css/.scss/.vue
```

---

## 2. 环境与发布

### 2.1 环境配置文件

项目根目录下的 `.env.*` 文件控制不同环境的 API 地址：

| 文件 | NODE_ENV | VUE_APP_BASE_URL | 何时使用 |
|------|----------|------------------|----------|
| `.env.dev` | development | `/api1`（走本地 vue.config.js 代理） | `yarn serve` |
| `.env.test` | test | `https://shipping.sandbox.golads.com` | `yarn dev:test` / `yarn build:test` |
| `.env.production` | production | `https://shipping.apparcel.com` | `yarn dev:prod` / `yarn build` |

> ⚠️ **注意**：`request/index.js` 中的 baseURL 优先读取 `localStorage.getItem("baseURL")`，本地调试可手动覆盖。

### 2.2 开发代理（vue.config.js）

```js
devServer: {
  proxy: {
    "/api1": {
      target: "https://shipping.sandbox.golads.com",
      changeOrigin: true,
      pathRewrite: { "^/api1": "/" },
    },
  },
}
```

→ 即 dev 模式下，浏览器请求 `/api1/api/Tokens` 会被代理到 `https://shipping.sandbox.golads.com/api/Tokens`。

### 2.3 CI/CD 流水线（两套并存）

#### A. CNB 流水线（**当前主用**）`.cnb.yml`

| 触发分支 | ARTIFACT_NAME | 备注 |
|---------|---------------|------|
| `master` push | `shipping-test` | 推到测试环境 |
| `release` push | `shipping-release` | 推到生产环境 |
| `feature/build` push | `shipping-test` | 临时调试用 |
| 任意分支手动触发 | `shipping-test` | web_trigger 按钮，在 `.cnb/web_trigger.yml` 配置 |

构建步骤：
1. **安装依赖**：拉取 node:16.16.0 镜像
2. **编译**：执行 `./.build/build.sh`（内部 `yarn && yarn build`）
3. **上传制品**：打包 dist 为 `${ARTIFACT_NAME}.zip`，上传到七牛云 bucket（凭据从 `https://cnb.cool/suishouji_2025/keys/-/blob/main/qiniu.json` 导入）
4. **发布**：仅 master 分支触发，运行 `./.build/publish.sh`，通过 webhook 通知服务器拉取
5. **企微通知**：成功/失败都会推送到企业微信群机器人

**企微机器人 Webhook**：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=fd4d4f42-137a-4fa7-9ef1-6860fa6f273e`

**发布 Webhook**（`.build/publish.sh`）：
```
http://webhook.olabala.com/hooks/publishspa?token=8ukBFB5uqXXRjCtJ
```
带参数 `{ "path": "/data/web/shipping", "url": "https://file-qn.golads.com/artifacts/shipping/shipping-test.zip?t=<timestamp>" }`

#### B. Jenkins 流水线（备用/历史遗留）`Jenkinsfile`

老流水线，用 Jenkins agent + coding generic 仓库。**目前主用是 CNB**，Jenkins 仅做兜底保留。

### 2.4 Git 远程仓库

项目同时挂在两个远程：

```
cnborigin  → https://cnb.cool/suishouji_2025/shippingspa/shippingspa  (主仓，CI 在此)
origin     → git@e.coding.net:suishouji/shippingspa/shippingspa.git    (coding 镜像)
```

⚠️ **推代码请同时推两个 remote**，或者仅推 cnborigin。详见 `git remote -v`。

---

## 3. 技术栈与依赖

### 3.1 核心依赖（package.json 摘要）

| 包 | 版本 | 用途 | 注意点 |
|----|------|------|--------|
| vue | **3.2.0-beta.7** | 框架 | ⚠️ Vue3 早期 beta，不要随意升级 |
| vue-router | 4.0.10 | 路由 | history 模式 |
| vuex | ^4.0.0 | 状态管理 | strict: true |
| element-plus | **1.0.2-beta.65** | UI 库 | ⚠️ 早期 beta，与正式版 API 有差异 |
| @element-plus/icons-vue | ^2.0.10 | 图标 | |
| axios | 0.21.1 | HTTP | 老版本，不要随意升级（拦截器 API 不同） |
| vue-i18n | ^9.3.0-beta.19 | 国际化 | legacy: false 模式 |
| echarts | 5.1.2 | 图表 | 实际使用很少 |
| less / less-loader | 4.x / 6.0 | 样式 | 主样式语言 |
| moment | ^2.29.4 | 时间 | 慎用，已不推荐 |
| nprogress | ^0.2.0 | 路由顶部进度条 | |
| file-saver | ^2.0.5 | 文件下载 | 导出 Excel 时使用 |
| clipboard | ^2.0.11 | 复制到剪贴板 | |
| @fortawesome/fontawesome-free | ^6.4.0 | 图标库 | 菜单图标用 |
| nprogress | ^0.2.0 | 进度条 | router 配套 |

### 3.2 构建相关

- **Vue CLI 4.5**：基于 webpack 4，构建较老
- **Babel**：默认 preset-env
- **ESLint**：vue/vue3-recommended + 自定义关闭 `vue/no-v-html`
- **Stylelint**：standard + scss + vue
- **Husky 8 + lint-staged**：提交前自动 prettier + eslint + stylelint
- **commitlint**：强制 conventional commits（type 必须是 feat/fix/docs/style/refactor/perf/test/revert/ci/config/chore/build）

### 3.3 浏览器兼容

```json
"browserslist": ["> 1%", "last 2 versions", "not dead"]
```

---

## 4. 项目结构（重点章节，必读）

### 4.1 顶层结构

```
shippingspa/
├── .build/                  # CI 构建脚本（build.sh / debug.sh / publish.sh）
├── .cnb/                    # CNB 流水线 web_trigger 配置
├── .claude/                 # Claude Code 本地配置（可忽略）
├── .cnb.yml                 # CNB CI 主配置文件
├── .env.dev / .env.test / .env.production   # 环境变量
├── .eslintrc.js             # ESLint 规则
├── .stylelintrc.js          # Stylelint 规则
├── .lintstagedrc            # lint-staged 规则
├── .husky/                  # Git hooks（pre-commit / commit-msg）
├── babel.config.js          # Babel 配置（默认）
├── commitlint.config.js     # commit 消息规范
├── vue.config.js            # Vue CLI 配置（含 devServer 代理）
├── Jenkinsfile              # 老 Jenkins 流水线（备用）
├── public/                  # 静态资源
│   ├── index.html           # HTML 模板（含 loader 动画样式）
│   ├── favicon.ico
│   ├── images/              # 公共图片
│   └── templates/           # 模板文件
├── src/                     # ★ 业务代码全在这里
├── BUG_REPORT.md            # ★ 必读！已知 bug 清单（14 个，含 3 个 P0）
├── README.md                # 旧文档（信息已较老）
├── README.en.md
├── tracking.json            # 追踪接口的 mock 数据样例
├── package.json
└── yarn.lock
```

### 4.2 src/ 目录详解（★ 核心）

```
src/
├── main.js                  # 应用入口：注册 vue / vuex / vue-router / i18n / ElementPlus
├── App.vue                  # 根组件，仅渲染 <Unitui />，挂载用户信息获取逻辑
├── assets/                  # iconfont.js / 图片
├── components/              # 全局组件
│   ├── Pagesion.vue         # ⚠️ 自定义分页器（"Pagesion" 是拼写错误，应为 Pagination，但全局已用，不要改）
│   └── empty.vue            # 空状态展示
├── hooks/                   # ★ 所有 API 请求都在这里（不是 Vue3 hooks 命名习惯）
│   ├── index.js             # 统一导出
│   ├── useHttp.js           # 通用接口（Token / 用户 / 包裹列表 / 异常 等，最大文件）
│   ├── useaccountings.js    # 财务相关接口（余额/账本/账单/运费）
│   ├── useaddress.js        # 地址簿接口
│   ├── usedownload.js       # 下载中心接口
│   ├── useparcel.js         # 包裹创建/编辑接口
│   ├── userecharge.js       # 充值接口
│   ├── usesackMfts.js       # 清单管理接口
│   └── useservices.js       # 服务/费率接口
├── language/                # i18n 国际化
│   ├── index.js             # vue-i18n 初始化（legacy: false）
│   ├── ch.js                # 中文文案（580 行）
│   └── en.js                # 英文文案（594 行）
├── locales/                 # ⚠️ 空目录（历史遗留，可删）
├── request/
│   └── index.js             # ★ axios 实例 + 请求/响应拦截器（Token / 401 / 错误消息）
├── router/
│   └── index.js             # ★ 路由表（全部静态路由，无懒加载 chunk 分组）
├── store/                   # Vuex
│   ├── index.js             # createStore + 模块注册
│   └── modules/
│       ├── user.js                  # 用户信息（name/avatar/WebClient=tenantAlias）
│       ├── count.js                 # 分页：count / pagecurrent / total
│       ├── consignee.js             # 收件人预存（注释「作废」但代码还在）
│       ├── shiper.js                # 寄件人预存（同上「作废」）
│       ├── createparcel.js          # 单笔创建的所有字段（Cnee/Shipper/Parcel 等）
│       ├── batchcalparcel.js        # 批量试算暂存
│       ├── scanform.js              # 扫描表单暂存
│       └── task.js                  # 异步任务暂存
├── until/                   # ⚠️ 应为 utils，是拼写错误，但全局已用
│   ├── compare.js           # 比较工具
│   ├── country.js           # 国家列表数据（9.2KB）
│   ├── filename.js          # 文件名处理
│   ├── format.js            # 格式化
│   ├── locale.js            # 区域设置
│   ├── originurl.js         # URL 处理
│   ├── pc.js                # ⚠️ 响应式 PC/Mobile 判断（直接赋值 window.onresize，全局副作用 bug）
│   ├── setdate.js           # 日期工具
│   └── utcOffset.js         # UTC 时区偏移工具
├── unitui/                  # ★ 业务页面与 UI 框架
│   ├── unitui_init.js       # 初始化配置（顶部 logo / 菜单宽度 / 版本号 v3.1.6）
│   ├── assets/
│   │   ├── json/
│   │   │   └── menu.json    # ★ 侧边栏菜单结构（181 行，i18n key + 路由 path）
│   │   └── unit_style/      # 基础样式
│   ├── ui/                  # 框架级 UI 组件
│   │   ├── Unitui.vue       # 布局容器：Aside + Header + Main + Footer + transition
│   │   └── unit/
│   │       ├── Aside.vue            # 左侧菜单（读 menu.json）
│   │       ├── Header.vue           # 顶部栏（菜单收起按钮 + 用户 + 语言 + 任务）
│   │       ├── Footer.vue           # 底部
│   │       ├── Setting.vue          # 设置面板
│   │       └── sub/                 # 顶部右侧子组件（User/Zn 中英文/Task/MobileMenu/VistMenu）
│   └── pages/               # ★★ 所有业务页面
│       ├── 404.vue
│       ├── Login.vue        # 登录页
│       ├── Register.vue     # 注册页
│       ├── Forget.vue       # 找回密码
│       ├── style.less       # 页面公共样式（11KB）
│       ├── Parcel/          # 包裹模块（最大）
│       │   ├── List/                # 包裹查询列表
│       │   ├── Create/              # 单笔创建主页
│       │   ├── CreateComponents/    # 单笔创建子组件（Sender/Consignee/DeclarInfo/Serve/Cnee 搜索/退货地址）
│       │   ├── Batchcalculation/    # 批量试算
│       │   ├── Batchcomponents/     # 批量试算子组件（Sender/Consignee）
│       │   ├── CancelList/          # 撤销列表
│       │   ├── RefundList/          # 退款列表（最新加的功能，2026-05）
│       │   ├── Detail/              # 列表详情
│       │   ├── Download/            # 包裹下载
│       │   ├── Message/             # 包裹消息
│       │   ├── Tracking/            # 追踪
│       │   ├── ServicesList/        # 服务列表
│       │   ├── PreviewPage/         # 批量导入预览
│       │   ├── PostingPreviewPage/  # 推送入网预览
│       │   ├── Import.vue           # 批量导入主页
│       │   ├── Postingtolastmiler.vue  # 推送入网主页
│       │   └── Import.less          # 导入样式
│       ├── Accountings/     # 财务模块
│       │   ├── Balance/             # 账户余额（含 Recharge 充值组件）
│       │   ├── Xacts/               # 交易记录
│       │   ├── LedgerList/          # 账本流水
│       │   ├── Invoices/            # 周期账单
│       │   └── Statements/          # 应收运费
│       ├── Exceptions/      # 异常处理
│       │   ├── LastMilerRejected/   # 获取面单失败
│       │   ├── BrokerRejected/      # 清关推送失败
│       │   └── Import/              # 异常导入
│       ├── Overlabel/       # 换单
│       │   ├── Import/
│       │   └── list/
│       ├── Address/         # 收发件地址簿
│       │   └── component/
│       │       ├── Create/
│       │       └── Edit/
│       ├── CustomManagers/  # 清单管理
│       │   └── SackMfts/List/
│       ├── SetConfigurations/  # 配置
│       │   ├── Site/                # 操作点
│       │   ├── Users/               # 用户
│       │   └── Company/             # 公司
│       ├── ToolsVue/        # 工具
│       │   ├── Printing/            # 打印面单
│       │   └── Tracking/            # 追踪查询
│       └── Download/        # 下载中心
├── uviews/                  # ⚠️ 应为 views，是拼写错误，目前只放 home.vue（控制面板）
│   └── home.vue             # 首页（账户余额卡片）
└── (其他 .DS_Store 系 macOS 文件，可忽略)
```

> **重要的拼写遗留**：`until` 应为 `utils`、`uviews` 应为 `views`、`Pagesion` 应为 `Pagination`、`shiper` 应为 `shipper`。这些已经被全项目引用，**改名风险极高**，**不要轻易改**。

---

## 5. 核心机制详解

### 5.1 应用启动流程

```
main.js
  ├─ import iconfont.js                            # 注册全局 iconfont
  ├─ import unitui_init.js                         # 读 localStorage.config → 初始化布局参数（v3.1.6）
  ├─ createApp(App)
  ├─ .use(store)                                   # Vuex
  ├─ globalProperties.$unit = unit                  # 全局可用 this.$unit
  ├─ .use(i18n)                                    # vue-i18n（locale 从 localStorage.lang 读，默认 zh-cn）
  ├─ .use(ElementPlus)                             # 全局 Element Plus
  └─ .use(router).mount("#app")

App.vue（onMounted）
  └─ if (localStorage.token && !store.userModule.name) → getuser() → store.commit

Unitui.vue
  ├─ 根据 route.meta.show_site 决定全屏渲染 / 框架内渲染
  ├─ isMobile()：UA + 屏宽 ≥ 768 判断 pc
  └─ window.onresize = isMobile  (⚠️ 全局副作用，未清理，BUG_REPORT.md #6 & #10)
```

### 5.2 路由系统（src/router/index.js）

- **模式**：`createWebHistory()`（HTML5 history，需要服务器配置 fallback to index.html）
- **全部静态路由**：所有页面在 router/index.js 写死（无动态路由真实实现，虽然 README 写了"动态路由"）
- **meta 字段**：
  - `show_site`: 0 = 全屏（登录/注册/404），1 = 框架内（带菜单的业务页）
  - `web_title`: i18n key，用于设置浏览器标题（在 beforeEach 中通过 i18n.global.t 解析）
- **守卫逻辑**（beforeEach）：
  1. NProgress.start()
  2. 有 token：未匹配路由 → router.push("/404") ⚠️ **BUG**：应用 `next("/404")`，否则死循环（BUG_REPORT.md #1）
  3. 无 token：除 / 和 /home 外都跳 /login
- **未路由的页面**：菜单中的"换单"、"换单导入"、"清单详情"等部分功能可能未在 router 表里

### 5.3 HTTP 请求层（src/request/index.js + src/hooks/*）

**axios 实例配置**：
- baseURL：优先 localStorage.baseURL，否则按 env 取（dev → /api1，其他空字符串）
- timeout：60 秒

**请求拦截**：
- 自动注入 `Authorization: Bearer ${token}`
- 默认 `Content-Type: application/json`
- 自动注入 `Accept-Language`（从 localStorage.lang，默认 zh-cn）

**响应拦截**：
- 非 application/json 响应（如 blob）→ 返回原 response
- json 响应 → 返回 `response.data`（即 `{ result, isSuccess, message, ... }`）
- 分页：若响应头有 `x-paging-availcnt` → 注入到 `data.availcnt`
- 401 → 清 token + 跳 /login（⚠️ BUG_REPORT.md #4：未 return Promise.reject）
- 错误 → ElMessage.error 提示后端 errors 字段或 message

**接口文件分布（src/hooks/）**：
- 全部接口集中在 hooks/ 目录，每个文件就是一组业务接口
- ⚠️ 命名为 `useXxx` 但**不是 Vue3 Composition API hook**，只是普通函数集合
- 在组件中：`import { parcellist, refundlist } from "@/hooks";`

**已知接口 Bug**（来自 BUG_REPORT.md #3）：
- `importfile` / `brokerRejectedfile` / `overlabelfile` 三个上传接口用了 `Headers`（大写 H），axios 不识别 → 文件上传 Content-Type 设置失效

### 5.4 状态管理（Vuex）

- **strict 模式**：所有 state 变更必须走 mutation
- **namespaced**：全部模块开启命名空间
- **使用方式**：`store.commit("userModule/increment", payload)`

| 模块 | 主要 state | 用途 |
|------|-----------|------|
| userModule | user{name,avatar}, WebClient | 当前登录用户 + 租户别名 |
| countModule | count/pagecurrent/total | ★ 全局分页状态（多页共用） |
| createparcelModule | Cnee/Shipper/Parcel/ReturnAddress/ClientRefNbr/IsSign | 单笔创建表单暂存（防丢失） |
| batchcalparcelModule | 批量试算暂存 | |
| scanformModule | 扫描表单暂存 | |
| taskModule | 任务暂存 | |
| consigneeModule | 收件人预存 | 文档标注「作废」 |
| shiperModule | 寄件人预存 | 文档标注「作废」 |

**⚠️ Bug**（BUG_REPORT.md #11）：user.js 中 `Object.assign({}, content)` 是浅拷贝，嵌套对象会共享引用。

### 5.5 国际化（i18n）

- **模式**：Composition API 模式（`legacy: false`）
- **使用**：模板里用 `$tm("menu.Parcel.List")` 或 `$t("menu.Parcel.List")`
- **切换语言**：写 localStorage.lang（"zh-cn" / "en"），然后刷新页面
- **文案文件**：`src/language/ch.js`（580 行）、`src/language/en.js`（594 行）
- **结构**：menu / pages / title / 各业务模块分组

### 5.6 菜单系统

- **数据源**：`src/unitui/assets/json/menu.json`（181 行硬编码）
- **渲染**：`src/unitui/ui/unit/Aside.vue` 读 JSON 渲染 el-menu
- **i18n**：menu_name 字段是 i18n key（如 `menu.Parcel.List`）
- **图标**：FontAwesome 类名（`icon fas fa-luggage-cart`）或 iconfont
- **新增菜单步骤**：
  1. 在 `menu.json` 加节点（含 menu_name / path / menu_icon）
  2. 在 `language/ch.js` 和 `en.js` 加对应 i18n key
  3. 在 `router/index.js` 加对应路由
  4. 创建对应 .vue 页面

### 5.7 布局响应式

- **断点**：屏宽 ≥ 768px 视为 PC，否则视为 Mobile
- **传递方式**：通过 `:pc` prop 一路下传到子组件
- **侧边栏**：PC 显示 Aside（200px 或 65px 折叠），Mobile 隐藏（Aside.width = "0px"）
- **菜单收起状态**：存 localStorage.config.aside_default_status

---

## 6. ★ 已知 Bug 与技术债务（必读）

完整清单见根目录 `BUG_REPORT.md`（14 个 bug，2026-03-06 检测）。**优先修复**：

### 🔴 P0 必须立即修复（30 分钟）

| # | 文件 | 问题 |
|---|------|------|
| 1 | `router/index.js:276-278` | 404 路由守卫死循环（用 `router.push` 而非 `next`） |
| 2 | `unitui/unitui_init.js:18` | `JSON.parse(localStorage.config)` 无 try-catch → 白屏 |
| 3 | `hooks/useHttp.js:91,187,321` | `Headers` 应为 `headers`（小写）→ 文件上传失败 |

### 🟠 P1 严重（建议本迭代）

- `request/index.js:39` 401 未 return Promise.reject
- 4 个 Sender/Consignee/ReturnaddressEdit 的 `addEventListener`/`removeEventListener` 参数不一致 → 内存泄漏
- `until/pc.js:26` 全局 `window.onresize = ...` 污染
- 8 个文件使用 `v-html` 有 XSS 风险
- `Unitui.vue:60` / `Setting.vue:115` / `Header.vue:35` 三处 JSON.parse 无 try-catch

### 🟡 P2/P3

- 10+ 个文件 setTimeout 未在 onUnmounted 清理
- `App.vue:23` 登录状态判断依赖 name 字段，name 为空会重复请求
- `Recharge/index.vue:86` 拼写错误 `_blanck`（应为 `_blank`）
- `store/modules/user.js:16` 浅拷贝问题

### 历史包袱

- 命名拼写错误：`until`/`uviews`/`Pagesion`/`shiper` 不要改
- 文档标注「作废」的 Vuex 模块（consignee/shiper）代码仍存在
- `locales/` 空目录可清理
- README.md 仍提到「动态路由可视化管理」「mock 数据 Taro-Mock-master」等已废弃概念
- Element Plus 用的是 beta.65，与 v2 正式版 API 差异较大（升级风险高）
- Vue 是 3.2.0-beta.7，建议升级到稳定版（已有 `feature/upgrade` 分支尝试过）

---

## 7. 分支策略与提交规范

### 7.1 分支

| 分支 | 用途 | 部署目标 |
|------|------|---------|
| `master` | 主开发分支，合并测试通过的 feature | 测试环境（artifact: shipping-test）|
| `release` | 正式发布分支 | 生产环境（artifact: shipping-release）|
| `feature/build` | 临时构建用 | 测试 |
| `feature/<name>` | 功能开发分支 | - |
| `fix/<name>` | bug 修复分支 | - |

**远程上目前存在的活跃分支**（`git branch -a` 截取）：
- feature/local（本地开发常用集成分支）
- feature/upgrade（依赖升级中）
- feature/cancel-order-refund（取消单退款）
- feature/transaction-list / feature/ledger-list / feature/invoice-list-display
- feature/cancel-list-refund-status（最新合并 #6）
- fix/code-quality-issues
- fix/tracking-time
- fix/ui

### 7.2 提交规范（commitlint 强制）

```
<type>: <subject>
```

**type 枚举**：build / feat / fix / docs / style / refactor / perf / test / revert / ci / config / chore

**示例**：
```
feat: 退款列表移除cancelled状态tab
fix: 修复翻译key路径到pages.accounting.ledger
style: lint 自动修复
```

**Husky 钩子**：
- pre-commit：跑 `npm run pre-commit` → lint-staged（prettier + eslint + stylelint）
- commit-msg：跑 `npm run commit-msg` → commitlint 校验

### 7.3 最近迭代历史（脉络）

| 时间 | 主题 |
|------|------|
| 2026-05 | 退款列表、撤销列表状态调整；账本流水/交易记录列表显示按设计稿调整 |
| 2026-04 | Tracking 查询页 UI 重构、限制 200 条；首页 min-height 修复 |
| 2026-03 | UI 优化、字体显示、菜单文案；账单 → 消费账单 → 周期账单文案变更 |
| 2026-02 | 菜单顺序调整 |
| 2026-01 | 时间字段时区转换、撤销取消功能 |
| 2025-12 ~ 2026 | 大改：撤销取消、列表导出、推送入网、单笔创建样式 |

---

## 8. 后端 API 约定

### 8.1 响应格式

**正常 JSON 响应**：
```json
{
  "result": <业务数据>,
  "message": "<消息>",
  "isSuccess": true,
  "utcStamp": "2026-04-02T10:55:44Z"
}
```

**错误响应**：
```json
{
  "isSuccess": false,
  "message": "错误描述",
  "errors": { "field": ["msg1", "msg2"] }  // 字段级错误（可选）
}
```

**分页**：响应头 `x-paging-availcnt` 表示总数，axios 拦截器自动挂到 `data.availcnt`。

**文件下载**：接口返回 blob，需在请求参数中加 `responseType: "blob"`。

### 8.2 常用接口前缀

- `/api/Tokens` 登录/Token 相关
- `/api/Users` 用户管理
- `/api/Parcels` 包裹（列表/创建/详情/导出/标签等）
- `/api/Parcels/overlabel/*` 换单
- `/api/Parcels/postingToLastMiler/*` 推送入网
- `/api/exception/lastMiler/*` 获取面单失败异常
- `/api/exception/brokerRejected/*` 清关推送失败异常
- `/api/accounting/xacts/*` 余额明细
- `/api/accounting/statement/*` 应收运费
- `/api/Configuration/sites/*` 操作点
- `/api/Configuration/roles` 角色
- `/api/Configuration/company/*` 公司
- `/api/address/*` 地址簿
- `/api/tracking` 追踪
- `/api/Download/*` 下载中心

**完整接口清单见** `src/hooks/useHttp.js`（共 60+ 接口）。

### 8.3 后端环境

| 环境 | URL |
|------|-----|
| 沙箱（联调） | `https://shipping.sandbox.golads.com` |
| 生产 | `https://shipping.apparcel.com` |

---

## 9. 常见操作 Cookbook

### 9.1 新增一个业务页面

1. 在 `src/unitui/pages/<Module>/<Page>/index.vue` 创建组件
2. `src/router/index.js` 注册路由（`show_site: 1`、`web_title: "title.XXX"`）
3. `src/unitui/assets/json/menu.json` 加菜单项（若需要在侧边栏出现）
4. `src/language/ch.js` + `en.js` 加 i18n key
5. 接口写在 `src/hooks/use<Module>.js`，并在 `src/hooks/index.js` 导出

### 9.2 调用后端接口

```vue
<script setup>
import { parcellist } from "@/hooks";
import { ref, onMounted } from "vue";

const list = ref([]);
const fetchData = async () => {
  const res = await parcellist({ index: 1, size: 20 });
  if (res.isSuccess) list.value = res.result;
};
onMounted(fetchData);
</script>
```

### 9.3 使用 Vuex

```vue
<script setup>
import { useStore } from "vuex";
const store = useStore();

// 读
const userName = store.state.userModule.user.name;

// 写
store.commit("createparcelModule/incrementShipper", shipperObj);
</script>
```

### 9.4 i18n 切换

```vue
<template>
  <span>{{ $tm("pages.AccountBalance.CurrentBalance") }}</span>
</template>

<script>
// 程序方式：
import i18n from "@/language";
const text = i18n.global.t("menu.Parcel.List");
</script>
```

### 9.5 文件下载

```js
import FileSaver from "file-saver";
import { parcelexport } from "@/hooks";

const handleExport = async () => {
  const blob = await parcelexport(params, body);
  FileSaver.saveAs(blob, `parcels_${Date.now()}.xlsx`);
};
```

### 9.6 触发发布

- **测试环境**：往 `master` 分支 push，CNB 自动构建并发布
- **生产环境**：往 `release` 分支 push（注意：当前 `.cnb.yml` 的发布逻辑只在 master 分支触发 publish.sh，**release 分支的发布流程需确认是否人工介入**）
- **手动触发**：在 CNB Web UI 上的对应分支点「编译并发布」按钮（详见 `.cnb/web_trigger.yml`）

---

## 10. 排查指南（FAQ）

### Q1：本地启动后 401，登录不上
- 检查 `.env.dev` 的 `VUE_APP_BASE_URL` 是否还是 `/api1`
- 检查 `vue.config.js` 的 proxy.target 是否是 sandbox
- 检查浏览器 localStorage 是否残留旧 `baseURL`（会覆盖配置）

### Q2：上传 Excel 文件后端报"unsupported media type"
- 这是 **BUG_REPORT.md #3** 的已知问题：`useHttp.js` 中 `Headers` 应为 `headers`

### Q3：访问不存在路由后浏览器卡死
- **BUG_REPORT.md #1**：路由守卫死循环。修复方式：`router.push("/404")` → `next("/404"); return;`

### Q4：CI 构建失败
- 优先看 CNB Web UI 的构建日志
- 常见原因：yarn install 网络问题 → 重试或换镜像（已配置 `mirrors.cloud.tencent.com`）
- node 版本不一致 → CI 强制 `node:16.16.0`

### Q5：本地依赖装不上
```bash
# 切镜像
yarn config set registry https://registry.npmmirror.com
# 清缓存
yarn cache clean
# 删 node_modules 重装
rm -rf node_modules && yarn
```

### Q6：Element Plus 某个组件用法和官网不一样
- 当前用的 `1.0.2-beta.65` 是早期 beta，与 v2 正式版 API 差异大
- 参考已有代码或翻该版本 git 历史

### Q7：怎么加新语言（如日文）
1. 复制 `src/language/ch.js` → `ja.js`
2. `src/language/index.js` 注册 `'ja': require('./ja.js')`
3. 顶部语言切换组件 `src/unitui/ui/unit/sub/Zn.vue` 加选项
4. 设置 `localStorage.lang = 'ja'` + 刷新

### Q8：怎么改菜单顺序
- 编辑 `src/unitui/assets/json/menu.json` 调整数组顺序

### Q9：路由刷新后 404
- HTML5 history 模式，**生产部署需要 Nginx fallback 到 index.html**
- 检查服务器配置（webhook 拉取后是否正确解压到 `/data/web/shipping`）

---

## 11. 接手 Checklist（建议第一周做）

- [ ] 跑通本地环境（yarn / yarn serve）
- [ ] 通读 `BUG_REPORT.md`（14 个 bug，约 30 分钟）
- [ ] 修掉 3 个 P0 bug（30 分钟，风险极低）
- [ ] 用沙箱账号跑一遍核心流程：登录 → 单笔创建 → 列表查询 → 追踪 → 退出登录
- [ ] 在 CNB Web UI 上找一次构建日志，熟悉发布流程
- [ ] 找产品/后端拿沙箱账号、生产账号、企微群、文档链接
- [ ] 验证 `cnborigin` + `origin` 两个远程都能正常推拉
- [ ] 跑一次 `yarn lint` 看一下当前 ESLint 警告数（基线）
- [ ] 阅读 `src/router/index.js` + `src/hooks/useHttp.js` + `src/unitui/ui/Unitui.vue` 三个核心文件（约 1 小时）

---

## 12. 联系人与外部资源

> ⚠️ 本节请接手前与原负责人确认补充

- **产品负责人**：（待填）
- **后端联系人**：（待填）
- **运维/部署联系人**：（待填）
- **设计稿地址**：（待填，通常在 Figma / 蓝湖）
- **企业微信群**：通过上面的机器人 webhook 推送通知（key=fd4d4f42-...）
- **代码仓库（主）**：https://cnb.cool/suishouji_2025/shippingspa/shippingspa
- **代码仓库（镜像）**：https://e.coding.net/suishouji/shippingspa/shippingspa
- **七牛云制品**：bucket 名见 `$QINIU_BUCKET`（CI 注入），artifact 路径：`https://file-qn.golads.com/artifacts/shipping/<ARTIFACT_NAME>.zip`
- **发布 webhook**：`http://webhook.olabala.com/hooks/publishspa?token=8ukBFB5uqXXRjCtJ`
- **七牛密钥**：从 `https://cnb.cool/suishouji_2025/keys/-/blob/main/qiniu.json` 导入（CNB CI 自动）

---

## 13. 维护建议（个人观察）

按对项目健康度影响排序：

1. **先修 P0 bug**（特别是 BUG_REPORT.md #1 #2 #3），都是低风险高收益修复
2. **升级 Vue 和 Element Plus 到稳定版**：当前 beta 版限制太多，但工作量大（已有 feature/upgrade 分支），建议安排一个完整 sprint
3. **清理 README**：旧 README 信息过时，可考虑用本文档替代
4. **接口层重构**：把 `hooks/` 改名为 `api/`（其实里面都是普通 API 函数），符合社区习惯
5. **国际化补全**：很多页面文案是硬编码中文，没有走 i18n
6. **拆分巨型文件**：`useHttp.js` 600 多行接口混在一起，按业务模块拆分
7. **TypeScript 迁移**：长期看建议，但工作量大
8. **单元测试**：当前**完全没有测试**，可优先给关键工具函数（until/）和接口层加测试

---

## 14. 附录

### 14.1 全部路由清单（来自 router/index.js）

| 路径 | 名称 | 全屏 | 标题 i18n |
|------|------|------|-----------|
| / | (redirect) → /home | - | - |
| /login | login | ✅ | title.Login |
| /register | register | ✅ | title.Register |
| /forget | forget | ✅ | title.Forget |
| /404 | 404 | ✅ | 404 |
| /home | home | - | title.Dashboard |
| /Parcels/Single | sub_menu | - | (空) |
| /Parcels/Import | parcels_import | - | title.ParcelImport |
| /Parcels/Import/Preview | parcels_import_preview | - | title.ParcelImportPreview |
| /Parcels/Posting/Preview | parcels_posting_preview | - | title.ParcelImportPreview |
| /Parcels/Services | parcels_Services | - | title.ParcelServices |
| /PostingToLastMiler/Import | postingToLastMiler_import | - | title.PostingtoLastMilerImport |
| /Accountings/Xacts | accountings_xacts | - | title.BalanceDetail |
| /Accountings/Xacts/Balance | accountings_xacts_balance | - | title.AccountBalance |
| /Accountings/AR/LedgerList | accountings__ar_ledgerList | - | title.Ledger |
| /Accountings/Statements/List | accountings_statements_list | - | title.AccountReceivableFreight |
| /Accountings/Invoices/List | accountings_Invoices_list | - | title.Invoices |
| /Exceptions/LastMilerRejected | exceptions_lastmilerrejected | - | title.LastMilerRejection |
| /Addresses | addresses | - | title.Addresses |
| /Parcels/List | sub_List | - | title.ParcelList |
| /Parcels/CancelList | sub_cancelList | - | title.CancelList |
| /Parcels/RefundList | sub_refundList | - | title.RefundList |
| /Parcels/Batchcalculation | Batchcalculation | - | title.Batchcalculation |
| /CustomManagers/SackMfts/List | customManagers_sackMfts | - | title.CustomManagers.SackMfts |
| /Configurations/Sites/List | configurations_sites_list | - | title.ConfigurationsSite |
| /Configurations/Users/List | configurations_users_list | - | title.ConfigurationsUser |
| /Configurations/Company | configurations_company | - | title.ConfigurationsCompany |
| /Tools/Printing | tools_printing | - | title.PrintLabel |
| /Tools/Tracking | tools_tracking | - | title.Tracking |
| /Download | download | - | title.Download |

### 14.2 项目体量统计

- **源码文件**：约 112 个（.vue 76 个，.js 36 个）
- **语言文件**：ch.js 580 行，en.js 594 行
- **接口数量**：~60+（主要在 useHttp.js）
- **路由数量**：30 个
- **菜单项**：9 个一级分类，~20 个二级菜单
- **Vuex 模块**：8 个

### 14.3 ASCII 架构图

```
┌──────────────────────────────────────────────────────────────┐
│                       Browser                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Vue 3 SPA (createApp)                                       │
│                                                              │
│  main.js → store + i18n + ElementPlus + router → #app        │
│                              │                               │
│                              ▼                               │
│  App.vue → Unitui.vue (layout)                               │
│              ├─ Aside (menu.json)                            │
│              ├─ Header (User/Zn/Task/MobileMenu/VistMenu)    │
│              ├─ Main (router-view)                           │
│              │     └─ pages/* (业务页面)                      │
│              │           └─ hooks/* → request/index.js       │
│              │                            └─ axios            │
│              └─ Footer                                       │
│                                                              │
│  Vuex (8 modules) ◄────────┐                                │
│  vue-i18n (ch/en) ◄────────┤                                │
│  localStorage (token/config/lang/baseURL) ◄┐                │
└──────────────────────────────────────────────┼──────────────┘
                              │                │
                              ▼                │
       ┌──────────────────────────────────┐    │
       │  axios interceptors              │    │
       │   - 注入 Token (Bearer)         ─┼────┘
       │   - 注入 Accept-Language        │
       │   - 401 清 token + 跳 /login    │
       │   - error → ElMessage.error     │
       └──────────────┬───────────────────┘
                      │
                      ▼
       ┌──────────────────────────────────┐
       │  Backend API                     │
       │  - sandbox (golads.com)          │
       │  - prod (apparcel.com)           │
       │  返回 {result, isSuccess,        │
       │       message, utcStamp}        │
       └──────────────────────────────────┘

CI/CD：
  git push (master/release)
    ↓
  CNB Pipeline (node:16.16.0)
    ↓
  yarn && yarn build → dist/
    ↓
  zip + upload 七牛云 (file-qn.golads.com/artifacts/shipping/)
    ↓
  master 分支 → webhook (webhook.olabala.com) → 服务器拉取解压
    ↓
  企微机器人通知
```

---

> 📝 **结束语**：本文档基于 2026-06-22 当前 master 分支状态生成，覆盖项目所有可见信息。如有信息过时，欢迎接手后直接修改本文件。
>
> 项目代码风格较老（早期 Vue3 beta + 命名拼写问题），但业务逻辑完整。
> **建议优先级**：1) 修 P0 bug → 2) 熟悉业务流程 → 3) 升级核心依赖 → 4) 重构 API 层。
>
> 祝顺利接手 🚢
