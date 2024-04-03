<template>
  <div class="app-container">
    
    <el-form size="mini" inline >
      <el-row>
          <el-form-item>
            <PermissionButton size="mini" icon="el-icon-delete" label="批量删除" perms="1003" type="danger" @click="deletes" />
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
        <el-table-column align="center" prop="name" label="名称"></el-table-column>
        <el-table-column align="center" prop="photo" label="轮播图">
          <template slot-scope="scope">
            <div class="demo-image__preview">
              <el-image
                v-if="scope.row.photo"
                style="width: 50px; height: 50px"
                :src="scope.row.photo"
              ></el-image>
              <el-tag v-if="!scope.row.photo" size="mini">暂无</el-tag>
            </div>
          </template></el-table-column>

          <el-table-column label="类型" align="center">
        <template prop="type" slot-scope="{ row }">
          <el-tag v-if="row.type == null || row.type == 0">WEB</el-tag>
          <el-tag v-if="row.type == 1" type="success"> APP</el-tag>
        </template>
      </el-table-column>


        <el-table-column label="状态" align="center">
        <template prop="state" slot-scope="{ row }">
          <el-tag v-if="row.state == null || row.state == 0" type="warning">禁用</el-tag>
          <el-tag v-if="row.state == 1" type="success"> 启用</el-tag>
        </template>
      </el-table-column>

        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <PermissionLink size="mini" label="编辑" perms="1002" icon="el-icon-edit" type="primary" @click="getById(scope.row.bannerId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.bannerId)"/>
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
      title="轮播图"
      width="850px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" :rules="rules" size="mini" ref="ruleForm" label-width="70px">
          <el-row :gutter="12">

             

            <el-col :span="8">
              <el-form-item label="名称" prop="name">
                <el-input placeholder="请输入名称" style="width: 150px;" v-model="ruleForm.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="状态" prop="state">
                <el-select v-model="ruleForm.state" filterable placeholder="请选择状态" style="width: 150px;">
                  <el-option v-for="item in optionsState" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="类型" prop="type">
                <el-select v-model="ruleForm.type" filterable placeholder="请选择类型" style="width: 150px;">
                  <el-option v-for="item in optionsType" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>



            <el-col :span="24">
                <!-- <div class="form_list_title" >轮播图</div> -->
                <el-form-item label="轮播图" class="fileList" prop="photo">
                  <el-upload
                    class="avatar-uploader"
                    :action="baseImgURL + '/api/file/fileUpload'"
                    :show-file-list="false"
                    :headers="headers"
                    name="file"
                    :on-success="attachmentSuccess"
                    :before-upload="beforeAvatarUploadIdCard">
                    <el-image
                      :src="ruleForm.photo!=null?ruleForm.photo:defaultImage"
                      class="avatar"
                      style="width: auto; height: 180px;">
                       <div slot="error" class="image-slot">
                           <img src="../../assets/layout-img/no_image.png" alt="" style="width: auto; height: 180px;">
                      </div>
                      </el-image>
                  </el-upload>

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
        sinceNo:'',
        sinceNoTwo:'',
        licensePlate:'',
        name:'',
        idCard:'',
        licenseCode:'',
        type:'',
        startDateStart:null,
        startDateEnd:null,
        endDateStart:null,
        endDateEnd:null,
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
    optionsType:[
        {
            value: 0,
            label: 'WEB'
          }, {
            value: 1,
            label: 'APP'
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
        name:[{required: true, message: '不能为空!', trigger: 'change' }],
        state:[{required: true, message: '不能为空!', trigger: 'change' }],
        photo:[{required: true, message: '不能为空!', trigger: 'change' }],
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



    async getById(bannerId) {
      this.submitFlag = false;
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });

      const url="/Banner/detail"
      const res = await sendPostByKeyValue(url,{ id: bannerId})
      if (res) {
                this.ruleForm = res.data;
              }
     
    },

    delById(bannerId) {
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
            const url = "/Banner/delete";
            const res = await sendPostByKeyValue(url, { id: bannerId });
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
              ids.push(this.multipleSelection[i].bannerId);
            }
            // 删除操作
            const url = "/Banner/deletes";
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
      const url = "/Banner/save";
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
        sinceNo:'',
        sinceNoTwo:'',
        licensePlate:'',
        name:'',
        idCard:'',
        licenseCode:'',
        type:'',
        startDateStart:null,
        startDateEnd:null,
        endDateStart:null,
        endDateEnd:null,
        total: 0,
        page: 1,
        size: 100,
      }
    },

    async search() {
      this.listLoading = true;
      const url = "/Banner/findAllBanner";
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
