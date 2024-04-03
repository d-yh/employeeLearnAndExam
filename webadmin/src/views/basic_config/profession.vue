<template>
  <div class="app-container">
    <el-form size="mini" inline >
      <el-row>
          <el-form-item >
            <el-input type="text" placeholder="专业" clearable v-model="serverQuerey.name" class="wd16"></el-input>
        </el-form-item>
        <el-form-item >
            <el-input type="text" placeholder="备注" clearable v-model="serverQuerey.keyword" class="wd16"></el-input>
        </el-form-item>
        <el-form-item >
            <el-button type="warning" class="el-icon-search" @click="search" >查询</el-button>
        </el-form-item>

        <el-form-item>
            <!-- <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">添加一级专业</el-button> -->
            <PermissionButton size="mini" icon="el-icon-plus" label="添加一级专业" perms="1001" type="primary" @click="openDialog(1)" />
        </el-form-item>
        <el-form-item>
            <!-- <el-button type="primary" icon="el-icon-plus" @click="openDialog(2)">添加二级专业</el-button> -->
            <PermissionButton size="mini" icon="el-icon-plus" label="添加二级专业" perms="1001" type="primary" @click="openDialog(2)" />
        </el-form-item>
      </el-row>
    </el-form>

    <div>
      <el-table
        v-loading="listLoading"
        :height="tableHeight"
        :data="listData"
        border
        fit
        ref="multipleTable"
        :span-method="objectSpanMethod"
      >
        <el-table-column align="center" prop="oneName" label="一级专业"></el-table-column>
        <el-table-column align="center" label="操作" width="120">
          <template slot-scope="scope">
            <!-- <el-link type="primary" :disabled="!scope.row.oneId" @click="getById(1,scope.row.oneId)" >编辑</el-link> -->
            <PermissionLink size="mini" label="编辑" :disabled="!scope.row.oneId" perms="1002" type="primary" @click="getById(1,scope.row.oneId)"/>
            <el-divider direction="vertical"></el-divider>
            <!-- <el-link type="danger" :disabled="!scope.row.oneId" @click="delById(scope.row.oneId)">删除</el-link> -->
            <PermissionLink size="mini" :disabled="!scope.row.oneId" label="删除" perms="1003" type="danger" @click="delById(scope.row.oneId)"/>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="name" label="二级专业"></el-table-column>
        <el-table-column align="center" prop="note" label="备注"></el-table-column>
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <!-- <el-link icon="el-icon-edit" type="primary" :disabled="!scope.row.professionId" @click="getById(2,scope.row.professionId)" >编辑</el-link> -->
            <PermissionLink size="mini" icon="el-icon-edit" label="编辑" :disabled="!scope.row.professionId" perms="1002" type="primary" @click="getById(2,scope.row.professionId)"/>
            <el-divider direction="vertical"></el-divider>
            <!-- <el-link icon="el-icon-delete" type="danger" :disabled="!scope.row.professionId" @click="delById(scope.row.professionId)" >删除</el-link> -->
            <PermissionLink size="mini" label="删除" :disabled="!scope.row.professionId" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.professionId)"/>
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
      title="二级专业"
      width="500px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" size="mini" :rules="rules" ref="ruleForm" label-width="100px">
          <el-form-item label="上级专业" prop="proProfessionId">
            <el-select
              v-model="ruleForm.proProfessionId"
              filterable
              clearable
              :key="keyFlag"
              style="width:100%"
              placeholder="请选择上级专业"
            >
              <el-option
                v-for="item in listOne"
                :key="item.professionId"
                :label="item.name"
                :value="item.professionId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="专业名称" prop="name">
            <el-input placeholder="请输入专业名称" class="w250" v-model="ruleForm.name"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input placeholder="请输入备注" class="w250" v-model="ruleForm.note"></el-input>
          </el-form-item>
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
      title="一级专业"
      width="500px"
      :visible.sync="dialogOneFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" size="mini" :rules="rules" ref="oneForm" label-width="90px">
          <el-form-item label="专业名称" prop="name">
            <el-input placeholder="请输入专业名称" class="w250" v-model="ruleForm.name"></el-input>
          </el-form-item>

          <el-form-item label="图标">
                <el-upload
                  class="avatar-uploader"
                  :action="baseImgURL+'/api/file/fileUpload'"
                  :show-file-list="false"
                  :headers="headers"
                  name="file"
                  :on-success="uploadSuccess"
                  :on-error="uploadError"
                  :before-upload="beforeAvatarUpload"
                >
                  <img
                    v-if="ruleForm.icon"
                    :src="ruleForm.icon"
                    style="width: 40px;height: 40px;display: block;"
                  />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </el-form-item>

          <el-form-item label="备注">
            <el-input placeholder="请输入备注" class="w250" v-model="ruleForm.note"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogOneFlag=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitForm('oneForm')">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sendGet, sendPostByKeyValue, sendPostByJson } from "@/utils/httpUtils";
