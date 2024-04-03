<template>
  <div class="logo-container pe-4" :class="{'collapse':!collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="logo-link" to="/dashboard/home_page">
        <img v-if="logoImg"  :src="logoImg" class="logo">
        <!-- <h1 v-else class="sidebar-title">{{ title }} </h1> -->
      </router-link>
      <router-link v-else key="expand" class="logo-link" to="/dashboard/home_page">
        <img v-if="logoImg" :src="logoImg" class="logo">
      </router-link>
        <!-- <h1 class="sidebar-title">{{ title }} </h1> -->
    </transition>
  </div>
</template>

<script>
import logoImg from '@/assets/images/logo_white.png'
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: ' HUIYU 辉宇项目信息管理平台',
      logoImg: logoImg
    }
  }
}
</script>
