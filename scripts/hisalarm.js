var grid = null;
var curtree = null;
var curnode = null;
$().ready(function () {
  setSize();
  setTree();
  setGrid();
  setDate();
  setEvent();
  done();
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
    name: "全部",
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
        title: "序号",
        data: "SerialNO",
      },
      {
        title: "级别",
        data: "AlarmLevel",
        className: "center",
      },
      {
        title: "机房",
        data: "RoomName",
      },
      {
        title: "设备",
        data: "DeviceName",
      },
      {
        title: "信号",
        data: "SignalName",
      },
      {
        title: "开始时间",
        data: "StartTime",
        className: "center",
      },
      {
        title: "触发告警值",
        data: "StartValue",
      },
      {
        title: "结束时间",
        data: "EndTime",
        className: "center",
      },
      {
        title: "告警结束值",
        data: "EndValue",
      },
      {
        title: "描述",
        data: "AlarmDesc",
      },
      {
        title: "历时",
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
          showAlert("系统错误", data, "danger");
        }
      }
    },
  }).always(function () {
    me.button("reset");
  });
};
