//校验是否合法手机号
export function checkIsMobile(value) {
    const reg = /^1[3|4|5|7|8|9][0-9]\d{8}$/;
    const isPhone = reg.test(value);
    value = Number(value); //转换为数字
    if (typeof value === "number" && !isNaN(value)) {
      //判断是否为数字
      value = value.toString(); //转换成字符串
      if (value.length < 0 || value.length > 12 || !isPhone) {
        //判断是否为11位手机号
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  //校验是否合法座机号码
  export function checkIsLandlineNumber(value) {
    const reg = /^0\d{2,3}-\d{7,8}$/;
    if (!reg.test(value)) {
      return false;
    }
    return true;
  }
  //校验身份证号码是否合法
  export function checkIsIdCard(idNo) {
    // var regIdNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    //var regIdNo = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    var regIdNo = /^[1-9]\d{5}((((19|[2-9][0-9])\d{2})(0?[13578]|1[02])(0?[1-9]|[12][0-9]|3[01]))|(((19|[2-9][0-9])\d{2})(0?[13456789]|1[012])(0?[1-9]|[12][0-9]|30))|(((19|[2-9][0-9])\d{2})0?2(0?[1-9]|1[0-9]|2[0-8]))|(((1[6-9]|[2-9][0-9])(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))0?229))\d{3}[0-9Xx]$/;
    if (!regIdNo.test(idNo)) {
      return false;
    }
    return true;
  }
  //校验户口簿号码是否合法
  export function checkIsResidenceBookletNumber(value) {
    var reg = /^\d{9}$/;
    if (!reg.test(value)) {
      return false;
    }
    return true;
  }
  //校验台胞证号码是否合法
  export function checkIsTaiwanCompatriotNumber(value) {
    var reg = /^(?:(830000(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dX])|\d{10}[DAB])$/;
    if (!reg.test(value)) {
      return false;
    }
    return true;
  }
  //校验护照号码是否合法
  export function checkIsPassportNumber(value) {
    var reg = /^([EK]\d{8}|(SE|DE|PE|MA)\d{7})$/;
    if (!reg.test(value)) {
      return false;
    }
    return true;
  }
  //检验邮箱地址是否合法
  export function checkIsEmail(email) {
    var reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/; //正则表达式
    if (!reg.test(email)) { //正则验证不通过，格式不对
      return false;
    }
    return true;
  }
  /**
   * 校验字符串是否为整数
   */
  export function checkIsInteger(value) {
    if (/^\d+$/.test(value)) {
      return true;
    }
    return false;
  }
  
  /**
   * 校验字符串是否为数字
   */
  export function checkIsNumber(str) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(str) || regNeg.test(str)) {
      return true;
    } else {
      return false;
    }
  }
  
  /**
   * 校验是否为空
   */
  export function checkIsNull(value) {
    if (value === null || value === undefined || value === "") {
      return true;
    }
    return false;
  }
  