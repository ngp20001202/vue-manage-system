<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="header-left">
      <img class="logo" src="../assets/img/logo.svg" alt="" />
      <div class="web-title">{{ webTitle }}</div>
      <div class="collapse-btn" @click="collapseChage">
        <el-icon v-if="sidebar.collapse">
          <Expand />
        </el-icon>
        <el-icon v-else>
          <Fold />
        </el-icon>
      </div>
    </div>
    <div class="header-right">
      <div class="header-user-con">
        <!-- 下载任务 -->
        <div class="btn-icon" @click="router.push('/download')">
          <el-tooltip effect="dark" content="下载任务" placement="bottom">
            <i class="iconfont icon-piliangxiazai" style="font-size: 22px"></i>
          </el-tooltip>
          <span class="btn-bell-badge" v-if="taskCount > 0"></span>
        </div>
        <!-- 中英文切换 -->
        <el-dropdown
          class="btn-icon lang-dropdown"
          trigger="click"
          @command="handleLang"
        >
          <span class="lang-trigger">
            <el-tooltip
              effect="dark"
              :content="lang === 'en' ? 'English' : '中文简体'"
              placement="bottom"
            >
              <i class="iconfont icon-language" style="font-size: 25px"></i>
            </el-tooltip>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :disabled="lang === 'zh-cn'" command="zh-cn">
                <i class="iconfont icon-zhongwen"></i>
                中文简体
              </el-dropdown-item>
              <el-dropdown-item :disabled="lang === 'en'" command="en">
                <i class="iconfont icon-yingwen"></i>
                English
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- 全屏 -->
        <div class="btn-icon" @click="toggleFullScreen">
          <el-tooltip
            effect="dark"
            :content="isFullscreen ? '退出全屏' : '全屏'"
            placement="bottom"
          >
            <el-icon :size="22"><FullScreen /></el-icon>
          </el-tooltip>
        </div>
        <!-- 用户头像 -->
        <el-avatar
          class="user-avator"
          :size="30"
          :src="userStore.user.avatar || defaultAvatar"
        />
        <!-- 用户名下拉菜单 -->
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ displayName }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item  command="loginout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useSidebarStore } from "../store/sidebar";
import { useUserStore } from "../store/user";
import { useRouter } from "vue-router";
import { FullScreen } from "@element-plus/icons-vue";

const defaultAvatar =
  "https://images.pexels.com/photos/106685/pexels-photo-106685.jpeg?cs=srgb&dl=pexels-mark-broadhurst-106685.jpg&fm=jpg";

const userStore = useUserStore();
const taskCount = ref(0);
const isFullscreen = ref(false);

const sidebar = useSidebarStore();
const collapseChage = () => {
  sidebar.handleCollapse();
};

const router = useRouter();

const lang = (localStorage.getItem("lang") as "zh-cn" | "en" | null) || "zh-cn";

const webTitle = computed(() => userStore.user.tenantAlias || "后台管理系统");
const displayName = computed(
  () => userStore.user.name || localStorage.getItem("vuems_name") || "",
);

const handleCommand = (command: string) => {
  if (command == "loginout") {
    localStorage.removeItem("vuems_name");
    userStore.logout();
    router.push("/login");
  } else if (command == "user") {
    router.push("/ucenter");
  }
};

const handleLang = (command: string) => {
  if (command === lang) return;
  localStorage.setItem("lang", command);
  window.location.reload();
};

const toggleFullScreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.body.requestFullscreen();
  }
};

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage();
  }
  if (userStore.token) {
    userStore.fetchProfile();
  }
  document.addEventListener("fullscreenchange", onFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
});
</script>
<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  color: var(--header-text-color);
  background-color: var(--header-bg-color);
  border-bottom: 1px solid #ddd;
}

.header-left {
  display: flex;
  align-items: center;
  padding-left: 20px;
  height: 100%;
}

.logo {
  width: 35px;
}

.web-title {
  margin: 0 40px 0 10px;
  font-size: 22px;
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  cursor: pointer;
  opacity: 0.8;
  font-size: 22px;
}

.collapse-btn:hover {
  opacity: 1;
}

.header-right {
  float: right;
  padding-right: 50px;
}

.header-user-con {
  display: flex;
  height: 70px;
  align-items: center;
}

.btn-icon {
  position: relative;
  width: 36px;
  height: 36px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--header-text-color);
  margin: 0 5px;
  font-size: 22px;
}

.btn-bell-badge {
  position: absolute;
  right: 4px;
  top: 0px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #f56c6c;
  color: var(--header-text-color);
}

.user-avator {
  margin: 0 10px 0 20px;
}

.el-dropdown-link {
  color: var(--header-text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-dropdown-menu__item {
  text-align: center;
}

.lang-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
