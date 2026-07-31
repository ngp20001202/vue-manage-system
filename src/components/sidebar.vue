<template>
    <div class="sidebar">
        <el-menu
            class="sidebar-el-menu"
            :default-active="onRoutes"
            :collapse="sidebar.collapse"
            :background-color="sidebar.bgColor"
            :text-color="sidebar.textColor"
            router
        >
            <template v-for="item in menuData">
                <template v-if="item.children">
                    <el-sub-menu :index="item.index" :key="item.index">
                        <template #title>
                            <el-icon>
                                <component :is="item.icon"></component>
                            </el-icon>
                            <span>{{ titleOf(item) }}</span>
                        </template>
                        <template v-for="subItem in item.children">
                            <el-sub-menu
                                v-if="subItem.children"
                                :index="subItem.index"
                                :key="subItem.index"
                            >
                                <template #title>{{ titleOf(subItem) }}</template>
                                <el-menu-item
                                    v-for="(threeItem, i) in subItem.children"
                                    :key="i"
                                    :index="threeItem.index"
                                    @mouseenter="prefetchRoute(threeItem.index)"
                                >
                                    {{ titleOf(threeItem) }}
                                </el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else :index="subItem.index" @mouseenter="prefetchRoute(subItem.index)">
                                {{ titleOf(subItem) }}
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index" @mouseenter="prefetchRoute(item.index)">
                        <el-icon>
                            <component :is="item.icon"></component>
                        </el-icon>
                        <template #title>{{ titleOf(item) }}</template>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSidebarStore } from '../store/sidebar';
import { useRoute, useRouter } from 'vue-router';
import { menuData } from '@/components/menu';

const { t } = useI18n();
const titleOf = (item: { title?: string; titleKey?: string }) =>
    (item.titleKey ? t(item.titleKey) : '') || item.title || '';

const route = useRoute();
const router = useRouter();
const onRoutes = computed(() => {
    return route.path;
});

const sidebar = useSidebarStore();

const prefetchRoute = (path?: string) => {
    if (!path || !path.startsWith('/')) return;
    try {
        const resolved = router.resolve(path);
        resolved.matched.forEach((record) => {
            const components = record.components || {};
            Object.values(components).forEach((comp) => {
                if (typeof comp === 'function') {
                    (comp as () => Promise<any>)();
                }
            });
        });
    } catch {
        // ignore invalid paths
    }
};
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
    width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}

.sidebar-el-menu {
    min-height: 100%;
}
</style>
