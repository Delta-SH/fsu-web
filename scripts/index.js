var chart1 = null;
var chart2 = null;
var chart3 = null;
var chart4 = null;
var timerid = 0;
var timerval = 6000;
var option1 = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  legend: {
    data: ["一级告警", "二级告警", "三级告警", "四级告警"],
    align: "left",
  },
  grid: {
    top: 25,
    left: 5,
    right: 10,
    bottom: 5,
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      data: ["NODATA"],
      splitLine: { show: false },
    },
  ],
  yAxis: [
    {
      type: "value",
    },
  ],
  series: [
    {
      name: "一级告警",
      type: "bar",
      itemStyle: {
        normal: {
          color: "#dd514c",
        },
      },
      data: [0],
    },
    {
      name: "二级告警",
      type: "bar",
      itemStyle: {
        normal: {
          color: "#f37b1d",
        },
      },
      data: [0],
    },
    {
      name: "三级告警",
      type: "bar",
      itemStyle: {
        normal: {
          color: "#ffd700",
        },
      },
      data: [0],
    },
    {
      name: "四级告警",
      type: "bar",
      itemStyle: {
        normal: {
          color: "#3bb4f2",
        },
      },
      data: [0],
    },
  ],
};
var option2 = {
  tooltip: {
    trigger: "item",
  },
  legend: {
    x: "left",
    y: "middle",
    orient: "vertical",
    data: ["一级告警", "二级告警", "三级告警", "四级告警"],
  },
  series: [
    {
      name: "活动告警占比",
      type: "pie",
      radius: [35, 70],
      center: ["62%", "50%"],
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: false,
          position: "center",
        },
        emphasis: {
          show: true,
          textStyle: {
            fontSize: "16",
            fontWeight: "bold",
          },
        },
      },
      labelLine: {
        normal: {
          show: false,
        },
      },
      data: [
        {
          value: 0,
          name: "一级告警",
          itemStyle: {
            normal: {
              color: "#dd514c",
            },
          },
        },
        {
          value: 0,
          name: "二级告警",
          itemStyle: {
            normal: {
              color: "#f37b1d",
            },
          },
        },
        {
          value: 0,
          name: "三级告警",
          itemStyle: {
            normal: {
              color: "#ffd700",
            },
          },
        },
        {
          value: 0,
          name: "四级告警",
          itemStyle: {
            normal: {
              color: "#3bb4f2",
            },
          },
        },
      ],
    },
  ],
};
var option3 = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
  },
  legend: {
    data: ["总计", "一级告警", "二级告警", "三级告警", "四级告警"],
    selected: {
      总计: false,
    },
  },
  grid: {
    top: 25,
    left: 5,
    right: 10,
    bottom: 5,
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      boundaryGap: false,
      data: ["NODATA"],
    },
  ],
  yAxis: [
    {
      type: "value",
    },
  ],
  series: [
    {
      name: "总计",
      type: "line",
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: "#5eb95e",
      },
      data: [0],
    },
    {
      name: "一级告警",
      type: "line",
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: "#dd514c",
      },
      data: [0],
    },
    {
      name: "二级告警",
      type: "line",
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: "#f37b1d",
      },
      data: [0],
    },
    {
      name: "三级告警",
      type: "line",
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: "#ffd700",
      },
      data: [0],
    },
    {
      name: "四级告警",
      type: "line",
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: "#3bb4f2",
      },
      data: [0],
    },
  ],
};
var option4 = {
  tooltip: {
    trigger: "item",
  },
  legend: {
    x: "left",
    y: "middle",
    orient: "vertical",
    data: ["一级告警", "二级告警", "三级告警", "四级告警"],
  },
  series: [
    {
      name: "历史告警占比",
      type: "pie",
      radius: [35, 70],
      center: ["62%", "50%"],
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: false,
          position: "center",
        },
        emphasis: {
          show: true,
          textStyle: {
            fontSize: "16",
            fontWeight: "bold",
          },
        },
      },
      labelLine: {
        normal: {
          show: false,
        },
      },
      data: [
        {
          value: 0,
          name: "一级告警",
          itemStyle: {
            normal: {
              color: "#dd514c",
            },
          },
        },
        {
          value: 0,
          name: "二级告警",
          itemStyle: {
            normal: {
              color: "#f37b1d",
            },
          },
        },
        {
          value: 0,
          name: "三级告警",
          itemStyle: {
            normal: {
              color: "#ffd700",
            },
          },
        },
        {
          value: 0,
          name: "四级告警",
          itemStyle: {
            normal: {
              color: "#3bb4f2",
            },
          },
        },
      ],
    },
  ],
};

$().ready(function () {
  initChart();
  setActive();
  setHistory();
  setFsuInfo();
  done();
});

alarmCallback = function (data, ended) {
  setActive(data);
  if (ended === true) {
    setHistory();
  }
};

