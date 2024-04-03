<template>
  <div class="app-container">
    
    <el-form size="mini" inline >
      <el-row>
          <el-form-item>
            <PermissionButton size="mini" icon="el-icon-delete" label="批量删除" perms="1003" type="danger" @click="deletes" />
          </el-form-item>
          <el-form-item>
        <el-input v-model="keyword" @keyup.enter.native="search" placeholder="搜索关键词"></el-input>
      </el-form-item>
      <el-form-item >
            <el-button type="warning" class="el-icon-search" @click="search" >查询</el-button>
      </el-form-item>
          <el-form-item>
            <PermissionButton size="mini" icon="el-icon-plus" label="添加" perms="1001" type="primary" @click="openDialog(true)" />
          </el-form-item>
         
      </el-row>
    </el-form>
    <div>
      <el-table
        id="tableList"
        v-loading="listLoading"
        :height="tableHeight"
        :data="tables0"
        border
        fit
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" width="55"></el-table-column>
        <el-table-column align="center" prop="title" label="标题"></el-table-column>
        <!-- <el-table-column align="center" prop="content"  show-overflow-tooltip label="内容"></el-table-column> -->
        <el-table-column align="center" label="内容">
          <template slot-scope="scope">
            <el-link type="primary" @click="openInstructions(scope.row.content)">预览</el-link> 
          </template>
        </el-table-column>
        <el-table-column align="center" prop="releaseTime" label="发布时间"></el-table-column>
        <el-table-column label="发布状态" align="center">
        <template prop="isRelease" slot-scope="{ row }">
          <el-tag v-if="row.isRelease == null || row.isRelease == 0" type="warning">未发布</el-tag>
          <el-tag v-if="row.isRelease == 1" type="success"> 发布</el-tag>
        </template>
      </el-table-column>

        <el-table-column label="操作" align="center" width="190">
          <template slot-scope="scope">
            <PermissionLink size="mini" v-if="scope.row.isRelease == 0" label="发布" perms="1005" type="primary" @click="release(scope.row.policyConfigId)"/>
            <PermissionLink size="mini" v-if="scope.row.isRelease == 1" label="撤销" perms="1005" type="danger" @click="undo(scope.row.policyConfigId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="编辑" perms="1002" icon="el-icon-edit" type="primary" @click="getById(scope.row.policyConfigId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.policyConfigId)"/>
          </template>
        </el-table-column>
      </el-table>
      <pagination style="margin-top:5px"
      :total="dataTotal"
      :auto-scroll="false"
      :pageSizes="[50, 100, 150, 200,300]"
      :page.sync="serverQuerey.page"
      :limit.sync="serverQuerey.size"
      @pagination="search"
    />
     <!-- <div style="margin-top:10px;font-size:14px;">*已加载&nbsp; &nbsp;{{listData.length}}&nbsp;&nbsp; 条信息</div> -->
    </div>
    <el-dialog
    v-dialogDrag
      :modal-append-to-body="false"
      title="培训公告"
      width="850px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" :rules="rules" size="mini" ref="ruleForm" label-width="90px">
          <el-row :gutter="30">

             

            <el-col :span="12">
              <el-form-item label="名称" prop="title">
                <el-input placeholder="请输入名称" style="width: 250px;" v-model="ruleForm.title"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="是否发布" prop="isRelease">
                <el-select v-model="ruleForm.isRelease" filterable placeholder="请选择发布状态" style="width: 250px;">
                  <el-option v-for="item in optionsState" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
           
            <el-col :span="24">
              <el-form-item label="内容:">
                <tinymce style="width: 93%; " ref="editor" v-model="ruleForm.content"></tinymce>
              </el-form-item>
            </el-col>


          </el-row>
        </el-form>
      </div>



      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogBaseFlag=false">取 消</el-button>
        <el-button size="mini" type="primary" :disabled="submitButtonFlag" @click="submitForm('ruleForm')">提 交</el-button>
      </div>
    </el-dialog>

    <el-dialog
    v-dialogDrag
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      title="公告预览"
      width="1050px"
      :visible.sync="instructionsState"
      :lock-scroll="false"
    >
      <div>
        <el-form
          class="instructions__body"  
          :model="instructionsForm"
          ref="instructionsForm"
          label-width="88px"
           size="mini"
        >
       
          <el-row :gutter="20">
            <el-col :span="23">
              <div v-html="instructionsForm.instructions"></div>
            </el-col>
          </el-row>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="instructionsState=false">关 闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { sendGet, sendPostByKeyValue, sendPostByJson } from "@/utils/httpUtils";
