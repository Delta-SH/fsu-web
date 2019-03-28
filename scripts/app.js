var $systemAuth = null;
var $screenTime = 300000;
var $screenTimeId = null;
var $alarmInterval = 10000;
$().ready(function () {
    $systemAuth = getSystemAuth();
    if (isNull($systemAuth) === true) {
        logout();
        return;
    }

    setScreen();
    setAlarm();
});

var header = function () {
    $.ajax({
        type: "get",
        url: 'header.html',
        dataType: "html",
        async: false,
        success: function (data) {
            $('#py-header').html(data);
        },
        error: function (err) {
            $('#py-header').html(err.responseText || "模板加载失败");
        }
    });
};

var footer = function () {
    $.ajax({
        type: "get",
        url: 'footer.html',
        dataType: "html",
        async: false,
        success: function (data) {
            $('#py-footer').html(data);
        },
        error: function (err) {
            $('#py-footer').html(err.responseText || "模板加载失败");
        }
    });
};

var done = function () {
    $('#py-masking').hide();
};

var createGrid = function (element, options) {
    var _grid = null;
    var _defaults = {
        searching: false,
        scrollX: true,
        order: [],
        pageLength: 20,
        drawCallback: function (settings) {
            if (isNull(_grid) === false && isNull(_grid.selectedIndex) === false) {
                _grid.row(_grid.selectedIndex).nodes().to$().addClass('selected');
            }
        },
        language: {
            lengthMenu: '显示条数 _MENU_',
            info: '显示 _START_-_END_ 条，共 _TOTAL_ 条',
            infoEmpty: '没有数据',
            paginate: {
                first: "<span class='am-icon-angle-double-left'></span>",
                previous: "<span class='am-icon-angle-left'></span>",
                next: "<span class='am-icon-angle-right'></span>",
                last: "<span class='am-icon-angle-double-right'></span>"
            }
        },
        dom: "<'am-g am-datatable-center'<'am-u-sm-12'tr>><'am-g am-datatable-footer'<'am-u-sm-5'i><'am-u-sm-7'p>>"
    };

    options = $.extend(_defaults, options);

    _grid = $(element).DataTable(options);

    $(element + ' tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected'))
            return;

        _grid.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
        _grid.selectedIndex = _grid.row(this).index();
    });

    return _grid;
};

var setScreen = function () {
    var _screentime = $store.get('pylon.screen.time');
    if (isNull(_screentime) === false) $screenTime = parseInt(_screentime);

    $screenTimeId = setTimeout(logout, $screenTime);
    $('html,body').on('keydown mousedown touchstart', function () {
        clearTimeout($screenTimeId);
        $screenTimeId = setTimeout(logout, $screenTime);
    });
};

var setAlarm = function () {
    $.ajax({
        url: $requestURI + 'getrealalarm?' + $systemAuth.token,
        success: function (data, status) {
            if (isNullOrEmpty(data) === false &&
                data.startWith('Error') === false) {
                var alarms = $store.get('pylon.request.alarm');
                if (isNull(alarms) === false) {
                    var _alarms = [];
                    if (isEmpty(alarms) === false)
                        _alarms = JSON.parse(alarms);

                    var _data = JSON.parse(data);
                    var _ended = false;
                    $.each(_data, function (index, item) {
                        if (isNullOrEmpty(item.EndTime) === true) {
                            var _current = _.find(_alarms, function (value) {
                                return item.DeviceID === value.DeviceID && item.SignalID === value.SignalID;
                            });
                            if (isNull(_current) === true) {
                                _alarms.push(item);
                            }
                        } else {
                            var _current = _.find(_alarms, function (value) {
                                return item.DeviceID === value.DeviceID && item.SignalID === value.SignalID;
                            });
                            if (isNull(_current) === false) {
                                _alarms = _.without(_alarms, _current);
                            }

                            _ended = true;
                        }
                    });

                    $store.set('pylon.request.alarm', JSON.stringify(_alarms));
                    setAlarmCount(_alarms);
                    alarmCallback(_alarms, _ended);
                }

                setTimeout(setAlarm, $alarmInterval);
                return;
            }

            logout();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            logout();
        }
    });
};

var setAlarmCount = function (data) {
    var _level1 = 0,
        _level2 = 0,
        _level3 = 0,
        _level4 = 0;
    if ($.isArray(data) && data.length > 0) {
        $.each(data, function (name, value) {
            if (value.AlarmLevel == 1)
                _level1++;
            else if (value.AlarmLevel == 2)
                _level2++;
            else if (value.AlarmLevel == 3)
                _level3++;
            else if (value.AlarmLevel == 4)
                _level4++;
        });
    }

    $('#currentAlarm1').html(_level1);
    $('#currentAlarm2').html(_level2);
    $('#currentAlarm3').html(_level3);
    $('#currentAlarm4').html(_level4);
    $('#currentAlarm').html(_level1 + _level2 + _level3 + _level4);
};

var alarmCallback = function (data, ended) {};

var showAlert = function (title, content, theme) {
    var modal = $('#py-alert'),
        dialog = modal.children('.py-modal-dialog'),
        hd = dialog.children('.py-modal-hd'),
        bd = dialog.children('.py-modal-bd');

    dialog.removeClass('py-modal-danger py-modal-warning py-modal-primary py-modal-success');
    if (theme === 'danger') {
        dialog.addClass('py-modal-danger');
        hd.html('<i class="am-icon-times-circle"></i> ' + title);
        bd.html(content);
    } else if (theme === 'warning') {
        dialog.addClass('py-modal-warning');
        hd.html('<i class="am-icon-exclamation-circle"></i> ' + title);
        bd.html(content);
    } else if (theme === 'primary') {
        dialog.addClass('py-modal-primary');
        hd.html('<i class="am-icon-info-circle"></i> ' + title);
        bd.html(content);
    } else if (theme === 'success') {
        dialog.addClass('py-modal-success');
        hd.html('<i class="am-icon-check-circle"></i> ' + title);
        bd.html(content);
    } else {
        hd.html('<i class="am-icon-info-circle"></i> ' + title);
        bd.html(content);
    }

    modal.modal();
};

header();
footer();