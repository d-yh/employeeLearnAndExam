/**
 * 获取今天、昨天、本周、上周、本月、上月的开始日期和结束日期
 */
let now = new Date(); //当前日期
let nowDayOfWeek = now.getDay(); //今天本周的第几天
let nowDay = now.getDate(); //当前日
let nowMonth = now.getMonth(); //当前月
let nowYear = now.getFullYear(); //当前年

//获得某月的天数
function getMonthDays(myMonth) {
    let monthStartDate = new Date(nowYear, myMonth, 1);
    let monthEndDate = new Date(nowYear, myMonth + 1, 1);
    let days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
}
//获得本周的开始日期
function getWeekStartDate() {
    return new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1, 0, 0, 0);
}
//获得上周的开始日期
function getLastWeekStartDate() {
    return new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 6, 0, 0, 0);
}
//获得上周的结束日期
function getLastWeekEndDate() {
    return new Date(nowYear, nowMonth, nowDay - nowDayOfWeek, 23, 59, 59);
}
//获得本月的开始日期
function getMonthStartDate() {
    return new Date(nowYear, nowMonth, 1, 0, 0, 0);
}
//获得上月的开始日期
function getLastMonthStartDate() {
    return new Date(nowYear, nowMonth - 1, 1, 0, 0, 0);
}
//获得上月的结束日期
function getLastMonthEndDate() {
    return new Date(nowYear, nowMonth - 1, getMonthDays(nowMonth - 1), 23, 59, 59);

}

export function getDateByType(type) {
    switch (type) {
        case 1: //今天
            return { start: dateFormat(new Date(nowYear, nowMonth, nowDay, 0, 0), false), end: dateFormat(new Date(), false) }
        case 2: //昨天
            return { start: dateFormat(new Date(nowYear, nowMonth, nowDay - 1, 0, 0), false), end: dateFormat(new Date(nowYear, nowMonth, nowDay - 1, 23, 59, 59), false) }
        case 3: //本周
            return { start: dateFormat(getWeekStartDate(), false), end: dateFormat(new Date(), false) }
        case 4: //上周
            return { start: dateFormat(getLastWeekStartDate(), false), end: dateFormat(getLastWeekEndDate(), false) }
        case 5: //本月
            return { start: dateFormat(getMonthStartDate(), false), end: dateFormat(new Date(), false) }
        case 6: //上月
            return { start: dateFormat(getLastMonthStartDate(), false), end: dateFormat(getLastMonthEndDate(), false) }
        case 7://本年
            return { start: dateFormat(new Date(nowYear, 0, 1, 0, 0), false), end: dateFormat(new Date(), false) }
    }
}

export function getDateSectionByType(type) {
    switch (type) {
        case 1: //3-6月
            return { start: new Date(nowYear, 2, 1, 0, 0, 0), end: new Date(nowYear, 5, getMonthDays(5), 23, 59, 59) }
        case 2: //9-12月
            return { start: new Date(nowYear, 8, 1, 0, 0, 0), end: new Date(nowYear, 11, getMonthDays(11), 23, 59, 59) }
        default: return []
    }
}

//时间格式化
export function dateFormat(date = new Date(), flag = true) {
    var year = date.getFullYear();
    /* 在日期格式中，月份是从0开始的，因此要加0
     * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
     * */
    var month =
        date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1;
    var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    var hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minutes =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var seconds =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    // 拼接
    if (flag) {//yyyy-MM-dd hh:mm:ss
        return (
            year +
            "-" +
            month +
            "-" +
            day +
            " " +
            hours +
            ":" +
            minutes +
            ":" +
            seconds
        );
    } else {//yyyy-MM-dd
        return (
            year +
            month +
            day +
            hours +
            minutes +
            seconds
        );
    }
}

