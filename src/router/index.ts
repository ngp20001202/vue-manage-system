import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
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
                    noAuth: true,
                    hideInMenu: true,
                },
                component: () => import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue'),
            },
            {
                path: '/Parcels/List',
                name: 'shippingspa-parcel-list',
                meta: { title: '包裹查询', permiss: '101', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-list" */ '../views/parcel/list.vue'),
            },
            {
                path: '/Parcels/Single',
                name: 'shippingspa-parcel-create',
                meta: { title: '单笔创建', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-create" */ '../views/parcel/create.vue'),
            },
            {
                path: '/Parcels/Import',
                name: 'shippingspa-parcel-import',
                meta: { title: '批量导入', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-import" */ '../views/parcel/import.vue'),
            },
            {
                path: '/Parcels/Batchcalculation',
                name: 'shippingspa-parcel-batchCalculation',
                meta: { title: '批量试算', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-batchCalculation" */ '../views/parcel/batchCalculation.vue'),
            },
            {
                path: '/Parcels/RefundList',
                name: 'shippingspa-parcel-refund',
                meta: { title: '退款列表', permiss: '103', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-refund" */ '../views/parcel/refund.vue'),
            },
            {
                path: '/PostingToLastMiler/Import',
                name: 'shippingspa-parcel-postingToLastMiler',
                meta: { title: '推送入网', permiss: '100', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-postingToLastMiler" */ '../views/parcel/postingtolastmiler.vue'),
            },
            {
                path: '/Parcels/Services',
                name: 'shippingspa-parcel-services',
                meta: { title: '服务列表', permiss: '104', hideInMenu: true },
                component: () => import(/* webpackChunkName: "parcel-services" */ '../views/parcel/services.vue'),
            },
            {
                path: '/CustomManagers/SackMfts/List',
                name: 'shippingspa-customManagers-sackMfts',
                meta: { title: '清单列表', permiss: '9', hideInMenu: true },
                component: () => import(/* webpackChunkName: "customManagers-sackMfts" */ '../views/sackMft/list.vue'),
            },
            {
                path: '/Accountings/Xacts/Balance',
                name: 'shippingspa-accounting-balance',
                meta: { title: '账户余额', permiss: '3', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-balance" */ '../views/accounting/balance.vue'),
            },
            {
                path: '/Accountings/Xacts',
                name: 'shippingspa-accounting-xacts',
                meta: { title: '交易记录', permiss: '4', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-xacts" */ '../views/accounting/xacts.vue'),
            },
            {
                path: '/Accountings/AR/LedgerList',
                name: 'shippingspa-accounting-ledger',
                meta: { title: '账本流水', permiss: '107', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-ledger" */ '../views/accounting/ledger.vue'),
            },
            {
                path: '/Accountings/Invoices/List',
                name: 'shippingspa-accounting-invoices',
                meta: { title: '周期账单', permiss: '109', hideInMenu: true },
                component: () => import(/* webpackChunkName: "accounting-invoices" */ '../views/accounting/invoices.vue'),
            },
            {
                path: '/Configurations/Sites/List',
                name: 'shippingspa-configuration-site',
                meta: { title: '操作点管理', permiss: '108', hideInMenu: true },
                component: () => import(/* webpackChunkName: "configuration-site" */ '../views/config/site.vue'),
            },
            {
                path: '/Configurations/Users/List',
                name: 'shippingspa-configuration-user',
                meta: { title: '用户管理', permiss: '106', hideInMenu: true },
                component: () => import(/* webpackChunkName: "configuration-user" */ '../views/config/user.vue'),
            },
            {
                path: '/Configurations/Company',
                name: 'shippingspa-configuration-company',
                meta: { title: '公司配置', permiss: '160', hideInMenu: true },
                component: () => import(/* webpackChunkName: "configuration-company" */ '../views/config/company.vue'),
            },
            {
                path: '/Exceptions/LastMilerRejected',
                name: 'shippingspa-exception-lastMilerRejected',
                meta: { title: '获取面单失败', permiss: '6', hideInMenu: true },
                component: () => import(/* webpackChunkName: "exception-lastMilerRejected" */ '../views/exception/lastMilerRejected.vue'),
            },
            {
                path: '/Addresses',
                name: 'shippingspa-address-list',
                meta: { title: '收发件地址', permiss: '8', hideInMenu: true },
                component: () => import(/* webpackChunkName: "address-list" */ '../views/address/index.vue'),
            },
            {
                path: '/Download',
                name: 'shippingspa-download',
                meta: { title: '下载任务', permiss: '101', hideInMenu: true },
                component: () => import(/* webpackChunkName: "download" */ '../views/download/index.vue'),
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
