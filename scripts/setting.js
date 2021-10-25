$().ready(function () {
  setSize();
  setEvent();
  setNet();
  setScrval();
  done();
});

var setEvent = function () {
  $(window).resize(setSize);
  $("#pwd-save").click(savePwd);
  $("#date-save").click(saveDate);
  $("#net-save").click(saveNet);
  $("#screen-save").click(saveScrval);
  $("#setting-date-datetimepicker").datetimepicker({
    language: "zh-CN",
    format: "yyyy-mm-dd",
    autoclose: true,
    minView: 2,
  });
};

var setSize = function () {
  var height = $(window).height();
  $(".py-fixed-tabs-bd").height(height - 140);
};

var setNet = function () {
  if ($systemAuth === null) return false;

  var msg = $("#net-msg");
  setMsg(msg, "loading", "正在加载...");
  $.ajax({
    url: $requestURI + "getsnet?" + $systemAuth.token,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          bindNet(data);
          setMsg(msg, "success", "加载完成");
        } else {
          setMsg(msg, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setMsg(
        msg,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var setScrval = function () {
  if ($systemAuth === null) return false;

  var msg = $("#screen-msg");
  setMsg(msg, "loading", "正在加载...");
  $.ajax({
    url:
      $requestURI +
      "getclientdefinedata?" +
      $systemAuth.token +
      "&pylon_screen_time",
    success: function (data, status) {
      var screenTime = $screenTime;
      if (isNullOrEmpty(data) === false) {
        data = data.replace(/\"/g, "");
        if (isEmpty(data) === false && data.startWith("Error") === false) {
          screenTime = parseInt(data);
        }
      }

      var index = $screenTime / 60000,
        select = $("#screenInterval");

      select.val(index);
      select.trigger("changed.selected.amui");
      setMsg(msg, "success", "加载完成");
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setMsg(
        msg,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var setMsg = function (element, type, message) {
  var icon = "";
  if (type === "error") {
    icon = "<i class='am-icon-times-circle py-info-danger'></i>&nbsp;";
  } else if (type === "warning") {
    icon = "<i class='am-icon-exclamation-circle py-info-warning'></i>&nbsp;";
  } else if (type === "info") {
    icon = "<i class='am-icon-info-circle py-info-primary'></i>&nbsp;";
  } else if (type === "success") {
    icon = "<i class='am-icon-check-circle py-info-success'></i>&nbsp;";
  } else if (type === "loading") {
    icon = "<i class='am-icon-spinner am-icon-spin'></i>&nbsp;";
  }

  element.html(icon + message);
};

var savePwd = function () {
  if ($systemAuth === null) return false;

  var oldPwd = $("#oldPwd"),
    oldVal = oldPwd.val(),
    newPwd = $("#newPwd"),
    newVal = newPwd.val(),
    cfmPwd = $("#cfmPwd"),
    cfmVal = cfmPwd.val(),
    msg = $("#pwd-msg");

  if (isNullOrEmpty(oldVal) === true) {
    setMsg(msg, "error", "原始密码不能为空");
    oldPwd.focus();
    return false;
  }

  if (isNullOrEmpty(newVal) === true) {
    setMsg(msg, "error", "新密码不能为空");
    newPwd.focus();
    return false;
  }

  if (newVal.length !== 8) {
    setMsg(msg, "error", "新密码必须为8位数字");
    newPwd.focus();
    return false;
  }

  if (isNullOrEmpty(cfmVal) === true) {
    setMsg(msg, "error", "确认密码不能为空");
    cfmPwd.focus();
    return false;
  }

  if (newVal !== cfmVal) {
    setMsg(msg, "error", "确认密码不一致");
    cfmPwd.focus();
    return false;
  }

  setMsg(msg, "loading", "正在设置...");
  $.ajax({
    url:
      $requestURI +
      "setpd?" +
      $systemAuth.token +
      "&" +
      $.base64.btoa(newVal) +
      "&" +
      $.base64.btoa(oldVal),
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setMsg(msg, "success", "密码修改成功");
          } else {
            setMsg(msg, "error", "密码修改失败");
          }
        } else {
          setMsg(msg, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setMsg(
        msg,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var saveDate = function () {
  if ($systemAuth === null) return false;

  var date = $("#py-setting-date"),
    dateVal = date.val(),
    time = $("#py-setting-time"),
    timeVal = time.val(),
    msg = $("#date-msg");

  if (isNullOrEmpty(dateVal) === true) {
    setMsg(msg, "error", "设置日期不能为空");
    date.focus();
    return false;
  }

  if (isNullOrEmpty(timeVal) === true) {
    setMsg(msg, "error", "设置时间不能为空");
    time.focus();
    return false;
  }

  if (timeVal.length !== 6) {
    setMsg(msg, "error", "时间格式错误(格式: HHmmss 示例: 085959)");
    time.focus();
    return false;
  }

  var datetime = moment(dateVal + " " + timeVal, "YYYY-MM-DD HHmmss").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  setMsg(msg, "loading", "正在设置...");
  $.ajax({
    url: $requestURI + "settime?" + $systemAuth.token + "&" + datetime,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setMsg(msg, "success", "时间(" + datetime + ")设置成功");
          } else {
            setMsg(msg, "error", "时间(" + datetime + ")设置失败");
          }
        } else {
          setMsg(msg, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setMsg(
        msg,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var saveNet = function () {
  if ($systemAuth === null) return false;

  var MainAddressIP = $("#MainAddressIP"),
    MainAddressIPVal = MainAddressIP.val(),
    MainAddressMask = $("#MainAddressMask"),
    MainAddressMaskVal = MainAddressMask.val(),
    MainAddressGateway = $("#MainAddressGateway"),
    MainAddressGatewayVal = MainAddressGateway.val(),
    AuxAddressIP = $("#AuxAddressIP"),
    AuxAddressIPVal = AuxAddressIP.val(),
    AuxAddressMask = $("#AuxAddressMask"),
    AuxAddressMaskVal = AuxAddressMask.val(),
    DNS1 = $("#DNS1"),
    DNS1Val = DNS1.val(),
    DNS2 = $("#DNS2"),
    DNS2Val = DNS2.val(),
    msg = $("#net-msg");

  if (isNullOrEmpty(MainAddressIPVal) === true) {
    setMsg(msg, "error", "主地址IP不能为空");
    MainAddressIP.focus();
    return false;
  }

  if (isNullOrEmpty(MainAddressMaskVal) === true) {
    setMsg(msg, "error", "主地址掩码不能为空");
    MainAddressMask.focus();
    return false;
  }

  if (isNullOrEmpty(MainAddressGatewayVal) === true) {
    setMsg(msg, "error", "主地址默认网关不能为空");
    MainAddressGateway.focus();
    return false;
  }

  // if(isNullOrEmpty(AuxAddressIPVal) === true){
  //  setMsg(msg,'error','辅助地址IP不能为空');
  //  AuxAddressIP.focus();
  //  return false;
  // }

  // if(isNullOrEmpty(AuxAddressMaskVal) === true){
  //  setMsg(msg,'error','辅助地址掩码不能为空');
  //  AuxAddressMask.focus();
  //  return false;
  // }

  // if (isNullOrEmpty(DNS1Val) === true) {
  //     setMsg(msg, 'error', '主DNS不能为空');
  //     DNS1.focus();
  //     return false;
  // }

  // if(isNullOrEmpty(DNS2Val) === true){
  //  setMsg(msg,'error','备用DNS不能为空');
  //  DNS2.focus();
  //  return false;
  // }

  var netcfg = {
    MainAddressIP: MainAddressIPVal,
    MainAddressMask: MainAddressMaskVal,
    MainAddressGateway: MainAddressGatewayVal,
    AuxAddressIP: AuxAddressIPVal,
    AuxAddressMask: AuxAddressMaskVal,
    DNS1: DNS1Val,
    DNS2: DNS2Val,
  };

  setMsg(msg, "loading", "正在设置...");
  $.ajax({
    url: $requestURI + "setsnet?" + $systemAuth.token,
    data: JSON.stringify(netcfg),
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setMsg(msg, "success", "网卡设置成功");
          } else {
            setMsg(msg, "error", "网卡设置失败");
          }
        } else {
          setMsg(msg, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setMsg(
        msg,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var saveScrval = function () {
  if ($systemAuth === null) return false;

  var interval = $("#screenInterval"),
    intervalVal = parseInt(interval.val()) * 60000,
    msg = $("#screen-msg");

  setMsg(msg, "loading", "正在设置...");
  $.ajax({
    url:
      $requestURI +
      "setclientdefinedata?" +
      $systemAuth.token +
      "&pylon_screen_time",
    data: intervalVal.toString(),
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            $store.set("pylon.screen.time", intervalVal.toString());
            $screenTime = intervalVal;
            setMsg(msg, "success", "屏保设置成功");
          } else {
            setMsg(msg, "error", "屏保设置失败");
          }
        } else {
          setMsg(msg, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setMsg(
        msg,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var bindNet = function (data) {
  var _data = JSON.parse(data);
  var MainAddressIP = $("#MainAddressIP"),
    MainAddressMask = $("#MainAddressMask"),
    MainAddressGateway = $("#MainAddressGateway"),
    AuxAddressIP = $("#AuxAddressIP"),
    AuxAddressMask = $("#AuxAddressMask"),
    DNS1 = $("#DNS1"),
    DNS2 = $("#DNS2");

  MainAddressIP.val("");
  MainAddressMask.val("");
  MainAddressGateway.val("");
  AuxAddressIP.val("");
  AuxAddressMask.val("");
  DNS1.val("");
  DNS2.val("");

  if (isNullOrEmpty(_data.MainAddressIP) === false) {
    MainAddressIP.val(_data.MainAddressIP);
  }

  if (isNullOrEmpty(_data.MainAddressMask) === false) {
    MainAddressMask.val(_data.MainAddressMask);
  }

  if (isNullOrEmpty(_data.MainAddressGateway) === false) {
    MainAddressGateway.val(_data.MainAddressGateway);
  }

  if (isNullOrEmpty(_data.AuxAddressIP) === false) {
    AuxAddressIP.val(_data.AuxAddressIP);
  }

  if (isNullOrEmpty(_data.AuxAddressMask) === false) {
    AuxAddressMask.val(_data.AuxAddressMask);
  }

  if (isNullOrEmpty(_data.DNS1) === false) {
    DNS1.val(_data.DNS1);
  }

  if (isNullOrEmpty(_data.DNS2) === false) {
    DNS2.val(_data.DNS2);
  }
};
