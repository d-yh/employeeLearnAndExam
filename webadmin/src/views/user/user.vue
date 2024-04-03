<template>
  <div class="app-container">
    <el-form :inline="true" size="mini">
      <!-- <el-form-item>
        <el-button type="danger" icon="el-icon-delete" @click="deletes">批量删除</el-button>
      </el-form-item> -->
      <el-form-item>
        <el-select v-model="serverQuerey.country" @keyup.enter.native="search" clearable filterable placeholder="请选择国家">
            <el-option v-for="item in optionsCountry" :key="item.label" :label="item.label" :value="item.label">
            </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="serverQuerey.projectPowerId" @keyup.enter.native="search" clearable filterable placeholder="请选择项目">
            <el-option v-for="item in optionsProjectPower" :key="item.projectPowerId" :label="item.name" :value="item.projectPowerId">
            </el-option>
        </el-select>
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
        >
        </el-cascader>
    </el-form-item>
    <el-form-item >
          <el-input type="text" placeholder="工号" clearable v-model="serverQuerey.workNumber"></el-input>
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
      <el-form-item>
        <PermissionButton size="mini" icon="el-icon-download" label="导入模板下载" perms="1001" type="primary" @click="downloadTeplate" />
      </el-form-item>

      <el-form-item>
          <el-upload
            :action="baseImgURL+'/api/user/importUser'"
            :show-file-list="false"
            :headers="headers"
            name="file"
            accept=".xls"
            :on-success="uploadTitleSuccessTwo"
            :before-upload="uploadExcelBefore"
          >
            <PermissionButton size="mini" icon="el-icon-position" label="导入" perms="1001" type="primary" />
          </el-upload>
        </el-form-item>

    </el-form>
    <div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="全部" name="first"></el-tab-pane>
        <el-tab-pane label="待分配" name="second"></el-tab-pane>
        <el-tab-pane label="已分配" name="third"></el-tab-pane>
      </el-tabs>

      <el-table
        v-loading="listLoading"
        :height="tableHeight"
        :data="tables0"
        border
        fit
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection" align="center" width="55"></el-table-column> -->
         <el-table-column type="expand">
            <template slot-scope="props">
                <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="工号:">
                    <span>{{ props.row.workNumber }}</span>
                </el-form-item>
                <el-form-item label="姓名:">
                    <span>{{ props.row.nickname }}</span>
                </el-form-item>
                <el-form-item label="专业:">
                    <span>{{ props.row.professionName }}</span>
                </el-form-item>
                <el-form-item label="类型:">
                    <span v-if="props.row.workType == null || props.row.workType == 0">内部员工</span>
                    <span v-if="props.row.workType == 1">外包员工</span>
                    <span v-if="props.row.workType == 2">管理员</span>
                </el-form-item>
                <el-form-item label="职称:">
                    <span>{{ props.row.workCodeName }}</span>
                </el-form-item>
                <el-form-item label="项目组归属:">
                    <span>{{ props.row.projectName }}</span>
                </el-form-item>
                <el-form-item label="手机号:">
                    <span>{{ props.row.mobile }}</span>
                </el-form-item>
                <el-form-item label="身份证号:">
                    <span>{{ props.row.idCard }}</span>
                </el-form-item>
                <el-form-item label="民族:">
                    <span>{{ props.row.national }}</span>
                </el-form-item>
                <el-form-item label="性别:">
                    <span v-if="props.row.gender == null || props.row.gender == 0">男</span>
                    <span v-if="props.row.gender == 1">女</span>
                </el-form-item>
                </el-form>
            </template>
    </el-table-column>
       <el-table-column align="center" prop="workNumber" label="工号"></el-table-column>
        <el-table-column align="center" prop="nickname" label="姓名"></el-table-column>
        <el-table-column align="center" prop="photo" label="照片">
          <template slot-scope="scope">
            <div class="demo-image__preview">
              <el-image
                v-if="scope.row.photo"
                style="width: 50px; height: 50px"
                :src="photoFormatter(scope.row.photo)[0]"
                :preview-src-list="photoFormatter(scope.row.photo)"
              ></el-image>
              <el-tag v-if="!scope.row.photo" size="mini">暂无</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="professionName" label="专业"></el-table-column>
        <el-table-column align="center" prop="workCodeName" label="作业层等级"></el-table-column>
        <el-table-column label="类型" align="center">
        <template prop="workType" slot-scope="{ row }">
          <el-tag v-if="row.workType == null || row.workType == 0" type="success">内部员工</el-tag>
          <el-tag v-if="row.workType == 1" type="warning"> 外包员工</el-tag>
          <el-tag v-if="row.workType == 2"> 管理员</el-tag>
        </template>
      </el-table-column>
        <el-table-column align="center" prop="projectName" label="参与项目"></el-table-column>
        <el-table-column align="center" prop="roleName" label="权限角色"></el-table-column>
        <el-table-column label="操作" align="center" width="300">
          <template slot-scope="scope">
            <PermissionLink size="mini" label="编辑" perms="1002" icon="el-icon-edit" type="primary" @click="getById(scope.row.userId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="重置密码" perms="1011" type="info" @click="resetPassword(scope.row.userId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="删除" perms="1003" icon="el-icon-delete" type="danger" @click="delById(scope.row.userId)"/>
            <el-divider direction="vertical"></el-divider>
            <PermissionLink size="mini" label="加入黑名单" perms="1012" type="info" @click="addBlacklist(scope.row.userId)"/>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:15px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="serverQuerey.page"
        :page-sizes="[20,40, 60, 80, 100]"
        :page-size.sync="serverQuerey.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="serverQuerey.total"
      ></el-pagination>
    </div>
    <el-dialog
    v-dialogDrag
      :modal-append-to-body="false"
      title="记录信息"
      width="800px"
      :visible.sync="dialogBaseFlag"
      :lock-scroll="false"
    >
      <div class="div_center">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="95px" size="mini">
          <el-row :gutter="30">


              <el-col :span="12">
              <el-form-item label="工号" prop="workNumber">
                <el-input placeholder="请输入工号" class="w250" v-model="ruleForm.workNumber"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名" prop="nickname">
                <el-input placeholder="请输入姓名" class="w250" v-model="ruleForm.nickname"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-select v-model="ruleForm.gender" filterable placeholder="请选择性别" style="width: 250px;">
                  <el-option v-for="item in optionsGender" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="idCard">
                <el-input placeholder="请输入身份证号" class="w250" v-model="ruleForm.idCard"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="mobile">
                <el-input placeholder="请输入手机号" class="w250" v-model="ruleForm.mobile"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="民族" prop="national">
                <el-select v-model="ruleForm.national" filterable placeholder="请选择民族" style="width: 250px;">
                  <el-option v-for="item in optionsNational" :key="item.info" :label="item.info" :value="item.info">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出生日期">
                <el-date-picker
                  style="width: 250px;"
                  v-model="ruleForm.birthDate"
                  type="date"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  placeholder="选择出生日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所在国家" prop="country">
                <el-select v-model="ruleForm.country" filterable placeholder="请选择所在国家" style="width: 250px;">
                  <el-option v-for="item in optionsCountry" :key="item.label" :label="item.label" :value="item.label">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="籍贯" prop="nativePlace">
                <el-cascader
                  style="width: 250px;"
                  placeholder="请选择省市"
                  :options="optionsCity"
                  v-model="ruleForm.nativePlace">
                </el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="户口性质" prop="householdRegister">
                <el-select v-model="ruleForm.householdRegister" filterable placeholder="请选择所在国家" style="width: 250px;">
                  <el-option v-for="item in optionsRegister" :key="item.label" :label="item.label" :value="item.label">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="户口地址" prop="residence">
                <el-cascader
                  style="width: 250px;"
                  placeholder="请选择省市区/县"
                  :options="optionsRegion"
                  v-model="ruleForm.residence"
                >
                </el-cascader>
              </el-form-item>
            </el-col>
            
            
            <el-col :span="12">
              <el-form-item  label="详细地址" prop="residenceDetail">
                <el-popover
                  placement="bottom"
                  width="100"
                  trigger="manual"
                  v-model="tipVisible">
                  <div style="color: red;font-size: 13px">{{tip}}</div>
                  <el-input slot="reference" class="w250" placeholder="详细地址"  @change="regionChange" v-model="ruleForm.residenceDetail"></el-input>
                </el-popover>
              </el-form-item>
            </el-col>

            <!-- <el-col :span="12">
              <el-form-item label="账号" prop="username">
                <el-input placeholder="请输入账号" class="w250" v-model="ruleForm.username"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input placeholder="请输入邮箱" class="w250" v-model="ruleForm.email"></el-input>
              </el-form-item>
            </el-col> -->

            <el-col :span="24">
              <el-form-item label="头像">
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
                    v-if="ruleForm.photo"
                    :src="ruleForm.photo"
                    style="width: 40px;height: 40px;display: block;"
                  />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </el-form-item>
            </el-col>


            <el-col :span="12">
              <el-form-item label="类型" prop="workType">
                <el-select v-model="ruleForm.workType" filterable placeholder="请选择类型" style="width: 250px;">
                  <el-option v-for="item in optionsWorkType" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
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
                   >
                </el-cascader>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="作业层" prop="workCode">
                <el-select v-model="ruleForm.workCode" filterable placeholder="请选择作业层" style="width: 250px;">
                  <el-option v-for="item in optionsWorkCode" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="学历层" prop="degreeCode">
                <el-select v-model="ruleForm.degreeCode" filterable placeholder="请选择学历层" style="width: 250px;">
                  <el-option v-for="item in optionsDegreeCode" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="职称图片">
                <el-upload
                  class="avatar-uploader"
                  :action="baseImgURL+'/api/file/fileUpload'"
                  :show-file-list="false"
                  :headers="headers"
                  name="file"
                  accept=".png, .jpeg, .jpg"
                  :on-success="uploadTitleSuccess"
                  :on-error="uploadError"
                  :before-upload="beforeAvatarUpload"
                >
                  <img
                    v-if="ruleForm.titlePhoto"
                    :src="ruleForm.titlePhoto"
                    style="width: 40px;height: 40px;display: block;"
                  />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </el-form-item>
            </el-col>


            <el-col :span="24">
              <el-form-item label="角色">
                <el-checkbox-group v-model="checkedRoleIds">
                  <el-checkbox
                    v-for="item in roleList"
                    :label="item.value"
                    :key="item.value"
                  >{{item.label}}</el-checkbox>
                </el-checkbox-group>
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
import {
  checkIsMobile,
  checkIsIdCard,
  checkIsInteger,
  checkIsNull
} from "@/utils/formatCheck";
const { provinceAndCityData,regionData,CodeToText,TextToCode} = require('element-china-area-data/dist/app.commonjs')
export default {
  data() {
    let isMobileNumber = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入电话号码"));
      } else {
        const reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
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
      tableHeight: window.innerHeight -240+"px",
      keyword:'',
      serverQuerey: {
        username: "",
        nickname: "",
        mobile: "",
        total: 0,
        page: 1,
        size: 20,
      },
      optionsGender:[
        {
            value: 0,
            label: '男'
          }, {
            value: 1,
            label: '女'
          }
    ],

    optionsNational:[
        {
          info: "汉族",
          value: 1,
        },
        {
          info: "壮族",
          value: 2,
        },
        {
          info: "满族",
          value: 3,
        },
        {
          info: "回族",
          value: 4,
        },
        {
          info: "苗族",
          value: 5,
        },
        {
          info: "维吾尔族",
          value: 6,
        },
        {
          info: "土家族",
          value: 7,
        },
        {
          info: "彝族",
          value: 8,
        },
        {
          info: "蒙古族",
          value: 9,
        },
        {
          info: "藏族",
          value: 10,
        },
        {
          info: "布依族",
          value: 11,
        },
        {
          info: "侗族",
          value: 12,
        },
        {
          info: "瑶族",
          value: 13,
        },
        {
          info: "朝鲜族",
          value: 14,
        },
        {
          info: "白族",
          value: 15,
        },
        {
          info: "哈尼族",
          value: 16,
        },
        {
          info: "哈萨克族",
          value: 17,
        },
        {
          info: "黎族",
          value: 18,
        },
        {
          info: "傣族",
          value: 19,
        },
        {
          info: "畲族",
          value: 20,
        },
        {
          info: "傈僳族",
          value: 21,
        },
        {
          info: "仡佬族",
          value: 22,
        },
        {
          info: "东乡族",
          value: 23,
        },
        {
          info: "高山族",
          value: 24,
        },
        {
          info: "拉祜族",
          value: 25,
        },
        {
          info: "水族",
          value: 26,
        },
        {
          info: "佤族",
          value: 27,
        },
        {
          info: "纳西族",
          value: 28,
        },
        {
          info: "羌族",
          value: 29,
        },
        {
          info: "土族",
          value: 30,
        },
        {
          info: "仫佬族",
          value: 31,
        },
        {
          info: "锡伯族",
          value: 32,
        },
        {
          info: "柯尔克孜族",
          value: 33,
        },
        {
          info: "达斡尔族",
          value: 34,
        },
        {
          info: "景颇族",
          value: 35,
        },
        {
          info: "毛南族",
          value: 36,
        },
        {
          info: "撒拉族",
          value: 37,
        },
        {
          info: "布朗族",
          value: 38,
        },
        {
          info: "塔吉克族",
          value: 39,
        },
        {
          info: "阿昌族",
          value: 40,
        },
        {
          info: "普米族",
          value: 41,
        },
        {
          info: "鄂温克族",
          value: 42,
        },
        {
          info: "怒族",
          value: 43,
        },
        {
          info: "京族",
          value: 44,
        },
        {
          info: "基诺族",
          value: 45,
        },
        {
          info: "德昂族",
          value: 46,
        },
        {
          info: "保安族",
          value: 47,
        },
        {
          info: "俄罗斯族",
          value: 48,
        },
        {
          info: "裕固族",
          value: 49,
        },
        {
          info: "乌孜别克族",
          value: 50,
        },
        {
          info: "门巴族",
          value: 51,
        },
        {
          info: "鄂伦春族",
          value: 52,
        },
        {
          info: "独龙族",
          value: 53,
        },
        {
          info: "塔塔尔族",
          value: 54,
        },
        {
          info: "赫哲族",
          value: 55,
        },
        {
          info: "珞巴族",
          value: 56,
        },
    ],
    optionsProjectPower:[],
    optionsCountry:[
        {value:'China',label:'中国'},
        {value:'United States of America',label:'美国'},
        {value:'Germany',label:'德国'},
        {value:'Japan',label:'日本'},
        {value:'Korea',label:'韩国'},
        {value:'Belarus',label:'白俄罗斯'},
        {value:'India',label:'印度'},
        {value:'Indonesia',label:'印度尼西亚'},
        {value:'Angola',label:'安哥拉'},
        {value:'Afghanistan',label:'阿富汗'},
        {value:'Albania',label:'阿尔巴尼亚'},
        {value:'Algeria',label:'阿尔及利亚'},
        {value:'Andorra',label:'安道尔共和国'},
        {value:'Anguilla',label:'安圭拉岛'},
        {value:'Antigua and Barbuda',label:'安提瓜和巴布达'},
        {value:'Argentina',label:'阿根廷'},
        {value:'Armenia',label:'亚美尼亚'},
        {value:'Ascension',label:'阿森松'},
        {value:'Australia',label:'澳大利亚'},
        {value:'Austria',label:'奥地利'},
        {value:'Azerbaijan',label:'阿塞拜疆'},
        {value:'Bahamas',label:'巴哈马'},
        {value:'Bahrain',label:'巴林'},
        {value:'Bangladesh',label:'孟加拉国'},
        {value:'Barbados',label:'巴巴多斯'},
        {value:'Belgium',label:'比利时'},
        {value:'Belize',label:'伯利兹'},
        {value:'Benin',label:'贝宁'},
        {value:'Bermuda Is',label:'百慕大群岛'},
        {value:'Bolivia',label:'玻利维亚'},
        {value:'Botswana',label:'博茨瓦纳'},
        {value:'Brazil',label:'巴西'},
        {value:'Brunei',label:'文莱'},
        {value:'Bulgaria',label:'保加利亚'},
        {value:'Burkina Faso',label:'布基纳法索'},
        {value:'Burma',label:'缅甸'},
        {value:'Burundi',label:'布隆迪'},
        {value:'Cameroon',label:'喀麦隆'},
        {value:'Canada',label:'加拿大'},
        {value:'Cayman Is',label:'开曼群岛'},
        {value:'Central African Republic',label:'中非共和国'},
        {value:'Chad',label:'乍得'},
        {value:'Chile',label:'智利'},
        {value:'Colombia',label:'哥伦比亚'},
        {value:'Congo',label:'刚果'},
        {value:'Cook Is',label:'库克群岛'},
        {value:'Costa Rica',label:'哥斯达黎加'},
        {value:'Cuba',label:'古巴'},
        {value:'Cyprus',label:'塞浦路斯'},
        {value:'Czech Republic',label:'捷克'},
        {value:'Denmark',label:'丹麦'},
        {value:'Djibouti',label:'吉布提'},
        {value:'Dominica Rep',label:'多米尼加共和国'},
        {value:'Ecuador',label:'厄瓜多尔'},
        {value:'Egypt',label:'埃及'},
        {value:'EI Salvador',label:'萨尔瓦多'},
        {value:'Estonia',label:'爱沙尼亚'},
        {value:'Ethiopia',label:'埃塞俄比亚'},
        {value:'Fiji',label:'斐济'},
        {value:'Finland',label:'芬兰'},
        {value:'France',label:'法国'},
        {value:'French Guiana',label:'法属圭亚那'},
        {value:'French Polynesia',label:'法属玻利尼西亚'},
        {value:'Gabon',label:'加蓬'},
        {value:'Gambia',label:'冈比亚'},
        {value:'Georgia',label:'格鲁吉亚'},
        {value:'Ghana',label:'加纳'},
        {value:'Gibraltar',label:'直布罗陀'},
        {value:'Greece',label:'希腊'},
        {value:'Grenada',label:'格林纳达'},
        {value:'Guam',label:'关岛'},
        {value:'Guatemala',label:'危地马拉'},
        {value:'Guinea',label:'几内亚'},
        {value:'Guyana',label:'圭亚那'},
        {value:'Haiti',label:'海地'},
        {value:'Honduras',label:'洪都拉斯'},
        {value:'Hungary',label:'匈牙利'},
        {value:'Iceland',label:'冰岛'},
        {value:'Iran',label:'伊朗'},
        {value:'Iraq',label:'伊拉克'},
        {value:'Ireland',label:'爱尔兰'},
        {value:'Israel',label:'以色列'},
        {value:'Italy',label:'意大利'},
        {value:'Ivory Coast',label:'科特迪瓦'},
        {value:'Jamaica',label:'牙买加'},
        {value:'Jordan',label:'约旦'},
        {value:'Kampuchea (Cambodia )',label:'柬埔寨'},
        {value:'Kazakstan',label:'哈萨克斯坦'},
        {value:'Kenya',label:'肯尼亚'},
        {value:'Kuwait',label:'科威特'},
        {value:'Kyrgyzstan',label:'吉尔吉斯坦'},
        {value:'Laos',label:'老挝'},
        {value:'Latvia',label:'拉脱维亚'},
        {value:'Lebanon',label:'黎巴嫩'},
        {value:'Lesotho',label:'莱索托'},
        {value:'Liberia',label:'利比里亚'},
        {value:'Libya',label:'利比亚'},
        {value:'Liechtenstein',label:'列支敦士登'},
        {value:'Lithuania',label:'立陶宛'},
        {value:'Luxembourg',label:'卢森堡'},
        {value:'Madagascar',label:'马达加斯加'},
        {value:'Malawi',label:'马拉维'},
        {value:'Malaysia',label:'马来西亚'},
        {value:'Maldives',label:'马尔代夫'},
        {value:'Mali',label:'马里'},
        {value:'Malta',label:'马耳他'},
        {value:'Mariana Is',label:'马里亚那群岛'},
        {value:'Martinique',label:'马提尼克'},
        {value:'Mauritius',label:'毛里求斯'},
        {value:'Mexico',label:'墨西哥'},
        {value:'Moldova',label:'摩尔多瓦'},
        {value:'Monaco',label:'摩纳哥'},
        {value:'Mongolia',label:'蒙古'},
        {value:'Montserrat Is',label:'蒙特塞拉特岛'},
        {value:'Morocco',label:'摩洛哥'},
        {value:'Mozambique',label:'莫桑比克'},
        {value:'Namibia',label:'纳米比亚'},
        {value:'Nauru',label:'瑙鲁'},
        {value:'Nepal',label:'尼泊尔'},
        {value:'Netheriands Antilles',label:'荷属安的列斯'},
        {value:'Netherlands',label:'荷兰'},
        {value:'New Zealand',label:'新西兰'},
        {value:'Nicaragua',label:'尼加拉瓜'},
        {value:'Niger',label:'尼日尔'},
        {value:'Nigeria',label:'尼日利亚'},
        {value:'North Korea',label:'朝鲜'},
        {value:'Norway',label:'挪威'},
        {value:'Oman',label:'阿曼'},
        {value:'Pakistan',label:'巴基斯坦'},
        {value:'Panama',label:'巴拿马'},
        {value:'Papua New Cuinea',label:'巴布亚新几内亚'},
        {value:'Paraguay',label:'巴拉圭'},
        {value:'Peru',label:'秘鲁'},
        {value:'Philippines',label:'菲律宾'},
        {value:'Poland',label:'波兰'},
        {value:'Portugal',label:'葡萄牙'},
        {value:'Puerto Rico',label:'波多黎各'},
        {value:'Qatar',label:'卡塔尔'},
        {value:'Reunion',label:'留尼旺'},
        {value:'Romania',label:'罗马尼亚'},
        {value:'Russia',label:'俄罗斯'},
        {value:'Saint Lueia',label:'圣卢西亚'},
        {value:'Saint Vincent',label:'圣文森特岛'},
        {value:'Samoa Eastern',label:'东萨摩亚(美)'},
        {value:'Samoa Western',label:'西萨摩亚'},
        {value:'San Marino',label:'圣马力诺'},
        {value:'Sao Tome and Principe',label:'圣多美和普林西比'},
        {value:'Saudi Arabia',label:'沙特阿拉伯'},
        {value:'Senegal',label:'塞内加尔'},
        {value:'Seychelles',label:'塞舌尔'},
        {value:'Sierra Leone',label:'塞拉利昂'},
        {value:'Singapore',label:'新加坡'},
        {value:'Slovakia',label:'斯洛伐克'},
        {value:'Slovenia',label:'斯洛文尼亚'},
        {value:'Solomon Is',label:'所罗门群岛'},
        {value:'Somali',label:'索马里'},
        {value:'South Africa',label:'南非'},
        {value:'Spain',label:'西班牙'},
        {value:'SriLanka',label:'斯里兰卡'},
        {value:'St.Vincent',label:'圣文森特'},
        {value:'Sudan',label:'苏丹'},
        {value:'Suriname',label:'苏里南'},
        {value:'Swaziland',label:'斯威士兰'},
        {value:'Sweden',label:'瑞典'},
        {value:'Switzerland',label:'瑞士'},
        {value:'Syria',label:'叙利亚'},
        {value:'Tajikstan',label:'塔吉克斯坦'},
        {value:'Tanzania',label:'坦桑尼亚'},
        {value:'Thailand',label:'泰国'},
        {value:'Togo',label:'多哥'},
        {value:'Tonga',label:'汤加'},
        {value:'Trinidad and Tobago',label:'特立尼达和多巴哥'},
        {value:'Tunisia',label:'突尼斯'},
        {value:'Turkey',label:'土耳其'},
        {value:'Turkmenistan',label:'土库曼斯坦'},
        {value:'Uganda',label:'乌干达'},
        {value:'Ukraine',label:'乌克兰'},
        {value:'United Arab Emirates',label:'阿拉伯联合酋长国'},
        {value:'United Kiongdom',label:'英国'},
        {value:'Uruguay',label:'乌拉圭'},
        {value:'Uzbekistan',label:'乌兹别克斯坦'},
        {value:'Venezuela',label:'委内瑞拉'},
        {value:'Vietnam',label:'越南'},
        {value:'Yemen',label:'也门'},
        {value:'Yugoslavia',label:'南斯拉夫'},
        {value:'Zimbabwe',label:'津巴布韦'},
        {value:'Zaire',label:'扎伊尔'},
        {value:'Zambia',label:'赞比亚'}
    ],
    optionsRegister:[
      {value:'0',label:'城镇'},
      {value:'1',label:'农村'},
    ],
    optionsWorkType:[
        {
            value: 0,
            label: '内部员工'
          }, {
            value: 1,
            label: '外包员工'
          }, {
            value: 2,
            label: '管理员'
          }
    ],
    optionsDegreeCode:[
    ],
    optionsWorkCode:[
    ],
    optionsProfession:[

    ],
      optionsCity:provinceAndCityData,
      optionsRegion: regionData,
      dialogBaseFlag: false,
      listLoading: false,
      submitButtonFlag: false,
      baseImgURL: "",
      headers: {},
      listData: [],
      roleList: [],
      activeName: 'first',
      checkedRoleIds: [],
      multipleSelection: [],
      ruleForm: {
        photo: "",
        titlePhoto: "",
        nickname: "",
        mobile: "",
        residenceDetail: "",
        professionEcho:[],
        nativePlace:[]
      },
      rules: {
        workNumber: [{ required: true, message: "不能为空", trigger: "blur" },],
        nickname: [{ required: true, message: "不能为空", trigger: "blur" },],
        gender: [{ required: true, message: "不能为空", trigger: "blur" },],
        idCard: [{ required: true, message: "不能为空", trigger: "blur" },],
        national: [{ required: true, message: "不能为空", trigger: "blur" },],
        birthDate: [{ required: true, message: "不能为空", trigger: "blur" },],
        country: [{ required: true, message: "不能为空", trigger: "blur" },],
        nativePlace: [{ required: true, message: "不能为空", trigger: "blur" },],
        residence: [{ required: true, message: "不能为空", trigger: "blur" },],
        residenceDetail:[{ required: true, message: "不能为空", trigger: "blur" },],
        workType: [{ required: true, message: "不能为空", trigger: "blur" },],
        professionEcho: [{ required: true, message: "不能为空", trigger: "blur" },],
        workCode: [{ required: true, message: "不能为空", trigger: "blur" },],
        degreeCode: [{ required: true, message: "不能为空", trigger: "blur" },],
        mobile: [
          { required: true, message: "不能为空", trigger: "blur" },
          { validator: isMobileNumber, trigger: "blur" },
        ],

      },
      nativePlace:[],
      tip:"警告",
      tipVisible:false
    };
  },
  mounted: async function () {
    await this.initFun();
    this.baseImgURL = process.env.VUE_APP_BASE_IMG;
    this.headers = {
      Token: this.$store.state.user.token,
    };
    this.search();
    this.degreeCodeSearch();
    this.workCodeSearch();
    this.professionSearch();
    this.selectAllProjectPower();
  },
  computed: {
    tables0: function () {
      var keyword = this.keyword;
      if (keyword) {
        return this.listData.filter(function (item) {
            return (
                item["workNumber"].indexOf(keyword)!=-1
                ||item["nickname"].indexOf(keyword)!=-1
                ||item["professionName"].indexOf(keyword)!=-1
                ||item["workCodeName"].indexOf(keyword)!=-1
                ||item["roleName"].indexOf(keyword)!=-1
                );
        });
      }
      return this.listData;
    },
  },
  methods: {

    downloadTeplate() {
        window.open('static/员工导入模板.xls', '_blank');
      },

      //项目  optionsProjectPower
      async selectAllProjectPower() {
      const url = "/ProjectPower/selectAllProjectPower";
      const response = await sendPostByKeyValue(url,null)
      if (response) {
        this.optionsProjectPower = response.data;
      }
    },


      //学历层
        async degreeCodeSearch() {
      const url = "/BasicConfig/findAllListNoPage";
      const response = await sendPostByKeyValue(url,{ type: 0})
      if (response) {
        this.optionsDegreeCode = response.data;
      }
    },
      //作业层
      async workCodeSearch() {
      const url = "/BasicConfig/findAllListNoPage";
      const response = await sendPostByKeyValue(url,{ type: 1})
      if (response) {
        this.optionsWorkCode = response.data;
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

    handleClick(tab, event) {
        // console.log(tab, event);
        // console.log(this.activeName);
        if(this.activeName == "first"){
          this.serverQuerey.distributionState = '';
          this.search();
        }
        if(this.activeName == "second"){
          this.serverQuerey.distributionState = 0;
          this.search();
        }
        if(this.activeName == "third"){
          this.serverQuerey.distributionState = 1;
          this.search();
        }
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

    initFun() {
      //查询角色
      sendPostByKeyValue("/role/getKeyValue")
        .then((response) => {
          if (response.code == 200) {
            this.roleList = response.data;
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

    resetPassword(userId) {
      this.$confirm("确定重置密码?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            sendGet("/user/resetPassword?userId=" + userId)
              .then((response) => {
                if (response.code == 200) {
                  this.$message({
                    type: "success",
                    message: "重置成功",
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
    addBlacklist(userId) {
      this.$confirm("确定加入黑名单?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: false,
        type: "warning",
        center: true,
        beforeClose: (action, instance, done) => {
          // 确定
          if (action === "confirm") {
            // 删除操作
            sendGet("/user/addBlacklist?userId=" + userId)
              .then((response) => {
                if (response.code == 200) {
                  this.search();
                  this.$message({
                    type: "success",
                    message: "加入黑名单成功",
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



    async getById(userId) {
      this.submitFlag = false;
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });


      const url="/user/detail"
      const response = await sendPostByKeyValue(url,{ id: userId})
      if (response) {
                let roleIds = [];
            if (response.data.roles && response.data.roles.length > 0) {
              for (let i = 0; i < response.data.roles.length; i++) {
                if (response.data.roles[i].roleId) {
                  roleIds.push(response.data.roles[i].roleId);
                }
              }
            }
            this.checkedRoleIds = roleIds;
            this.ruleForm = response.data;
            if(response.data.professionEcho){
             this.ruleForm.professionEcho = response.data.professionEcho.split(',').map(Number);
            }
            const nativePlace = this.ruleForm.nativePlace.split(',');
            this.ruleForm.nativePlace =[TextToCode[nativePlace[0]].code,TextToCode[nativePlace[0]][nativePlace[1]].code]
            let residence = this.ruleForm.residence.split(',')
            if(residence[3]){
              this.ruleForm.residenceDetail =residence[3]
            }
            this.ruleForm.residence = [TextToCode[residence[0]].code,TextToCode[residence[0]][residence[1]].code,TextToCode[residence[0]][residence[1]][residence[2]].code]
      }

    },

    delById(userId) {
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
            sendGet("/user/delete?id=" + userId)
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
              ids.push(this.multipleSelection[i].userId);
            }
            // 删除操作
            sendGet("/user/deletes?ids=" + ids.toString())
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



    async add() {
        if (checkIsNull(this.ruleForm.idCard)) {
        this.$message.warning("请输入身份证号");
        return;
      } else if (!checkIsIdCard(this.ruleForm.idCard)) {
        this.$message.warning("身份证号格式不正确");
        return;
      }
      this.submitButtonFlag = true;
      let saveRoles = [];
      for (let i = 0; i < this.checkedRoleIds.length; i++) {
        saveRoles.push({
          roleId: this.checkedRoleIds[i],
          userId: this.ruleForm.userId,
        });
      }
      this.ruleForm.userRoles = saveRoles;
      const nativePlace = this.ruleForm.nativePlace;
      this.ruleForm.nativePlace =CodeToText[nativePlace[0]]+","+CodeToText[nativePlace[1]];
      const residence = this.ruleForm.residence;
      this.ruleForm.residence =CodeToText[residence[0]]+","+CodeToText[residence[1]]+","+CodeToText[residence[2]]+","+this.ruleForm.residenceDetail
      if(this.ruleForm.professionEcho && this.ruleForm.professionEcho instanceof Array){
          this.ruleForm.professionEcho = this.ruleForm.professionEcho.join(",");
      }
      const url = "/user/saveUser";
      const response = await sendPostByJson(url, this.ruleForm);
      if (response) {
        this.search();
            this.$message({
              type: "success",
              message: "操作成功",
            });
      }
      this.dialogBaseFlag = false;
      this.submitButtonFlag = false;
    },

    handleSizeChange(val) {
      //查询
      this.serverQuerey.size = val;
      this.search();
    },

    handleCurrentChange(val) {
      //查询
      this.serverQuerey.page = val;
      this.search();
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

    uploadTitleSuccess(response, file, fileList) {
      if (response) {
        this.ruleForm.titlePhoto = this.baseImgURL + response.data.fileUrl;
      }
    },

    uploadTitleSuccessTwo(response, file, fileList) {
      if (response) {
        if(response.code == 400){
          this.$message({
          message: response.message,
          type: "error",
      });
        }
        
        // this.ruleForm.titlePhoto = this.baseImgURL + response.data.fileUrl;
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
    openDialog(flag) {
      this.submitFlag = flag; //false 修改 true 添加
      this.dialogBaseFlag = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
      this.checkedRoleIds = [];
      this.ruleForm = {
        photo: "",
        titlePhoto: "",
        nickname: "",
        mobile: "",
        professionEcho:[],
      };
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
      this.serverQuerey.blacklist = 0;
      const url = "/user/findByParam";
      sendPostByKeyValue(url, this.serverQuerey)
        .then((response) => {
          if (response.code == 200) {
            this.listData = response.data.list;
            this.serverQuerey.total = response.data.total;
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
    async regionChange()
    {
      const url = "/user/findBlankList?residenceDetail="+this.ruleForm.residenceDetail;
      if(this.ruleForm.residenceDetail.length===0)return;
      sendGet(url)
        .then((response) => {
          if (response.code === 200) {
            console.log(response.data)
            if(response.data.length>0)
            {
              this.tip = `该地址与黑名单中的${response.data[0].residence}地址相近，请注意`;
              this.tipVisible = true
            }
            else
            {
              this.tipVisible = false
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

    }
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
  .demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 20%;
}
::v-deep .demo-table-expand label {
  width: auto;
}

 .el-select .el-input {
   width: 130px;
 }
 .input-with-select .el-input-group__prepend {
   background-color: #fff;
 }
</style>
