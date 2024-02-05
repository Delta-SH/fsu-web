var grid = null;
var curtree = null;
var curnode = null;
var timerid = null;
var timerval = 10000;
$().ready(function () {
  i18n.apply(function () {
    setGrid();
    setTree();
    setEvent();
    done();
  });
});

var setTree = function () {
  var nodes = [];
  var setting = {
    callback: {
      onClick: function (event, treeId, treeNode) {
        curnode = treeNode;
        reloadPoint();
      },
    },
  };

  var data = $store.get("pylon.request.device");
  if (data.length > 0) {
    var _devs = _.groupBy(data, function (value) {
      return value.Room;
    });

    _.each(_devs, function (value, key, list) {
      var _node = {
        id: key,
        name: key,
        open: true,
        icon: "images/room.png",
        type: 0,
        children: [],
      };
      _.each(value, function (element, index) {
        _node.children.push({
          id: element.ID,
          name: element.Name,
          icon: "images/device.png",
          type: 1,
        });
      });
      nodes.push(_node);
    });
  }

  curtree = $.fn.zTree.init($("#nav-tree"), setting, nodes);
};

var setEvent = function () {
  $("#py-point-type").on("change", function () {
    reloadPoint();
  });

  $("#py-grid tbody").on("click", "button.py-opt-ctrl", function () {
    var me = $(this);
    var dialog = $("#py-ctrl-dialog");
    var pid = me.attr("pid");
    if (isNullOrEmpty(pid) === true) return false;

    dialog.attr("_point", pid);

    var ctrlname = $("#py-ctrl-name");
    ctrlname.val("--");

    var name = me.attr("pname");
    if (isNullOrEmpty(name) === false) {
      ctrlname.val(name);
    }

    var ctrlparam = $("#py-ctrl-param");
    ctrlparam.html(
      '<option value="0">' +
        i18n.get("dialog.ctrl.param.on") +
        '-0</option><option value="1">' +
        i18n.get("dialog.ctrl.param.off") +
        '-1</option><option value="4">' +
        i18n.get("dialog.ctrl.param.onff") +
        "-4</option>"
    );

    var remark = me.attr("premark");
    if (isNullOrEmpty(remark) === false) {
      var pairs = getUnits(remark);
      var options = [];
      $.each(pairs, function (index, item) {
        options.push(
          '<option value="' +
            item.id +
            '">' +
            item.name +
            "-" +
            item.id +
            "</option>"
        );
      });

      if (options.length > 0) {
        ctrlparam.html(options.join());
      }
    }

    setDialogMsg(dialog, "", "");
    dialog.modal({
      closeViaDimmer: false,
      width: 250,
    });
  });

  $("#py-grid tbody").on("click", "button.py-opt-adjust", function () {
    var me = $(this);
    var dialog = $("#py-adjust-dialog");
    var pid = me.attr("pid");
    if (isNullOrEmpty(pid) === true) return false;

    dialog.attr("_point", pid);

    var adjustname = $("#py-adjust-name");
    adjustname.val("--");

    var name = me.attr("pname");
    if (isNullOrEmpty(name) === false) {
      adjustname.val(name);
    }

    var adjustparam = $("#py-adjust-param");
    adjustparam.val(0);

    setDialogMsg(dialog, "", "");
    dialog.modal({
      closeViaDimmer: false,
      width: 250,
    });
  });

  $("#py-grid tbody").on("click", "button.py-opt-level", function () {
    var me = $(this);
    var dialog = $("#py-level-dialog");
    var pid = me.attr("pid");
    if (isNullOrEmpty(pid) === true) return false;

    dialog.attr("_point", pid);

    var levelname = $("#py-level-name");
    levelname.val("--");

    var name = me.attr("pname");
    if (isNullOrEmpty(name) === false) {
      levelname.val(name);
    }

    var levelparam = $("#py-level-param");
    levelparam.val("1");

    var level = me.attr("plevel");
    if (isNullOrEmpty(level) === false) {
      levelparam.val(level);
    }

    setDialogMsg(dialog, "", "");
    dialog.modal({
      closeViaDimmer: false,
      width: 250,
    });
  });

  $("#py-grid tbody").on("click", "button.py-opt-limit", function () {
    var me = $(this);
    var dialog = $("#py-threshold-dialog");
    var pid = me.attr("pid");
    if (isNullOrEmpty(pid) === true) return false;

    dialog.attr("_point", pid);

    var thresholdname = $("#py-threshold-name");
    thresholdname.val("--");

    var name = me.attr("pname");
    if (isNullOrEmpty(name) === false) {
      thresholdname.val(name);
    }

    var thresholdparam = $("#py-threshold-param");
    thresholdparam.val(0);

    var threshold = me.attr("pthreshold");
    if (isNullOrEmpty(threshold) === false) {
      thresholdparam.val(threshold);
    }

    setDialogMsg(dialog, "", "");
    dialog.modal({
      closeViaDimmer: false,
      width: 250,
    });
  });

  $("#py-ctrl-ok").click(function (e) {
    var dialog = $("#py-ctrl-dialog"),
      point = dialog.attr("_point"),
      value = $("#py-ctrl-param").val();

    setPoint(dialog, point, value);
  });

  $("#py-ctrl-close").click(function (e) {
    $("#py-ctrl-dialog").modal("close");
  });

  $("#py-adjust-ok").click(function (e) {
    var dialog = $("#py-adjust-dialog"),
      point = dialog.attr("_point"),
      param = $("#py-adjust-param"),
      value = param.val();

    if (isNullOrEmpty(value) === true || $.isNumeric(value) === false) {
      setDialogMsg(dialog, "error", i18n.get("dialog.adjust.error"));
      param.focus();
      return false;
    }

    setPoint(dialog, point, value);
  });

  $("#py-adjust-close").click(function (e) {
    $("#py-adjust-dialog").modal("close");
  });

  $("#py-level-ok").click(function (e) {
    var dialog = $("#py-level-dialog"),
      point = dialog.attr("_point"),
      value = $("#py-level-param").val();

    setLevel(dialog, point, value);
  });

  $("#py-level-close").click(function (e) {
    $("#py-level-dialog").modal("close");
  });

  $("#py-threshold-ok").click(function (e) {
    var dialog = $("#py-threshold-dialog"),
      point = dialog.attr("_point"),
      param = $("#py-threshold-param"),
      value = param.val();

    if (isNullOrEmpty(value) === true || $.isNumeric(value) === false) {
      setDialogMsg(dialog, "error", i18n.get("dialog.threshold.error"));
      param.focus();
      return false;
    }

    setThreshold(dialog, point, value);
  });

  $("#py-threshold-close").click(function (e) {
    $("#py-threshold-dialog").modal("close");
  });
};

