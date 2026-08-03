<template>
    <div class="content">
        <div class="flex w">
            <el-input
                v-model="textarea"
                class="trackingsize"
                :rows="4"
                type="textarea"
                :placeholder="t('pages.trackingPage.trackplace')"
            />
            <el-button
                class="sub"
                :disabled="disabled || loading"
                :loading="loading"
                @click="submit"
            >
                <el-icon v-if="!loading" :size="18"><Search /></el-icon>
            </el-button>
        </div>
        <hr class="line" />
        <div class="data">
            <div
                v-for="(item, index) in datalist"
                :key="itemKey(item)"
                class="tracking-card"
                :class="{ 'tracking-card-paddingbottom0': item.checked }"
                @click="() => toggleExpand(index, itemKey(item))"
            >
                <div class="tracking-left">
                    <div class="status-icon">
                        <el-icon v-if="item.hasError" class="status-error" :size="20">
                            <Warning />
                        </el-icon>
                        <el-icon v-else-if="!item.stage" class="status-pending" :size="20">
                            <Timer />
                        </el-icon>
                        <el-icon v-else-if="isDelivered(item)" class="status-success" :size="20">
                            <CircleCheck />
                        </el-icon>
                        <el-icon v-else class="status-transit" :size="20">
                            <Van />
                        </el-icon>
                    </div>
                    <div class="tracking-info">
                        <div class="tracking-number">{{ item.trackingNbr }}</div>
                        <div class="tracking-status">
                            <span v-if="item.hasError" class="status-text error">
                                {{ t('pages.trackingPage.queryRestricted') }}
                            </span>
                            <span v-else-if="!item.stage" class="status-text pending">
                                {{ t('pages.trackingPage.notFound') }}
                            </span>
                            <span v-else-if="isDelivered(item)" class="status-text success">
                                {{ t('pages.trackingPage.delivered') }}
                                ({{ getDeliveryDays(item) }}{{ t('pages.trackingPage.days') }})
                            </span>
                            <span v-else class="status-text transit">{{ item.stage }}</span>
                        </div>
                        <div v-if="isDelivered(item)" class="delivery-time">
                            {{ t('pages.trackingPage.deliveryTime') }}:
                            {{ getDeliveryTime(item) }}
                        </div>
                    </div>
                </div>

                <div class="tracking-right">
                    <div v-if="item.hasError" class="error-notice">
                        <el-icon><Warning /></el-icon>
                        {{ t('pages.trackingPage.uspsLimit') }}
                        <el-button type="warning" size="small" class="upgrade-btn">
                            {{ t('pages.trackingPage.upgrade') }}
                        </el-button>
                    </div>
                    <template v-else>
                        <div class="latest-info">
                            <div class="latest-time">{{ getLatestTime(item) }}</div>
                            <div class="latest-status">{{ getLatestStatus(item) }}</div>
                        </div>
                    </template>
                    <el-icon
                        class="expand-icon"
                        :class="{ 'is-expand': item.checked }"
                    >
                        <ArrowRight />
                    </el-icon>
                </div>

                <div v-if="item.checked" class="timeline-detail" @click.stop>
                    <el-timeline v-if="item.eventItems && item.eventItems.length > 0">
                        <el-timeline-item
                            v-for="(val, idx) in item.eventItems"
                            :key="val.id || val.utcTime"
                            :color="idx === 0 ? '#0bbd87' : '#e4e7ed'"
                        >
                            <div class="timeline-content">
                                <div class="timeline-time">
                                    {{
                                        val.utcTime
                                            ? formatUtc(val.utcTime)
                                            : ''
                                    }}
                                </div>
                                <div v-if="val.operator" class="timeline-operator">
                                    <el-icon><User /></el-icon>
                                    {{ val.operator }}
                                </div>
                                <div class="timeline-place">
                                    [{{ val.utcPlace }}] {{ val.content }}
                                </div>
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                    <div v-else class="empty-detail">
                        <p>{{ t('pages.trackingPage.noDetails') }}</p>
                    </div>
                </div>
            </div>

            <el-empty v-if="!loading && datalist.length === 0" :description="t('pages.NoData')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import {
    Search,
    Warning,
    Timer,
    CircleCheck,
    Van,
    ArrowRight,
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
    hasError?: boolean;
    eventItems?: TrackingEvent[];
    checked?: boolean;
    getdata?: boolean;
    loading?: boolean;
    [k: string]: any;
}

const MAX_INPUT = 200;
const CONCURRENCY = 3;

