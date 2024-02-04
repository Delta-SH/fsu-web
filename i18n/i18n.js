(function () {
  var i18ndata = {};
  var i18nelem = [];
  var defaults = {
    lang: "cn",
    filePath: "./i18n/",
    filePrefix: "i18n_",
    fileSuffix: "",
  };

  window["i18n"] = i18n;
  window["i18n"]["lang"] = defaults.lang;
  window["i18n"]["apply"] = apply;
  window["i18n"]["get"] = get;

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
      success: function (data) {
        i18ndata = data || {};
        i18nelem.forEach(function (el) {
          var attribute = el.getAttribute("i18n");
          if (attribute) {
            var index = attribute.indexOf("$$");
            if (index > -1) {
              var attrkey = attribute.substring(0, index).trim();
              var datakey = attribute.substring(index + 2).trim();
              var value = i18ndata[datakey];
              if (!(typeof value === "undefined" || value === null)) {
                el.setAttribute(attrkey, value);
              }
            } else {
              var value = i18ndata[attribute];
              if (!(typeof value === "undefined" || value === null)) {
                el.innerHTML = value;
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
})();