var setGrid = function () {
  grid = createGrid("#py-grid", {
    columns: [
      {
        title: i18n.get("point.table.column.state"),
        data: "State",
        className: "center",
      },
      {
        title: i18n.get("point.table.column.name"),
        data: "Name",
      },
      {
        title: i18n.get("point.table.column.type"),
        data: "Type",
        className: "center",
      },
      {
        title: i18n.get("point.table.column.value"),
        data: "Value",
      },
      {
        title: i18n.get("point.table.column.remark"),
        data: "Remark",
      },
      {
        title: i18n.get("point.table.column.time"),
        data: "Time",
        className: "center",
      },
      {
        className: "center",
        data: "Type",
        orderable: false,
      },
    ],
    columnDefs: [
      {
        targets: 0,
        render: function (data, type, row) {
          return getStateName(data);
        },
        createdCell: function (td, cellData, rowData, row, col) {
          $(td).addClass(getStateClass(cellData));
        },
      },
      {
        targets: 2,
        render: function (data, type, row) {
          return getPointType(data);
        },
      },
      {
        targets: 4,
        render: function (data, type, row) {
          return getUnit(row.Value, row.Type, data);
        },
      },
      {
        targets: 6,
        render: function (data, type, row) {
          var html = "";
          if ($systemAuth !== null && $systemAuth.ticket === true) {
            if (data == 2) {
              html +=
                "<button pid='" +
                row.ID +
                "' pname='" +
                row.Name +
                "' premark='" +
                row.Remark +
                "' class='am-btn am-btn-secondary am-btn-xs py-opt-ctrl'><i class='am-icon-wifi'></i> " +
                i18n.get("point.table.button.ctl") +
                "</button>";
            } else if (data == 3) {
              html +=
                "<button pid='" +
                row.ID +
                "' pname='" +
                row.Name +
                "' class='am-btn am-btn-secondary am-btn-xs py-opt-adjust'><i class='am-icon-sliders'></i> " +
                i18n.get("point.table.button.adjust") +
                "</button>";
            } else if (data == 0) {
              if (row.AlarmLevel > 0) {
                html +=
                  "<button pid='" +
                  row.ID +
                  "' pname='" +
                  row.Name +
                  "' plevel='" +
                  row.AlarmLevel +
                  "' class='am-btn am-btn-danger am-btn-xs py-opt-level'><i class='am-icon-bell'></i> " +
                  i18n.get("point.table.button.alarm") +
                  "</button>";
                html +=
                  "<button pid='" +
                  row.ID +
                  "' pname='" +
                  row.Name +
                  "' pthreshold='" +
                  row.Threshold +
                  "' class='am-btn am-btn-warning am-btn-xs py-opt-limit'><i class='am-icon-filter'></i> " +
                  i18n.get("point.table.button.threshold") +
                  "</button>";
              }
            }
          }

          return html;
        },
      },
    ],
  });
};

var clearGrid = function () {
  if (grid == null) return;

  delete grid._device;
  delete grid._rows;
  grid.clear().draw();
};

