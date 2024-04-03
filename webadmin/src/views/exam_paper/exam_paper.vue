<template>
  <div class="app-container">
    
    <el-form size="mini" inline >
      <el-row>
        <el-form-item>
            <PermissionButton size="mini" icon="el-icon-delete" label="批量删除" perms="1003" type="danger" @click="deletes" />
          </el-form-item>
          <el-form-item >
            <el-input type="text" placeholder="考试名称" clearable v-model="serverQuerey.examName" class="wd16"></el-input>
        </el-form-item>
        <el-form-item>
        <el-cascader
        v-model="serverQuerey.professionEcho"
        filterable
         clearable
        @keyup.enter.native="search"
        placeholder="请选择考试专业"
        :options="optionsProfession"
        :props="{ expandTrigger: 'hover' }"
        @change="optionsTrainingSearch(serverQuerey.professionEcho[1])"
        >
        </el-cascader>
    </el-form-item>

    <el-form-item>
        <el-select v-model="serverQuerey.trainingId" @keyup.enter.native="search" clearable filterable placeholder="请选择课程">
            <el-option v-for="item in optionsTraining" :key="item.trainingId" :label="item.name" :value="item.trainingId">
            </el-option>
        </el-select>
    </el-form-item>

        <el-form-item>
        <el-select v-model="serverQuerey.remindInterval" @keyup.enter.native="search" clearable filterable placeholder="请选择提醒间隔时间">
            <el-option v-for="item in optionsRemindInterval" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
        </el-select>
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
        <el-table-column align="center" prop="examName" label="考试名称"></el-table-column>
        <el-table-column align="center" prop="professionName" label="专业"></el-table-column>
        <el-table-column align="center" prop="trainingName" label="课程名称"></el-table-column>
        <el-table-column align="center" prop="examDuration" label="考试时长(分钟)"></el-table-column>
        <el-table-column label="提醒间隔时间" align="center">
        <template prop="remindInterval" slot-scope="{ row }">
          <el-tag v-if="row.remindInterval == null || row.remindInterval == 0" type="success">每天</el-tag>
          <el-tag v-if="row.remindInterval == 1" type="success"> 每周</el-tag>
          <el-tag v-if="row.remindInterval == 2" type="success"> 每月</el-tag>
        </template>
      </el-table-column>
        <el-table-column align="center" prop="singleCount" label="单选题数量"></el-table-column>
        <el-table-column align="center" prop="multipleCount" label="多选题数量"></el-table-column>
        <el-table-column align="center" prop="judgeCount" label="判断题数量"></el-table-column>

        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <PermissionLink size="mini" label="编辑" perms="1002" icon="el-icon-edit" type="primary" @click="getById(scope.row.examPaperId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.examPaperId)"/>
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
    </div>
    <el-dialog
    v-dialogDrag
      :modal-append-to-body="false"
      title="考试管理"
      width="850px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" :rules="rules" size="mini" ref="ruleForm" label-width="95px">
          <el-row :gutter="30">

             

            <el-col :span="12">
              <el-form-item label="考试名称" prop="examName">
                <el-input placeholder="请输入考试名称" style="width: 250px;" v-model="ruleForm.examName"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="考试时长" prop="examDuration">
                <el-input placeholder="请输入考试时长：分钟" style="width: 250px;" v-model="ruleForm.examDuration"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="专业" prop="professionEcho">
                <el-cascader
                    v-model="ruleForm.professionEcho"
                    filterable
                    placeholder="请选择专业"
                    style="width: 250px;"
                    :options="optionsProfession"
                    :props="{ expandTrigger: 'hover' }"
                    @change="optionsTrainingSearch(ruleForm.professionEcho[1])"
                   >
                </el-cascader>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="课程:" prop="trainingId">
                <el-select v-model="ruleForm.trainingId" filterable placeholder="请选择课程" style="width: 250px;">
                  <el-option v-for="item in optionsTraining" :key="item.trainingId" :label="item.name" :value="item.trainingId">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="提醒间隔" prop="remindInterval">
                <el-select v-model="ruleForm.remindInterval" filterable placeholder="请选择提醒间隔" style="width: 250px;">
                  <el-option v-for="item in optionsRemindInterval" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
            <div style="margin-left:10px;font-weight:500;font-size:5;">题型设置(请设置各类型考题数量与分值，系统将按设置规则随机抽取考题生成试卷)</div>
            </el-col>


            <el-col :span="12">
              <el-form-item label="单选题数量" prop="singleCount">
                <el-input placeholder="请输入单选题数量" style="width: 250px;" v-model="ruleForm.singleCount"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单选题总分" prop="singleScore">
                <el-input placeholder="请输入单选题总分" style="width: 250px;" v-model="ruleForm.singleScore"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="多选题数量" prop="multipleCount">
                <el-input placeholder="请输入多选题数量" style="width: 250px;" v-model="ruleForm.multipleCount"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="多选题总分" prop="multipleScore">
                <el-input placeholder="请输入多选题总分" style="width: 250px;" v-model="ruleForm.multipleScore"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="判断题数量" prop="judgeCount">
                <el-input placeholder="请输入判断题数量" style="width: 250px;" v-model="ruleForm.judgeCount"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="判断题总分" prop="judgeScore">
                <el-input placeholder="请输入判断题总分" style="width: 250px;" v-model="ruleForm.judgeScore"></el-input>
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
        name:'',
        keyword:'',
        total: 0,
        page: 1,
        size: 100,
      },
      dataTotal: 0,

      optionsProfession:[
        
    ],

    optionsState:[
        {
            value: 0,
            label: '禁用'
          }, {
            value: 1,
            label: '启用'
          }
    ],
    
    optionsRemindInterval:[
        {
            value: 0,
            label: '每天'
          }, {
            value: 1,
            label: '每周'
          }, {
            value: 2,
            label: '每月'
          }
    ],
      optionsTraining:[
        
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
       singleCount:0,
       singleScore:0,
       multipleCount:0,
       multipleScore:0,
       judgeCount:0,
       judgeScore:0,
       professionEcho:[],
       photo:null
      },
      rules: {
        examName:[{required: true, message: '不能为空!', trigger: 'change' }],
        examDuration:[{required: true, message: '不能为空!', trigger: 'change' }],
        remindInterval:[{required: true, message: '不能为空!', trigger: 'change' }],
        trainingId:[{required: true, message: '不能为空!', trigger: 'change' }],
        professionEcho:[{required: true, message: '不能为空!', trigger: 'change' }],
        singleCount:[{required: true, message: '不能为空!', trigger: 'change' }],
        singleScore:[{required: true, message: '不能为空!', trigger: 'change' }],
        multipleCount:[{required: true, message: '不能为空!', trigger: 'change' }],
        multipleScore:[{required: true, message: '不能为空!', trigger: 'change' }],
        judgeCount:[{required: true, message: '不能为空!', trigger: 'change' }],
        judgeScore:[{required: true, message: '不能为空!', trigger: 'change' }],
      },
    };
  },



  mounted: async function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
    this.professionSearch();
    this.optionsTrainingSearch();
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

      //课程
      async optionsTrainingSearch(professionId) {
      const url = "/Training/findByParamNoPage";
      const response = await sendPostByKeyValue(url,{professionId:professionId});
      if (response) {
        this.optionsTraining = response.data;
      }
    },

     

    //专业
      async professionSearch() {
      const url = "/Profession/getCascadeParam";
      const response = await sendPostByJson(url,null);
      if (response) {
        this.optionsProfession = response.data;
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
        singleCount:0,
       singleScore:0,
       multipleCount:0,
       multipleScore:0,
       judgeCount:0,
       judgeScore:0,
          photo:null,
        attachment:null
      };
    },



    async getById(id) {
      this.submitFlag = false;
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });

      const url="/ExamPaper/detail"
      const res = await sendPostByKeyValue(url,{ id: id})
      if (res) {
                this.ruleForm = res.data;
                if(res.data.professionEcho){
                this.ruleForm.professionEcho = res.data.professionEcho.split(',').map(Number);
                }
                this.optionsTrainingSearch(this.ruleForm.professionEcho[1])
              }
     
    },

    delById(id) {
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
            const url = "/ExamPaper/delete";
            const res = await sendPostByKeyValue(url, { id: id });
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
              ids.push(this.multipleSelection[i].examPaperId);
            }
            // 删除操作
            const url = "/ExamPaper/deletes";
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
      if(this.ruleForm.professionEcho && this.ruleForm.professionEcho instanceof Array){
          this.ruleForm.professionEcho = this.ruleForm.professionEcho.join(",");
      }
      const url = "/ExamPaper/save";
      const response = await sendPostByJson(url, this.ruleForm);
      if (response) {
        this.search();
            this.$message({
              type: "success",
              message: "操作成功",
            });
            this.dialogBaseFlag = false;
      }
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
        if(this.serverQuerey.professionEcho && this.serverQuerey.professionEcho instanceof Array){
          this.serverQuerey.professionEcho = this.serverQuerey.professionEcho.join(",");
      }
      this.listLoading = true;
      const url = "/ExamPaper/findAllList";
      const response = await sendPostByKeyValue(url, this.serverQuerey);
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
