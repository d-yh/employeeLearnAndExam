<template>
   <el-link  :size="size" :type="type" :disabled='disabled' :loading="loading" :icon='icon'  v-if="hasPerms(perms)"  @click="handleClick">{{label}}</el-link>
</template>

<script>
export default {
  name: 'KtLink',
  props: {
    label: {  // 按钮显示文本
      type: String,
      default: 'Button'
    },
    size: {  // 按钮尺寸
      type: String,
      default: 'small'
    },
    type: {  // 按钮类型
      type: String,
      default: null
    },
    loading: {  // 按钮加载标识
      type: Boolean,
      default: false
    },
    disabled: {  // 按钮是否禁用
      type: Boolean,
      default: false
    },
    icon: {  // 按钮图标
      type: String,
      default: ''
    },
    perms: {  // 按钮权限标识，外部使用者传入
      type: String,
      default: null
    }
  },
  computed: {

  },
  methods: {
     handleClick: function () {
      // 按钮操作处理函数
      this.$emit('click', {})
    },
    hasPerms: function (perms) {
      let roles = this.$route.meta.roles;
      // 根据权限标识和外部指示状态进行权限判断
      return roles.indexOf(Number(perms))!=-1;
    }
  }
};
</script>

