<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="5">
        <div class="pageH  boxShadow pd20 flexCulomn">
          <div class="treeContainer overflowY">
            <el-tree
              :data="treeData"
              @node-click="treeClick"
              node-key="id"
              highlight-current
              default-expand-all
              ref="ztrees"
              :expand-on-click-node="false">
                    <span class="custom-tree-node treeLine" slot-scope="{ node, data }"
                          @mouseenter="mouseenter(data)"
                          @mouseleave="mouseleave(data)">
                             <span class="textTreeNode">{{ node.label }}</span>
                        <!-- <span class="btnGroup">
                         <span class="">
                            <el-link v-show="data.show" v-if="data.level > 1" size="mini" type="danger" icon="el-icon-delete" @click.stop="deleteTree(data,node)" ></el-link>
                        </span>
                         <span class="">
                            <el-link v-show="data.show" v-if="data.level > 1" size="mini" style="margin:0 10px;" type="warning" icon="el-icon-edit" @click.stop="editTree(data)" ></el-link>

                        </span>
                        <span class="">
                            <el-link v-show="data.show" v-if="data.level<3 && data.level > 0" size="mini" type="success" icon="el-icon-circle-plus-outline" @click.stop="addFnc(data)" ></el-link>
                        </span>
                         </span> -->
                    </span>
            </el-tree>

          </div>
        </div>
      </el-col>
      <el-col :span="19">
        <div class="pageH  boxShadow pd20 ">
          <el-form inline size="mini" >
            <el-form-item>
              <el-input
                clearable class="wd16" v-model="severQuery.keyWord"
                placeholder="输入关键词"
              ></el-input>
            </el-form-item>
            <el-form-item >
              <el-button type="warning" class="el-icon-search" @click="search" >查询</el-button>
            </el-form-item>
            <el-form-item>
              <!-- <el-button type="primary"  icon="el-icon-plus" @click="openDialog(null)">添加</el-button> -->
              <PermissionButton size="mini" icon="el-icon-plus" label="添加" perms="1001" type="primary" @click="openDialog(null)" />
            </el-form-item>
            <el-form-item>
              <!-- <el-button type="danger"  icon="el-icon-delete" v-on:click="deleteBatch">批量删除</el-button> -->
              <PermissionButton size="mini" icon="el-icon-delete" label="批量删除" perms="1003" type="danger" @click="deleteBatch" />
            </el-form-item>
          </el-form>
          <el-table
            v-loading="listLoading"
            :height="tableHeight"
            :data="listData"
            element-loading-text="加载中..."
            border
            fit
            highlight-current-row
            @selection-change="handleSelectionChange"
            ref="tabs"

          >
            <el-table-column type="selection" align="center" width="55"></el-table-column>
            <el-table-column label="名称" align="center" prop="name"></el-table-column>
            <el-table-column label="课时" align="center" prop="classCount"></el-table-column>
            <el-table-column align="center" prop="cover" label="封面">
              <template slot-scope="scope">
                <div class="demo-image__preview">
                  <el-image
                    v-if="scope.row.cover"
                    style="width: 50px; height: 50px"
                    :src="photoFormatter(scope.row.cover)[0]"
                    :preview-src-list="photoFormatter(scope.row.cover)"
                  ></el-image>
                  <el-tag v-if="!scope.row.cover" size="mini">暂无</el-tag>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column label="介绍" align="center" prop="content" show-overflow-tooltip></el-table-column> -->
            <el-table-column align="center" label="介绍">
              <template slot-scope="scope">
                <el-link type="primary" @click="openInstructions(scope.row.content)">预览</el-link>
              </template>
            </el-table-column>
            
            <el-table-column label="开启防作弊" align="center">
              <template prop="antiCheating" slot-scope="{ row }">
                <el-tag v-if="row.antiCheating == null || row.antiCheating == 0" type="warning">不开启</el-tag>
                <el-tag v-if="row.antiCheating == 1" type="success"> 开启</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="防作弊间隔" align="center" prop="intervalTime"></el-table-column>
           
            <el-table-column label="是否上架" align="center">
              <template prop="shelves" slot-scope="{ row }">
                <el-tag v-if="row.shelves == null || row.shelves == 0" type="warning">未上架</el-tag>
                <el-tag v-if="row.shelves == 1" type="success"> 上架</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="140">
              <template slot-scope="{row}">
                <!-- <el-link type="primary" size="mini" icon="el-icon-edit" @click="editOne(row.trainingId)">编辑</el-link>
                <el-divider direction="vertical"></el-divider>
                <el-link type="danger" size="mini" icon="el-icon-delete" @click="deleteOne(row.trainingId)">删除</el-link> -->
                <PermissionLink size="mini" label="编辑" perms="1002" icon="el-icon-edit" type="primary" @click="editOne(row.trainingId)"/>
                <el-divider direction="vertical"></el-divider>
                <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="deleteOne(row.trainingId)"/>
              </template>
            </el-table-column>
          </el-table>
          <pagination style="margin-top:5px;"
                      :total="dataTotal"
                      :auto-scroll="false"
                      :pageSizes="[50, 100, 150, 200,300]"
                      :page.sync="severQuery.page"
                      :limit.sync="severQuery.size"
                      @pagination="fetchTabel"
          >
          </pagination>
        </div>
      </el-col>
    </el-row>
    <el-dialog
    v-dialogDrag
      :title="dVisibleTitle"
      :visible.sync="dVisible"
       width="1150px"
      :modal="true"
      :close-on-click-modal="false"
      :show-close="true"
    >
      <div style="height:500px">
      <el-form :model="addDormitoryModel" :rules="rules" label-position="right" ref="addDormitoryModelRef" label-width="160px" size="mini" class="form">

        
        <el-row :gutter="43">
          <el-col :span="12">
              <el-form-item label="名称:" prop="name">
                <el-input placeholder="请输入名称" class="w250" v-model="addDormitoryModel.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上架前端:" prop="shelves">
                <el-select v-model="addDormitoryModel.shelves" filterable placeholder="请选择是否上架前端" style="width: 250px;">
                  <el-option v-for="item in optionsIsRelease" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-form-item label="章节:" >
              <!-- <el-button type="primary" @click="createRow" size="mini" style=" margin-bottom: 10px">添加章</el-button> -->
              <el-link type="primary"  icon="el-icon-circle-plus" @click="createRow">添加章</el-link>
            </el-form-item>
          </el-row>
          <div v-for="(item,index) in optionTable" :key="index">
          <el-row>
            <el-col :span="24">
            <el-form-item :label="'第' + (index+1)+'章'" >
              <el-input placeholder="请输入章名称" class="w250" v-model="optionTable[index].chapterName"></el-input>
              <!-- <el-button type="primary" @click="createRow1(index)" size="mini" style=" margin-bottom: 10px">添加节</el-button> -->
              <el-link type="primary"  icon="el-icon-circle-plus"  @click="createRow1(index)">添加节</el-link>
              <el-link type="danger"  icon="el-icon-error" @click="handleDeleteOne(index)">删除</el-link>
            </el-form-item>
            </el-col>
            
          </el-row>
            <div v-for="(item,index1) in optionTable[index].children" :key="index1">
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="'第' + (index1+1)+'节'" >
                    <el-input placeholder="请输入节名称" class="w250" v-model="optionTable[index].children[index1].chapterName"></el-input>
                  </el-form-item>
                  </el-col>
                  <el-col :span="14">
                    <el-form-item >
                    <el-upload
                    class="avatar-uploader"
                    :action="baseImgURL+'/api/file/fileUpload'"
                    :show-file-list="false"
                    :headers="headers"
                    name="file"
                    :on-success="uploadSuccessTwo"
                    :on-error="uploadError"
                    :before-upload="beforeAvatarUpload"
                  >
                    <span v-if="optionTable[index].children[index1].fileName">{{optionTable[index].children[index1].fileName}}</span>
                     <el-button size="mini" @click="assignmentIndex(index, index1)">点击上传</el-button>
                  </el-upload>
                     

                    </el-form-item>
                    </el-col>
                    <el-col :span="2">
                  <!-- <el-button size="mini" type="danger" @click="handleDelete(index, index1)">删除</el-button> -->
                  <el-link type="danger"  icon="el-icon-error" @click="handleDelete(index, index1)">删除</el-link>
                  </el-col>
                    
                  </el-row>
            </div>
          </div>

          <el-row :gutter="43">
            <el-col :span="12">
              <el-form-item label="防作弊:" prop="antiCheating">
                <el-select v-model="addDormitoryModel.antiCheating" filterable placeholder="请选择是否开启防作弊" style="width: 250px;">
                  <el-option v-for="item in optionsAntiCheating" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          <el-col :span="12">
              <el-form-item label="防作弊时间（分钟）:" prop="intervalTime">
                <el-input-number placeholder="请输入防作弊时间" controls-position="right" class="w250" v-model="addDormitoryModel.intervalTime">
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
                <el-form-item label="上传封面">
                  <el-upload
                    class="avatar-uploader"
                    :action="baseImgURL+'/api/file/fileUpload'"
                    :show-file-list="false"
                    :headers="headers"
                    name="file"
                    accept=".png, .jpeg, .jpg"
                    :on-success="uploadSuccess"
                    :on-error="uploadError"
                    :before-upload="beforeAvatarUpload"
                  >
                    <img
                      v-if="addDormitoryModel.cover"
                      :src="addDormitoryModel.cover"
                      style="width: 40px;height: 40px;display: block;"
                    />
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                  </el-upload>
                </el-form-item>
              </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="23">
              <el-form-item label="课程介绍:">
                <tinymce style="width: 100%; " ref="editor" v-model="addDormitoryModel.content"></tinymce>
              </el-form-item>
            </el-col>
          </el-row>

      </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="dVisible = false">取 消</el-button>
          <el-button size="mini" type="primary" @click="dormitorySave()" :loading="loading">提 交</el-button>
        </div>
    </el-dialog>

    <el-dialog
    v-dialogDrag
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      title="介绍预览"
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
  import {
    sendPostByJson,
    sendPostByKeyValue
  } from '@/utils/httpUtils'
  import Pagination from "@/components/Pagination";
  import Tinymce from "@/components/TinymceTwo";

  export default {
    components: {
     Pagination,
     Tinymce,
    },
    data() {
      return {

        //模板下载URl
        downURl: undefined,

        //导入excel文件url
        url:undefined,
        header: {},

        loading: false,
        tableHeight: window.innerHeight - 190 + 'px',
        dataTotal: 0,
        severQuery: {
          page: 1,
          size: 50,
          keyWord: undefined,
          schoolId: undefined,
          buildingId: undefined,
          floorId: undefined,

        },
        optionsAntiCheating:[
        {
            value: 0,
            label: '不开启'
          }, {
            value: 1,
            label: '开启'
          }
    ],
        optionsIsRelease:[
        {
            value: 0,
            label: '不上架'
          }, {
            value: 1,
            label: '上架'
          }
    ],
    baseImgURL: "",
        searchUrl: undefined,
        listLoading: false,
        listData: [],
        treeData: [],
        fileList: [],
        dialogVisible: false,
        dialogTitle: '',
        addModal: {
          id: "",
          name: '',
          notic: ""
        },
        labelName: '',
        
        addType: undefined,
        addInfo: {},
        multiSelect: [],
        headers: {},
        dVisible: false,
        dormitoryModel: {},
        dormitoryModelRules: {
          name: [{required: true, message: '不能为空', trigger: 'blur'}],
          shelves: [{required: true, message: '不能为空', trigger: 'blur'}],
          antiCheating: [{required: true, message: '不能为空', trigger: 'blur'}],
          intervalTime: [{required: true, message: '不能为空', trigger: 'blur'}],
          dormitoryTypeId: [{required: true, message: '不能为空!', trigger: 'blur'}],
        },
        rules: {
          name: [{required: true, message: '不能为空', trigger: 'blur'}],
          shelves: [{required: true, message: '不能为空', trigger: 'blur'}],
          antiCheating: [{required: true, message: '不能为空', trigger: 'blur'}],
          intervalTime: [{required: true, message: '不能为空', trigger: 'blur'}],
          dormitoryTypeId: [{required: true, message: '不能为空!', trigger: 'blur'}],
      },

      instructionsForm:{
        instructions: '',
    },

    instructionsState: false,
        addDormitoryModel: {
          name: "",
          notice: '',
          cover: '',
          dormitoryTypeId: undefined,
          chapterArr: [],
        },
        deviceList: [],
        currentData: undefined,
        editVisible: false,
        dVisibleTitle:"",//编辑宿舍名称

        dorTypeList: [],
        // 动态表
        optionTable: [],
        chapterList:[],
        chapterMap:{},
        index:"",
        index1:"",
      }
    },
    created() {
      this.fetchAreaTreeData()
      //excel相关参数获取
      this.header = {
        Token: this.$store.state.user.token,
      };

    },
    
    mounted: async function () {
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
  },
    methods: {
       handleChange(index,index1,file, fileList) {
        this.optionTable[index].children[index1].fileList = fileList.slice(-3);
      },

      // 动态行相关的方法
      createRow() {
        var list = {
          chapterName: '',
          children:[]
        }
        this.optionTable.push(list)
      },
       // 动态行相关的方法
      createRow1(index) {
        
        var list = {
          chapterName: '',
          fileUrl: '',
          fileName: '',
        }
        this.optionTable[index].children.push(list);
        // console.log(this.optionTable)
      },
      handleDeleteOne(index) {
        // 模态框删除按钮
        this.$confirm('是否确认删除本条数据，删除后不可恢复?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          // 此为假删除，只是删除了模态框中当前行的数据，并没有真正删除表格数据
          this.optionTable.splice(index, 1)
        })
      },

      openInstructions(content) {
      this.instructionsForm.instructions=content
      this.instructionsState = true;

    },


      handleDelete(index, index1) {
        // 模态框删除按钮
        this.$confirm('是否确认删除本条数据，删除后不可恢复?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          // 此为假删除，只是删除了模态框中当前行的数据，并没有真正删除表格数据
          this.optionTable[index].children.splice(index1, 1)
        })
      },

     
      async fetchAreaTreeData() {
        const res = await sendPostByKeyValue('/Training/getTreeModalList')
        if (res) {
          if(res.data){
            this.treeData= [{
              "level": -1,
              "id": -1,
              "label": "全部",
              "children":res.data?res.data:''
            }]
          }else{
            this.treeData = []
          }
          //this.treeData=res.data?res.data:[]
          if (this.treeData && this.treeData.length > 0) {
            const data = this.treeData[0]
            this.treeClick(data, null, null)
            this.$nextTick(() => {
              this.$refs.ztrees.setCurrentKey(data.id)
            })
          }
        }
      },
      uploadSuccess(response, file, fileList) {
      if (response) {
        this.addDormitoryModel.cover = this.baseImgURL + response.data.fileUrl;
      }
    },
    uploadSuccessTwo(response, file, fileList) {
      if (response) {
        this.optionTable[this.index].children[this.index1].fileUrl = this.baseImgURL + response.data.fileUrl;
        this.optionTable[this.index].children[this.index1].fileName = response.data.fileName;
      }
    },

    assignmentIndex(index,index1) {
        this.index = index;
        this.index1 = index1;
    },

    uploadError(err, file, fileList) {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 100;

      if (!isLt2M) {
        this.$message.error("上传文件大小不能超过 100MB!");
      }
      return isLt2M;
    },

      mouseenter(data) {
        this.$set(data, "show", true);
      },
      mouseleave(data) {
        this.$set(data, "show", false);
      },
      treeClick(data, node, el) {
        this.currentData = data;
        let url = ""

        switch (data.level) {
          case -1:
            this.severQuery.selectType = null
            url="/Training/findByParam"
            break;
          case 1:

            this.severQuery.professionId = data.id
            this.severQuery.selectType = 1

            url = "/Training/findByParam"
            break;
          case 2:

            this.severQuery.professionId = data.id
            this.severQuery.selectType = 2

            url = "/Training/findByParam"
            break;
         
          default:
            break;
        }
        if (url) {
          this.searchUrl = url
          this.getDormitoryById(url)
        }
      },
      async getDormitoryById(url) {
        const res = await sendPostByKeyValue(url, this.severQuery)
        if (res) {

          this.listData = res.data.list
          this.dataTotal = res.data.total
          this.$nextTick(() => {
            if (this.currentData.id) {

              this.$refs.ztrees.setCurrentKey(this.currentData.id)
            }
          })
        }
      },
      fetchTabel() {
        if (this.searchUrl) {
          this.getDormitoryById(this.searchUrl)
        }

      },
      search() {
        this.fetchTabel()
      },

      photoFormatter(pictures) {
      if (pictures != null && pictures != "") {
        return pictures.split(",");
      }
      return [];
    },
      
      
      handleSelectionChange(v) {
        this.multiSelect = v
      },
      editOne(id) {
        this.dVisibleTitle = "编辑课程"
        this.optionTable = [];
        this.dVisible = true
        if (id) {
          //获取详情
          this.getDetailById(id)
        }
      },

      async getDetailById(id) {

        const url = "/Training/detail"
        const res = await sendPostByKeyValue(url, {'id': id})

        if (res) {
          this.addDormitoryModel = res.data;
          this.optionTable = res.data.treeChapterParams;
        }
      },

      async deleteOne(id) {
        console.log("yes")
        this.$confirm('确定要删除该记录', '确认', {
          distinguishCancelAndClose: true,
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        }).then(async () => {
          console.log("yes")

          const url = "/Training/delete"
          try {
            const res = await sendPostByKeyValue(url, {id})
            if (res) {
              this.$message({type: "success", 'message': '删除成功!'})
              this.fetchTabel()
            }

          } catch (error) {
            this.$message({type: "error", 'message': '删除失败!'})
          }

        }).catch(() => {

        })
      },
      deleteBatch() {
        if (this.multiSelect.length == 0) {
          return this.$message({type: 'warning', message: "请选择要删除的内容!"})
        }
        this.$confirm('确定删除选中内容？', '确认', {
          distinguishCancelAndClose: true,
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        })
          .then(async () => {
            const url = "/Training/deletes"
            const ids = this.multiSelect.map(v => v.trainingId).join(',')

            try {

              const res = await sendPostByKeyValue(url, {"ids": ids})
              if (res) {

                this.fetchTabel()
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                });
              }
            } catch (error) {
              this.$message({
                type: 'error',
                message: '删除失败!'
              });
            }
          })
          .catch(action => {

          });
      },
      async openDialog(id) {
        if (this.currentData.level !== 2) {
          return this.$message({type: "error", message: "请选择二级专业"})
        }
        this.optionTable = [];
        this.addDormitoryModel = {
          name: "",
          notice: '',
          cover: '',
          deviceId: "",
        }
        this.dormitoryModel.dormitoryId = undefined
        this.dVisibleTitle = "添加课程"
        this.dVisible = true
        this.$nextTick(() => {
          this.$refs.addDormitoryModelRef.clearValidate()
        })
      },
     
     async dormitorySave() {
      this.loading = true
      const url = "/Training/saveTraining";
      this.addDormitoryModel.treeChapterParams = this.optionTable;
      if(this.addDormitoryModel.trainingId){

      }else{
      this.addDormitoryModel.professionId = this.currentData.id;
      }
      const response = await sendPostByJson(url, this.addDormitoryModel);
      if (response) {
        this.search();
            this.$message({
              type: "success",
              message: "操作成功",
            });
      }
        this.loading = false;
            this.dVisible = false
            this.fetchTabel()
    },

      
    }
  }
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