const textarea = ref('');
const datalist = ref<TrackingItem[]>([]);
const loading = ref(false);

const disabled = computed(() => !textarea.value);

const itemKey = (item: TrackingItem) =>
    String(item.trackingNbr ?? item.id ?? '');

const formatUtc = (utc: string) =>
    moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');

const isDelivered = (item: TrackingItem): boolean => {
    const events = item.eventItems;
    if (!events || !events.length) return false;
    const latest = events[0];
    const c = String(latest?.content || '').toLowerCase();
    return (
        c.includes('delivered') ||
        c.includes('签收') ||
        c.includes('已送达')
    );
};

const getDeliveryDays = (item: TrackingItem): number => {
    const events = item.eventItems;
    if (!events || !events.length) return 0;
    const delivered = events.find(
        (e) =>
            e.content &&
            (e.content.toLowerCase().includes('delivered') ||
                e.content.includes('签收') ||
                e.content.includes('已送达')),
    );
    if (delivered?.utcTime) {
        const date = new Date(delivered.utcTime);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    }
    return 0;
};

const getDeliveryTime = (item: TrackingItem): string => {
    const events = item.eventItems;
    if (!events || !events.length) return '';
    const delivered = events.find(
        (e) =>
            e.content &&
            (e.content.toLowerCase().includes('delivered') ||
                e.content.includes('签收') ||
                e.content.includes('已送达')),
    );
    return delivered?.utcTime ? delivered.utcTime.split(' ')[0] : '';
};

const getLatestStatus = (item: TrackingItem): string => {
    const ev = item.eventItems?.[0];
    if (ev) {
        return `[${ev.utcPlace || ''}] ${ev.content || ''}`;
    }
    return String(item.stage || '') || t('pages.trackingPage.noTrackingInfo');
};

const getLatestTime = (item: TrackingItem): string => {
    const ev = item.eventItems?.[0];
    return ev?.utcTime ? formatUtc(ev.utcTime) : '';
};

const splitInput = (raw: string): string[] =>
    raw
        .split(/[\n\r,，]+/)
        .map((s) => s.trim())
        .filter(Boolean);

const submit = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        const raw = splitInput(textarea.value);
        if (raw.length > MAX_INPUT) {
            ElMessage.info(t('pages.trackingPage.limitInfo'));
        }
        const trackingNbrs = raw.slice(0, MAX_INPUT).join('\n');

        const res: ApiResponse<TrackingItem[]> = await trackingSearch({
            TrackingNbrs: trackingNbrs,
        });
        if (res?.isSuccess) {
            datalist.value = (res.result ?? []).map((item) => ({
                ...item,
                checked: false,
                getdata: true,
                hasError: false,
                eventItems: item.eventItems || [],
            }));
            const toLoad = datalist.value.filter(
                (item) => item.id !== 0 && item.stage !== '' && item.stage !== undefined && item.stage !== null,
            );
            for (let i = 0; i < toLoad.length; i += CONCURRENCY) {
                const batch = toLoad.slice(i, i + CONCURRENCY);
                await Promise.all(
                    batch.map((item) => {
                        const idx = datalist.value.findIndex(
                            (d) => itemKey(d) === itemKey(item),
                        );
                        return getdetail(item.id as string | number, idx);
                    }),
                );
            }
        } else {
            datalist.value = [];
            ElMessage.error(res?.message || t('pages.Failed'));
        }
    } catch {
        ElMessage.error(t('pages.Failed'));
    } finally {
        loading.value = false;
    }
};

const toggleExpand = (index: number, _key: string) => {
    const isExpanding = !datalist.value[index].checked;
    datalist.value = datalist.value.map((it, i) => ({
        ...it,
        checked: i === index ? isExpanding : false,
    }));
    if (
        isExpanding &&
        datalist.value[index].id !== 0 &&
        datalist.value[index].stage !== '' &&
        datalist.value[index].stage !== undefined &&
        datalist.value[index].stage !== null &&
        datalist.value[index].getdata &&
        !datalist.value[index].loading
    ) {
        setTimeout(() => {
            if (!datalist.value[index].loading) {
                getdetail(datalist.value[index].id as string | number, index);
            }
        }, 100);
    }
};