var loadPoint = function () {
  if ($systemAuth === null) return false;

  if (grid == null) return false;

  if (curnode == null) {
    clearGrid();
    return false;
  }

  if (curnode.type !== 1) {
    clearGrid();
    return false;
  }

  $.ajax({
    url: $requestURI + "getsignals?" + $systemAuth.token + "&" + curnode.id,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          grid._device = curnode.id;
          bindPoint(data);
        } else {
          showAlert(i18n.get("dialog.alert.error.title"), data, "danger");
        }
      }
    },
  });
};

var reloadPoint = function () {
  if (isNull(timerid) === false) {
    clearTimeout(timerid);
    timerid = null;
  }
  loadPoint();
};

var loadValue = function (rows) {
  if ($systemAuth === null) return false;

  if (grid == null) return false;

  if (isNull(grid._device) === true) return false;

  if (isNull(rows) === true && isNull(grid._rows) === true) return false;

  $.ajax({
    url:
      $requestURI + "getsignalvalues?" + $systemAuth.token + "&" + grid._device,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          bindValue(rows || grid._rows, data);
        } else {
          showAlert(i18n.get("dialog.alert.error.title"), data, "danger");
        }
      }
    },
  });
};

var reloadValue = function () {
  if (isNull(timerid) === false) {
    clearTimeout(timerid);
    timerid = null;
  }
  loadValue();
};

var bindPoint = function (data) {
  var _rows = [];
  var _types = $("#py-point-type").val();
  var _data = JSON.parse(data);
  var _page = grid.page();
  $.each(_data, function (index, item) {
    if (isNull(_types) === false && _types.length > 0) {
      if (_.contains(_types, item.Type.toString()) === false) return true;
    }

    _rows.push({
      ID: item.ID,
      Name: item.Name,
      Type: item.Type,
      Remark: item.ValueDesc,
      AlarmLevel: item.AlarmLevel,
      Threshold: item.Threshold,
      Value: 0,
      Time: "--",
      State: 0,
    });
  });

  grid.clear();
  grid.rows.add(_rows);
  grid.draw(false).page(_page);
  loadValue(_rows);
};

var bindValue = function (rows, data) {
  var _maps = new HashMap();
  var _data = JSON.parse(data);
  var _page = grid.page();
  $.each(_data, function (index, item) {
    _maps.put(item.ID, item);
  });

  $.each(rows, function (index, item) {
    var _current = _maps.get(item.ID);
    if (_current === null) return true;
    item.Value = _current.Value;
    item.Time = _current.Time;
    item.State = _current.State;
  });

  grid._rows = rows;
  grid.clear();
  grid.rows.add(rows);
  grid.draw(false).page(_page);
  timerid = setTimeout(loadValue, timerval);
};

var setPoint = function (target, point, value) {
  if ($systemAuth === null) return false;

  if (grid == null) return false;

  if (isNull(grid._device) === true) return false;

  setDialogMsg(target, "loading", i18n.get("point.setting.loading"));
  $.ajax({
    url:
      $requestURI +
      "setsignalvalue?" +
      $systemAuth.token +
      "&" +
      point +
      "@" +
      grid._device +
      "&" +
      value,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setDialogMsg(target, "success", i18n.get("point.setting.success"));
            reloadPoint();
          } else {
            setDialogMsg(target, "error", i18n.get("point.setting.failed"));
          }
        } else {
          setDialogMsg(target, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setDialogMsg(
        target,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var setLevel = function (target, point, value) {
  if ($systemAuth === null) return false;

  if (grid == null) return false;

  if (isNull(grid._device) === true) return false;

  setDialogMsg(target, "loading", i18n.get("point.setting.loading"));
  $.ajax({
    url:
      $requestURI +
      "setalarmlevel?" +
      $systemAuth.token +
      "&" +
      point +
      "@" +
      grid._device +
      "&" +
      value,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setDialogMsg(target, "success", i18n.get("point.setting.success"));
            reloadPoint();
          } else {
            setDialogMsg(target, "error", i18n.get("point.setting.failed"));
          }
        } else {
          setDialogMsg(target, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setDialogMsg(
        target,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var setThreshold = function (target, point, value) {
  if ($systemAuth === null) return false;

  if (grid == null) return false;

  if (isNull(grid._device) === true) return false;

  setDialogMsg(target, "loading", i18n.get("point.setting.loading"));
  $.ajax({
    url:
      $requestURI +
      "setthreashold?" +
      $systemAuth.token +
      "&" +
      point +
      "@" +
      grid._device +
      "&" +
      value,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          if (data === "true") {
            setDialogMsg(target, "success", i18n.get("point.setting.success"));
            reloadPoint();
          } else {
            setDialogMsg(target, "error", i18n.get("point.setting.failed"));
          }
        } else {
          setDialogMsg(target, "error", data);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      setDialogMsg(
        target,
        "error",
        jqXHR.status + ":" + jqXHR.statusText + " " + jqXHR.responseText
      );
    },
  });
};

var setDialogMsg = function (element, type, message) {
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

  element
    .find(".py-form-footer > .py-form-info > .py-form-msg")
    .html(icon + message);
};
