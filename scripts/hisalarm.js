var grid = null;
var curtree = null;
var curnode = null;
$().ready(function () {
  setSize();
  i18n.apply(function () {
    setTree();
    setGrid();
    setDate();
    setEvent();
    done();
  });
});

var setEvent = function () {
  $(window).resize(setSize);
  $("#query").click(query);
  $("#start-datetimepicker").datetimepicker({
    language: "zh-CN",
    format: "yyyy-mm-dd hh:ii",
    autoclose: true,
    pickerPosition: "top-right",
  });
  $("#end-datetimepicker").datetimepicker({
    language: "zh-CN",
    format: "yyyy-mm-dd hh:ii",
    autoclose: true,
    pickerPosition: "top-right",
  });
};

var setSize = function () {
  var height = $(window).height();
  $("#nav-tree").height(height - 245);
};

var setTree = function () {
  var root = {
    id: "root",
    name: i18n.get("tree.root"),
    open: true,
    icon: "images/all.png",
    type: -1,
    children: [],
  };
  var setting = {
    callback: {
      onClick: function (event, treeId, treeNode) {
        curnode = treeNode;
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
      root.children.push(_node);
    });
  }

  curtree = $.fn.zTree.init($("#nav-tree"), setting, root);
};

var setGrid = function () {
  grid = createGrid("#py-grid", {
    order: [[0, "desc"]],
    columns: [
      {
        title: i18n.get("alarm.table.column.SerialNO"),
        data: "SerialNO",
      },
      {
        title: i18n.get("alarm.table.column.AlarmLevel"),
        data: "AlarmLevel",
        className: "center",
      },
      {
        title: i18n.get("alarm.table.column.RoomName"),
        data: "RoomName",
      },
      {
        title: i18n.get("alarm.table.column.DeviceName"),
        data: "DeviceName",
      },
      {
        title: i18n.get("alarm.table.column.SignalName"),
        data: "SignalName",
      },
      {
        title: i18n.get("alarm.table.column.StartTime"),
        data: "StartTime",
        className: "center",
      },
      {
        title: i18n.get("alarm.table.column.StartValue"),
        data: "StartValue",
      },
      {
        title: i18n.get("alarm.table.column.EndTime"),
        data: "EndTime",
        className: "center",
      },
      {
        title: i18n.get("alarm.table.column.EndValue"),
        data: "EndValue",
      },
      {
        title: i18n.get("alarm.table.column.AlarmDesc"),
        data: "AlarmDesc",
      },
      {
        title: i18n.get("alarm.table.column.Interval"),
        data: "Interval",
        className: "center",
      },
    ],
    columnDefs: [
      {
        targets: 1,
        render: function (data, type, row) {
          return getAlarmName(data);
        },
        createdCell: function (td, cellData, rowData, row, col) {
          $(td).addClass(getAlarmClass(cellData));
        },
      },
    ],
  });
};

var setDate = function () {
  $("#py-alarm-start").val(
    moment({
      hour: 0,
      minute: 0,
      seconds: 0,
    })
      .add(-1, "days")
      .format("YYYY-MM-DD HH:mm")
  );
  $("#py-alarm-end").val(
    moment({
      hour: 0,
      minute: 0,
      seconds: 0,
    }).format("YYYY-MM-DD HH:mm")
  );
};

var setData = function (data) {
  var _data = JSON.parse(data);
  if (_data.length === 0) {
    grid.clear().draw();
    return true;
  }

  var _maps = new HashMap();
  var devices = $store.get("pylon.request.device");
  if (devices.length > 0) {
    $.each(devices, function (index, item) {
      _maps.put(item.ID, item);
    });
  }

  var _rows = [];
  var _levels = $("#py-alarm-level").val();
  $.each(_data, function (index, item) {
    if (isNull(_levels) === false && _levels.length > 0) {
      if (_.contains(_levels, item.AlarmLevel.toString()) === false)
        return true;
    }

    var _row = {
      SerialNO: item.SerialNO,
      RoomName: "--",
      DeviceName: item.DeviceName,
      SignalName: item.SignalName,
      AlarmLevel: item.AlarmLevel,
      AlarmDesc: item.AlarmDesc,
      StartTime: item.StartTime,
      StartValue: item.StartValue,
      EndTime: item.EndTime,
      EndValue: item.EndValue,
      Interval: getTimespan(item.StartTime, item.EndTime),
    };

    var _device = _maps.get(item.DeviceID);
    if (isNull(_device) === false) {
      _row.RoomName = _device.Room;
    }

    _rows.push(_row);
  });

  grid.clear();
  grid.rows.add(_rows).draw();
};

var query = function () {
  if ($systemAuth === null) return false;

  if (grid == null) return false;

  var start = moment($("#py-alarm-start").val(), "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  var end = moment($("#py-alarm-end").val(), "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  var param = start + "&" + end;
  if (curnode !== null) {
    if (curnode.type === 0) {
      $.each(curnode.children, function (index, item) {
        param += "&" + item.id;
      });
    } else if (curnode.type === 1) {
      param += "&" + curnode.id;
    }
  }

  var me = $("#query");
  me.button("loading");
  grid.clear().draw();
  $.ajax({
    url: $requestURI + "gethistalarm?" + $systemAuth.token + "&" + param,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          setData(data);
        } else {
          showAlert(i18n.get("dialog.alert.error.title"), data, "danger");
        }
      }
    },
  }).always(function () {
    me.button("reset");
  });
};
