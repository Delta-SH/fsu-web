var grid = null;
var curtree = null;
var curnode = null;
$().ready(function () {
  i18n.apply(function () {
    setGrid();
    setTree();
    setEvent();
    done();
  });
});

alarmCallback = function (data, ended) {
  load();
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
        load();
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

var setEvent = function () {
  $("#py-alarm-level").on("change", function () {
    load();
  });
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

var load = function () {
  if (grid == null) return false;

  var alarms = $store.get("pylon.request.alarm");
  if (alarms.length === 0) {
    grid.clear().draw();
    return true;
  }

  var _levels = $("#py-alarm-level").val();
  if (isNull(_levels) === false && _levels.length > 0) {
    alarms = _.filter(alarms, function (value) {
      return _.contains(_levels, value.AlarmLevel.toString());
    });
  }

  if (alarms.length === 0) {
    grid.clear().draw();
    return true;
  }

  var _maps = new HashMap();
  var devices = $store.get("pylon.request.device");
  if (devices.length > 0) {
    _.each(devices, function (element, index, list) {
      _maps.put(element.ID, element);
    });
  }

  var _data = [];
  _.each(alarms, function (element, index, list) {
    var _row = {
      SerialNO: element.SerialNO,
      RoomName: "--",
      DeviceID: element.DeviceID,
      DeviceName: element.DeviceName,
      SignalID: element.SignalID,
      SignalName: element.SignalName,
      AlarmLevel: element.AlarmLevel,
      AlarmDesc: element.AlarmDesc,
      StartTime: element.StartTime,
      StartValue: element.StartValue,
      Interval: getTimespan(element.StartTime),
    };

    var _device = _maps.get(element.DeviceID);
    if (isNull(_device) === false) {
      _row.RoomName = _device.Room;
    }

    _data.push(_row);
  });

  if (curnode != null && curnode.type >= 0) {
    _data = _.filter(_data, function (value) {
      return (
        (curnode.type == 0 && curnode.id == value.RoomName) ||
        (curnode.type == 1 && curnode.id == value.DeviceID)
      );
    });

    if (_data.length === 0) {
      grid.clear().draw();
      return true;
    }
  }

  var _page = grid.page();
  grid.clear();
  grid.rows.add(_data);
  grid.draw(false).page(_page);
  return true;
};