const getdetail = async (id: string | number | undefined, index: number) => {
    if (id === undefined || id === null || id === 0) return;
    if (datalist.value[index].loading) return;
    datalist.value[index].loading = true;
    try {
        const res: ApiResponse<{ eventItems?: TrackingEvent[] }> = await trackingDetail(id);
        if (res?.isSuccess && res.result) {
            datalist.value[index].eventItems = res.result.eventItems ?? [];
        } else {
            datalist.value[index].eventItems = [];
        }
        datalist.value[index].getdata = false;
    } catch {
        datalist.value[index].eventItems = [];
    } finally {
        datalist.value[index].loading = false;
    }
};
</script>

<script lang="ts">
export default { name: 'tracking-index' };
</script>

<style lang="scss" scoped>
.el-button:focus {
    border: none !important;
}

.content {
    padding: 12px;
    background: #fff;
}

.line {
    height: 0;
    margin-right: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
    border: 1px solid #e5e9f2;
}

.trackingsize {
    font-weight: bold;
    font-size: 16px;
}

.w {
    width: 65%;
    min-width: 360px;
    max-width: 900px;
    padding: 15px 25px;

    .sub {
        width: 40px !important;
        height: auto !important;
        margin-left: -3px;
        padding-left: 10px;
        color: white;
        background-color: #68c2d1;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
}

.data {
    padding: 0 15px 12px;

    .tracking-card {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 12px;
        padding: 12px 20px;
        background: #ffffff;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
        }
    }

    .tracking-card-paddingbottom0 {
        padding-bottom: 10px;
    }

    .tracking-left {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
    }

    .status-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin-right: 12px;
        font-size: 20px;
        border-radius: 8px;
    }

    .status-pending {
        color: #909399;
    }

    .status-error {
        color: #f56c6c;
    }

    .status-success {
        padding: 6px;
        color: #ffffff;
        font-weight: bold;
        background: #67c23a;
        border-radius: 50%;
    }

    .status-transit {
        padding: 6px;
        color: #409eff;
        background: #ecf5ff;
        border-radius: 50%;
    }

    .tracking-info {
        .tracking-number {
            margin-bottom: 4px;
            color: #303133;
            font-weight: 600;
            font-size: 15px;
            line-height: 1.4;
        }

        .tracking-status {
            .status-text {
                font-size: 13px;

                &.success {
                    color: #67c23a;
                }
                &.pending {
                    color: #909399;
                }
                &.transit {
                    color: #409eff;
                }
                &.error {
                    color: #f56c6c;
                }
            }
        }

        .delivery-time {
            margin-top: 4px;
            color: #909399;
            font-size: 12px;
        }
    }

    .tracking-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-left: auto;

        .latest-info {
            margin-right: 20px;
            text-align: right;

            .latest-time {
                margin-bottom: 4px;
                color: #303133;
                font-size: 14px;
                line-height: 1.4;
            }

            .latest-status {
                max-width: 500px;
                overflow: hidden;
                color: #606266;
                font-size: 13px;
                line-height: 1.4;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }

        .error-notice {
            display: flex;
            align-items: center;
            margin-right: 15px;
            padding: 8px 12px;
            color: #f56c6c;
            font-size: 13px;
            background: #fef0f0;
            border-radius: 4px;

            .el-icon {
                margin-right: 6px;
            }

            .upgrade-btn {
                margin-left: 12px;
            }
        }

        .expand-icon {
            flex-shrink: 0;
            color: #c0c4cc;
            font-size: 16px;
            transition: transform 0.3s;

            &.is-expand {
                transform: rotate(90deg);
            }
        }
    }

    .timeline-detail {
        width: 100%;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #ebeef5;

        .timeline-content {
            display: flex;
            flex-wrap: wrap;
            align-items: center;

            .timeline-place {
                color: #606266;
                font-size: 13px;
                line-height: 1.5;
            }

            .timeline-operator {
                margin-right: 15px;
                color: #606266;
                font-size: 13px;

                .el-icon {
                    margin-right: 4px;
                }
            }

            .timeline-time {
                margin-right: 15px;
                color: #909399;
                font-size: 13px;
            }
        }

        .empty-detail {
            padding: 20px;
            color: #909399;
            text-align: center;
        }

        :deep(.el-timeline-item) {
            padding-bottom: 10px !important;
        }
    }
}

.flex {
    display: flex;
}

@media (max-width: 768px) {
    .data {
        .tracking-card {
            flex-direction: column;
            align-items: flex-start;
        }

        .tracking-right {
            justify-content: space-between;
            width: 100%;

            .latest-info {
                text-align: left;
            }
        }
    }
    .w{
        max-width: 100%;
        min-width: 90%;
    }
}
</style>