import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
import Home from '../views/home.vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                meta: {
                    title: '系统首页',
                    noAuth: true,
                },
                component: () => import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue'),
            },
            {
                path: '/system-user',
                name: 'system-user',
                meta: {
                    title: '用户管理',
                    permiss: '11',
                },
                component: () => import(/* webpackChunkName: "system-user" */ '../views/system/user.vue'),
            },
            {
                path: '/system-role',
                name: 'system-role',
                meta: {
                    title: '角色管理',
                    permiss: '12',
                },
                component: () => import(/* webpackChunkName: "system-role" */ '../views/system/role.vue'),
            },
            {
                path: '/system-menu',
                name: 'system-menu',
                meta: {
                    title: '菜单管理',
                    permiss: '13',
                },
                component: () => import(/* webpackChunkName: "system-menu" */ '../views/system/menu.vue'),
            },
            {
                path: '/table',
                name: 'basetable',
                meta: {
                    title: '基础表格',
                    permiss: '31',
                },
                component: () => import(/* webpackChunkName: "table" */ '../views/table/basetable.vue'),
            },
            {
                path: '/table-editor',
                name: 'table-editor',
                meta: {
                    title: '可编辑表格',
                    permiss: '32',
                },
                component: () => import(/* webpackChunkName: "table-editor" */ '../views/table/table-editor.vue'),
            },
            {
                path: '/schart',
                name: 'schart',
                meta: {
                    title: 'schart图表',
                    permiss: '41',
                },
                component: () => import(/* webpackChunkName: "schart" */ '../views/chart/schart.vue'),
            },
            {
                path: '/echarts',
                name: 'echarts',
                meta: {
                    title: 'echarts图表',
                    permiss: '42',
                },
                component: () => import(/* webpackChunkName: "echarts" */ '../views/chart/echarts.vue'),
            },

            {
                path: '/icon',
                name: 'icon',
                meta: {
                    title: '图标',
                    permiss: '5',
                },
                component: () => import(/* webpackChunkName: "icon" */ '../views/pages/icon.vue'),
            },
            {
                path: '/ucenter',
                name: 'ucenter',
                meta: {
                    title: '个人中心',
                },
                component: () => import(/* webpackChunkName: "ucenter" */ '../views/pages/ucenter.vue'),
            },
            {
                path: '/editor',
                name: 'editor',
                meta: {
                    title: '富文本编辑器',
                    permiss: '291',
                },
                component: () => import(/* webpackChunkName: "editor" */ '../views/pages/editor.vue'),
            },
            {
                path: '/markdown',
                name: 'markdown',
                meta: {
                    title: 'markdown编辑器',
                    permiss: '292',
                },
                component: () => import(/* webpackChunkName: "markdown" */ '../views/pages/markdown.vue'),
            },
            {
                path: '/export',
                name: 'export',
                meta: {
                    title: '导出Excel',
                    permiss: '34',
                },
                component: () => import(/* webpackChunkName: "export" */ '../views/table/export.vue'),
            },
            {
                path: '/import',
                name: 'import',
                meta: {
                    title: '导入Excel',
                    permiss: '33',
                },
                component: () => import(/* webpackChunkName: "import" */ '../views/table/import.vue'),
            },
            {
                path: '/theme',
                name: 'theme',
                meta: {
                    title: '主题设置',
                    permiss: '7',
                },
                component: () => import(/* webpackChunkName: "theme" */ '../views/pages/theme.vue'),
            },
            {
                path: '/calendar',
                name: 'calendar',
                meta: {
                    title: '日历',
                    permiss: '24',
                },
                component: () => import(/* webpackChunkName: "calendar" */ '../views/element/calendar.vue'),
            },
            {
                path: '/watermark',
                name: 'watermark',
                meta: {
                    title: '水印',
                    permiss: '25',
                },
                component: () => import(/* webpackChunkName: "watermark" */ '../views/element/watermark.vue'),
            },
            {
                path: '/carousel',
                name: 'carousel',
                meta: {
                    title: '走马灯',
                    permiss: '23',
                },
                component: () => import(/* webpackChunkName: "carousel" */ '../views/element/carousel.vue'),
            },
            {
                path: '/tour',
                name: 'tour',
                meta: {
                    title: '分步引导',
                    permiss: '26',
                },
                component: () => import(/* webpackChunkName: "tour" */ '../views/element/tour.vue'),
            },
            {
                path: '/steps',
                name: 'steps',
                meta: {
                    title: '步骤条',
                    permiss: '27',
                },
                component: () => import(/* webpackChunkName: "steps" */ '../views/element/steps.vue'),
            },
            {
                path: '/form',
                name: 'forms',
                meta: {
                    title: '表单',
                    permiss: '21',
                },
                component: () => import(/* webpackChunkName: "form" */ '../views/element/form.vue'),
            },
            {
                path: '/upload',
                name: 'upload',
                meta: {
                    title: '上传',
                    permiss: '22',
                },
                component: () => import(/* webpackChunkName: "upload" */ '../views/element/upload.vue'),
            },
            {
                path: '/statistic',
                name: 'statistic',
                meta: {
                    title: '统计',
                    permiss: '28',
                },
                component: () => import(/* webpackChunkName: "statistic" */ '../views/element/statistic.vue'),
            },
            {
                path: '/parcel/list',
                name: 'parcel-list',
                meta: {
                    title: '包裹列表',
                    permiss: '101',
                },
                component: () => import(/* webpackChunkName: "parcel-list" */ '../views/parcel/list.vue'),
            },
            {
                path: '/parcel/cancel',
                name: 'parcel-cancel',
                meta: {
                    title: '撤销列表',
                    permiss: '102',
                },
                component: () => import(/* webpackChunkName: "parcel-cancel" */ '../views/parcel/cancel.vue'),
            },
            {
                path: '/parcel/refund',
                name: 'parcel-refund',
                meta: {
                    title: '退款列表',
                    permiss: '103',
                },
                component: () => import(/* webpackChunkName: "parcel-refund" */ '../views/parcel/refund.vue'),
            },
            {
                path: '/parcel/services',
                name: 'parcel-services',
                meta: {
                    title: '服务列表',
                    permiss: '104',
                },
                component: () => import(/* webpackChunkName: "parcel-services" */ '../views/parcel/services.vue'),
            },
            {
                path: '/customManagers/sackMfts',
                name: 'customManagers-sackMfts',
                meta: {
                    title: '清单列表',
                    permiss: '9',
                },
                component: () => import(/* webpackChunkName: "customManagers-sackMfts" */ '../views/sackMft/list.vue'),
            },
            {
                path: '/configuration/user',
                name: 'configuration-user',
                meta: {
                    title: '用户管理',
                    permiss: '106',
                },
                component: () => import(/* webpackChunkName: "configuration-user" */ '../views/config/user.vue'),
            },
            {
                path: '/configuration/site',
                name: 'configuration-site',
                meta: {
                    title: '操作点管理',
                    permiss: '108',
                },
                component: () => import(/* webpackChunkName: "configuration-site" */ '../views/config/site.vue'),
            },
            {
                path: '/configuration/company',
                name: 'configuration-company',
                meta: {
                    title: '公司配置',
                    permiss: '160',
                },
                component: () => import(/* webpackChunkName: "configuration-company" */ '../views/config/company.vue'),
            },
            {
                path: '/parcel/list/detail',
                name: 'parcel-list-detail',
                meta: {
                    title: '包裹详情',
                    permiss: '101',
                    hideInTabs: true,
                },
                component: () => import(/* webpackChunkName: "parcel-list-detail" */ '../views/parcel/detail.vue'),
            },
            {
                path: '/exception/lastMilerRejected',
                name: 'exception-lastMilerRejected',
                meta: {
                    title: '获取面单失败',
                    permiss: '6',
                },
                component: () => import(/* webpackChunkName: "exception-lastMilerRejected" */ '../views/exception/lastMilerRejected.vue'),
            },
            {
                path: '/exception/brokerRejected',
                name: 'exception-brokerRejected',
                meta: {
                    title: '清关推送失败',
                    permiss: '132',
                },
                component: () => import(/* webpackChunkName: "exception-brokerRejected" */ '../views/exception/brokerRejected.vue'),
            },
            {
                path: '/exception/brokerRejected/import',
                name: 'exception-brokerRejected-import',
                meta: {
                    title: '清关推送失败 - 导入订单',
                    permiss: '132',
                },
                component: () => import(/* webpackChunkName: "exception-brokerRejected-import" */ '../views/exception/brokerRejectedImport.vue'),
            },
            {
                path: '/download',
                name: 'download',
                meta: {
                    title: '下载任务',
                    permiss: '101',
                },
                component: () => import(/* webpackChunkName: "download" */ '../views/download/index.vue'),
            },
            {
                path: '/accounting/xacts/balance',
                name: 'accounting-balance',
                meta: {
                    title: '账户余额',
                    permiss: '3',
                },
                component: () => import(/* webpackChunkName: "accounting-balance" */ '../views/accounting/balance.vue'),
            },
            {
                path: '/accounting/xacts',
                name: 'accounting-xacts',
                meta: {
                    title: '交易记录',
                    permiss: '4',
                },
                component: () => import(/* webpackChunkName: "accounting-xacts" */ '../views/accounting/xacts.vue'),
            },
            {
                path: '/accounting/statements',
                name: 'accounting-statements',
                meta: {
                    title: '应收运费',
                    permiss: '105',
                },
                component: () => import(/* webpackChunkName: "accounting-statements" */ '../views/accounting/statements.vue'),
            },
            {
                path: '/accounting/invoices',
                name: 'accounting-invoices',
                meta: {
                    title: '周期账单',
                    permiss: '109',
                },
                component: () => import(/* webpackChunkName: "accounting-invoices" */ '../views/accounting/invoices.vue'),
            },
            {
                path: '/accounting/ledger',
                name: 'accounting-ledger',
                meta: {
                    title: '账本流水',
                    permiss: '107',
                },
                component: () => import(/* webpackChunkName: "accounting-ledger" */ '../views/accounting/ledger.vue'),
            },
            {
                path: '/address/list',
                name: 'address-list',
                meta: {
                    title: '收发件地址',
                    permiss: '8',
                },
                component: () => import(/* webpackChunkName: "address-list" */ '../views/address/index.vue'),
            },
            {
                path: '/Tools/Tracking',
                name: 'tools-tracking',
                meta: {
                    title: '追踪',
                    permiss: '150',
                },
                component: () => import(/* webpackChunkName: "tools-tracking" */ '../views/tracking/index.vue'),
            },
        ],
    },
    {
        path: '/login',
        meta: {
            title: '登录',
            noAuth: true,
        },
        component: () => import(/* webpackChunkName: "login" */ '../views/pages/login.vue'),
    },
    {
        path: '/register',
        meta: {
            title: '注册',
            noAuth: true,
        },
        component: () => import(/* webpackChunkName: "register" */ '../views/pages/register.vue'),
    },
    {
        path: '/reset-pwd',
        meta: {
            title: '重置密码',
            noAuth: true,
        },
        component: () => import(/* webpackChunkName: "reset-pwd" */ '../views/pages/reset-pwd.vue'),
    },
    {
        path: '/403',
        meta: {
            title: '没有权限',
            noAuth: true,
        },
        component: () => import(/* webpackChunkName: "403" */ '../views/pages/403.vue'),
    },
    {
        path: '/404',
        meta: {
            title: '找不到页面',
            noAuth: true,
        },
        component: () => import(/* webpackChunkName: "404" */ '../views/pages/404.vue'),
    },
    { path: '/:path(.*)', redirect: '/404' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    NProgress.start();
    const role = localStorage.getItem('vuems_name');
    const permiss = usePermissStore();

    if (!role && to.meta.noAuth !== true) {
        next('/login');
    } else if (typeof to.meta.permiss == 'string' && !permiss.key.includes(to.meta.permiss)) {
        // 如果没有权限，则进入403
        next('/403');
    } else {
        next();
    }
});

router.afterEach(() => {
    NProgress.done();
});

export default router;
