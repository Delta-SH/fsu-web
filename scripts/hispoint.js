var grid = null;
var curtree = null;
var curnode = null;
$().ready(function() {
    setSize();
    setTree();
    setGrid();
    setDate();
    setEvent();
    done();
});

var setEvent = function() {
    $(window).resize(setSize);
    $('#query').click(query);
    $('#start-datetimepicker').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii',
        autoclose: true,
        pickerPosition: 'top-right'
    });
    $('#end-datetimepicker').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii',
        autoclose: true,
        pickerPosition: 'top-right'
    });
};

var setSize = function() {
    var height = $(window).height();
    $('#nav-tree').height(height - 208);
};

var setTree = function() {
    var roots = [];
    var setting = {
        callback: {
            onClick: function(event, treeId, treeNode) {
                curnode = treeNode;
                if (treeNode.type === 1) {
                    curtree.expandNode(treeNode, null, false, true, true);
                }
            },
            beforeExpand: function(treeId, treeNode) {
                loadPoints(treeNode);
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
                    type: 1,
                    children: []
                })
            });
            roots.push(_node);
        });
    }

    curtree = $.fn.zTree.init($("#nav-tree"), setting, roots);
};

var setGrid = function() {
    grid = createGrid('#py-grid', {
        columns: [{
            title: '信号',
            data: 'Name'
        }, {
            title: '类型',
            data: 'Type',
            className: 'center'
        }, {
            title: '测值',
            data: 'Value'
        }, {
            title: '单位/描述',
            data: 'Remark'
        }, {
            title: '时间',
            data: 'Time',
            className: 'center'
        }],
        columnDefs: [{
            targets: 3,
            render: function(data, type, row) {
                return getUnit(row.Value, row.Type, data);
            }
        }]
    });
};

var setDate = function() {
    $('#py-point-start').val(moment({
        hour: 0,
        minute: 0,
        seconds: 0
    }).add(-1, 'days').format('YYYY-MM-DD HH:mm'));
    $('#py-point-end').val(moment({
        hour: 0,
        minute: 0,
        seconds: 0
    }).format('YYYY-MM-DD HH:mm'));
};

var setData = function(data) {
    if (isNull(grid._signal) === true) {
        grid.clear().draw();
        return false;
    }

    var _data = JSON.parse(data);
    if (_data.length === 0) {
        grid.clear().draw();
        return true;
    }

    var _rows = [];
    var _signal = grid._signal;
    $.each(_data, function(index, item) {
        var _row = {
            Name: _signal.Name,
            Type: _signal.Type,
            Remark: _signal.ValueDesc,
            Value: item.Value,
            Time: item.Time
        };

        _rows.push(_row);
    });

    grid.clear();
    grid.rows.add(_rows).draw();
};

var query = function() {
    if ($systemAuth === null)
        return false;

    if (grid == null)
        return false;

    if (curnode === null || curnode.type !== 2) {
        showAlert('系统错误', '请选择查询的信号', 'danger');
        return;
    }

    var start = moment($('#py-point-start').val(), 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
    var end = moment($('#py-point-end').val(), 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
    var param = start + '&' + end + '&' + curnode.id + '@' + curnode.pid;

    grid._signal = curnode.pdata;
    grid.clear().draw();

    var me = $('#query');
    me.button('loading');
    $.ajax({
        url: $requestURI + 'gethistvalue?' + $systemAuth.token + '&' + param,
        success: function(data, status) {
            if (isNullOrEmpty(data) === false) {
                if (data.startWith('Error') === false) {
                    setData(data);
                } else {
                    showAlert('系统错误', data, 'danger');
                }
            }
        }
    }).always(function() {
        me.button('reset');
    });
};

var loadPoints = function(node) {
    if ($systemAuth === null)
        return false;

    if (curtree === null)
        return false;

    if (node === null)
        return false;

    if (node.type !== 1)
        return false;

    if (isNull(node.ajaxed) === false)
        return false;

    var _icon = node.icon;
    node.icon = 'images/loading.gif'
    curtree.updateNode(node);
    $.ajax({
        url: $requestURI + 'getsignals?' + $systemAuth.token + '&' + node.id,
        success: function(data, status) {
            if (isNullOrEmpty(data) === false) {
                if (data.startWith('Error') === false) {
                    var _data = JSON.parse(data);
                    var _nodes = [];
                    $.each(_data, function(index, item) {
                        if (item.Type == 2 || item.Type == 3)
                            return true;

                        _nodes.push({
                            id: item.ID,
                            name: item.Name,
                            icon: "images/signal.png",
                            type: 2,
                            pid: node.id,
                            pdata: item
                        });
                    });

                    node.ajaxed = true;
                    curtree.addNodes(node, _nodes);
                } else {
                    showAlert('系统错误', data, 'danger');
                }
            }
        }
    }).always(function() {
        node.icon = _icon;
        curtree.updateNode(node);
    });
};