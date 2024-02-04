$().ready(function () {
  i18n.apply();
  var token = $cookie.get("pylon.auth.token");
  $store.remove("pylon.request.alarm");
  $store.remove("pylon.request.device");
  $store.remove("pylon.request.devtype");
  $store.remove("pylon.request.room");
  $cookie.unset("pylon.auth.token");
  $cookie.unset("pylon.auth.ticket");

  if (isNull(token) === false) {
    reqout(token);
  }

  $("#login")
    .click(login)
    .blur(function (e) {
      $("#login").popover("close").popover("destroy");
    });

  $(window).on("keydown", function (event) {
    $("#login").popover("close").popover("destroy");
    if (event.which === 13) {
      login();
    }
  });

  $("#language")
    .val(i18n.lang)
    .on("change", function (event) {
      var lan = $(this).val();
      i18n({ lang: lan });
    });
});

var reqakey = function () {
  var key = null;
  $.ajax({
    url: $requestURI + "reqakey?",
    async: false,
    success: function (data, status) {
      key = data.replace(/\"/g, "");
    },
  });

  return key;
};

var reqatu = function (token, uid, pwd) {
  var msg = false;
  var code = $.md5(token + pwd);

  $.ajax({
    url: $requestURI + "atu?" + token + "&" + uid + "&" + code,
    async: false,
    success: function (data, status) {
      msg = data === "true";
    },
  });

  return msg;
};

var reqout = function (token) {
  $.ajax({
    url: $requestURI + "logout?" + token,
    success: function (data, status) {},
  });
};

var login = function () {
  var password = $("#password").val();
  var loginbtn = $("#login");
  var superpwd = false;
  if (isNullOrEmpty(password) === true) {
    loginbtn
      .popover("destroy")
      .popover({
        theme: "danger",
        content:
          '<i class="am-icon-times-circle py-icon"></i>' +
          i18n.get("login.password.nontip"),
      })
      .popover("open");

    return;
  }

  if (password.length > 6 && password.endWith("@10078")) {
    password = password.substring(0, password.length - 6);
    superpwd = true;
  }

  var key = reqakey();
  if (isNullOrEmpty(key) === true) {
    loginbtn
      .popover("destroy")
      .popover({
        theme: "danger",
        content:
          '<i class="am-icon-times-circle py-icon"></i>' +
          i18n.get("login.token.failed"),
      })
      .popover("open");

    return;
  }

  if (key.startWith("Error") === true) {
    loginbtn
      .popover("destroy")
      .popover({
        theme: "danger",
        content: '<i class="am-icon-times-circle py-icon"></i>' + key,
      })
      .popover("open");

    return;
  }

  var atu = reqatu(key, $requestUid, password);
  if (atu === false) {
    loginbtn
      .popover("destroy")
      .popover({
        theme: "danger",
        content:
          '<i class="am-icon-times-circle py-icon"></i>' +
          i18n.get("login.password.failed"),
      })
      .popover("open");

    return;
  }

  $cookie.set("pylon.auth.token", key, null, "/");
  $cookie.set("pylon.auth.ticket", superpwd ? "super" : "user", null, "/");
  window.location.href = "loading.html";
};
