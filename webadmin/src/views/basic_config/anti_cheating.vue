<template>
  <div class="app-container">
    
    <el-form size="mini" inline >
      <el-row>
        <el-form-item>
            <PermissionButton size="mini" icon="el-icon-delete" label="批量删除" perms="1003" type="danger" @click="deletes" />
          </el-form-item>
          <el-form-item >
            <el-input type="text" placeholder="题目" clearable v-model="serverQuerey.name" class="wd16"></el-input>
        </el-form-item>
        <el-form-item >
            <el-input type="text" placeholder="备注" clearable v-model="serverQuerey.keyword" class="wd16"></el-input>
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
        :data="listData"
        border
        fit
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" width="55"></el-table-column>
        <el-table-column align="center" prop="topic" label="题目"></el-table-column>
        <el-table-column align="center" prop="answer" label="答案"></el-table-column>
        <el-table-column align="center" prop="note" label="备注"></el-table-column>

        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <PermissionLink size="mini" label="编辑" perms="1002" icon="el-icon-edit" type="primary" @click="getById(scope.row.antiCheatingId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.antiCheatingId)"/>
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
      title="防作弊设置"
      width="450px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" :rules="rules" size="mini" ref="ruleForm" label-width="90px">
          <el-row :gutter="30">

             

            <el-col :span="24">
              <el-form-item label="题目" prop="topic">
                <el-input placeholder="请输入题目" style="width: 250px;" v-model="ruleForm.topic"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="答案" prop="answer">
                <el-input placeholder="请输入答案" style="width: 250px;" v-model="ruleForm.answer"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="备注" prop="note">
                <el-input placeholder="请输入备注" style="width: 250px;" v-model="ruleForm.note"></el-input>
              </el-form-item>
            </el-col>


          </el-row>
        </el-form>
      </div>


      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogBaseFlag=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitForm('ruleForm')">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sendGet, sendPostByKeyValue, sendPostByJson } from "@/utils/httpUtils";
import default_image from "@/assets/layout-img/no_image.png";
import Pagination from "@/components/Pagination";
export default {
    components: {
    Pagination,
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
        keyword:'',
        total: 0,
        page: 1,
        size: 100,
      },
      dataTotal: 0,

    optionsState:[
        {
            value: 0,
            label: '禁用'
          }, {
            value: 1,
            label: '启用'
          }
    ],
    


      dialogBaseFlag: false,
      listLoading: false,
      submitButtonFlag: false,
      baseImgURL: "",
      baseImgURLCOS: "",
      headers: {},
      listData: [],
      checkedRoleIds: [],
      multipleSelection: [],


      ruleForm: {
       name:'',
       idCard:'',
       photo:null
      },
      rules: {
        topic:[{required: true, message: '不能为空!', trigger: 'change' }],
        answer:[{required: true, message: '不能为空!', trigger: 'change' }],
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
  methods: {


    
      //图片上传
      beforeAvatarUploadIdCard(file) {
              const isLt6M = file.size / 1024 / 1024 < 6;
        if (!isLt6M) {
          this.$message.error("上传图片大小不能超过 6MB!");
        }
        return isLt6M;
      },
      //上传回显
      attachmentSuccess(response, filefile, fileList){
        if (response) {
          this.ruleForm.photo = this.baseImgURL + response.data.fileUrl
        }
      },

     



    openDialog(flag) {
      this.submitFlag = flag; //false 修改 true 添加
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
      this.checkedRoleIds = [];
      this.ruleForm = {
          photo:null,
        attachment:null
      };
    },



    async getById(antiCheatingId) {
      this.submitFlag = false;
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });

      const url="/AntiCheating/detail"
      const res = await sendPostByKeyValue(url,{ id: antiCheatingId})
      if (res) {
                this.ruleForm = res.data;
              }
     
    },

    delById(antiCheatingId) {
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
            const url = "/AntiCheating/delete";
            const res = await sendPostByKeyValue(url, { id: antiCheatingId });
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
              ids.push(this.multipleSelection[i].antiCheatingId);
            }
            // 删除操作
            const url = "/AntiCheating/deletes";
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
      const url = "/AntiCheating/save";
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
        this.ruleForm.photo = this.baseImgURL + response.data.fileUrl;
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
        keyword:'',
        total: 0,
        page: 1,
        size: 100,
      }
    },

    async search() {
      this.listLoading = true;
      const url = "/AntiCheating/findAllList";
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
<style scoped>

.divider p {
    border-bottom: 1px dotted;
  }
  .divider span {
    font-size: 16px;
    font-weight: 700;
  }

  /* ::v-deep .el-dialog__body {
    height: 560px;
    overflow-y: auto;
    overflow-x: hidden;
  } */
</style>
