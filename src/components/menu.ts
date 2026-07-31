import { Menus } from '@/types/menu';

// 菜单按 shippingspa release 分支 menu.json 排列：
// 包裹管理 / 清单管理 / 财务管理 / 配置 / 异常处理 / 收发件地址 / 追踪 / 下载中心，
// 另增 "工具" 组承载换单列表/换单导入/面单打印/异常导入。
export const menuData: Menus[] = [
    {
        id: '0',
        title: '系统首页',
        index: '/home',
        icon: 'Odometer',
    },
    {
        id: '100',
        title: '包裹管理',
        index: '100',
        icon: 'Box',
        children: [
            { id: '101', pid: '100', index: '/Parcels/List', title: '包裹查询' },
            { id: '115', pid: '100', index: '/Parcels/Single', title: '单笔创建' },
            { id: '116', pid: '100', index: '/Parcels/Import', title: '批量创建' },
            { id: '117', pid: '100', index: '/Parcels/Batchcalculation', title: '批量试算' },
            { id: '103', pid: '100', index: '/Parcels/RefundList', title: '退款列表' },
            { id: '118', pid: '100', index: '/PostingToLastMiler/Import', title: '推送入网' },
        ],
    },
    {
        id: '120',
        title: '清单管理',
        index: '120',
        icon: 'List',
        children: [
            { id: '9', pid: '120', index: '/CustomManagers/SackMfts/List', title: '清单列表' },
        ],
    },
    {
        id: '110',
        title: '财务管理',
        index: '110',
        icon: 'Money',
        children: [
            { id: '113', pid: '110', index: '/Accountings/Xacts/Balance', title: '账户余额' },
            { id: '112', pid: '110', index: '/Accountings/Xacts', title: '交易记录' },
            { id: '107', pid: '110', index: '/Accountings/AR/LedgerList', title: '账本流水' },
            { id: '109', pid: '110', index: '/Accountings/Invoices/List', title: '周期账单' },
        ],
    },
    {
        id: '160',
        title: '配置',
        index: '160',
        icon: 'Setting',
        children: [
            { id: '108', pid: '160', index: '/Configurations/Sites/List', title: '操作点' },
            { id: '106', pid: '160', index: '/Configurations/Users/List', title: '用户' },
            { id: '161', pid: '160', index: '/Configurations/Company', title: '公司' },
            { id: '104', pid: '160', index: '/Parcels/Services', title: '服务列表' },
        ],
    },
    {
        id: '130',
        title: '异常处理',
        index: '130',
        icon: 'Warning',
        children: [
            { id: '131', pid: '130', index: '/Exceptions/LastMilerRejected', title: '获取面单失败' },
        ],
    },
    {
        id: '140',
        title: '收发件地址',
        index: '/Addresses',
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
        index: '/Download',
        icon: 'Download',
    },
];