import default_image from "@/assets/layout-img/no_image.png";
import Pagination from "@/components/Pagination";
import Tinymce from "@/components/TinymceTwo";
export default {
    components: {
    Pagination,
    Tinymce,
  },
  data() {
    let isMobileNumber = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入电话号码"));
      } else {
        const reg = /^1[3|4|5|7|8|9][0-9]\d{8}$/;
        const isPhone = reg.test(value);
        value = Number(value); //转换为数字
        if (typeof value === "number" && !isNaN(value)) {
          //判断是否为数字
          value = value.toString(); //转换成字符串
          if (value.length < 0 || value.length > 12 || !isPhone) {
            //判断是否为11位手机号
            callback(new Error("请输入正确的手机号码"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入电话号码"));
        }
      }
    };
    return {

      defaultImage:default_image,
      tableHeight:window.innerHeight-175+"px",
      serverQuerey: {
        name:'',
        type:3,
        total: 0,
        page: 1,
        size: 100,
      },
      dataTotal: 0,


      instructionsForm:{
        instructions: '',
    },

    optionsState:[
        {
            value: 0,
            label: '未发布'
          }, {
            value: 1,
            label: '发布'
          }
    ],
    
    keyword:'',

      dialogBaseFlag: false,
      listLoading: false,
      submitButtonFlag: false,
      baseImgURL: "",
      baseImgURLCOS: "",
      headers: {},
      listData: [],
      checkedRoleIds: [],
      multipleSelection: [],
      instructionsState: false,

      ruleForm: {
       content:null
      },
      rules: {
        title:[{required: true, message: '不能为空!', trigger: 'change' }],
        isRelease:[{required: true, message: '不能为空!', trigger: 'change' }],
      },
    };
  },



  mounted: async function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
  },

    computed: {
    tables0: function () {
      var keyword = this.keyword;
      if (keyword) {
        return this.listData.filter(function (item) {  
            return (
                item["title"].indexOf(keyword)!=-1
                ||item["content"].indexOf(keyword)!=-1
                );
        });
      }
      return this.listData;
    },
  },

  methods: {


    openInstructions(content) {
      this.instructionsForm.instructions=content
      this.instructionsState = true;

    },


    openDialog(flag) {
      this.submitFlag = flag; //false 修改 true 添加
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
      this.checkedRoleIds = [];
      this.ruleForm = {
      };
    },

    
    
    async release(policyConfigId) {
      this.submitFlag = false;

      const url="/PolicyConfig/release"
      const res = await sendPostByKeyValue(url,{ id: policyConfigId})
      if (res) {
          this.search();
            this.$message({
                type: "success",
                message: "发布成功",
                });
            }
     
    },

    
    async undo(policyConfigId) {
      this.submitFlag = false;

      const url="/PolicyConfig/undo"
      const res = await sendPostByKeyValue(url,{ id: policyConfigId})
      if (res) {
          this.search();
            this.$message({
                type: "success",
                message: "发布成功",
                });
            }
     
    },

    async getById(policyConfigId) {
      this.submitFlag = false;
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });

      const url="/PolicyConfig/detail"
      const res = await sendPostByKeyValue(url,{ id: policyConfigId})
      if (res) {
                this.ruleForm = res.data;
              }
     
    },

    delById(policyConfigId) {
      this.$confirm("确定要删除该记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            const url = "/PolicyConfig/delete";
            const res = await sendPostByKeyValue(url, { id: policyConfigId });
            if (res) {
                this.search();
                  this.$message({
                    type: "success",
                    message: "删除成功",
                  });
              }
           
            done();
          } else {
            done();
          }
        },
      }).catch(() => {
        this.$message({
          type: "info",
          message: "已取消",
        });
      });
    },

     deletes() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          type: "error",
          message: "请先选择记录",
        });
        return;
      }
      this.$confirm("确定批量删除选中记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: async (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            let ids = [];
            for (let i = 0; i < this.multipleSelection.length; i++) {
              ids.push(this.multipleSelection[i].policyConfigId);
            }
            // 删除操作
            const url = "/PolicyConfig/deletes";
            const res = await sendPostByKeyValue(url, { ids: ids.join(",") });
            if (res) {
                this.search();
                  this.$message({
                    type: "success",
                    message: "删除成功",
                  });
              }
            done();
          } else {
            done();
          }
        },
      }).catch(() => {
        this.$message({
          type: "info",
          message: "已取消",
        });
      });
    },


    async add() {
      this.submitButtonFlag = true;
      const url = "/PolicyConfig/save";
      this.ruleForm.type = 3;
      const response = await sendPostByJson(url, this.ruleForm);
      if (response) {
        this.search();
            this.$message({
              type: "success",
              message: "操作成功",
            });
            this.dialogBaseFlag = false;
      }
      this.submitButtonFlag = false;
    },

 
    photoFormatter(pictures) {
      if (pictures != null && pictures != "") {
        return pictures.split(",");
      }
      return [];
    },
    uploadSuccess(response, file, fileList) {
      if (response) {
        this.ruleForm.content = this.baseImgURL + response.data.fileUrl;
      }
    },
    uploadError(err, file, fileList) {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 5;

      if (!isLt2M) {
        this.$message.error("上传文件大小不能超过 5MB!");
      }
      return isLt2M;
    },

    
   

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.add();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    resetSearch(){
      this.serverQuerey ={
        name:'',
       type:3,
        total: 0,
        page: 1,
        size: 100,
      }
    },

    async search() {
      this.listLoading = true;
      const url = "/PolicyConfig/findAllList";
      const response = await sendPostByJson(url, this.serverQuerey);
      if (response) {
        this.listData = response.data.list;
        this.dataTotal = response.data.total;
        this.listLoading = false;
      }
    },

  },
};
</script>
<style>
  

  .form .el-form-item {
    margin-bottom: 22px !important;
  }