//获取当前月 yyyy-MM
export function getNowMonth(date = new Date()) {
    var year = date.getFullYear();
    /* 在日期格式中，月份是从0开始的，因此要加0
     * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
     * */
    var month =
        date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1;

    return (
        year +
        "-" +
        month
    );

}

/**
     * @description 将扁平化数据 转换成 树状结构
     * @param {Array} arrayList 扁平化的数据
     * @param {String} pidStr parentId的key名
     * @param {String} idStr id的key名
     * @param {String} childrenStr children的key名
     */
export function transformTree({ arrayList, pidStr = 'pid', idStr = 'id', childrenStr = 'children' }) {
    let listOjb = {}; // 用来储存{key: obj}格式的对象
    let treeList = []; // 用来储存最终树形结构数据的数组
    // 将数据变换成{key: obj}格式，方便下面处理数据
    for (let i = 0; i < arrayList.length; i++) {
        listOjb[arrayList[i][idStr]] = arrayList[i]
    }
    // 根据pid来将数据进行格式化
    for (let j = 0; j < arrayList.length; j++) {
        // 判断父级是否存在
        let haveParent = listOjb[arrayList[j][pidStr]]
        if (haveParent) {
            // 如果有没有父级children字段，就创建一个children字段
            !haveParent[childrenStr] && (haveParent[childrenStr] = [])
            // 在父级里插入子项
            haveParent[childrenStr].push(arrayList[j])
        } else {
            // 如果没有父级直接插入到最外层
            treeList.push(arrayList[j])
        }
    }
    return treeList
}

export function getLoginFlagStorage() {
    return JSON.parse(window.localStorage.getItem("loginFlag"))
}

export function setLoginFlagStorage(flag) {
    window.localStorage.setItem("loginFlag", flag)
}

//根据传入的数组和要取的id key，返回id串
export function getIdsByArray(arr, idKey) {
    let ids = "";
    for (let i = 0; i < arr.length; i++) {
        ids += (arr[i][idKey] + ",");
    }
    return ids === "" ? "" : ids.substr(0, ids.length - 1)
}

//合并两个数组，去重  
export function mergeAndDuplicateRemoval(arr1, arr2) {
    let arr = arr1.concat();
    for (let i = 0, len = arr2.length; i < len; i++) {
        arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
    }
    return arr;
}

//获取树形结构所有子节点的id   data：树形数据  childrenStr：子节点名称   idStr：id的名称   ids：装id的数组
export function getChildrenIds(data, childrenStr = 'children', idStr, ids) {
    if (data) {
        for (let i = 0, len = data.length; i < len; i++) {
            if (data[i][childrenStr]) {
                getChildrenIds(data[i][childrenStr], childrenStr, idStr, ids)
            } else {
                ids.push(data[i][idStr])
            }
        }
    }
    return ids
}

// 寻找从属关系公共方法
export function regroupCascaderData(
    id, //要寻找的唯一值
    data, // 列表总数据
    key = 'label', //列表总数据 的key
    val = 'value', //列表总数据 的value
    list = 'children' //列表总数据 下属关系的key
) {
    let _allObj = {}
    const _allArr = []
    const setData = function (data) {
        let Obj
        for (const item of data) {
            Obj = {
                [key]: item[key],
                [val]: item[val]
            }
            if (item[val] == id) {
                Obj['isOk'] = true //如果条件符合，接下来就不会再判断
                return Obj
            } else if (item[list] && item[list].length) {
                Obj[list] = setData(item[list])
                if (Obj[list] && Obj[list]['isOk']) {
                    Obj['isOk'] = true
                    return Obj
                }
            } else {
                Obj = null
            }
        }
        return Obj
    }
    const getObjData = function (data) {
        // 递归向数组中填充数据 
        _allArr.push(data[val])
        if (data[list]) {
            getObjData(data[list])
        }
    }
    _allObj = setData(data)
    if (_allObj != null) {
        getObjData(_allObj)
    }
    return {
        Obj: _allObj,
        arr: _allArr
    }
}