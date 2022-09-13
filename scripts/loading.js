var auth = null;
var steps = 5;
var finish = [];
var timerid = null;
var timercnt = 0;
var timeout = 120;
$().ready(function () {
  auth = getSystemAuth();
  if (isNull(auth) === true) {
    logout();
    return;
  }

  timerid = window.setInterval(function () {
    timercnt++;
    if (finish.length >= steps) {
      window.clearInterval(timerid);
      window.location.href = "index.html";
    }

    if (timercnt > timeout) {
      showError("数据加载失败");
    }
  }, 1000);

  setScreen();
  setDevice();
  setAlarm();
});

var setScreen = function () {
  $.ajax({
    url:
      $requestURI + "getclientdefinedata?" + auth.token + "&pylon_screen_time",
    success: function (data, status) {
      var screenTime = 300000;
      if (isNullOrEmpty(data) === false) {
        data = data.replace(/\"/g, "");
        if (isEmpty(data) === false && data.startWith("Error") === false) {
          screenTime = parseInt(data);
        }
      }

      $store.set("pylon.screen.time", screenTime);
      finish.push("pylon.screen.time");
      setProgress();
    },
  });
};

var setDevice = function () {
  $.ajax({
    url: $requestURI + "getdevices?" + auth.token,
    success: function (data, status) {
      if (isNullOrEmpty(data) === true) {
        data = "[]";
      }

      if (data.startWith("Error") === true) {
        showError(String.format("设备加载失败({0})", data));
        return;
      }

      $store.set("pylon.request.device", JSON.parse(data));
      finish.push("pylon.request.device");
      setProgress();
      setDevType(data);
      setRoom(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showError(
        String.format(
          "设备加载失败({0}:{1}:{2})",
          jqXHR.status,
          jqXHR.statusText,
          jqXHR.responseText
        )
      );
    },
  });
};

var setDevType = function (data) {
  var types = [];
  var devices = JSON.parse(data);
  if (devices.length > 0) {
    $.each(devices, function (index, item) {
      if (_.contains(types, item.Type) === false) {
        types.push(item.Type);
      }
    });
  }

  $store.set("pylon.request.devtype", _.sortBy(types));
  finish.push("pylon.request.devtype");
  setProgress();
};

var setRoom = function (data) {
  var rooms = [];
  var devices = JSON.parse(data);
  if (devices.length > 0) {
    $.each(devices, function (index, item) {
      if (_.contains(rooms, item.Room) === false) {
        rooms.push(item.Room);
      }
    });
  }

  $store.set("pylon.request.room", _.sortBy(rooms));
  finish.push("pylon.request.room");
  setProgress();
};

var setAlarm = function () {
  $.ajax({
    url: $requestURI + "getactalarm?" + auth.token,
    success: function (data, status) {
      if (isNullOrEmpty(data) === true) {
        data = "[]";
      }

      if (data.startWith("Error") === true) {
        showError(String.format("告警加载失败({0})", data));
        return;
      }

      $store.set("pylon.request.alarm", JSON.parse(data));
      finish.push("pylon.request.alarm");
      setProgress();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showError(
        String.format(
          "告警加载失败({0}:{1}:{2})",
          jqXHR.status,
          jqXHR.statusText,
          jqXHR.responseText
        )
      );
    },
  });
};

var showError = function (error) {
  alert(error);
  logout();
};

var setProgress = function () {
  $(".am-progress-bar").css(
    "width",
    (finish.length / (steps * 1.0)) * 100 + "%"
  );
};
