var snmpenabled = true;
$().ready(function () {
  setSize();
  i18n.apply(function () {
    setEvent();
    setNet();
    setSNMP();
    setUpload();
    setScrval();
    done();
  });
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
  setMsg(msg, "loading", i18n.get("setting.loading"));
  $.ajax({
    url: $requestURI + "getsnet?" + $systemAuth.token,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          bindNet(data);
          setMsg(msg, "success", i18n.get("setting.loaded"));
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
  setMsg(msg, "loading", "loading...");
  $.ajax({
    url: $requestURI + "getnorthport?" + $systemAuth.token,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          bindSNMP(data);
          setMsg(msg, "success", i18n.get("setting.loaded"));
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
  setMsg(msg, "loading", i18n.get("setting.loading"));
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
      setMsg(msg, "success", i18n.get("setting.loaded"));
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
        '<i class="am-icon-cloud-upload"></i> ' +
          i18n.get("setting.tabs.upgrade.label.Select")
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
    setMsg(msg, "error", i18n.get("setting.tabs.password.error.oldpwd"));
    oldPwd.focus();
    return false;
  }

  if (isNullOrEmpty(newVal) === true) {
    setMsg(msg, "error", i18n.get("setting.tabs.password.error.newpwd"));
    newPwd.focus();
    return false;
  }

  if (newVal.length < 8) {
    setMsg(msg, "error", i18n.get("setting.tabs.password.error.pwdlen"));
    newPwd.focus();
    return false;
  }

  if (isNullOrEmpty(cfmVal) === true) {
    setMsg(msg, "error", i18n.get("setting.tabs.password.error.cfmpwd"));
    cfmPwd.focus();
    return false;
  }

  if (newVal !== cfmVal) {
    setMsg(msg, "error", i18n.get("setting.tabs.password.error.notcfm"));
    cfmPwd.focus();
    return false;
  }

  setMsg(msg, "loading", i18n.get("setting.tabs.password.saving"));
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
            setMsg(
              msg,
              "success",
              i18n.get("setting.tabs.password.save.success")
            );
          } else {
            setMsg(msg, "error", i18n.get("setting.tabs.password.save.fail"));
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
    setMsg(msg, "error", i18n.get("setting.tabs.datetime.error.date"));
    date.focus();
    return false;
  }

  if (isNullOrEmpty(timeVal) === true) {
    setMsg(msg, "error", i18n.get("setting.tabs.datetime.error.time"));
    time.focus();
    return false;
  }

  if (timeVal.length !== 6) {
    setMsg(msg, "error", i18n.get("setting.tabs.datetime.error.timeformat"));
    time.focus();
    return false;
  }

  var datetime = moment(dateVal + " " + timeVal, "YYYY-MM-DD HHmmss").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  setMsg(msg, "loading", i18n.get("setting.tabs.datetime.saving"));
  $.ajax({
    url: $requestURI + "settime?" + $systemAuth.token + "&" + datetime,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setMsg(
              msg,
              "success",
              String.format(
                i18n.get("setting.tabs.datetime.save.success"),
                datetime
              )
            );
          } else {
            setMsg(
              msg,
              "error",
              String.format(
                i18n.get("setting.tabs.datetime.save.fail"),
                datetime
              )
            );
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
    setMsg(msg, "error", i18n.get("setting.tabs.network.error.MainAddressIP"));
    MainAddressIP.focus();
    return false;
  }

  if (isNullOrEmpty(MainAddressMaskVal) === true) {
    setMsg(
      msg,
      "error",
      i18n.get("setting.tabs.network.error.MainAddressMask")
    );
    MainAddressMask.focus();
    return false;
  }

  if (isNullOrEmpty(MainAddressGatewayVal) === true) {
    setMsg(
      msg,
      "error",
      i18n.get("setting.tabs.network.error.MainAddressGateway")
    );
    MainAddressGateway.focus();
    return false;
  }

  // if(isNullOrEmpty(AuxAddressIPVal) === true){
  //  setMsg(msg,'error',i18n.get("setting.tabs.network.error.AuxAddressIP"));
  //  AuxAddressIP.focus();
  //  return false;
  // }

  // if(isNullOrEmpty(AuxAddressMaskVal) === true){
  //  setMsg(msg,'error',i18n.get("setting.tabs.network.error.AuxAddressMask"));
  //  AuxAddressMask.focus();
  //  return false;
  // }

  // if (isNullOrEmpty(DNS1Val) === true) {
  //     setMsg(msg, 'error', i18n.get("setting.tabs.network.error.DNS1"));
  //     DNS1.focus();
  //     return false;
  // }

  // if(isNullOrEmpty(DNS2Val) === true){
  //  setMsg(msg,'error',i18n.get("setting.tabs.network.error.DNS2"));
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

  setMsg(msg, "loading", i18n.get("setting.tabs.network.saving"));
  $.ajax({
    url: $requestURI + "setsnet?" + $systemAuth.token,
    data: JSON.stringify(netcfg),
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setMsg(
              msg,
              "success",
              i18n.get("setting.tabs.network.save.success")
            );
          } else {
            setMsg(msg, "error", i18n.get("setting.tabs.network.save.fail"));
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
    setMsg(msg, "error", i18n.get("setting.tabs.snmp.error.SnmpPort"));
    SnmpPort.focus();
    return false;
  }

  if (!portPattern.test(SnmpPortVal)) {
    setMsg(msg, "error", i18n.get("setting.tabs.snmp.error.SnmpPortInvalid"));
    SnmpPort.focus();
    return false;
  }

  var SnmpOidVal = SnmpOid.val();
  if (isNullOrEmpty(SnmpOidVal) === true) {
    setMsg(msg, "error", i18n.get("setting.tabs.snmp.error.SnmpOid"));
    SnmpOid.focus();
    return false;
  }

  var SnmpReadCommunityVal = SnmpReadCommunity.val();
  if (isNullOrEmpty(SnmpReadCommunityVal) === true) {
    setMsg(msg, "error", i18n.get("setting.tabs.snmp.error.SnmpReadCommunity"));
    SnmpReadCommunity.focus();
    return false;
  }

  var SnmpWriteCommunityVal = SnmpWriteCommunity.val();
  if (isNullOrEmpty(SnmpWriteCommunityVal) === true) {
    setMsg(
      msg,
      "error",
      i18n.get("setting.tabs.snmp.error.SnmpWriteCommunity")
    );
    SnmpWriteCommunity.focus();
    return false;
  }

  var InformIntervalVal = InformInterval.val();
  if (isNullOrEmpty(InformIntervalVal) === true) {
    setMsg(msg, "error", i18n.get("setting.tabs.snmp.error.InformInterval"));
    InformInterval.focus();
    return false;
  }

  if (!numberPattern.test(InformIntervalVal)) {
    setMsg(
      msg,
      "error",
      i18n.get("setting.tabs.snmp.error.InformIntervalInvalid")
    );
    InformInterval.focus();
    return false;
  }

  var InformMaxNumVal = InformMaxNum.val();
  if (isNullOrEmpty(InformMaxNumVal) === true) {
    setMsg(msg, "error", i18n.get("setting.tabs.snmp.error.InformMaxNum"));
    InformMaxNum.focus();
    return false;
  }

  if (!numberPattern.test(InformMaxNumVal)) {
    setMsg(
      msg,
      "error",
      i18n.get("setting.tabs.snmp.error.InformMaxNumInvalid")
    );
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

  setMsg(msg, "loading", i18n.get("setting.tabs.snmp.saving"));
  $.ajax({
    url: $requestURI + "setnorthport?" + $systemAuth.token,
    data: JSON.stringify(snmpcfg),
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setMsg(msg, "success", i18n.get("setting.tabs.snmp.save.success"));
          } else {
            setMsg(msg, "error", i18n.get("setting.tabs.snmp.save.fail"));
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

  setMsg(msg, "loading", i18n.get("setting.tabs.screen.saving"));
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
            setMsg(
              msg,
              "success",
              i18n.get("setting.tabs.screen.save.success")
            );
          } else {
            setMsg(msg, "error", i18n.get("setting.tabs.screen.save.fail"));
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

      setMsg(msg, "loading", i18n.get("setting.tabs.upgrade.submiting"));
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
                setMsg(
                  msg,
                  "success",
                  i18n.get("setting.tabs.upgrade.submit.success")
                );
              } else {
                setMsg(
                  msg,
                  "error",
                  i18n.get("setting.tabs.upgrade.submit.fail")
                );
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
      setMsg(msg, "warning", i18n.get("setting.tabs.upgrade.error.filetype"));
    }
  } else {
    setMsg(msg, "warning", i18n.get("setting.tabs.upgrade.error.select"));
  }
};

var execUpgrade = function () {
  $("#exec-confirm").modal({
    onConfirm: function (options) {
      var msg = $("#upgrade-msg");
      setMsg(msg, "loading", i18n.get("setting.tabs.upgrade.updating"));
      $.ajax({
        url: $requestURI + "upgrade?" + $systemAuth.token,
        success: function (data, status) {
          if (isNullOrEmpty(data) === false) {
            if (data.startWith("Error") === false) {
              if (data === "true") {
                setMsg(
                  msg,
                  "success",
                  i18n.get("setting.tabs.upgrade.update.success")
                );
              } else {
                setMsg(
                  msg,
                  "error",
                  i18n.get("setting.tabs.upgrade.update.fail")
                );
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
