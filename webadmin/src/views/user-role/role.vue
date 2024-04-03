<template>
  <div class="app-container">

    <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="后台系统权限" name="first"></el-tab-pane>
        <el-tab-pane label="APP权限" name="second"></el-tab-pane>
      </el-tabs>
    <el-row :style="'height:' + contentHeight">
      <el-col :span="5" class="h-100">
        <div class="grid-content">
          <el-row>
            <el-col :span="14">
              <label class="title-label">角色管理</label>
            </el-col>
          </el-row>
          <div style="margin-top: 20px">
            <el-input
              v-model="serverQuerey.name"
              placeholder="角色名"
              size="mini"
              style="width: 50%"
              clearable
            >
            </el-input>
            <PermissionButton
              size="mini"
              label="查询"
              perms="1003"
              type="primary"
              @click="initroleList()"
            />
            <PermissionButton
              size="mini"
              label="添加"
              perms="1064"
              type="primary"
              @click="addRole()"
            />
          </div>
          <el-table
            style="width: 100%; margin-top: 20px"
            v-loading="listLoading"
            :height="tableHeight"
            :data="roleList"
            border
            fit
            highlight-current-row
            ref="multipleTable"
            @row-click="handleNodeClick"
          >
            <!-- <el-table-column align="center" prop="roleId" label="ID"></el-table-column> -->
            <el-table-column align="center" prop="name" label="角色名"></el-table-column>
            <el-table-column align="center" prop="description" label="角色描述"></el-table-column>
            <el-table-column label="操作" align="center" width="100">
              <template slot-scope="scope">
                <el-link icon="el-icon-edit" type="primary" @click="getById(scope.row.roleId)">编辑</el-link>
                <br>
                <el-link icon="el-icon-delete" type="danger" @click="delById(scope.row.roleId)">删除</el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="9" class="h-100">
        <div class="grid-content" style="margin-left: 10px">
          <label class="title-label">已有权限</label>
          <div style="margin-top: 20px">
            <el-select
              v-model="searchPermissionId"
              filterable
              placeholder="请选择"
              size="mini"
              style="width: 80%"
              clearable
            >
              <el-option
                v-for="item in firstPermissions"
                :key="item.permissionId"
                :label="item.title"
                :value="item.permissionId"
              >
              </el-option>
            </el-select>
            <PermissionButton
              size="mini"
              label="批量移除"
              perms="1002"
              type="danger"
              @click="deletePermissions()"
            />
          </div>
          <el-table
            :data="tables0"
            :span-method="objectSpanMethodExist"
            border
            style="width: 100%; margin-top: 20px"
            :height="tableHeight"
            @selection-change="handleSelectionChangeExist"
          >
            <el-table-column type="selection" align="center"></el-table-column>
            <el-table-column
              align="center"
              prop="title"
              label="页面名称"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="name"
              label="操作"
            ></el-table-column>
            <el-table-column label="" align="center" width="80">
              <template slot-scope="scope">
                <PermissionLink
                  size="mini"
                  label="删除"
                  perms="1002"
                  icon="el-icon-delete"
                  type="danger"
                  @click="deletePermission(scope.row.permissionItemId)"/>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="10" class="h-100">
        <div class="grid-content" style="margin-left: 10px">
          <label class="title-label">暂未配置权限</label>
          <div style="margin-top: 20px">
            <el-select
              v-model="searchPermissionIdTwo"
              filterable
              placeholder="请选择"
              size="mini"
              style="width: 80%"
              clearable
            >
              <el-option
                v-for="item in firstPermissions"
                :key="item.permissionId"
                :label="item.title"
                :value="item.permissionId"
              >
              </el-option>
            </el-select>
            <PermissionButton
              size="mini"
              label="批量添加"
              perms="1002"
              type="primary"
              @click="addPermissions()"
            />
          </div>
          <el-table
            :data="tables1"
            :span-method="objectSpanMethod"
            border
            style="width: 100%; margin-top: 20px"
            :height="tableHeight"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" align="center"></el-table-column>
            <el-table-column
              align="center"
              prop="title"
              label="页面名称"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="name"
              label="操作"
            ></el-table-column>
            <el-table-column
              align="center"
              prop="desc"
              label="功能说明"
            ></el-table-column>
            <el-table-column label="" align="center" width="80">
              <template slot-scope="scope">
                <PermissionLink
                  size="mini"
                  label="添加"
                  perms="1002"
                  type="primary"
                  @click="addPermission(scope.row.permissionItemId)"/>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-dialog
      :modal-append-to-body="false"
      title="角色信息"
      width="400px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form ref="ruleForm" label-width="90px" :rules="rules" :model="ruleForm">
          <el-form-item
            label="角色名称"
             prop="name"
          >
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
          <el-form-item
            label="角色描述"
          >
            <el-input v-model="ruleForm.description"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogBaseFlag = false">取 消</el-button>
        <el-button
          size="mini"
          type="primary"
          :disabled="submitButtonFlag"
          @click="add()"
        >提 交
        </el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { sendGet, sendPostByKeyValue, sendPostByJson } from '@/utils/httpUtils'
  import { transformTree, getChildrenIds } from '@/utils/custom'

  export default {
    data() {
      return {
        contentHeight: window.innerHeight - 145 + 'px',
        tableHeight: window.innerHeight - 270 + 'px',
        listLoading: false,
        selectType: 0,
        activeName: 'first',
        serverQuerey: {
          name: '',
          total: 0,
          page: 1,
          size: 20
        },
        rules: {
          name: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          description: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ]
        
      },
        roleList: [],
        firstPermissions: [],
        searchPermissionId: '',
        searchPermissionIdTwo: '',
        existingPermissions: [],
        noPermissions: [],
        multipleSelectionExist: [],
        multipleSelection: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        currentRoleId: '',
        dialogBaseFlag: false,
        ruleForm:{
          name: "",
          description: "",
        },
        submitButtonFlag: false,
        roleName: '',
        spanArr: {},
        spanArrNo: {}
      }
    },
    mounted: async function() {
      this.initroleList()
    },
    computed: {
      tables0: function() {
        var searchPermissionId = this.searchPermissionId
        if (searchPermissionId) {
          return this.existingPermissions.filter(function(item) {
            return item['permissionId'] == searchPermissionId
          })
        }
        return this.existingPermissions
      },
      tables1: function() {
        var searchPermissionId = this.searchPermissionIdTwo
        if (searchPermissionId) {
          return this.noPermissions.filter(function(item) {
            return item['permissionId'] == searchPermissionId
          })
        }
        return this.noPermissions
      }
    },
    methods: {
      handleNodeClick(item, node, a3) {
        this.currentRoleId = item.roleId
        this.initPermissionList(item.roleId)

      },

      handleClick(tab, event) {
        // console.log(tab, event);
        // console.log(this.activeName);
        if(this.activeName == "first"){
          this.selectType = 0;
          this.existingPermissions = [];
          this.noPermissions = [];
          this.initroleList();
        }
        if(this.activeName == "second"){
          this.selectType = 1;
          this.existingPermissions = [];
          this.noPermissions = [];
          this.initroleList();
        }
      },
      
      //初始化角色用户列表
      initroleList() {
        this.listLoading = true
        const url = '/role/noPageList'
        sendPostByKeyValue(url, this.serverQuerey)
          .then((response) => {
            if (response.code == 200) {
              this.roleList = response.data
            } else {
              this.$message({
                type: 'error',
                message: response.message
              })
            }
            this.listLoading = false
          })
          .catch((err) => {
            this.listLoading = false
            console.log(err)
          })
      },
      initPermissionList(roleId) {
        let url = '/permission/getFirstPermissions';
        if(this.selectType == 1){
            url = '/permission/getAppPermissions';
        }
        sendPostByKeyValue(url, { roleId: roleId })
          .then((response) => {
            if (response.code == 200) {
              this.firstPermissions = response.data
              if (roleId == 0) {
                return
              }
              let existingPermissions = []
              let noPermissions = []
              if (this.firstPermissions) {
                this.firstPermissions.forEach((item) => {
                  if (item.permissionItems) {
                    item.permissionItems.forEach((item0, index) => {
                      if (item0.hasPermission) {
                        existingPermissions.push({
                          title: item.title,
                          name: item0.name,
                          permissionId: item.permissionId,
                          permissionItemId: item0.permissionItemId,
                          desc: item0.description
                        })
                      } else {
                        noPermissions.push({
                          title: item.title,
                          name: item0.name,
                          permissionId: item.permissionId,
                          permissionItemId: item0.permissionItemId,
                          desc: item0.description
                        })
                      }
                    })
                  }
                })
              }
              this.existingPermissions = existingPermissions
              this.noPermissions = noPermissions
              //以下代碼用於處理单元格合并问题
              const spanArr = {}
              const spanArrNo = {}
              spanArr['permissionId'] = { spanArr: [], pos: 0 }
              spanArrNo['permissionId'] = { spanArr: [], pos: 0 }
              this.existingPermissions.forEach((row, i) => {
                if (i == 0) {
                  spanArr['permissionId'].spanArr.push(1)
                  spanArr['permissionId'].pos = 0
                } else {
                  if (
                    row['permissionId'] ===
                    this.existingPermissions[i - 1]['permissionId']
                  ) {
                    spanArr['permissionId'].spanArr[
                      spanArr['permissionId'].pos
                      ] += 1
                    spanArr['permissionId'].spanArr.push(0)
                  } else {
                    // 不相等push 1,并且可修改下标指向
                    spanArr['permissionId'].spanArr.push(1)
                    spanArr['permissionId'].pos = i
                  }
                }
              })
              this.noPermissions.forEach((row, i) => {
                if (i == 0) {
                  spanArrNo['permissionId'].spanArr.push(1)
                  spanArrNo['permissionId'].pos = 0
                } else {
                  if (
                    row['permissionId'] ===
                    this.noPermissions[i - 1]['permissionId']
                  ) {
                    spanArrNo['permissionId'].spanArr[
                      spanArrNo['permissionId'].pos
                      ] += 1
                    spanArrNo['permissionId'].spanArr.push(0)
                  } else {
                    // 不相等push 1,并且可修改下标指向
                    spanArrNo['permissionId'].spanArr.push(1)
                    spanArrNo['permissionId'].pos = i
                  }
                }
              })
              this.spanArr = spanArr
              this.spanArrNo = spanArrNo
            } else {
              this.$message({ type: 'error', message: response.message })
            }
          })
          .catch((err) => {
            console.log(err)
          })
      },
      addPermissions() {
        if (this.multipleSelection && this.multipleSelection.length > 0) {
          let ids = []
          this.multipleSelection.forEach((item) => {
            ids.push(item.permissionItemId)
          })
          this.addUserPermission(ids)
        } else {
          this.$message({ type: 'error', message: '请选择需要添加的权限' })
        }
      },
      addPermission(permissionItemId) {
        let ids = []
        ids.push(permissionItemId)
        this.addUserPermission(ids)
      },
      deletePermissions() {
        if (
          this.multipleSelectionExist &&
          this.multipleSelectionExist.length > 0
        ) {
          let ids = []
          this.multipleSelectionExist.forEach((item) => {
            ids.push(item.permissionItemId)
          })
          this.removeRolePermissionItem(ids)
        } else {
          this.$message({ type: 'error', message: '请选择需要批量移除的权限' })
        }
      },
      deletePermission(permissionItemId) {
        let ids = []
        ids.push(permissionItemId)
        this.removeRolePermissionItem(ids)
      },
      addUserPermission(perItemIds) {
        let param = {
          roleId: this.currentRoleId,
          permissionItemIds: perItemIds
        }
        sendPostByJson('/RolePermissionItem/adds', param)
          .then((response) => {
            if (response.code == 200) {
              this.initPermissionList(this.currentRoleId)
            } else {
              this.$message({ type: 'error', message: response.message })
            }
          })
          .catch((err) => {
            console.log(err)
          })
      },
      removeRolePermissionItem(perItemIds) {
        let param = {
          roleId: this.currentRoleId,
          permissionItemIds: perItemIds
        }
        sendPostByJson('/RolePermissionItem/deletes', param)
          .then((response) => {
            if (response.code == 200) {
              this.initPermissionList(this.currentRoleId)
            } else {
              this.$message({ type: 'error', message: response.message })
            }
          })
          .catch((err) => {
            console.log(err)
          })
      },
      handleSelectionChangeExist(val) {
        this.multipleSelectionExist = val
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      objectSpanMethodExist({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 1) {
          return {
            rowspan: this.spanArr.permissionId.spanArr[rowIndex],
            colspan: this.spanArr.permissionId.spanArr[rowIndex] == 0 ? 0 : 1
          }
        }
      },
      //https://www.cnblogs.com/yeminglong/p/13757463.html
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 1) {
          //用于设置要合并的列
          return {
            rowspan: this.spanArrNo.permissionId.spanArr[rowIndex],
            colspan: this.spanArrNo.permissionId.spanArr[rowIndex] == 0 ? 0 : 1
          }
        }
      },
      addRole() {
        this.ruleForm={
          name: "",
          description: "",
        }
        this.dialogBaseFlag = true
        this.roleName = ''
        this.submitButtonFlag = false
      },
      saveRole() {
        if (this.roleName) {
          this.submitButtonFlag = true
          sendPostByJson('/role/add', { name: this.roleName })
            .then((response) => {
              this.submitButtonFlag = false
              if (response.code == 200) {
                this.dialogBaseFlag = false
                this.initroleList()
              } else {
                this.$message({ type: 'error', message: response.message })
              }
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          this.$message({ type: 'error', message: '请输入组织名称' })
        }
      },
      getById(id) {
        this.dialogBaseFlag = true;
        this.$nextTick(() => {
          this.$refs["ruleForm"].clearValidate();
        });
        const url = "/role/detail";
        sendPostByKeyValue(url, { id })
          .then((response) => {
            if (response.code == 200) {
              this.ruleForm = response.data;
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
      delById(id) {
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
              sendPostByKeyValue("/role/delete", { id })
                .then((response) => {
                  if (response.code == 200) {
                    this.initroleList();
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
                ids.push(this.multipleSelection[i].roleId);
              }
              // 删除操作
              sendPostByKeyValue("/role/deletes", { ids: ids.toString() })
                .then((response) => {
                  if (response.code == 200) {
                    this.initroleList();
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
        if(this.ruleForm.name == null || this.ruleForm.name == ''){
          console.log(this.ruleForm.name)
          this.$message({
                type: "error",
                message: '名称不能为空',
              });
              return;
        }
        this.submitButtonFlag = true;
        sendPostByJson("/role/SaveRole", this.ruleForm)
          .then((response) => {
            if (response.code == 200) {
              this.initroleList();
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
            this.submitButtonFlag = false;
            console.log(error);
          });
      },
    }
  }
</script>
<style scoped>
  .app-container {
    background: rgb(242, 242, 242);
  }

  .h-100 {
    height: 100%;
  }

  .grid-content {
    height: 100%;
    background: white;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 15px 12px;
  }

  .grid-content .el-tree {
    background: white;
  }

  .grid-content .title-label {
    font-family: "Microsoft YaHei";
    font-size: 28.667px;
    color: rgb(79, 129, 189);
    white-space: pre;
    text-decoration: none;
    font-weight: bold;
    user-select: initial;
  }
</style>
<style>
  /*树节点前面的图标修改*/
  .grid-content .el-tree .el-tree-node__expand-icon.expanded {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  .grid-content .el-tree .el-icon-caret-right:before {
    background: url(../../assets/layout-img/jiahao.png) no-repeat center center;
    content: "";
    display: block;
    width: 14px;
    height: 14px;
    font-size: 14px;
    background-size: 14px;
  }

  .grid-content
  .el-tree
  .el-tree-node__expand-icon.expanded.el-icon-caret-right:before {
    background: url(../../assets/layout-img/jianhao.png) no-repeat center center;
    content: "";
    display: block;
    width: 14px;
    height: 14px;
    font-size: 14px;
    background-size: 14px;
  }

  .grid-content .el-tree-node__expand-icon.is-leaf::before {
    display: none;
  }
</style>
