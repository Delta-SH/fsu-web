var grid = null;
var curtree = null;
var curnode = null;
$().ready(function() {
    setGrid();
    setTree();
    setEvent();
    done();
});

alarmCallback = function(data, ended) {
    load();
};

var setTree = function() {
    var root = {
        id: 'root',
        name: '全部',
        open: true,
        icon: "images/all.png",
        type: -1,
        children: []
    };
    var setting = {
        callback: {
            onClick: function(event, treeId, treeNode) {
                curnode = treeNode;
                load();
            }
        }
    };

    var data = $store.get('pylon.request.device');
    if (isNull(data) === false) {
        var _data = JSON.parse(data);
        var _devs = _.groupBy(_data, function(value) {
            return value.Room;
        });

        _.each(_devs, function(value, key, list) {
            var _node = {
                id: key,
                name: key,
                open: true,
                icon: "images/room.png",
                type: 0,
                children: []
            }
            _.each(value, function(element, index) {
                _node.children.push({
                    id: element.ID,
                    name: element.Name,
                    icon: "images/device.png",
                    type: 1
                })
            });
            root.children.push(_node);
        });
    }

    curtree = $.fn.zTree.init($("#nav-tree"), setting, root);
};

var setEvent = function() {
    $('#py-alarm-level').on('change', function() {
        load();
    });
};

var setGrid = function() {
    grid = createGrid('#py-grid', {
        order: [
            [0, 'desc']
        ],
        columns: [{
            title: '序号',
            data: 'SerialNO'
        }, {
            title: '级别',
            data: 'AlarmLevel',
            className: 'center'
        }, {
            title: '机房',
            data: 'RoomName'
        }, {
            title: '设备',
            data: 'DeviceName'
        }, {
            title: '信号',
            data: 'SignalName'
        }, {
            title: '时间',
            data: 'StartTime',
            className: 'center'
        }, {
            title: '触发值',
            data: 'StartValue'
        }, {
            title: '描述',
            data: 'AlarmDesc'
        }, {
            title: '历时',
            data: 'Interval',
            className: 'center'
        }],
        columnDefs: [{
            targets: 1,
            render: function(data, type, row) {
                return getAlarmName(data);
            },
            createdCell: function(td, cellData, rowData, row, col) {
                $(td).addClass(getAlarmClass(cellData));
            }
        }]
    });
};

var load = function() {
    if (grid == null)
        return false;

    var alarms = $store.get('pylon.request.alarm');
    if (isNullOrEmpty(alarms) === true) {
        grid.clear().draw();
        return false;
    }

    var _alarms = JSON.parse(alarms);
    if (_alarms.length === 0) {
        grid.clear().draw();
        return true;
    }

    var _levels = $('#py-alarm-level').val();
    if (isNull(_levels) === false && _levels.length > 0) {
        _alarms = _.filter(_alarms, function(value) {
            return _.contains(_levels, value.AlarmLevel.toString());
        });
    }

    if (_alarms.length === 0) {
        grid.clear().draw();
        return true;
    }

    var _maps = new HashMap();
    var devices = $store.get('pylon.request.device');
    if (isNull(devices) === false) {
        var _devices = JSON.parse(devices);
        _.each(_devices, function(element, index, list) {
            _maps.put(element.ID, element)
        });
    }

    var _data = [];
    _.each(_alarms, function(element, index, list) {
        var _row = {
            SerialNO: element.SerialNO,
            RoomName: '--',
            DeviceID: element.DeviceID,
            DeviceName: element.DeviceName,
            SignalID: element.SignalID,
            SignalName: element.SignalName,
            AlarmLevel: element.AlarmLevel,
            AlarmDesc: element.AlarmDesc,
            StartTime: element.StartTime,
            StartValue: element.StartValue,
            Interval: getTimespan(element.StartTime)
        };

        var _device = _maps.get(element.DeviceID);
        if (isNull(_device) === false) {
            _row.RoomName = _device.Room;
        }

        _data.push(_row);
    });

    if (curnode != null && curnode.type >= 0) {
        _data = _.filter(_data, function(value) {
            return (curnode.type == 0 && curnode.id == value.RoomName) ||
                (curnode.type == 1 && curnode.id == value.DeviceID);
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