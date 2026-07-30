<template>
    <div class="tracking-page">
        <el-card shadow="never" class="filter-card">
            <el-input
                v-model="textarea"
                :rows="4"
                class="tracking-input"
                type="textarea"
                :placeholder="t('pages.trackplace')"
            />
            <div class="tracking-actions">
                <el-button type="primary" :icon="Search" :loading="searching" @click="onSearch">
                    {{ t('pages.Search') }}
                </el-button>
                <el-button :icon="Refresh" @click="onReset">
                    {{ t('pages.Reset') }}
                </el-button>
            </div>
        </el-card>

        <el-card shadow="never" class="result-card" v-loading="searching">
            <el-empty
                v-if="!list.length && !searching"
                :description="t('pages.NoData')"
            />
            <div v-else class="card-list">
                <el-card
                    v-for="item in list"
                    :key="item.trackingNbr || item.id"
                    class="tracking-item"
                    shadow="hover"
                >
                    <div class="tracking-row" @click="toggleExpand(item)">
                        <div class="left">
                            <el-icon
                                class="status-icon"
                                :class="statusClass(item)"
                                :size="22"
                            >
                                <component :is="statusIcon(item)" />
                            </el-icon>
                            <div class="meta">
                                <div class="tracking-no">{{ item.trackingNbr || item.id }}</div>
                                <div
                                    class="status-text"
                                    :class="statusClass(item)"
                                >
                                    {{ statusText(item) }}
                                </div>
                                <div
                                    v-if="isDelivered(item)"
                                    class="delivery-time"
                                >
                                    {{ t('pages.trackingPage.deliveryTime') }}:
                                    {{ getDeliveryTime(item) }}
                                </div>
                            </div>
                        </div>
                        <div class="right">
                            <template v-if="item.hasError">
                                <div class="notice">
                                    <el-icon class="notice-icon"><Warning /></el-icon>
                                    <span class="notice-text">
                                        {{ t('pages.trackingPage.queryRestricted') }}
                                    </span>
                                </div>
                                <el-button
                                    v-if="item.status === 4"
                                    type="primary"
                                    size="small"
                                    link
                                >
                                    {{ t('pages.trackingPage.upgrade') }}
                                </el-button>
                            </template>
                            <template v-else>
                                <div class="latest">
                                    <div class="latest-time">
                                        {{ getLatestTime(item) || '' }}
                                    </div>
                                    <div class="latest-content">
                                        {{ getLatestStatus(item) || '' }}
                                    </div>
                                </div>
                            </template>
                            <el-icon class="expand-icon" :class="{ rotated: isExpanded(item) }">
                                <ArrowDown />
                            </el-icon>
                        </div>
                    </div>
                    <transition name="el-fade-in">
                        <div v-show="isExpanded(item)" class="timeline-wrap">
                            <div
                                v-if="!detailLoadingMap[itemKey(item)] && !getDetail(item).eventItems?.length"
                                class="no-detail"
                            >
                                {{ t('pages.trackingPage.noDetails') }}
                            </div>
                            <el-timeline v-else>
                                <el-timeline-item
                                    v-for="(ev, idx) in getDetail(item).eventItems"
                                    :key="ev.id || ev.utcTime"
                                    :color="idx === 0 ? '#0bbd87' : '#e4e7ed'"
                                >
                                    <div class="timeline-content">
                                        <div class="timeline-time">
                                            {{ formatUtc(ev.utcTime) }}
                                        </div>
                                        <div
                                            v-if="ev.operator"
                                            class="timeline-operator"
                                        >
                                            <el-icon><User /></el-icon>
                                            <span>{{ ev.operator }}</span>
                                        </div>
                                        <div class="timeline-place">
                                            [{{ ev.utcPlace }}] {{ ev.content }}
                                        </div>
                                    </div>
                                </el-timeline-item>
                            </el-timeline>
                        </div>
                    </transition>
                </el-card>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import {
    Search,
    Refresh,
    Warning,
    CircleCheck,
    Van,
    Timer,
    ArrowDown,
    User,
} from '@element-plus/icons-vue';
import moment from 'moment';
import { trackingSearch, trackingDetail } from '@/api/tracking';
import type { ApiResponse } from '@/api/types';

const { t } = useI18n();

interface TrackingEvent {
    id?: string | number;
    utcPlace?: string;
    utcTime?: string;
    content?: string;
    operator?: string;
}

interface TrackingItem {
    id?: string | number;
    trackingNbr?: string;
    stage?: string | number;
    stageText?: string;
    status?: number;
    hasError?: boolean;
    deliveryTime?: string;
    postedStamp?: { utcTime?: string };
    utcPlace?: string;
    eventItems?: TrackingEvent[];
    [k: string]: any;
}

