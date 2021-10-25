var grid = null;
var curtree = null;
var curnode = null;
$().ready(function () {
  initTree();
  initSelect();
  initGrid();
  setSize();
  setEvent();
  done();
});

var setEvent = function () {
  $(window).resize(setSize);
  $("#query").click(query);
};

var setSize = function () {
  var height = $(window).height();
  $("#nav-tree").height(height - 180);
};

var setData = function (data) {
  var _data = JSON.parse(data);
  if (_data.length === 0) {
    grid.clear().draw();
    return true;
  }

  var _rows = [];
  var _types = $("#py-device-type").val();
  var _room = null;
  if (curnode !== null && curnode.type === 0) {
    _room = curnode.id;
  }
  $.each(_data, function (index, item) {
    if (isNull(_types) === false && _types.length > 0) {
      if (_.contains(_types, item.Type) === false) return true;
    }

    if (isNull(_room) === false && _room !== item.Room) return true;

    var _row = {
      ID: item.ID,
      Name: item.Name,
      Type: item.Type,
      Room: item.Room,
      Brand: item.Brand,
      Model: item.Model,
      Version: item.Version,
      BeginTime: item.BeginTime,
      Desc: item.Desc,
    };

    _rows.push(_row);
  });

  grid.clear();
  grid.rows.add(_rows).draw();
};

var initTree = function () {
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

  var data = $store.get("pylon.request.room");
  if (isNull(data) === false) {
    $.each(data, function (index, item) {
      root.children.push({
        id: item,
        name: item,
        icon: "images/room.png",
        type: 0,
      });
    });
  }

  curtree = $.fn.zTree.init($("#nav-tree"), setting, root);
};

var initSelect = function () {
  var types = $store.get("pylon.request.devtype");
  if (isNull(types) === false) {
    var selector = $("#py-device-type");
    $.each(types, function (index, item) {
      selector.append(String.format('<option value="{0}">{0}</option>', item));
    });

    if (!$.AMUI.support.mutationobserver) {
      selector.trigger("changed.selected.amui");
    }
  }
};

var initGrid = function () {
  grid = createGrid("#py-grid", {
    order: [[0, "desc"]],
    columns: [
      {
        title: "编号",
        data: "ID",
      },
      {
        title: "名称",
        data: "Name",
      },
      {
        title: "类型",
        data: "Type",
      },
      {
        title: "所属机房",
        data: "Room",
      },
      {
        title: "品牌",
        data: "Brand",
      },
      {
        title: "型号",
        data: "Model",
      },
      {
        title: "版本",
        data: "Version",
      },
      {
        title: "上线时间",
        data: "BeginTime",
        className: "center",
      },
      {
        title: "描述",
        data: "Desc",
      },
    ],
  });
};

var query = function () {
  if (grid == null) return false;

  var me = $("#query");
  me.button("loading");
  grid.clear().draw();

  var data = $store.get("pylon.request.device");
  if (isNullOrEmpty(data) === false) {
    setData(data);
  }

  me.button("reset");
};