import { transformTree } from "@/utils/custom";
import Pagination from "@/components/Pagination";
export default {
    components: {
    Pagination,
  },
  data() {
    return {
      tableHeight: window.innerHeight - 175+"px",
      serverQuerey: {
        name: "",
        total: 0,
        page: 1,
        size: 100,
      },
      dataTotal: 0,
      baseImgURL: "",
      keyFlag: 0,
      openType: "",
      submitFlag: false,
      dialogBaseFlag: false,
      dialogOneFlag: false,
      submitButtonFlag: false,
      listLoading: false,
      listData: [],
      listOne: [],
      oneIdSpanArr: [],
      ruleForm: {
        professionId: "",
        proProfessionId: "",
        name: "",
        level: "",
        sort: "",
        icon: "",
      },
      rules: {
        proProfessionId: [
          { required: true, message: "请选择上级专业", trigger: "change" },
        ],
        name: [
          { required: true, message: "专业名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  mounted: function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
    this.getAll();

    window.onresize = () => {
      this.tableHeight = window.innerHeight - 200;
    };
  },
  methods: {
    
    uploadSuccess(response, file, fileList) {
      if (response) {
        this.ruleForm.icon = this.baseImgURL + response.data.fileUrl;
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

    async getAll() {
      ++this.keyFlag;
      //查询一级专业
      const url = "/Profession/getAllOne";
      const response = await sendPostByJson(url, null);
      if (response) {
            this.listOne = response.data;
      }
    },

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex === 1) {
        const _row = this.oneIdSpanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
    },
    

    async getById(type, professionId) {
      this.submitFlag = false;
      this.openType = type;
      switch (type) {
        case 1:
          this.dialogOneFlag = true;
          this.$nextTick(() => {
            this.$refs["oneForm"].clearValidate();
          });
          break;
        case 2:
          this.dialogBaseFlag = true;
          this.$nextTick(() => {
            this.$refs["ruleForm"].clearValidate();
          });
          break;
      }

      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });

      const url="/Profession/detail"
      const res = await sendPostByKeyValue(url,{ id: professionId})
      if (res) {
                this.ruleForm = res.data;
              }
     
    },

    

     delById(professionId) {
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
            const url = "/Profession/delete";
            const res = await sendPostByKeyValue(url, { id: professionId });
            if (res) {
                this.search();
                this.getAll();
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
      this.ruleForm.level = this.openType;
      this.submitButtonFlag = true;
      const url = "/Profession/save";
      const response = await sendPostByJson(url, this.ruleForm);
      if (response) {
            this.search();
            this.getAll();
            this.$message({
              type: "success",
              message: "操作成功",
            });
            this.dialogOneFlag = false;
            this.dialogBaseFlag = false;
      }
      this.submitButtonFlag = false;
    },

    async update() {
      this.submitButtonFlag = true;
      const url = "/Profession/save";
      const response = await sendPostByJson(url, this.ruleForm);
      if (response) {
            this.search();
            this.getAll();
            this.$message({
              type: "success",
              message: "操作成功",
            });
            this.dialogOneFlag = false;
            this.dialogBaseFlag = false;
      }
      this.submitButtonFlag = false;
    },

    
    handleSizeChange(val) {
      //查询
      this.serverQuerey.pageSize = val;
      this.search();
    },
    handleCurrentChange(val) {
      //查询
      this.serverQuerey.pageIndex = val;
      this.search();
    },
    openDialog(type) {
      this.openType = type;
      switch (type) {
        case 1:
          this.dialogOneFlag = true;
          this.$nextTick(() => {
            this.$refs["oneForm"].clearValidate();
          });
          break;
        case 2:
          this.dialogBaseFlag = true;
          this.$nextTick(() => {
            this.$refs["ruleForm"].clearValidate();
          });
          break;
      }
      this.submitFlag = true; //false 修改 true 添加
      this.ruleForm = {
        
      };
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.submitFlag) {
            //添加
            this.add();
          } else {
            //修改
            this.update();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    

    async search() {
      this.listLoading = true;
      const url = "/Profession/getList";
      const response = await sendPostByJson(url, this.serverQuerey);
      if (response) {
        this.listData = response.data.list;
        this.dataTotal = response.data.total;
        this.listLoading = false;

        let data = response.data.list;
            let oneIdPos = 0;
            this.oneIdSpanArr = [];
        for (let i = 0, len = data.length; i < len; i++) {
              if (i === 0) {
                this.oneIdSpanArr.push(1);
                oneIdPos = 0;
              } else {
                // 判断仓库当前元素与上一个元素是否相同
                if (data[i].oneId === data[i - 1].oneId) {
                  this.oneIdSpanArr[oneIdPos] += 1;
                  this.oneIdSpanArr.push(0);
                } else {
                  this.oneIdSpanArr.push(1);
                  oneIdPos = i;
                }
              }
            }

      }
    },
  },
};
</script>
<style scoped>
</style>