const MAX_INPUT = 200;
const CONCURRENCY = 3;

const textarea = ref('');
const list = ref<TrackingItem[]>([]);
const searching = ref(false);
const expandedId = ref<string | number | null>(null);
const detailMap = ref<Record<string, { eventItems: TrackingEvent[] }>>({});
const detailLoadingMap = ref<Record<string, boolean>>({});

const itemKey = (it: TrackingItem) =>
    String(it.trackingNbr ?? it.id ?? '');

const splitInput = (raw: string): string[] => {
    if (!raw) return [];
    // 支持 换行、英文逗号、中文逗号
    return raw
        .split(/[\n,，]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
};

const getInputNumbers = computed(() => splitInput(textarea.value));

const onSearch = async () => {
    const numbers = getInputNumbers.value;
    if (!numbers.length) {
        ElMessage.warning(t('pages.trackingPage.trackplace'));
        return;
    }
    let toQuery = numbers;
    let showLimitNotice = false;
    if (numbers.length > MAX_INPUT) {
        toQuery = numbers.slice(0, MAX_INPUT);
        showLimitNotice = true;
    }
    if (showLimitNotice) {
        ElMessage.warning(t('pages.trackingPage.limitInfo'));
    }
    searching.value = true;
    list.value = [];
    detailMap.value = {};
    detailLoadingMap.value = {};
    expandedId.value = null;
    try {
        const res: ApiResponse<TrackingItem[]> = await trackingSearch({
            TrackingNbrs: toQuery.join('\n'),
        });
        if (res?.isSuccess) {
            list.value = (res.result ?? []).map((item) => ({
                ...item,
                checked: false,
                getdata: true,
                hasError: false,
                eventItems: item.eventItems || [],
            })) as TrackingItem[];
            await loadAllDetails();
        } else {
            list.value = [];
            ElMessage.error(res?.message || t('pages.Failed'));
        }
    } catch {
        ElMessage.error(t('pages.Failed'));
    } finally {
        searching.value = false;
    }
};

const onReset = () => {
    textarea.value = '';
    list.value = [];
    expandedId.value = null;
};

const isDelivered = (item: TrackingItem): boolean => {
    const events = getDetail(item).eventItems;
    if (!events || !events.length) return false;
    const latest = events[0];
    const c = String(latest?.content || '').toLowerCase();
    return (
        c.includes('delivered') ||
        c.includes('签收') ||
        c.includes('已送达')
    );
};

const getDeliveryEvent = (item: TrackingItem): TrackingEvent | undefined => {
    const events = getDetail(item).eventItems;
    if (!events || !events.length) return undefined;
    return events.find(
        (e) =>
            e.content &&
            (e.content.toLowerCase().includes('delivered') ||
                e.content.includes('签收') ||
                e.content.includes('已送达')),
    );
};

const getLatestStatus = (item: TrackingItem): string => {
    const ev = getDetail(item).eventItems?.[0];
    if (ev) {
        return `[${ev.utcPlace || ''}] ${ev.content || ''}`;
    }
    return String(item.stage || '') || t('pages.trackingPage.noTrackingInfo');
};

const getLatestTime = (item: TrackingItem): string => {
    const ev = getDetail(item).eventItems?.[0];
    return formatUtc(ev?.utcTime);
};

const getDeliveryTime = (item: TrackingItem): string => {
    const delivered = getDeliveryEvent(item);
    if (delivered?.utcTime) {
        return delivered.utcTime.split(' ')[0];
    }
    return '';
};

const getDeliveryDays = (item: TrackingItem): string | number => {
    const delivered = getDeliveryEvent(item);
    if (!delivered?.utcTime) return '';
    const date = new Date(delivered.utcTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
};

const formatUtc = (utc?: string) => {
    if (!utc) return '';
    return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
};

const statusIcon = (item: TrackingItem) => {
    if (item.hasError) return Warning;
    if (!item.stage) return Timer;
    if (isDelivered(item)) return CircleCheck;
    return Van;
};

const statusClass = (item: TrackingItem) => {
    if (item.hasError) return 'is-error';
    if (isDelivered(item)) return 'is-success';
    if (!item.stage) return 'is-pending';
    return 'is-transit';
};

const statusText = (item: TrackingItem) => {
    if (item.hasError) return t('pages.trackingPage.queryRestricted');
    if (isDelivered(item)) {
        const days = getDeliveryDays(item);
        return `${t('pages.trackingPage.delivered')} (${days}${t('pages.trackingPage.days')})`;
    }
    if (!item.stage) return t('pages.trackingPage.noTrackingInfo');
    return String(item.stage);
};

const isExpanded = (item: TrackingItem) =>
    expandedId.value === itemKey(item);

const toggleExpand = async (item: TrackingItem) => {
    const key = itemKey(item);
    if (expandedId.value === key) {
        expandedId.value = null;
        return;
    }
    expandedId.value = key;
    // 仅当 id 非 0、stage 非空且未加载过详情时拉取一次（对齐 shippingspa）
    if (
        item.id !== 0 &&
        item.stage !== '' &&
        !detailLoadingMap.value[key] &&
        !getDetail(item).eventItems?.length
    ) {
        await loadDetail(item);
    }
};

const getDetail = (item: TrackingItem) => {
    const key = itemKey(item);
    return detailMap.value[key] || { eventItems: item.eventItems || [] };
};

const loadDetail = async (item: TrackingItem) => {
    const key = itemKey(item);
    const id = item.id;
    if (id === 0 || id === '' || id === undefined || id === null || item.stage === '') return;
    if (detailLoadingMap.value[key]) return;
    detailLoadingMap.value[key] = true;
    try {
        const res: ApiResponse<TrackingEvent[]> = await trackingDetail(id);
        if (res?.isSuccess && res.result) {
            const result = res.result as any;
            detailMap.value[key] = {
                eventItems: result?.eventItems ?? result ?? [],
            };
        } else {
            detailMap.value[key] = { eventItems: [] };
        }
    } catch {
        detailMap.value[key] = { eventItems: [] };
    } finally {
        detailLoadingMap.value[key] = false;
    }
};

// 控制并发：每批最多 CONCURRENCY 个
async function loadAllDetails() {
    const items = list.value.filter((i) => i.id !== 0 && i.stage !== '');
    const queue = [...items];
    const workers: Promise<void>[] = [];
    const runOne = async () => {
        while (queue.length) {
            const item = queue.shift()!;
            await loadDetail(item);
        }
    };
    for (let i = 0; i < Math.min(CONCURRENCY, queue.length); i++) {
        workers.push(runOne());
    }
    await Promise.all(workers);
}

onMounted(() => {
    textarea.value = '';
});
</script>

<script lang="ts">
export default { name: 'tracking-index' };
</script>

<style lang="scss" scoped>
.tracking-page {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.filter-card,
.result-card {
    background: #fff;
}
.tracking-input {
    width: 100%;
    max-width: 800px;
}
.tracking-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
    align-items: center;
}
.card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.tracking-item {
    margin-bottom: 0;
}
.tracking-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    user-select: none;
}
.left {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    flex: 1;
    min-width: 0;
}
.right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    max-width: 40%;
}
.status-icon {
    margin-top: 2px;
}
.status-icon.is-error {
    color: #f56c6c;
}
.status-icon.is-pending {
    color: #e6a23c;
}
.status-icon.is-success {
    color: #67c23a;
}
.status-icon.is-transit {
    color: #409eff;
}
.meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}
.tracking-no {
    font-weight: 600;
    font-size: 14px;
    color: #303133;
}
.status-text {
    font-size: 13px;
}
.status-text.is-error {
    color: #f56c6c;
}
.status-text.is-pending {
    color: #e6a23c;
}
.status-text.is-success {
    color: #67c23a;
}
.status-text.is-transit {
    color: #409eff;
}
.delivery-time {
    font-size: 12px;
    color: #909399;
}
.latest {
    text-align: right;
    font-size: 12px;
    color: #606266;
    max-width: 360px;
}
.latest-place {
    color: #909399;
    margin-bottom: 2px;
}
.latest-content {
    color: #303133;
    margin-bottom: 2px;
    word-break: break-word;
}
.latest-time {
    color: #909399;
    font-size: 11px;
}
.notice {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #e6a23c;
    font-size: 13px;
}
.notice-icon {
    color: #e6a23c;
}
.notice-text {
    color: #e6a23c;
}
.expand-icon {
    transition: transform 0.2s;
    color: #c0c4cc;
}
.expand-icon.rotated {
    transform: rotate(180deg);
}
.timeline-wrap {
    margin-top: 12px;
    padding-left: 30px;
    border-top: 1px dashed #ebeef5;
    padding-top: 12px;
}
.timeline-time {
    font-size: 13px;
    color: #303133;
    margin-bottom: 4px;
}
.timeline-operator {
    color: #909399;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
}
.timeline-place {
    color: #f56c6c;
    font-size: 12px;
    word-break: break-word;
}
.no-detail {
    color: #909399;
    font-size: 13px;
    text-align: center;
    padding: 8px 0;
}
</style>
