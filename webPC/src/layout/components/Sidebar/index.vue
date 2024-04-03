<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" class="rounded-4 overflow-hidden"/>
      </el-menu>
    </el-scrollbar>
    
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container rounded-4"
      @toggleClick="toggleSideBar"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SidebarItem from './SidebarItem';
import variables from '@/styles/variables.scss';
import Hamburger from "@/components/Hamburger"

export default {
  components: { 
    SidebarItem,
    Hamburger 
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
  }
}
</script>
