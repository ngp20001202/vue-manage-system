import { Menus } from '@/types/menu';

// 菜单分组说明（参考 shippingspa 顺序，但去重 / 调整以适配 vue-manage-system）：
//   包裹管理 (100) — 客户域：包裹查询 / 撤销 / 退款 / 服务 / 下载
//   财务管理 (110) — 租户域：交易 / 应收运费 / 账本流水 / 周期账单 / 余额（占位）
//   清单管理 (120) — 清关：清单列表
//   异常处理 (130) — 清关 + 末段：获取面单失败 / 清关推送失败（占位）
//   地址     (140)
//   追踪     (150)
//   配置管理 (160) — 用户 / 操作点 / 公司
//   系统管理 (1)   — 用户 / 角色 / 菜单（vue-manage-system 自身管理）
//
// NOTE: 标题暂用中文硬编码，i18n 化是后续工作。
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
            {
                id: '104',
                pid: '100',
                index: '/parcel/services',
                title: '服务列表',
            },
            {
                id: '111',
                pid: '100',
                index: '/download',
                title: '下载任务',
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
                id: '105',
                pid: '110',
                index: '/accounting/statements',
                title: '应收运费',
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
        index: '/tracking',
        icon: 'Search',
    },
    {
        id: '160',
        title: '配置管理',
        index: '160',
        icon: 'Setting',
        children: [
            {
                id: '106',
                pid: '160',
                index: '/configuration/user',
                title: '用户管理',
            },
            {
                id: '108',
                pid: '160',
                index: '/configuration/site',
                title: '操作点',
            },
            {
                id: '161',
                pid: '160',
                index: '/configuration/company',
                title: '公司管理',
            },
        ],
    },
    {
        id: '1',
        title: '系统管理',
        index: '1',
        icon: 'HomeFilled',
        children: [
            {
                id: '11',
                pid: '1',
                index: '/system-user',
                title: '系统用户',
            },
            {
                id: '12',
                pid: '1',
                index: '/system-role',
                title: '角色管理',
            },
            {
                id: '13',
                pid: '1',
                index: '/system-menu',
                title: '菜单管理',
            },
        ],
    },
    {
        id: '2',
        title: '组件',
        index: '2-1',
        icon: 'Calendar',
        children: [
            {
                id: '21',
                pid: '3',
                index: '/form',
                title: '表单',
            },
            {
                id: '22',
                pid: '3',
                index: '/upload',
                title: '上传',
            },
            {
                id: '23',
                pid: '2',
                index: '/carousel',
                title: '走马灯',
            },
            {
                id: '24',
                pid: '2',
                index: '/calendar',
                title: '日历',
            },
            {
                id: '25',
                pid: '2',
                index: '/watermark',
                title: '水印',
            },
            {
                id: '26',
                pid: '2',
                index: '/tour',
                title: '分布引导',
            },
            {
                id: '27',
                pid: '2',
                index: '/steps',
                title: '步骤条',
            },
            {
                id: '28',
                pid: '2',
                index: '/statistic',
                title: '统计',
            },
            {
                id: '29',
                pid: '3',
                index: '29',
                title: '三级菜单',
                children: [
                    {
                        id: '291',
                        pid: '29',
                        index: '/editor',
                        title: '富文本编辑器',
                    },
                    {
                        id: '292',
                        pid: '29',
                        index: '/markdown',
                        title: 'markdown编辑器',
                    },
                ],
            },
        ],
    },
    {
        id: '3',
        title: '表格',
        index: '3',
        icon: 'Calendar',
        children: [
            {
                id: '31',
                pid: '3',
                index: '/table',
                title: '基础表格',
            },
            {
                id: '32',
                pid: '3',
                index: '/table-editor',
                title: '可编辑表格',
            },
            {
                id: '33',
                pid: '3',
                index: '/import',
                title: '导入Excel',
            },
            {
                id: '34',
                pid: '3',
                index: '/export',
                title: '导出Excel',
            },
        ],
    },
    {
        id: '4',
        icon: 'PieChart',
        index: '4',
        title: '图表',
        children: [
            {
                id: '41',
                pid: '4',
                index: '/schart',
                title: 'schart图表',
            },
            {
                id: '42',
                pid: '4',
                index: '/echarts',
                title: 'echarts图表',
            },
        ],
    },
    {
        id: '5',
        icon: 'Guide',
        index: '/icon',
        title: '图标',
        permiss: '5',
    },
    {
        id: '7',
        icon: 'Brush',
        index: '/theme',
        title: '主题',
    },
    {
        id: '6',
        icon: 'DocumentAdd',
        index: '6',
        title: '附加页面',
        children: [
            {
                id: '61',
                pid: '6',
                index: '/ucenter',
                title: '个人中心',
            },
            {
                id: '62',
                pid: '6',
                index: '/login',
                title: '登录',
            },
            {
                id: '63',
                pid: '6',
                index: '/register',
                title: '注册',
            },
            {
                id: '64',
                pid: '6',
                index: '/reset-pwd',
                title: '重设密码',
            },
            {
                id: '65',
                pid: '6',
                index: '/403',
                title: '403',
            },
            {
                id: '66',
                pid: '6',
                index: '/404',
                title: '404',
            },
        ],
    },
];