var getCategory = function () {
  var alarms = $store.get("pylon.request.alarm");
  if (isNullOrEmpty(alarms) === false) {
    var data = JSON.parse(alarms);
    if ($.isArray(data) && data.length > 0) {
      return data;
    }
  }

  return null;
};

var getCount = function (data) {
  var obj = { L1: 0, L2: 0, L3: 0, L4: 0 };
  if (isNullOrEmpty(data) === false) {
    $.each(data, function (name, value) {
      if (value.AlarmLevel == 1) obj.L1++;
      else if (value.AlarmLevel == 2) obj.L2++;
      else if (value.AlarmLevel == 3) obj.L3++;
      else if (value.AlarmLevel == 4) obj.L4++;
    });
  }

  return obj;
};

var getHAlarms = function (start, end, callback, error) {
  if ($systemAuth === null) {
    error();
    return false;
  }

  $.ajax({
    url:
      $requestURI +
      "gethistalarm?" +
      $systemAuth.token +
      "&" +
      start +
      "&" +
      end,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false && data.startWith("Error") === false) {
        var obj = JSON.parse(data);
        if ($.isArray(obj) && obj.length > 0) {
          callback(obj);
          return;
        }
      }

      error();
    },
    error: error,
  });
};

var getFsuInfo = function (callback, error) {
  if ($systemAuth === null) {
    error();
    return false;
  }

  $.ajax({
    url: $requestURI + "getfsuinfo?" + $systemAuth.token,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false && data.startWith("Error") === false) {
        callback(JSON.parse(data));
        return;
      }

      error();
    },
    error: error,
  });
};

var setCategory = function (count) {
  $("#py-category-alarm1").html(count.L1);
  $("#py-category-alarm2").html(count.L2);
  $("#py-category-alarm3").html(count.L3);
  $("#py-category-alarm4").html(count.L4);
  $("#py-category-alarm").html(count.L1 + count.L2 + count.L3 + count.L4);
};

var setChart1 = function (data) {
  if (isNullOrEmpty(data) === true) {
    resetChart1();
    return false;
  }

  var _maps = new HashMap();
  var devices = $store.get("pylon.request.device");
  if (isNull(devices) === false) {
    var _devices = JSON.parse(devices);
    $.each(_devices, function (index, item) {
      _maps.put(item.ID, item);
    });
  }

  if (_maps.size() == 0) {
    resetChart1();
    return false;
  }

  var categories = [];
  $.each(data, function (index, item) {
    var categroy = {
      DeviceID: item.DeviceID,
      DeviceType: "未定义",
      SignalID: item.SignalID,
      AlarmLevel: item.AlarmLevel,
    };

    var _device = _maps.get(item.DeviceID);
    if (isNull(_device) === false) {
      categroy.DeviceType = _device.Type;
    }

    categories.push(categroy);
  });

  if (categories.length == 0) {
    resetChart1();
    return false;
  }

  option1.xAxis[0].data = [];
  option1.series[0].data = [];
  option1.series[1].data = [];
  option1.series[2].data = [];
  option1.series[3].data = [];

  var typeObject = _.groupBy(categories, function (item) {
    return item.DeviceType;
  });
  $.each(typeObject, function (key, value, list) {
    option1.xAxis[0].data.push(key);
    var level1 = 0,
      level2 = 0,
      level3 = 0,
      level4 = 0;
    $.each(value, function (index, item) {
      if (item.AlarmLevel == 1) level1++;
      else if (item.AlarmLevel == 2) level2++;
      else if (item.AlarmLevel == 3) level3++;
      else if (item.AlarmLevel == 4) level4++;
    });
    option1.series[0].data.push(level1);
    option1.series[1].data.push(level2);
    option1.series[2].data.push(level3);
    option1.series[3].data.push(level4);
  });

  chart1.setOption(option1, true);
};

var resetChart1 = function () {
  option1.xAxis[0].data = ["NODATA"];
  option1.series[0].data = [0];
  option1.series[1].data = [0];
  option1.series[2].data = [0];
  option1.series[3].data = [0];
  chart1.setOption(option1, true);
};

var setChart2 = function (count) {
  option2.series[0].data[0].value = count.L1;
  option2.series[0].data[1].value = count.L2;
  option2.series[0].data[2].value = count.L3;
  option2.series[0].data[3].value = count.L4;
  chart2.setOption(option2, true);
};

