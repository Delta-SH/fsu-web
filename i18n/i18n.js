(function () {
  var i18ndata = {};
  var i18nelem = [];
  var defaults = {
    lang: "cn",
    filePath: "./i18n/",
    filePrefix: "i18n_",
    fileSuffix: "",
    forever: true,
    get: false,
  };

  window["i18n"] = i18n;
  window["i18n"]["lang"] = defaults.lang;
  window["i18n"]["apply"] = apply;
  window["i18n"]["get"] = get;
  window["i18n"]["extra"] = extra;

  function i18n(options, callback) {
    options = _extend(defaults, options || {});
    _setCookie("i18n_lang", JSON.stringify(options));
    apply(callback);
  }

  function apply(callback) {
    var options = JSON.parse(_getCookie("i18n_lang") || "{}");
    options = _extend(defaults, options || {});
    window["i18n"]["lang"] = options.lang;
    i18ndata = {};
    i18nelem = document.querySelectorAll("[i18n]");

    var url =
      options.filePath +
      options.filePrefix +
      options.lang +
      options.fileSuffix +
      ".json";

    $.ajax({
      url: url,
      method: "get",
      dataType: "json",
      async: options.get,
      success: function (data) {
        i18ndata = data || {};
        i18nelem.forEach(function (el) {
          for (var i = 0; i < el.attributes.length; i++) {
            var attribute = el.attributes[i];

            if (attribute.name == "i18n") {
              if (attribute.value) {
                var value = i18ndata[attribute.value];
                if (!(typeof value === "undefined" || value === null)) {
                  el.innerHTML = value;
                }
              }
            } else if (attribute.name.substring(0, 5) == "i18n:") {
              if (attribute.value) {
                var value = i18ndata[attribute.value];
                if (!(typeof value === "undefined" || value === null)) {
                  el.setAttribute(attribute.name.substring(5), value);
                }
              }
            }
          }
        });

        callback && callback();
      },
      error: function (e) {
        console.error(e);
      },
    });
  }

  function get(key) {
    return i18ndata[key];
  }

  function extra(obj) {
    if (!("ele" in obj) || !("attr" in obj)) {
      throw '参数错误，正确的JSON格式为 {"ele":"","attr":""}';
    }

    var elements = document.querySelectorAll(obj.ele);
    elements.forEach(function (el) {
      let key = el.getAttribute(obj.attr);
      let val = get(key);
      if (typeof val !== "undefined") {
        el.setAttribute(obj.attr, val);
      }
    });
  }

  function _extend(destination, source) {
    for (var prop in source) {
      destination[prop] = source[prop];
    }
    return destination;
  }

  function _getCookie(name) {
    var lang = localStorage.getItem(name);
    return lang || "";
  }

  function _setCookie(name, value) {
    localStorage.setItem(name, value);
  }

  function _clearCookie(name) {
    localStorage.removeItem(name);
  }

  apply();
})();
