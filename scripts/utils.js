var $cookie = $.AMUI.utils.cookie;
var $store = $.AMUI.store;
if (!$store.enabled) {
  alert("您的浏览器不支持本地存储功能，请升级浏览器。");
}

var $requestURI =
  window.location.protocol +
  "//" +
  $config.ip +
  ":" +
  $config.port +
  "/" +
  $config.path;
var $requestUid = $config.user;
$.ajaxSetup({
  timeout: 30000,
  type: "post",
  dataType: "text",
  crossDomain: true,
});

$().ready(function () {
  if (
    window.$config &&
    window.$config.picker &&
    window.$config.picker === true
  ) {
    $(".py-keypicker").keypicker();
  }
  var _requesturi = $store.get("pylon.auth.request.uri");
  if (isNull(_requesturi) === false) $requestURI = _requesturi;
});

var isNull = function (value) {
  return typeof value === "undefined" || value === null;
};

var isEmpty = function (value, whitespace) {
  return (whitespace || false) === true ? value.trim() : value === "";
};

var isNullOrEmpty = function (value, whitespace) {
  if (isNull(value) === true) return true;
  return isEmpty(value, whitespace);
};

var logout = function () {
  window.location.href = "login.html";
};

var getTimespan = function (start, end) {
  var _start = moment(start);
  var _end = isNull(end) ? moment() : moment(end);
  var _diff = _end.diff(_start);
  if (_diff < 0) _diff = 0;
  var _duration = moment.duration(_diff);
  return (
    parseInt(_duration.asHours(), 10) +
    ":" +
    moment([2000, 1, 1]).add(_duration).format("mm:ss")
  );
};

var getAlarmName = function (value) {
  if (value === 1) {
    return "一级告警";
  } else if (value === 2) {
    return "二级告警";
  } else if (value === 3) {
    return "三级告警";
  } else if (value === 4) {
    return "四级告警";
  } else {
    return "正常数据";
  }
};

var getPointType = function (value) {
  value = value.toString();
  if (value === "0") {
    return "遥信";
  } else if (value === "1") {
    return "遥测";
  } else if (value === "2") {
    return "遥控";
  } else if (value === "3") {
    return "遥调";
  } else {
    return "未定义";
  }
};

var getAlarmClass = function (value) {
  if (value === 1) {
    return "py-level-1";
  } else if (value === 2) {
    return "py-level-2";
  } else if (value === 3) {
    return "py-level-3";
  } else if (value === 4) {
    return "py-level-4";
  } else {
    return "py-level-0";
  }
};

var getStateName = function (value) {
  if (value === 1) {
    return "一级告警";
  } else if (value === 2) {
    return "二级告警";
  } else if (value === 3) {
    return "三级告警";
  } else if (value === 4) {
    return "四级告警";
  } else if (value === 5) {
    return "操作事件";
  } else if (value === 6) {
    return "无效数据";
  } else if (value === 7) {
    return "通信中断";
  } else {
    return "正常数据";
  }
};

var getStateClass = function (value) {
  if (value === 1) {
    return "py-state-1";
  } else if (value === 2) {
    return "py-state-2";
  } else if (value === 3) {
    return "py-state-3";
  } else if (value === 4) {
    return "py-state-4";
  } else if (value === 5) {
    return "py-state-5";
  } else if (value === 6) {
    return "py-state-6";
  } else if (value === 7) {
    return "py-state-7";
  } else {
    return "py-state-0";
  }
};

var getUnit = function (value, type, desc) {
  type = type.toString();
  if (type === "0" || type === "2") {
    var result = "";
    var pairs = desc.split(";");
    $.each(pairs, function (index, item) {
      var _values = item.split("&");
      if (_values.length !== 2) return true;

      if (_values[0].trim() == value) {
        result = _values[1].trim();
        return false;
      }
    });
    return result;
  }

  return desc;
};

var getUnits = function (desc) {
  var data = [];
  var pairs = desc.split(";");
  $.each(pairs, function (index, item) {
    var _values = item.split("&");
    if (_values.length !== 2) return true;

    data.push({
      id: _values[0].trim(),
      name: _values[1].trim(),
    });
  });

  return data;
};

var getSystemAuth = function () {
  var token = $cookie.get("pylon.auth.token");
  var ticket = $cookie.get("pylon.auth.ticket");
  if (isNullOrEmpty(token) === true || isNullOrEmpty(ticket) === true) {
    return null;
  }

  return {
    token: token,
    ticket: ticket === "super",
  };
};

String.prototype.startWith = function (value, ignoreCase) {
  if (
    value == null ||
    value == "" ||
    this.length == 0 ||
    value.length > this.length
  ) {
    return false;
  }

  ignoreCase = ignoreCase || false;
  if (ignoreCase === true) {
    return (
      this.substring(0, value.length).toLowerCase() === value.toLowerCase()
    );
  }

  return this.substring(0, value.length) === value;
};

String.prototype.endWith = function (value, ignoreCase) {
  if (
    value == null ||
    value == "" ||
    this.length == 0 ||
    value.length > this.length
  ) {
    return false;
  }

  ignoreCase = ignoreCase || false;
  if (ignoreCase === true) {
    return (
      this.substring(this.length - value.length).toLowerCase() ===
      value.toLowerCase()
    );
  }

  return this.substring(this.length - value.length) === value;
};

String.format = function () {
  if (arguments.length == 0) return null;

  var str = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
    str = str.replace(re, arguments[i]);
  }

  return str;
};

function HashMap() {
  var length = 0;
  var hash = new Object();

  this.isEmpty = function () {
    return length === 0;
  };

  this.containsKey = function (key) {
    return key in hash;
  };

  this.containsValue = function (value) {
    for (var key in hash) {
      if (hash[key] === value) {
        return true;
      }
    }
    return false;
  };

  this.put = function (key, value) {
    if (!this.containsKey(key)) {
      length++;
    }

    hash[key] = value;
  };

  this.get = function (key) {
    return this.containsKey(key) ? hash[key] : null;
  };

  this.remove = function (key) {
    if (this.containsKey(key) && delete hash[key]) {
      length--;
    }
  };

  this.values = function () {
    var _values = new Array();
    for (var key in hash) {
      _values.push(hash[key]);
    }
    return _values;
  };

  this.keys = function () {
    var _keys = new Array();
    for (var key in hash) {
      _keys.push(key);
    }
    return _keys;
  };

  this.size = function () {
    return length;
  };

  this.clear = function () {
    length = 0;
    hash = new Object();
  };
}
