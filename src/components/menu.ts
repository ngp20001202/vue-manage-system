import { Menus } from '@/types/menu';

// 菜单按迁移要求排列，仅保留迁移业务菜单 + 系统首页，
// 隐藏原 vue-manage-system 的演示菜单（系统管理、组件、表格、图表、图标、主题、附加页面）。
export const menuData: Menus[] = [
    {
        id: '0',
        title: '系统首页',
        index: '/dashboard',
        icon: 'Odometer',
    },
    {
        id: '100',
        title: '包裹管理',
        index: '100',
        icon: 'Box',
        children: [
            {
                id: '101',
                pid: '100',
                index: '/parcel/list',
                title: '包裹查询',
            },
            {
                id: '102',
                pid: '100',
                index: '/parcel/cancel',
                title: '取消列表',
            },
            {
                id: '103',
                pid: '100',
                index: '/parcel/refund',
                title: '退款列表',
            },
        ],
    },
    {
        id: '120',
        title: '清单管理',
        index: '120',
        icon: 'List',
        children: [
            {
                id: '9',
                pid: '120',
                index: '/customManagers/sackMfts',
                title: '清单列表',
            },
        ],
    },
    {
        id: '110',
        title: '财务管理',
        index: '110',
        icon: 'Money',
        children: [
            {
                id: '113',
                pid: '110',
                index: '/accounting/xacts/balance',
                title: '账户余额',
            },
            {
                id: '112',
                pid: '110',
                index: '/accounting/xacts',
                title: '交易记录',
            },
            {
                id: '107',
                pid: '110',
                index: '/accounting/ledger',
                title: '账本流水',
            },
            {
                id: '109',
                pid: '110',
                index: '/accounting/invoices',
                title: '周期账单',
            },
        ],
    },
    {
        id: '160',
        title: '配置',
        index: '160',
        icon: 'Setting',
        children: [
            {
                id: '108',
                pid: '160',
                index: '/configuration/site',
                title: '操作点',
            },
            {
                id: '106',
                pid: '160',
                index: '/configuration/user',
                title: '用户',
            },
            {
                id: '161',
                pid: '160',
                index: '/configuration/company',
                title: '公司',
            },
            {
                id: '104',
                pid: '160',
                index: '/parcel/services',
                title: '服务列表',
            },
        ],
    },
    {
        id: '130',
        title: '异常处理',
        index: '130',
        icon: 'Warning',
        children: [
            {
                id: '131',
                pid: '130',
                index: '/exception/lastMilerRejected',
                title: '获取面单失败',
            },
        ],
    },
    {
        id: '140',
        title: '收发件地址',
        index: '/address/list',
        icon: 'Location',
    },
    {
        id: '150',
        title: '追踪',
        index: '/Tools/Tracking',
        icon: 'Search',
    },
    {
        id: '170',
        title: '下载中心',
        index: '/download',
        icon: 'Download',
    },
];