var setChart3 = function (data) {
  if (isNullOrEmpty(data) === true) {
    resetChart3();
    return false;
  }

  if (data.length == 0) {
    resetChart3();
    return false;
  }

  option3.xAxis[0].data = [];
  option3.series[0].data = [];
  option3.series[1].data = [];
  option3.series[2].data = [];
  option3.series[3].data = [];
  option3.series[4].data = [];

  var timeObject = _.groupBy(data, function (item) {
    return moment(item.StartTime, "YYYY-MM-DD HH:mm:ss").format("MM/DD");
  });
  $.each(timeObject, function (key, value, list) {
    var level1 = 0,
      level2 = 0,
      level3 = 0,
      level4 = 0;
    $.each(value, function (index, item) {
      if (item.AlarmLevel == 1) level1++;
      else if (item.AlarmLevel == 2) level2++;
      else if (item.AlarmLevel == 3) level3++;
      else if (item.AlarmLevel == 4) level4++;
    });

    option3.xAxis[0].data.push(key);
    option3.series[0].data.push(level1 + level2 + level3 + level4);
    option3.series[1].data.push(level1);
    option3.series[2].data.push(level2);
    option3.series[3].data.push(level3);
    option3.series[4].data.push(level4);
  });

  chart3.setOption(option3, true);
};

var resetChart3 = function () {
  option3.xAxis[0].data = ["NODATA"];
  option3.series[0].data = [0];
  option3.series[1].data = [0];
  option3.series[2].data = [0];
  option3.series[3].data = [0];
  option3.series[4].data = [0];
  chart3.setOption(option3, true);
};

var setChart4 = function (count) {
  option4.series[0].data[0].value = count.L1;
  option4.series[0].data[1].value = count.L2;
  option4.series[0].data[2].value = count.L3;
  option4.series[0].data[3].value = count.L4;
  chart4.setOption(option4, true);
};

var initChart = function () {
  chart1 = echarts.init(document.getElementById("py-categroy-chart1"), "shine");
  chart1.setOption(option1);

  chart2 = echarts.init(document.getElementById("py-categroy-chart2"), "shine");
  chart2.setOption(option2);

  chart3 = echarts.init(document.getElementById("py-categroy-chart3"), "shine");
  chart3.setOption(option3);

  chart4 = echarts.init(document.getElementById("py-categroy-chart4"), "shine");
  chart4.setOption(option4);
};

var setActive = function (data) {
  data = data || getCategory();
  var count = getCount(data);

  setCategory(count);
  setChart1(data);
  setChart2(count);
};

var setHistory = function () {
  var start = moment().subtract(29, "days").format("YYYY-MM-DD 00:00:00");
  var end = moment().format("YYYY-MM-DD HH:mm:ss");
  getHAlarms(
    start,
    end,
    function (alarms) {
      var hcount = getCount(alarms);
      setChart3(alarms);
      setChart4(hcount);
    },
    function () {
      var hcount = getCount(null);
      resetChart3();
      setChart4(hcount);
    }
  );
};

var setFsuInfo = function () {
  getFsuInfo(
    function (config) {
      if (isNull(config) === false) {
        $("#fsu-firmware").html(config.Firmware || "");
        $("#fsu-software").html(config.Software || "");
        $("#fsu-cpuusage").html(String.format("{0}%", config.CPUUsage || 0));
        $("#fsu-emeusage").html(String.format("{0}%", config.MemUsage || 0));
        $("#fsu-memavailable").html(
          String.format("{0}MB", config.MemAvailable || 0)
        );
        $("#fsu-memavailable2").html(
          String.format("{0}MB", config.MemAvailable2 || 0)
        );
        $("#fsu-runtime").html(config.Runtime);
        $("#fsu-wirelessmodule").html(config.WirelessModule || "");
        $("#fsu-wirelessdevice").html(config.WirelessDevice || "");
        $("#fsu-wirelessmobile").html(config.WirelessMobile || "");
        $("#fsu-wirelessinfo").html(
          String.format(
            "运营商：{0} &nbsp;&nbsp;&nbsp;&nbsp; 制式：{1} &nbsp;&nbsp;&nbsp;&nbsp; 信号：{2}",
            config.WirelessInfo?.Provider,
            config.WirelessInfo?.Standard,
            config.WirelessInfo?.Signal
          )
        );
        $("#fsu-wirelessaddress").html(config.WirelessAddress || "");
        $("#fsu-wirelesstraffic").html(
          String.format(
            "接收：{0} 字节 &nbsp;&nbsp;&nbsp;&nbsp; 发送：{1} 字节",
            config.WirelessTraffic?.Receive,
            config.WirelessTraffic?.Send
          )
        );
        $("#fsu-vpnaddress").html(config.VPNAddress || "");
        $("#fsu-vpntraffic").html(
          String.format(
            "接收：{0} 字节 &nbsp;&nbsp;&nbsp;&nbsp; 发送：{1} 字节",
            config.VPNTraffic?.Receive,
            config.VPNTraffic?.Send
          )
        );
      }

      if (timerid > 0) {
        clearTimeout(timerid);
        timerid = 0;
      }

      timerid = setTimeout(setFsuInfo, timerval);
    },
    function () {
      if (timerid > 0) {
        clearTimeout(timerid);
        timerid = 0;
      }

      timerid = setTimeout(setFsuInfo, timerval);
    }
  );
};
