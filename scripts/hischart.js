var curtree = null;
var curnode = null;
var curchart = null;
var chartOption = {
  title: {
    text: "历史性能曲线图",
    subtext: "",
    x: "center",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
    formatter: function (params) {
      if (chartOption.series.length > 0) {
        if (!$.isArray(params)) params = [params];

        var tips = [];
        $.each(params, function (index, item) {
          tips.push(
            String.format(
              '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:{0}"></span>{1}<br/>信号测值：{2} {3}<br/>测值时间：{4}',
              item.color,
              item.seriesName,
              item.value[1],
              item.data.unit,
              item.value[0]
            )
          );
        });

        return tips.join("<br/>");
      }

      return "无数据";
    },
  },
  legend: {
    type: "scroll",
    left: "center",
    top: "60",
    data: [],
  },
  grid: {
    top: 100,
    left: 20,
    right: 20,
    bottom: 40,
    containLabel: true,
  },
  dataZoom: [
    {
      type: "inside",
      start: 0,
      end: 100,
    },
    {
      type: "slider",
      show: true,
      start: 0,
      end: 100,
    },
  ],
  xAxis: [
    {
      type: "time",
      boundaryGap: false,
      splitLine: {
        show: false,
      },
    },
  ],
  yAxis: [
    {
      type: "value",
    },
  ],
  series: [],
};
$().ready(function () {
  setSize();
  setTree();
  setDate();
  setEvent();
  initChart();
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
  $("#nav-tree").height(height - 213);
  $("#py-chart").height(height - 107);
};

var setTree = function () {
  var roots = [];
  var setting = {
    callback: {
      onClick: function (event, treeId, treeNode) {
        curnode = treeNode;
        if (treeNode.type === 1) {
          curtree.expandNode(treeNode, null, false, true, true);
        }
      },
      beforeExpand: function (treeId, treeNode) {
        loadPoints(treeNode);
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
        nocheck: true,
        children: [],
      };
      _.each(value, function (element, index) {
        _node.children.push({
          id: element.ID,
          name: element.Name,
          icon: "images/device.png",
          type: 1,
          nocheck: true,
          children: [],
        });
      });
      roots.push(_node);
    });
  }

  curtree = $.fn.zTree.init($("#nav-tree"), setting, roots);
};

var setDate = function () {
  var _start = moment({
    hour: 0,
    minute: 0,
    seconds: 0,
  })
    .add(-1, "days")
    .format("YYYY-MM-DD HH:mm");
  var _end = moment({
    hour: 0,
    minute: 0,
    seconds: 0,
  }).format("YYYY-MM-DD HH:mm");

  $("#py-point-start").val(_start);
  $("#py-point-end").val(_end);
  chartOption.title.subtext = String.format("{0}:00 - {1}:00", _start, _end);
};

var setChart = function (data, signal) {
  var _data = JSON.parse(data);
  var _models = [];
  $.each(_data, function (index, item) {
    _models.push({
      value: [item.Time, item.Value],
      unit: signal.ValueDesc,
    });
  });

  chartOption.legend.data.push(signal.Name);
  chartOption.series.push({
    name: signal.Name,
    type: "line",
    smooth: true,
    showSymbol: false,
    itemStyle: {
      normal: {
        color: "#0892cd",
      },
    },
    data: _models,
  });

  curchart.setOption(chartOption, true);
};

var initChart = function () {
  curchart = echarts.init(document.getElementById("py-chart"), "shine");
  curchart.setOption(chartOption);
};

var query = function () {
  if ($systemAuth === null) return false;

  if (curtree === null) return false;

  if (curnode === null || curnode.type !== 2) {
    showAlert("系统错误", "请选择查询的信号", "danger");
    return;
  }

  var start = moment($("#py-point-start").val(), "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  var end = moment($("#py-point-end").val(), "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  var param = start + "&" + end + "&" + curnode.id + "@" + curnode.pid;

  var me = $("#query");
  me.button("loading");
  chartOption.legend.data = [];
  chartOption.series = [];
  chartOption.title.text = String.format("{0} 历史性能曲线", curnode.pname);
  chartOption.title.subtext = String.format("{0} - {1}", start, end);
  $.ajax({
    url: $requestURI + "gethistvalue?" + $systemAuth.token + "&" + param,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          setChart(data, curnode.pdata);
        } else {
          showAlert("系统错误", data, "danger");
        }
      }
    },
  })
    .fail(function () {
      curchart.setOption(chartOption, true);
    })
    .always(function () {
      me.button("reset");
    });
};

var loadPoints = function (node) {
  if ($systemAuth === null) return false;

  if (curtree === null) return false;

  if (node === null) return false;

  if (node.type !== 1) return false;

  if (isNull(node.ajaxed) === false) return false;

  var _icon = node.icon;
  node.icon = "images/loading.gif";
  curtree.updateNode(node);
  $.ajax({
    url: $requestURI + "getsignals?" + $systemAuth.token + "&" + node.id,
    success: function (data, status) {
      if (isNullOrEmpty(data) === false) {
        if (data.startWith("Error") === false) {
          var _data = JSON.parse(data);
          var _nodes = [];
          $.each(_data, function (index, item) {
            if (item.Type == 2 || item.Type == 3 || item.Type == 0) return true;

            _nodes.push({
              id: item.ID,
              name: item.Name,
              icon: "images/signal.png",
              type: 2,
              pid: node.id,
              pname: node.name,
              pdata: item,
            });
          });

          node.ajaxed = true;
          curtree.addNodes(node, _nodes);
        } else {
          showAlert("系统错误", data, "danger");
        }
      }
    },
  }).always(function () {
    node.icon = _icon;
    curtree.updateNode(node);
  });
};
