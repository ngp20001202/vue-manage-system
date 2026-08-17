import { Menus } from '@/types/menu';

// 菜单按 shippingspa release 分支 menu.json 排列：
// 包裹管理 / 清单管理 / 财务管理 / 配置 / 异常处理 / 收发件地址 / 追踪 / 下载中心。
// titleKey 用于 i18n 切换，title 作为中文兜底。
export const menuData: Menus[] = [
    {
        id: '0',
        title: '系统首页',
        titleKey: 'menu.Dashboard',
        index: '/home',
        icon: 'Odometer',
    },
    {
        id: '100',
        title: '包裹管理',
        titleKey: 'menu.Parcel.Parcel',
        index: '100',
        icon: 'Box',
        children: [
            { id: '101', pid: '100', index: '/Parcels/List', title: '包裹查询', titleKey: 'menu.Parcel.List' },
            { id: '115', pid: '100', index: '/Parcels/Single', title: '单笔创建', titleKey: 'menu.Parcel.Create' },
            { id: '116', pid: '100', index: '/Parcels/Import', title: '批量创建', titleKey: 'menu.Parcel.Import' },
            { id: '117', pid: '100', index: '/Parcels/Batchcalculation', title: '批量试算', titleKey: 'menu.Parcel.Batchcalculation' },
            { id: '102', pid: '100', index: '/Parcels/CancelList', title: '撤销列表', titleKey: 'menu.Parcel.CancelList' },
            { id: '103', pid: '100', index: '/Parcels/RefundList', title: '退款列表', titleKey: 'menu.Parcel.RefundList' },
            { id: '119', pid: '100', index: '/Parcels/ClaimList', title: '理赔列表', titleKey: 'menu.Parcel.ClaimList' },
            { id: '118', pid: '100', index: '/PostingToLastMiler/Import', title: '推送入网', titleKey: 'menu.Parcel.PostingtoLastMiler' },
        ],
    },
    {
        id: '120',
        title: '清单管理',
        titleKey: 'menu.CustomManagers.CustomManagers',
        index: '120',
        icon: 'List',
        children: [
            { id: '9', pid: '120', index: '/CustomManagers/SackMfts/List', title: '清单列表', titleKey: 'menu.CustomManagers.SackMfts' },
        ],
    },
    {
        id: '110',
        title: '财务管理',
        titleKey: 'menu.Accounting.Accounting',
        index: '110',
        icon: 'Money',
        children: [
            { id: '113', pid: '110', index: '/Accountings/Xacts/Balance', title: '账户余额', titleKey: 'menu.Accounting.AccountBalance' },
            { id: '112', pid: '110', index: '/Accountings/Xacts', title: '交易记录', titleKey: 'menu.Accounting.BalanceDetail' },
            { id: '107', pid: '110', index: '/Accountings/AR/LedgerList', title: '账本流水', titleKey: 'menu.Accounting.Ledger' },
            { id: '109', pid: '110', index: '/Accountings/Invoices/List', title: '周期账单', titleKey: 'menu.Accounting.Invoices' },
        ],
    },
    {
        id: '160',
        title: '配置',
        titleKey: 'menu.Configurations.Configurations',
        index: '160',
        icon: 'Setting',
        children: [
            { id: '108', pid: '160', index: '/Configurations/Sites/List', title: '操作点', titleKey: 'menu.Configurations.Site' },
            { id: '106', pid: '160', index: '/Configurations/Users/List', title: '用户', titleKey: 'menu.Configurations.User' },
            { id: '161', pid: '160', index: '/Configurations/Company', title: '公司', titleKey: 'menu.Configurations.Company' },
            { id: '104', pid: '160', index: '/Parcels/Services', title: '服务列表', titleKey: 'menu.Parcel.Services' },
        ],
    },
    {
        id: '130',
        title: '异常处理',
        titleKey: 'menu.ExceptionHanding.ExceptionHanding',
        index: '130',
        icon: 'Warning',
        children: [
            { id: '131', pid: '130', index: '/Exceptions/LastMilerRejected', title: '获取面单失败', titleKey: 'menu.ExceptionHanding.LastMilerRejection' },
        ],
    },
    {
        id: '140',
        title: '收发件地址',
        titleKey: 'menu.Address',
        index: '/Addresses',
        icon: 'Location',
    },
    {
        id: '150',
        title: '追踪',
        titleKey: 'menu.Tracking',
        index: '/Tools/Tracking',
        icon: 'Search',
    },
    {
        id: '170',
        title: '下载中心',
        titleKey: 'menu.Download',
        index: '/Download',
        icon: 'Download',
    },
];
