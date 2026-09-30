import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
import i18n from '../language';
import Home from '../views/home.vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/Tools/Tracking',
                name: 'tools-tracking',
                meta: {
                    title: '追踪',
                    titleKey: 'title.Tracking',
                    permiss: '150',
                },
                component: () => import(/* webpackChunkName: "tools-tracking" */ '../views/tracking/index.vue'),
            },
            // ============== shippingspa-style URL aliases ==============
            // These aliases point to the SAME component as the lowercase routes above.
            // They keep the existing lowercase routes intact for backward compatibility.
            {
                path: '/home',
                name: 'shippingspa-home',
                meta: {
                    title: '系统首页',
                    titleKey: 'title.Dashboard',
                    noAuth: true,
                    hideInMenu: true,
                },
                component: () => import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue'),
            },
            {
                path: '/Parcels/List',
                name: 'shippingspa-parcel-list',
                meta: { title: '包裹查询', titleKey: 'title.ParcelList', permiss: '101', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-list" */ '../views/parcel/list.vue'),
            },
            {
                path: '/Parcels/Single',
                name: 'shippingspa-parcel-create',
                meta: { title: '单笔创建', titleKey: 'title.ParcelCreate', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-create" */ '../views/parcel/create.vue'),
            },
            {
                path: '/Parcels/Import',
                name: 'shippingspa-parcel-import',
                meta: { title: '批量导入', titleKey: 'title.ParcelImport', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-import" */ '../views/parcel/import.vue'),
            },
            {
                path: '/Parcels/Import/Preview',
                name: 'shippingspa-parcel-import-preview',
                meta: { title: '导入预览', titleKey: 'title.ParcelImportPreview', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-preview" */ '../views/parcel/previewPage.vue'),
            },
            {
                path: '/Parcels/Batchcalculation',
                name: 'shippingspa-parcel-batchCalculation',
                meta: { title: '批量试算', titleKey: 'title.Batchcalculation', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-batchCalculation" */ '../views/parcel/batchCalculation.vue'),
            },
            {
                path: '/Parcels/RefundList',
                name: 'shippingspa-parcel-refund',
                meta: { title: '退款列表', titleKey: 'title.RefundList', permiss: '103', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-refund" */ '../views/parcel/refund.vue'),
            },
            {
                path: '/Parcels/CancelList',
                name: 'shippingspa-parcel-cancel',
                meta: { title: '撤销列表', titleKey: 'title.CancelList', permiss: '102', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-cancel" */ '../views/parcel/cancel.vue'),
            },
            {
                path: '/Parcels/ClaimList',
                name: 'shippingspa-parcel-claim',
                meta: { title: '理赔列表', titleKey: 'title.ClaimList', permiss: '119', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-claim" */ '../views/parcel/claim.vue'),
            },
            {
                path: '/PostingToLastMiler/Import',
                name: 'shippingspa-parcel-postingToLastMiler',
                meta: { title: '推送入网', titleKey: 'title.PostingtoLastMilerImport', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-postingToLastMiler" */ '../views/parcel/postingtolastmiler.vue'),
            },
            {
                path: '/Parcels/Services',
                name: 'shippingspa-parcel-services',
                meta: { title: '服务列表', titleKey: 'title.ParcelServices', permiss: '104', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-services" */ '../views/parcel/services.vue'),
            },
            {
                path: '/CustomManagers/SackMfts/List',
                name: 'shippingspa-customManagers-sackMfts',
                meta: { title: '清单列表', titleKey: 'title.CustomManagers.SackMfts', permiss: '9', hideInMenu: true },
                component: () => import(/* webpackChunkName: "customManagers-sackMfts" */ '../views/sackMft/list.vue'),
            },
            {
                path: '/Accountings/Xacts/Balance',
                name: 'shippingspa-accounting-balance',
                meta: { title: '账户余额', titleKey: 'title.AccountBalance', permiss: '3', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-balance" */ '../views/accounting/balance.vue'),
            },
            {
                path: '/Accountings/Xacts',
                name: 'shippingspa-accounting-xacts',
                meta: { title: '交易记录', titleKey: 'title.BalanceDetail', permiss: '4', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-xacts" */ '../views/accounting/xacts.vue'),
            },
            {
                path: '/Accountings/AR/LedgerList',
                name: 'shippingspa-accounting-ledger',
                meta: { title: '账本流水', titleKey: 'title.Ledger', permiss: '107', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-ledger" */ '../views/accounting/ledger.vue'),
            },
            {
                path: '/Accountings/Invoices/List',
                name: 'shippingspa-accounting-invoices',
                meta: { title: '周期账单', titleKey: 'title.Invoices', permiss: '109', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-invoices" */ '../views/accounting/invoices.vue'),
            },
            {
                path: '/Configurations/Sites/List',
                name: 'shippingspa-configuration-site',
                meta: { title: '操作点管理', titleKey: 'title.ConfigurationsSite', permiss: '108', hideInMenu: true },
                component: () => import(/* webpackChunkName: "configuration-site" */ '../views/config/site.vue'),
            },
            {
                path: '/Configurations/Users/List',
                name: 'shippingspa-configuration-user',
                meta: { title: '用户管理', titleKey: 'title.ConfigurationsUser', permiss: '106', hideInMenu: true },
                component: () => import(/* webpackChunkName: "configuration-user" */ '../views/config/user.vue'),
            },
            {
                path: '/Configurations/Company',
                name: 'shippingspa-configuration-company',
                meta: { title: '公司配置', titleKey: 'title.ConfigurationsCompany', permiss: '160', hideInMenu: true },
                component: () => import(/* webpackChunkName: "configuration-company" */ '../views/config/company.vue'),
            },
            {
                path: '/Exceptions/LastMilerRejected',
                name: 'shippingspa-exception-lastMilerRejected',
                meta: { title: '获取面单失败', titleKey: 'title.LastMilerRejection', permiss: '6', hideInMenu: true },
                component: () => import(/* webpackChunkName: "exception-lastMilerRejected" */ '../views/exception/lastMilerRejected.vue'),
            },
            {
                path: '/Addresses',
                name: 'shippingspa-address-list',
                meta: { title: '收发件地址', titleKey: 'title.Addresses', permiss: '8', hideInMenu: true },
                component: () => import(/* webpackChunkName: "address-list" */ '../views/address/index.vue'),
            },
            {
                path: '/Download',
                name: 'shippingspa-download',
                meta: { title: '下载任务', titleKey: 'title.Download', permiss: '101', hideInMenu: true },
                component: () => import(/* webpackChunkName: "download" */ '../views/download/index.vue'),
            },
            {
                path: '/Overlabel/List',
                name: 'shippingspa-overlabel-list',
                meta: { title: '换单列表', titleKey: 'title.OverlabelList', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "overlabel-list" */ '../views/overlabel/list.vue'),
            },
            {
                path: '/Overlabel/Import',
                name: 'shippingspa-overlabel-import',
                meta: { title: '换单导入', titleKey: 'title.OverlabelImport', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "overlabel-import" */ '../views/overlabel/import.vue'),
            },
            {
                path: '/Exceptions/BrokerRejected',
                name: 'shippingspa-exception-brokerRejected',
                meta: { title: '清关失败', titleKey: 'title.BrokerRejection', permiss: '6', hideInMenu: true },
                component: () => import(/* webpackChunkName: "exception-brokerRejected" */ '../views/exception/brokerRejected.vue'),
            },
            {
                path: '/Exceptions/BrokerRejected/Import',
                name: 'shippingspa-exception-brokerRejected-import',
                meta: { title: '清关失败导入', titleKey: 'title.BrokerRejectionImportParcels', permiss: '6', hideInMenu: true },
                component: () => import(/* webpackChunkName: "exception-brokerRejectedImport" */ '../views/exception/brokerRejectedImport.vue'),
            },
            {
                path: '/Exceptions/Import',
                name: 'shippingspa-exception-import',
                meta: { title: '异常导入', titleKey: 'title.BrokerRejectionImportParcels', permiss: '6', hideInMenu: true },
                component: () => import(/* webpackChunkName: "exception-import" */ '../views/exception/import.vue'),
            },
        ],
    },
    {
        path: '/login',
        meta: {
            title: '登录',
            titleKey: 'title.Login',
            noAuth: true,
        },
        component: () => import(/* webpackChunkName: "login2" */ '../views/pages/login2.vue'),
    },
    {
        path: '/login2',
        meta: {
            title: '登录',
            titleKey: 'title.Login',
            noAuth: true,
            hideInMenu: true,
        },
        component: () => import(/* webpackChunkName: "login2" */ '../views/pages/login2.vue'),
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

router.beforeEach(async (to, _from, next) => {
    NProgress.start();

    // 免密登录（其它站点带 ?token= 跳过来）：在导航落到组件前完成 token 兑换，
    // 并把 token 从 URL 上清掉，避免后续路由再触发一次。
    const urlToken = (to.query?.token as string | undefined) || undefined;
    if (urlToken) {
        try {
            const { useUserStore } = await import('../store/user');
            const user = useUserStore();
            await user.loginByToken(urlToken);
        } catch (e) {
            console.warn('token-based login failed', e);
        }
        // 把 token 从 URL 上清掉，避免后续路由跳转再触发一次
        const { token: _t, ...restQuery } = to.query as Record<string, any>;
        return next({ path: to.path, query: restQuery });
    }

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

router.afterEach(to => {
    const titleKey = to.meta.titleKey as string | undefined;
    const translated = titleKey ? i18n.global.t(titleKey) : '';
    const title = (translated && translated !== titleKey ? translated : (to.meta.title as string)) || '';
    document.title = title ? `${title}` : 'Shipping';
    NProgress.done();
});

export default router;
