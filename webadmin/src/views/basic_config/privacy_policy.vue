<template>
  <div class="app-container">
    <div>
      <el-form :model="ruleForm" ref="ruleForm" style="margin-top:25px">
     
        <div >
          <tinymce style="width: 95%; " ref="editor" v-model="ruleForm.content"></tinymce>
        </div>
        <br>
        <!-- <el-button size="mini" type="primary" :disabled="submitButtonFlag" @click="add" style="margin-left:30px;width:150px">保 存</el-button> -->
        <PermissionButton size="mini" label="保 存" perms="1002" type="primary" @click="add" style="margin-left:30px;width:150px"/>
      </el-form>
    </div>
  </div>
</template>

<script>
import { sendGet, sendPostByKeyValue, sendPostByJson } from "@/utils/httpUtils";
import Tinymce from "@/components/Tinymce";
// provinceAndCityData是省市二级联动数据（不带“全部”选项）
// regionData是省市区三级联动数据（不带“全部”选项）
// provinceAndCityDataPlus是省市区三级联动数据（带“全部”选项）
// regionDataPlus是省市区三级联动数据（带“全部”选项）
// "全部"选项绑定的value是空字符串""
// CodeToText是个大对象，属性是区域码，属性值是汉字 用法例如：CodeToText['110000']输出北京市
// TextToCode是个大对象，属性是汉字，属性值是区域码 用法例如：TextToCode['北京市'].code输出110000,TextToCode['北京市']['市辖区'].code输出110100,TextToCode['北京市']['市辖区']['朝阳区'].code输出110105

export default {
  components: {
    Tinymce,
  },
  data() {
    return {
      user: this.$store.state.user.userInfo,
      submitButtonFlag: false,
      baseImgURL: "",
      headers: {},
      serverQuerey: {
        type: 0,
      },
      ruleForm: {
        policyConfigId:undefined,
        content: "",
        type: 0,
      },
    };
  },
  mounted: function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
  },
  methods: {
      async search() {
      const url = "/PolicyConfig/findByType";
      const response = await sendPostByJson(url, this.serverQuerey);
      if (response) {
        this.ruleForm.content = response.data.content;
         this.ruleForm.policyConfigId = response.data.policyConfigId;
      }
    },

    async add() {
        this.submitButtonFlag = true;
      this.ruleForm.level = this.openType;
      const url = "/PolicyConfig/save";
      const response = await sendPostByJson(url, this.ruleForm);
      if (response) {
            this.$message({
              type: "success",
              message: "操作成功",
            });
      }
      this.submitButtonFlag = false;
    },
    
   
   
  },
};
</script>

<style scoped>
.icon_class {
  width: 25px;
  height: 25px;
  margin-left: 15px;
  vertical-align: middle;
}

.mtop {
  margin-top: 10px;
}
</style>
<style>
.el-upload-list__item {
  transition: none !important;
}
</style>