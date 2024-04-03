<template>
  <div class="app-container">
    <el-form size="mini" :inline="true">
      <el-form-item>
        <PermissionButton size="mini" icon="el-icon-delete" label="批量删除" perms="1003" type="danger" @click="deletes" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="serverQuerey.keyword" @keyup.enter.native="search" clearable placeholder="请输入关键词"></el-input>
      </el-form-item>

      <el-form-item>
        <el-cascader
        v-model="serverQuerey.professionEcho"
        filterable
         clearable
        @keyup.enter.native="search"
        placeholder="请选择专业"
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
        <el-button type="warning" icon="el-icon-search" @click="search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <PermissionButton size="mini" icon="el-icon-plus" label="添加" perms="1001" type="primary" @click="openDialog(true)" />
      </el-form-item>
      <el-form-item>
        <PermissionButton size="mini" icon="el-icon-download" label="导入模板下载" perms="1031" type="primary" @click="downloadTeplate" />
      </el-form-item>

      <el-form-item>
          <el-upload
            :action="baseImgURL+'/api/ExamQuestions/importExamQuestions'"
            :show-file-list="false"
            :headers="headers"
            name="file"
            accept=".xls"
            :on-success="uploadTitleSuccess"
            :before-upload="uploadExcelBefore"
          >
            <PermissionButton size="mini" icon="el-icon-position" label="导入" perms="1031" type="primary" />
          </el-upload>
        </el-form-item>

    </el-form>
    <div>

        <el-table
        v-loading="listLoading"
        :height="tableHeight"
        :data="listData"
        border
        fit
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >

        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column
          label="序号"
          width="50px" align="center">
          <template slot-scope="scope">
            {{scope.$index+1}}
          </template>
        </el-table-column>
        <el-table-column label="题目类型" align="center">
        <template prop="queType" slot-scope="{ row }">
          <el-tag v-if="row.queType == null || row.queType == 0">单选题</el-tag>
          <el-tag v-if="row.queType == 1" type="success"> 多选题</el-tag>
          <el-tag v-if="row.queType == 2" type="warning"> 判断题</el-tag>
        </template>
      </el-table-column>
       <el-table-column align="center" prop="professionName" label="专业"></el-table-column>
       <!-- <el-table-column align="center" prop="configName" label="难度等级"></el-table-column> -->
       <el-table-column align="center" prop="trainingName" label="课程名称"></el-table-column>
        <!-- <el-table-column align="center" prop="queContent" label="题目" show-overflow-tooltip></el-table-column> -->
        <el-table-column align="center" label="题目">
          <template slot-scope="scope">
            <el-link type="primary" @click="openInstructions(scope.row.queContent)">预览</el-link> 
          </template>
        </el-table-column>
        <el-table-column align="center" prop="answer" label="正确答案" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="analysis" label="答案分析" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <PermissionLink size="mini" label="编辑" perms="1002" icon="el-icon-edit" type="primary" @click="getById(scope.row.examQuestionsId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.examQuestionsId)"/>
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
      title="试题详情"
      width="900px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="questionForm" :rules="rules" ref="questionForm" label-width="98px" size="mini">
          <el-row>
            <el-form-item label="试题类型:" prop="queType">
              <el-radio size="small" v-model="questionForm.queType" label="0" border>单选题</el-radio>
              <el-radio size="small" v-model="questionForm.queType" label="1" border>多选题</el-radio>
              <el-radio size="small" v-model="questionForm.queType" label="2" border>判断题</el-radio>
            </el-form-item>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="专业:" prop="professionEcho">
                <el-cascader
                    v-model="questionForm.professionEcho"
                    filterable
                    placeholder="请选择专业"
                    style="width: 275px;"
                    :options="optionsProfession"
                    :props="{ expandTrigger: 'hover' }"
                    @change="optionsTrainingSearch(questionForm.professionEcho[1])"
                   >
                </el-cascader>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="课程:" prop="trainingId">
                <el-select v-model="questionForm.trainingId" filterable placeholder="请选择课程" style="width: 275px;">
                  <el-option v-for="item in optionsTraining" :key="item.trainingId" :label="item.name" :value="item.trainingId">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="题目信息:" prop="queContent">
                <!-- <el-input type="textarea"  style="width: 650px;" placeholder="请输入题目信息" v-model="questionForm.queContent"></el-input> -->
                <tinymce style="width:650px; " ref="editor" v-model="questionForm.queContent"></tinymce>
              </el-form-item>
            </el-col>
          </el-row>
          

         
          
          <el-row>
            <el-col :span="24">
              <el-form-item label="参考答案:" prop="answer">
                <el-input placeholder="请输入参考答案" style="width: 650px;" v-model="questionForm.answer"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="答案分析:" prop="analysis">
                <el-input type="textarea" style="width: 650px;" placeholder="请输入答案分析" v-model="questionForm.analysis"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="30">
            <span style="font-weight: bolder">选项:</span>
            <el-button
              type="primary"
              @click="createRow"
               size="mini"
              style="float: right; margin-bottom: 10px"
            >添加选项
            </el-button>
            <el-table
              border
              :data="optionTable"
              style="width: 100%">
              <el-table-column
                label="序号"
                width="50px">
                <template slot-scope="scope">
                  {{scope.$index+1}}
                </template>
              </el-table-column>
              <el-table-column
                width="80px"
                prop="optionName"
                label="选项">
                <template scope="scope">
                  <el-input size="small" v-model="scope.row.optionName"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                prop="optionContent"
                label="选项内容">
                <template scope="scope">
                  <el-input size="small" v-model="scope.row.optionContent"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="80">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.$index, scope.row)"
                  >删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogBaseFlag=false">取 消</el-button>
        <el-button size="mini" type="primary" :disabled="submitButtonFlag" @click="submitForm('questionForm')">提 交</el-button>
      </div>
    </el-dialog>

    <el-dialog
    v-dialogDrag
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      title="题目预览"
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
  import {sendGet, sendPostByKeyValue, sendPostByJson} from "@/utils/httpUtils";
   import Pagination from "@/components/Pagination";
   import Tinymce from "@/components/TinymceTwo";
  export default {
      components:{
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
        tableHeight:window.innerHeight-175,
          total: 0,
        serverQuerey: {
          keyword: "",
          page: 1,
          size: 50,
        },
        optionsProfession:[
        
      ],
      instructionsForm:{
        instructions: '',
    },
      instructionsState: false,
        optionsCode:[
        
        ],
        optionsTraining:[
        
        ],
        dialogBaseFlag: false,
        listLoading: false,
        submitButtonFlag: false,
        dataTotal: 0,
        baseImgURL: "",
        // 动态表
        optionTable: [{optionName: "A"}, {optionName: "B"}, {optionName: "C"}, {optionName: "D"}],
        headers: {},
        listData: [],
        roleList: [],
        multipleSelection: [],
        questionForm: {
          queType: "",
          queContent: "",
          answer: "",
          analysis: "",
          photo: "",
          professionEcho:[],
        },
        fileList: [],
        rules: {
          queContent: [{required: true, message: "不能为空", trigger: "blur"},],
          queType: [{required: true, message: "不能为空", trigger: "blur"},],
          professionEcho: [{required: true, message: "不能为空", trigger: "blur"},],
          trainingId: [{required: true, message: "不能为空", trigger: "blur"},],
          answer: [{required: true, message: "不能为空", trigger: "blur"},],
        },
      };
    },
    mounted: async function () {
      await this.initFun();
      this.baseImgURL = process.env.VUE_APP_BASE_IMG;
      this.headers = {
        Token: this.$store.state.user.token,
      };
      this.search();
      this.professionSearch();
      this.optionsTrainingSearch();
    },
    methods: {
      initFun() {},

      filesFormat(row, column){
        var files = row.files;
        var filestr = "";
        if (files && files.length > 0){
          for (var index = 0; index < files.length; index++){
            filestr += files[index].fileUrl+",";
          }
        }else {
          filestr = "暂无";
        }
        return filestr;
      },

      uploadTitleSuccess(response, file, fileList) {
      if (response) {
        if(response.code == 200){
          this.search();
          this.$message({
          type: "success",
              message: "操作成功",
      });
        }
        if(response.code == 400){
          this.$message({
          message: response.message,
          type: "error",
      });
        }
        
        // this.ruleForm.titlePhoto = this.baseImgURL + response.data.fileUrl;
      }
    },

    openInstructions(content) {
      this.instructionsForm.instructions=content
      this.instructionsState = true;

    },

    downloadTeplate() {
        window.open('static/题库导入模板.xls', '_blank');
      },


      uploadExcelBefore(file) {
        let hz = file.name.split('.').pop()
        if (hz != 'xls') {
          this.$message({
            type: "error",
            message: "文件格式错误！"
          });
          return false
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

    //难度等级
      async optionsCodeSearch() {
          let serverQuerey ={
                type:3,
                page: 1,
                size: 100,
            }
      const url = "/BasicConfig/findAllList";
      const response = await sendPostByJson(url,serverQuerey);
      if (response) {
        this.optionsCode = response.data.list;
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


      getById(examQuestionsId) {
        this.submitFlag = false;
        this.dialogBaseFlag = true;
        this.$nextTick(() => {
          this.$refs["questionForm"].clearValidate();
        });
        const url = "/ExamQuestions/detail?id=" + examQuestionsId;
        sendGet(url)
          .then((response) => {
            if (response.code == 200) {
              console.log(response.data)
              this.questionForm = response.data;
              this.$set(this.questionForm,"queType",response.data.queType+"");
              this.optionTable = response.data.options
              if(response.data.professionEcho){
                this.questionForm.professionEcho = response.data.professionEcho.split(',').map(Number);
                this.optionsTrainingSearch(this.questionForm.professionEcho[1])
                }
            } else {
              this.$message({
                type: "error",
                message: response.message,
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },

      delById(examQuestionsId) {
        this.$confirm("确定要删除该记录?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          lockScroll: false,
          type: "warning",
          center: true,
          beforeClose: (action, instance, done) => {
            // 确定
            if (action === "confirm") {
              // 删除操作
              sendGet("/ExamQuestions/delete?id=" + examQuestionsId)
                .then((response) => {
                  if (response.code == 200) {
                    this.search();
                    this.$message({
                      type: "success",
                      message: "删除成功",
                    });
                  } else {
                    this.$message({
                      type: "error",
                      message: response.message,
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
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
          beforeClose: (action, instance, done) => {
            // 确定
            if (action === "confirm") {
              let ids = [];
              for (let i = 0; i < this.multipleSelection.length; i++) {
                ids.push(this.multipleSelection[i].examQuestionsId);
              }
              // 删除操作
              sendGet("/ExamQuestions/deletes?ids=" + ids.toString())
                .then((response) => {
                  if (response.code == 200) {
                    this.search();
                    this.$message({
                      type: "success",
                      message: "删除成功",
                    });
                  } else {
                    this.$message({
                      type: "error",
                      message: response.message,
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
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

      add() {
          if(this.questionForm.professionEcho && this.questionForm.professionEcho instanceof Array){
          this.questionForm.professionEcho = this.questionForm.professionEcho.join(",");
      }
        // 整理数据
        console.log(this.questionForm)
        console.log(this.optionTable)
        for(let i = 0;i < this.optionTable.length;i++){
          if(this.optionTable[i].optionContent == null || this.optionTable[i].optionContent == ''){
            this.$message({
                type: "error",
                message: "选项不能为空",
              });
            return;
          }
        }
        this.submitButtonFlag = true;
          this.questionForm.options = this.optionTable
        console.log(this.questionForm)
        const data = JSON.parse(JSON.stringify(this.questionForm));
        var saveUrl;
        if (this.questionForm.examQuestionsId == null){
          console.log("新增")
          saveUrl = "/ExamQuestions/add";
        }else {
          console.log("修改")
          saveUrl = "/ExamQuestions/update";
        }
        sendPostByJson(saveUrl, data)
          .then((response) => {
            if (response.code == 200) {
              this.search();
              this.$message({
                type: "success",
                message: "操作成功",
              });
              this.dialogBaseFlag = false;
            } else {
              this.$message({
                type: "error",
                message: response.message,
              });
            }
            this.submitButtonFlag = false;
          })
          .catch((error) => {
            console.log(error);
            this.submitButtonFlag = false;
          });
      },

      
   
      openDialog(flag) {
        this.submitFlag = flag; //false 修改 true 添加
        this.dialogBaseFlag = true;
        this.$nextTick(() => {
          this.$refs["questionForm"].clearValidate();
        });
        this.questionForm = {
          queType: "",
          queContent: "",
          answer: "",
          analysis: "",
          professionEcho:[],
        };
        this.fileList = [];
        this.optionTable = [{optionName: "A"}, {optionName: "B"}, {optionName: "C"}, {optionName: "D"}]
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

      search() {
          if(this.serverQuerey.professionEcho && this.serverQuerey.professionEcho instanceof Array){
          this.serverQuerey.professionEcho = this.serverQuerey.professionEcho.join(",");
      }
        this.listLoading = true;
        const url = "/ExamQuestions/list";
        sendPostByKeyValue(url, this.serverQuerey)
          .then((response) => {
            if (response.code == 200) {
              this.listData = response.data.list;
              this.dataTotal = response.data.total;

            } else {
              this.$message({
                type: "error",
                message: response.message,
              });
            }
            this.listLoading = false;
          })
          .catch((err) => {
            this.listLoading = false;
            console.log(err);
          });
      },

      // 文件上传
      handleRemove(file, fileList) {
        // console.log(file, fileList);

      },
      handlePreview(file) {
        // console.log(file);
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file, fileList) {
        console.log(file);
        console.log(this.fileList);
        const files = this.fileList;
        var index;
        for (var i = 0; i < files.length; i++) {
          if (files[i].uid == file.uid) {
            index = i;
          }
        }
        this.fileList.splice(index,1);
        console.log(this.fileList)
      },


      // 动态行相关的方法
      createRow() {
        var list = {
          accessCode: "",
          additionalRule: "",
          assessName: "",
          // assessType: this.queryform.assessType, // 当前数据需要发送到后台保存，需要设置默认值
          id: "",
          orderNum: this.optionTable.length + 1, // orderNum为新创建行的索引
          ruleType: "",
          score: "",
          assessCodeName: "",
          accessNameCode: ""
        };
        this.optionTable.push(list);
      },


      handleDelete(val, row) {
        // 模态框删除按钮
        this.$confirm("是否确认删除本条数据，删除后不可恢复?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        }).then(() => {
          // 此为假删除，只是删除了模态框中当前行的数据，并没有真正删除表格数据
          this.optionTable.splice(val, 1);
          // 如下，接口请求则真正删除表格数据
          let rowId = row.id;
          /*regionactivityapi.DeleteAssess({ id: rowId }).then(res => {
            if (res.data) {
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 2000
              });
            }
          });*/
        });
      },

      doPriveImg(){
        // this.fileList[0].fileUrl.showViewer = true
        let dom = document.getElementsByClassName('el-image__preview')
        dom[0].click()
      },
    },
  };
</script>
<style scoped>
  ::v-deep .el-dialog__body {
    height: 560px;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
