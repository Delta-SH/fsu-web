var grid = null;
var curtree = null;
var curnode = null;
$().ready(function () {
  setSize();
  i18n.apply(function () {
    initTree();
    initSelect();
    initGrid();
    setEvent();
    done();
  });
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
  if (data.length === 0) {
    grid.clear().draw();
    return true;
  }

  var _rows = [];
  var _types = $("#py-device-type").val();
  var _room = null;
  if (curnode !== null && curnode.type === 0) {
    _room = curnode.id;
  }
  $.each(data, function (index, item) {
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
        title: i18n.get("hisdevice.table.column.ID"),
        data: "ID",
      },
      {
        title: i18n.get("hisdevice.table.column.Name"),
        data: "Name",
      },
      {
        title: i18n.get("hisdevice.table.column.Type"),
        data: "Type",
      },
      {
        title: i18n.get("hisdevice.table.column.Room"),
        data: "Room",
      },
      {
        title: i18n.get("hisdevice.table.column.Brand"),
        data: "Brand",
      },
      {
        title: i18n.get("hisdevice.table.column.Model"),
        data: "Model",
      },
      {
        title: i18n.get("hisdevice.table.column.Version"),
        data: "Version",
      },
      {
        title: i18n.get("hisdevice.table.column.BeginTime"),
        data: "BeginTime",
        className: "center",
      },
      {
        title: i18n.get("hisdevice.table.column.Desc"),
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

  setData($store.get("pylon.request.device"));
  me.button("reset");
};