</style>
<style scoped>
  .pageH {
    height: calc(100vh - 90px);
  }

  .boxShadow {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
  }

  .flexCulomn {
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    /* align-items: center; */
  }

  .areaAddbtn {
    text-align: center;
    margin-bottom: 10px;
  }

  .treeLine {

    width: 100%;


  }

  .textTreeNode {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80%;
    display: inline-block;
  }

  .btnGroup {
    position: absolute;
    right: 5px;

    z-index: 999;
  }

  .treeContainer {
    height: 100%;
  }

  .overflowY {
    overflow: hidden;
    overflow-y: auto;
  }

  .pd20 {
    padding: 10px 20px;

  }

  .wd16 {
    width: 160px;
  }

  .w50 {
    width: 50%;
  }

  .min180 {
    min-width: 180px;
    max-width: 180px;
  }
  .down-cls {
    display: inline-block;
    color: #fff;
    background: #409eff;
    padding: 0 14px;
    border-radius: 3px;
    height: 28px;
    line-height: 30px;
    font-size: 12px;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 108px;
    height: 108px;
    line-height: 108px;
    text-align: center;
  }
  .avatar {
    width: 108px;
    height: 108px;
    display: block;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
</style>
<style scoped>
  ::v-deep .el-dialog__body {
    height: 590px;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
