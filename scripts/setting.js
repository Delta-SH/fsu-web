var snmpenabled = true;
$().ready(function () {
  setSize();
  setEvent();
  setNet();
  setSNMP();
  setUpload();
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

  $("#upgrade-commit").click(saveUpgrade);
  $("#upgrade-apply").click(execUpgrade);

  if (snmpenabled) {
    $("#snmp-save").click(saveSnmp);
    $("#TrapInformType,#SnmpVer").on("change", function () {
      var version = $("#SnmpVer").val();
      var inform = $("#TrapInformType").val();
      if (version == "1" && inform == "2") {
        $("#InformParam").show();
      } else {
        $("#InformInterval").val(10);
        $("#InformMaxNum").val(3);
        $("#InformParam").hide();
      }
    });
  }
};

var setSize = function () {
  var height = $(window).height();
  $(".py-fixed-tabs-bd").height(height - 140);

  if (!snmpenabled) {
    $("#snpmtab").remove();
    $("#snpmtabpanel").remove();
  }
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

var setSNMP = function () {
  if ($systemAuth === null) return false;
  if (!snmpenabled) return false;

  var msg = $("#snmp-msg");
  setMsg(msg, "loading", "正在加载...");
  $.ajax({
    url: $requestURI + "getnorthport?" + $systemAuth.token,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          bindSNMP(data);
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

  element.html(icon + (message || ""));
};

var setUpload = function () {
  $("#upgrade-form-file").on("change", function () {
    var fileNames = [];
    $.each(this.files, function () {
      fileNames.push(this.name);
    });

    if (fileNames.length > 0) {
      $("#upgrade-file-button").html(
        '<i class="am-icon-file-archive-o"></i> ' + fileNames.join(";")
      );
    } else {
      $("#upgrade-file-button").html(
        '<i class="am-icon-cloud-upload"></i> 选择要上传的文件'
      );
    }

    setProgress(0);
    setMsg($("#upgrade-msg"));
  });
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

  if (newVal.length < 8) {
    setMsg(msg, "error", "新密码至少8位字符");
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

var saveSnmp = function () {
  if ($systemAuth === null) return false;

  var numberPattern = /^[1-9]\d*$/;
  var portPattern =
    /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;

  var SnmpEnabled = $("#SnmpEnabled"),
    SnmpPort = $("#SnmpPort"),
    SnmpVer = $("#SnmpVer"),
    SnmpOid = $("#SnmpOid"),
    SnmpReadCommunity = $("#SnmpReadCommunity"),
    SnmpWriteCommunity = $("#SnmpWriteCommunity"),
    TrapInformType = $("#TrapInformType"),
    InformInterval = $("#InformInterval"),
    InformMaxNum = $("#InformMaxNum"),
    TrapIpPorts = $("#TrapIpPorts"),
    ValidSnmpIps = $("#ValidSnmpIps"),
    msg = $("#snmp-msg");

  var SnmpEnabledVal = SnmpEnabled.val() == "1";
  var SnmpVerVal = SnmpVer.val();
  var TrapInformTypeVal = TrapInformType.val();
  var TrapIpPortsVal = TrapIpPorts.val();
  var ValidSnmpIpsVal = ValidSnmpIps.val();

  var SnmpPortVal = SnmpPort.val();
  if (isNullOrEmpty(SnmpPortVal) === true) {
    setMsg(msg, "error", "本地端口不能为空");
    SnmpPort.focus();
    return false;
  }

  if (!portPattern.test(SnmpPortVal)) {
    setMsg(msg, "error", "本地端口不合法");
    SnmpPort.focus();
    return false;
  }

  var SnmpOidVal = SnmpOid.val();
  if (isNullOrEmpty(SnmpOidVal) === true) {
    setMsg(msg, "error", "根节点OID不能为空");
    SnmpOid.focus();
    return false;
  }

  var SnmpReadCommunityVal = SnmpReadCommunity.val();
  if (isNullOrEmpty(SnmpReadCommunityVal) === true) {
    setMsg(msg, "error", "读公共体不能为空");
    SnmpReadCommunity.focus();
    return false;
  }

  var SnmpWriteCommunityVal = SnmpWriteCommunity.val();
  if (isNullOrEmpty(SnmpWriteCommunityVal) === true) {
    setMsg(msg, "error", "写公共体不能为空");
    SnmpWriteCommunity.focus();
    return false;
  }

  var InformIntervalVal = InformInterval.val();
  if (isNullOrEmpty(InformIntervalVal) === true) {
    setMsg(msg, "error", "Inform间隔不能为空");
    InformInterval.focus();
    return false;
  }

  if (!numberPattern.test(InformIntervalVal)) {
    setMsg(msg, "error", "Inform间隔不合法");
    InformInterval.focus();
    return false;
  }

  var InformMaxNumVal = InformMaxNum.val();
  if (isNullOrEmpty(InformMaxNumVal) === true) {
    setMsg(msg, "error", "Inform最大次数");
    InformMaxNum.focus();
    return false;
  }

  if (!numberPattern.test(InformMaxNumVal)) {
    setMsg(msg, "error", "Inform最大次数不合法");
    InformMaxNum.focus();
    return false;
  }

  var snmpcfg = {
    Enabled: SnmpEnabledVal,
    SvcPort: parseInt(SnmpPortVal),
    ClientIP: "",
    ClientPort: 0,
    Hearbeat: 10,
    LinkType: 0,
    Protocol: 5,
    ConnectDelay: 30,
    RID: "0000000000",
    Address: "",
    SerialAddrSwt: false,
    SendAckNum: 30,
    TestPackNum: 20,
    TimeOutNum: 10,
    SnmpVer: parseInt(SnmpVerVal),
    SnmpOid: SnmpOidVal,
    SnmpReadCommunity: SnmpReadCommunityVal,
    SnmpWriteCommunity: SnmpWriteCommunityVal,
    TrapInformType: TrapInformTypeVal,
    InformInterval: InformIntervalVal,
    InformMaxNum: InformMaxNumVal,
    ValidSnmpIps: ValidSnmpIpsVal,
    TrapIpPorts: TrapIpPortsVal,
    UsmUser: "",
    SecurityLevel: 0,
    AuthProtocol: 0,
    AuthPassword: "",
    PrivacyProtocol: 0,
    PrivacyPassword: "",
    SnmpSysLocation: "",
    SnmpSysContact: "",
    SnmpLocalEngineID: "",
  };

  setMsg(msg, "loading", "正在设置...");
  $.ajax({
    url: $requestURI + "setnorthport?" + $systemAuth.token,
    data: JSON.stringify(snmpcfg),
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setMsg(msg, "success", "SNMP设置成功");
          } else {
            setMsg(msg, "error", "SNMP设置失败");
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

var saveUpgrade = function () {
  var msg = $("#upgrade-msg");
  setProgress(0);
  setMsg(msg);

  var files = $("#upgrade-form-file")[0].files;
  if (files && files.length > 0) {
    var file = files[0];
    var name = file.name
      .substring(file.name.lastIndexOf(".") + 1)
      .toLowerCase();

    if (name == "gz" || name == "tar" || name == "zip") {
      var formData = new FormData();
      formData.append("upgrade", file);

      setMsg(msg, "loading", "正在上传...");
      $.ajax({
        type: "post",
        url: $requestURI + "upload?" + $systemAuth.token,
        data: formData,
        timeout: 300000,
        async: true,
        cache: false,
        contentType: false,
        processData: false,
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (xhr.upload) {
            xhr.upload.addEventListener(
              "progress",
              function (e) {
                var loaded = e.loaded;
                var total = e.total;
                setProgress(Math.floor((100 * loaded) / total));
              },
              false
            );
            return xhr;
          }
        },
        success: function (data) {
          if (isNullOrEmpty(data) === false) {
            if (data.startWith("Error") === false) {
              if (data === "true") {
                setMsg(msg, "success", "文件上传成功");
              } else {
                setMsg(msg, "error", "文件上传失败");
                setProgress(0);
              }
            } else {
              setMsg(msg, "error", data);
              setProgress(0);
            }
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          setMsg(
            msg,
            "error",
            jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
          );
          setProgress(0);
        },
      });
    } else {
      setMsg(msg, "warning", "仅支持(.tar,.gz,.zip)格式文件");
    }
  } else {
    setMsg(msg, "warning", "请选择需要上传的文件");
  }
};

var execUpgrade = function () {
  $("#exec-confirm").modal({
    onConfirm: function (options) {
      var msg = $("#upgrade-msg");
      setMsg(msg, "loading", "正在下发指令...");
      $.ajax({
        url: $requestURI + "upgrade?" + $systemAuth.token,
        success: function (data, status) {
          if (isNullOrEmpty(data) === false) {
            if (data.startWith("Error") === false) {
              if (data === "true") {
                setMsg(msg, "success", "指令下发成功");
              } else {
                setMsg(msg, "error", "指令下发失败");
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
    },
    onCancel: function () {},
  });
};

var setProgress = function (per) {
  $("#upgrade-form-progress > .progress-inner").css("width", per + "%");
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

var bindSNMP = function (data) {
  var _data = JSON.parse(data);
  var SnmpEnabled = $("#SnmpEnabled"),
    SnmpPort = $("#SnmpPort"),
    SnmpVer = $("#SnmpVer"),
    SnmpOid = $("#SnmpOid"),
    SnmpReadCommunity = $("#SnmpReadCommunity"),
    SnmpWriteCommunity = $("#SnmpWriteCommunity"),
    TrapInformType = $("#TrapInformType"),
    InformInterval = $("#InformInterval"),
    InformMaxNum = $("#InformMaxNum"),
    TrapIpPorts = $("#TrapIpPorts"),
    ValidSnmpIps = $("#ValidSnmpIps");

  SnmpEnabled.val(0);
  SnmpPort.val(0);
  SnmpVer.val(0);
  SnmpOid.val("");
  SnmpReadCommunity.val("");
  SnmpWriteCommunity.val("");
  TrapInformType.val(0);
  InformInterval.val(0);
  InformMaxNum.val(0);
  TrapIpPorts.val("");
  ValidSnmpIps.val("");

  if (isNullOrEmpty(_data.Enabled) === false) {
    SnmpEnabled.val(_data.Enabled ? 1 : 0);
  }

  if (isNullOrEmpty(_data.SvcPort) === false) {
    SnmpPort.val(_data.SvcPort);
  }

  if (isNullOrEmpty(_data.SnmpVer) === false) {
    SnmpVer.val(_data.SnmpVer);
  }

  if (isNullOrEmpty(_data.SnmpOid) === false) {
    SnmpOid.val(_data.SnmpOid);
  }

  if (isNullOrEmpty(_data.SnmpReadCommunity) === false) {
    SnmpReadCommunity.val(_data.SnmpReadCommunity);
  }

  if (isNullOrEmpty(_data.SnmpWriteCommunity) === false) {
    SnmpWriteCommunity.val(_data.SnmpWriteCommunity);
  }

  if (isNullOrEmpty(_data.TrapInformType) === false) {
    TrapInformType.val(_data.TrapInformType);
  }

  if (isNullOrEmpty(_data.InformInterval) === false) {
    InformInterval.val(_data.InformInterval);
  }

  if (isNullOrEmpty(_data.InformMaxNum) === false) {
    InformMaxNum.val(_data.InformMaxNum);
  }

  if (isNullOrEmpty(_data.TrapIpPorts) === false) {
    TrapIpPorts.val(_data.TrapIpPorts);
  }

  if (isNullOrEmpty(_data.ValidSnmpIps) === false) {
    ValidSnmpIps.val(_data.ValidSnmpIps);
  }

  SnmpEnabled.trigger("changed.selected.amui");
  SnmpVer.trigger("changed.selected.amui");
  TrapInformType.trigger("changed.selected.amui");
};
