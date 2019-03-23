"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

console.log('source:' + 'https://github.com/pavladan/pavladan.github.io');

function init() {
  function ajax_get(url, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        try {
          var data = JSON.parse(xmlhttp.responseText);
        } catch (err) {
          console.log(err.message + " in " + xmlhttp.responseText);
          return;
        }

        callback(data);
      }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function Canvas(selector, context, height, theme) {
    this.selector = selector;
    this.context = context;
    this.height = height;
    this.width = 0;
    this.colorGrid = theme.state === 'day' ? theme.colorDay.lines : theme.colorNight.lines;
  }

  Canvas.prototype.clear = function () {
    document.querySelector('#stat') && document.querySelector('.container').removeChild(document.querySelector('#stat'));
    this.context.clearRect(0, 0, this.width, this.height);
  };

  Canvas.prototype.drawGrid = function (lines) {
    var _this = this;

    var colRows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;
    var colCols = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;
    if (lines.length === 0) return;

    var numberToPx = function numberToPx(value) {
      return -(lines[0].ky * value) + _this.height - lines[0].ySpace;
    };

    var cc = this.context;
    var rowHeight = Math.ceil(lines[0].yRange.max / colRows / 10) * 10;

    for (var i = 0; i < colRows; i++) {
      cc.beginPath();
      cc.moveTo(0, numberToPx(rowHeight * i));
      cc.lineTo(this.width, numberToPx(rowHeight * i));
      cc.strokeStyle = this.colorGrid;
      cc.globalAlpha = 0.8;
      cc.lineWidth = 0.5;
      cc.stroke();
      cc.font = "14px sans-serif";
      cc.fillStyle = this.colorGrid;
      cc.fillText(rowHeight * i, 0, numberToPx(rowHeight * i) - 7);
    }

    var keys = Object.keys(lines[0].val);
    var colWidht = (keys[keys.length - 1] - keys[0]) / colCols;

    for (var _i = 0; _i < colCols; _i++) {
      var col = this.approxim(keys, Number(keys[0]) + colWidht * _i);
      var date = new Date();
      date.setTime(col);
      date = date.toString().split(' ');
      date = date[1] + ' ' + date[2];
      cc.font = this.width > 300 ? "14px sans-serif" : "10px sans-serif";
      cc.fillText(date, lines[0].timeToPx(col)[0], this.height);
    }
  };

  Canvas.prototype.drawVerticalLine = function (lines, currentX) {
    var currentPX = lines[0].timeToPx(currentX)[0];
    var cc = this.context;
    var points = [];
    cc.beginPath();
    cc.moveTo(currentPX, 0);
    cc.lineTo(currentPX, this.height - 25);
    cc.strokeStyle = this.colorGrid;
    cc.lineWidth = 0.5;
    cc.globalAlpha = 0.5;
    cc.stroke();
    lines.forEach(function (line) {
      var currentPX = line.timeToPx(currentX);
      cc.beginPath();
      cc.arc(currentPX[0], currentPX[1], 5, 0, 2 * Math.PI);
      cc.strokeStyle = line.color;
      cc.fillStyle = theme.state === 'day' ? theme.colorDay.bgc : theme.colorNight.bgc;
      cc.globalAlpha = 1;
      cc.lineWidth = line.lineWidth;
      cc.fill();
      cc.stroke();
      points.push(currentPX[1]);
    });
  };

  Canvas.prototype.drawStat = function (lines, currentX, e) {
    var _this2 = this;

    var container = document.querySelector('.container');
    var timeStat = new Date();
    timeStat.setTime(currentX);
    timeStat = timeStat.toString().split(' ');
    timeStat = timeStat[0] + ', ' + timeStat[1] + ' ' + timeStat[2];
    var points = [];
    lines.forEach(function (line) {
      var currentPX = line.timeToPx(currentX);
      points.push(currentPX[1]);
    });

    var moveStat = function moveStat(stat) {
      if (e.pageX < 2 * container.offsetLeft) stat.style.left = 0 + 'px';else if (e.pageX + stat.offsetWidth > document.body.offsetWidth) stat.style.left = document.body.offsetWidth - 2 * container.offsetLeft - stat.offsetWidth + 'px';else stat.style.left = e.pageX - container.offsetLeft - stat.offsetWidth * 0.5 + 'px';
      stat.style.top = _this2.selector.offsetTop + 'px';

      while (points.filter(function (e) {
        return e + 20 >= stat.offsetTop - _this2.selector.offsetTop && e - 20 <= stat.offsetTop - _this2.selector.offsetTop + stat.offsetHeight;
      }).length > 0 && stat.offsetTop + stat.offsetHeight < _this2.selector.offsetTop + _this2.selector.offsetHeight) {
        stat.style.top = stat.offsetTop + 10 + 'px';
      }
    };

    if (container.querySelector('#stat') === null) {
      var stat = document.createElement('div');
      stat.id = 'stat';
      stat.style.cssText = "position:absolute; background-color: ".concat(theme.state === 'day' ? theme.colorDay.bgc : theme.colorNight.bgc, "; top:").concat(this.selector.offsetTop, "px; box-shadow: 0 0 4px rgba(0,0,0,0.3); border-radius: 5px; padding:10px;");
      var date = document.createElement('div');
      date.className = 'date';
      date.innerText = timeStat;
      date.style.cssText = 'font-weight:700; margin-bottom:10px;';
      var listLine = document.createElement('ul');
      listLine.className = 'listLine';
      listLine.style.cssText = 'display:flex;justify-content:space-between;margin:-5px;';
      lines.forEach(function (line) {
        var oneLine = document.createElement('li');
        oneLine.style.cssText = 'list-style: none; margin:5px;';
        var valuePoint = document.createElement('div');
        valuePoint.className = 'valuePoint';
        valuePoint.innerText = line.val[currentX];
        valuePoint.style.cssText = "font-weight:900; font-size:17px; color:".concat(line.color, "; margin-bottom:5px;");
        var namePoint = document.createElement('div');
        namePoint.className = 'namePoint';
        namePoint.innerText = line.name;
        namePoint.style.cssText = "font-weight:500; font-size:17px; color:".concat(line.color, ";");
        oneLine.appendChild(valuePoint);
        oneLine.appendChild(namePoint);
        listLine.appendChild(oneLine);
      });
      stat.appendChild(date);
      stat.appendChild(listLine);
      container.appendChild(stat);
      moveStat(stat);
    } else {
      var _stat = container.querySelector('#stat');

      moveStat(_stat);
      container.querySelector('.date').innerText = timeStat;
      lines.forEach(function (line, i) {
        container.querySelectorAll('.valuePoint')[i].innerText = line.val[currentX];
        container.querySelectorAll('.namePoint')[i].innerText = line.name;
      });
    }
  };

  Canvas.prototype.approxim = function (mass, value) {
    return mass.reduce(function (prev, curr) {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
  };

  Canvas.prototype.onGetValue = function (lines) {
    var _this3 = this;

    var counter = 0;

    var moveEvent = function moveEvent(e) {
      var eL;
      var newE;

      if (e.clientX && e.clientY) {
        eL = e.layerX;
        newE = e;
      } else if (e.touches) {
        eL = e.touches[0].clientX - _this3.selector.parentElement.offsetLeft;
        newE = e.touches[0];
      }

      if (lines.filter(function (e) {
        return e.visible === true;
      }).length === 0) return;

      if (e.target === _this3.selector) {
        _this3.clear();

        _this3.drawGrid(lines.filter(function (e) {
          return e.visible === true;
        }));

        var currentX = _this3.approxim(Object.keys(lines.filter(function (e) {
          return e.visible === true;
        })[0].val), lines.filter(function (e) {
          return e.visible === true;
        })[0].pxToTime(eL)[0]);

        lines.forEach(function (line) {
          line.draw();
        });

        _this3.drawVerticalLine(lines.filter(function (e) {
          return e.visible === true;
        }), currentX);

        _this3.drawStat(lines.filter(function (e) {
          return e.visible === true;
        }), currentX, newE);

        counter++;
      } else if ((e.path || e.composedPath && e.composedPath()).filter(function (e) {
        return e === document.querySelector('#stat');
      }).length === 0 && counter > 0) {
        _this3.clear();

        _this3.drawGrid(lines.filter(function (e) {
          return e.visible === true;
        }));

        lines.forEach(function (line) {
          line.draw();
        });
        counter = 0;
      }
    };

    document.onmousemove = moveEvent;
    document.ontouchmove = moveEvent;
  };

  function Line(canvas, val, name, color, lineWidth, isVisible) {
    this.canvas = canvas;
    this.val = val;
    this.name = name;
    this.color = color;
    this.lineWidth = lineWidth;
    this.visible = isVisible === undefined ? true : isVisible;
  }

  Line.prototype.setLineParameters = function (lines) {
    var _Array$prototype;

    var ySpace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    this.lines = lines;
    this.ySpace = ySpace;

    var y_all = (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, _toConsumableArray(lines.filter(function (e) {
      return e.visible === true;
    }).map(function (e) {
      return Object.values(e.val);
    })));

    this.yRange = {
      min: Math.min.apply(Math, _toConsumableArray(y_all)),
      max: Math.max.apply(Math, _toConsumableArray(y_all))
    };
    var x = Object.keys(this.val);
    this.xRange = {
      min: Math.min.apply(Math, _toConsumableArray(x)),
      max: Math.max.apply(Math, _toConsumableArray(x))
    };
    this.kx = this.canvas.width / (this.xRange.max - this.xRange.min);
    this.ky = (this.canvas.height - 2 * this.ySpace) / this.yRange.max;
  };

  Line.prototype.timeToPx = function (value) {
    return [this.kx * (value - this.xRange.min), -(this.ky * this.val[value]) + this.canvas.height - this.ySpace];
  };

  Line.prototype.pxToTime = function (value) {
    return [value / this.kx + this.xRange.min, this.val[value / this.kx + this.xRange.min]];
  };

  Line.prototype.draw = function () {
    var _this4 = this;

    this.setLineParameters(this.lines, this.ySpace);
    if (this.visible === false) return;
    var cc = this.canvas.context;
    cc.beginPath();
    cc.lineWidth = this.lineWidth;
    cc.moveTo(0, this.timeToPx(0)[1]);
    Object.keys(this.val).forEach(function (x) {
      cc.lineTo.apply(cc, _toConsumableArray(_this4.timeToPx(x)));
    });
    cc.strokeStyle = this.color;
    cc.globalAlpha = 1;
    cc.stroke();
  };

  function VisibleField(canvas, x1, x2, theme) {
    this.canvas = canvas;
    this.x1 = x1;
    this.x2 = x2;
    this.sideWidth = 10;
    this.lineWidth = 2;
    this.minWidth = 10;
    this.theme = theme;
  }

  VisibleField.prototype.draw = function () {
    var x1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.x1;
    var x2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.x2;
    var canvasWidth = this.canvas.width;
    var canvasHeight = this.canvas.height;
    var cc = this.canvas.context;
    cc.beginPath();
    cc.rect(x1, 0, this.sideWidth, canvasHeight);
    cc.rect(x2, 0, -this.sideWidth, canvasHeight);
    cc.rect(x1 + this.sideWidth, 0, x2 - x1 - 2 * this.sideWidth, this.lineWidth);
    cc.rect(x1 + this.sideWidth, canvasHeight, x2 - x1 - 2 * this.sideWidth, -this.lineWidth);
    cc.globalAlpha = 0.4;
    cc.fillStyle = this.theme.state === 'day' ? this.theme.colorDay.lines : this.theme.colorNight.lines;
    cc.fill();
    cc.beginPath();
    cc.rect(0, 0, x1, canvasHeight);
    this.canvas.context.rect(x2, 0, canvasWidth, canvasHeight);
    cc.fillStyle = this.theme.state === 'day' ? this.theme.colorDay.visibleField : this.theme.colorNight.visibleField;
    cc.globalAlpha = 0.4;
    cc.fill();
  };

  VisibleField.prototype.onEvent = function () {
    var _this5 = this;

    this.canvas.selector.onmousemove = function (e) {
      if (e.layerX >= _this5.x1 + _this5.sideWidth && e.layerX <= _this5.x2 - _this5.sideWidth) {
        _this5.canvas.selector.style.cursor = 'grab';
      } else if (e.layerX >= _this5.x1 && e.layerX < _this5.x1 + _this5.sideWidth || e.layerX <= _this5.x2 && e.layerX > _this5.x2 - _this5.sideWidth) {
        _this5.canvas.selector.style.cursor = 'col-resize';
      } else {
        _this5.canvas.selector.style.cursor = 'default';
      }
    };

    var touchDown = function touchDown(e) {
      var moveAllField = function moveAllField(eC) {
        _this5.canvas.selector.style.cursor = 'grabbing';

        if (_this5.x1 + eC - downX < 0) {
          _this5.x2 = _this5.x2 - _this5.x1;
          _this5.x1 = 0;

          if (checkCount === 0) {
            drawStuff();
            downX = eC;
            checkCount++;
          }
        } else if (_this5.x2 + eC - downX > _this5.canvas.width) {
          _this5.x1 = _this5.x1 + _this5.canvas.width - _this5.x2;
          _this5.x2 = _this5.canvas.width;

          if (checkCount === 0) {
            drawStuff();
            downX = eC;
            checkCount++;
          }
        } else {
          _this5.x1 += eC - downX;
          _this5.x2 += eC - downX;
          drawStuff();
          downX = eC;
          checkCount = 0;
        }
      };

      var moveLeftSide = function moveLeftSide(eC) {
        _this5.canvas.selector.style.cursor = 'col-resize';

        if (_this5.x1 + eC - downX < 0) {
          _this5.x1 = 0;

          if (checkCount === 0) {
            drawStuff();
            downX = eC;
            checkCount++;
          }
        } else if (_this5.x1 + 2 * _this5.sideWidth + _this5.minWidth + eC - downX >= _this5.x2) {
          _this5.x1 = _this5.x2 - 2 * _this5.sideWidth - _this5.minWidth;

          if (checkCount === 0) {
            drawStuff();
            downX = eC;
            checkCount++;
          }
        } else {
          _this5.x1 += eC - downX;
          drawStuff();
          downX = eC;
          checkCount = 0;
        }
      };

      var moveRightSide = function moveRightSide(eC) {
        _this5.canvas.selector.style.cursor = 'col-resize';

        if (_this5.x2 + eC - downX > _this5.canvas.width) {
          _this5.x2 = _this5.canvas.width;

          if (checkCount === 0) {
            drawStuff();
            downX = eC;
            checkCount++;
          }
        } else if (_this5.x2 - 2 * _this5.sideWidth - _this5.minWidth + eC - downX < _this5.x1) {
          _this5.x2 = _this5.x1 + 2 * _this5.sideWidth + _this5.minWidth;

          if (checkCount === 0) {
            drawStuff();
            downX = eC;
            checkCount++;
          }
        } else {
          _this5.x2 += eC - downX;
          drawStuff();
          downX = eC;
          checkCount = 0;
        }
      };

      var downX;
      var tempMoveEvent;
      var eL;
      var checkCount = 0;

      if (e.clientX && e.clientY) {
        if (e.which != 1) return;
        downX = e.clientX;
        eL = e.layerX;
        tempMoveEvent = document.onmousemove;
      } else if (e.touches) {
        e.preventDefault();
        downX = e.touches[0].clientX;
        eL = e.touches[0].clientX - _this5.canvas.selector.parentElement.offsetLeft;
        tempMoveEvent = document.ontouchmove;
      }

      if (eL >= _this5.x1 + _this5.sideWidth && eL <= _this5.x2 - _this5.sideWidth) {
        if (e.clientX && e.clientY) document.onmousemove = function (e) {
          return moveAllField(e.clientX);
        };else if (e.touches) document.ontouchmove = function (e) {
          return moveAllField(e.touches[0].clientX);
        };
      } else if (eL >= _this5.x1 && eL < _this5.x1 + _this5.sideWidth) {
        if (e.clientX && e.clientY) document.onmousemove = function (e) {
          return moveLeftSide(e.clientX);
        };else if (e.touches) document.ontouchmove = function (e) {
          return moveLeftSide(e.touches[0].clientX);
        };
      } else if (eL <= _this5.x2 && eL > _this5.x2 - _this5.sideWidth) {
        if (e.clientX && e.clientY) document.onmousemove = function (e) {
          return moveRightSide(e.clientX);
        };else if (e.touches) document.ontouchmove = function (e) {
          return moveRightSide(e.touches[0].clientX);
        };
      }

      if (e.clientX && e.clientY) document.onmouseup = function () {
        return document.onmousemove = tempMoveEvent;
      };else if (e.touches) document.ontouchend = function () {
        return document.ontouchmove = tempMoveEvent;
      };
    };

    this.canvas.selector.addEventListener('mousedown', touchDown, false);
    this.canvas.selector.addEventListener('touchstart', touchDown, false);
  };

  function CheckButton(parent, line, theme, idname) {
    this.parent = parent;
    this.line = line;
    if (idname) this.idname = idname;else this.idname = 'id_' + line.name.replace(/[^a-zA-Z0-9]/g, '');
    this.init(theme);
    this.onEvent();
  }

  CheckButton.prototype.init = function (theme) {
    this.checkbox = document.createElement('input');
    this.checkbox.type = "checkbox";
    this.checkbox.id = this.idname;
    this.checkbox.checked = true;
    this.checkbox.onchange = this.onchange;
    this.label = document.createElement('label');
    this.label.htmlFor = this.idname;
    var styleBorder = document.createElement("style");
    var styleBefore = document.createElement("style");
    styleBorder.type = 'text/css';
    styleBefore.type = 'text/css';
    document.head.appendChild(styleBorder).innerHTML = "#".concat(this.idname, " + label{border:1px solid ").concat(theme.state === 'day' ? theme.colorDay.lines : theme.colorNight.lines, "50;}");
    document.head.appendChild(styleBefore).innerHTML = "#".concat(this.idname, " + label::before{border:1px solid ").concat(this.line.color, ";} #").concat(this.idname, ":checked + label::before{background-color: ").concat(this.line.color, ";}");
    this.label.appendChild(document.createTextNode(this.line.name));
    this.parent.appendChild(this.checkbox);
    this.parent.appendChild(this.label);
  };

  CheckButton.prototype.onEvent = function () {
    var _this6 = this;

    this.checkbox.onchange = function (e) {
      if (_this6.checkbox.checked === false) {
        _this6.line.visible = false;
      } else if (_this6.checkbox.checked === true) {
        _this6.line.visible = true;
      }

      drawStuff();
    };
  };

  function Theme(selector, textDay, textNight) {
    var _this7 = this;

    var firstState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'day';
    this.state = firstState;
    this.colorDay = {
      text: "#43484b",
      bgc: "#fff",
      visibleField: "#dfe6eb",
      lines: "#8199a8"
    };
    this.colorNight = {
      text: "#e8ecee",
      bgc: "#242f3e",
      visibleField: "#151d28",
      lines: "#344658"
    };

    var eventChange = function eventChange() {
      selector.innerText = _this7.state === 'day' ? textDay : textNight;
      document.body.style.color = _this7.state === 'day' ? _this7.colorDay.text : _this7.colorNight.text;
      document.body.style.backgroundColor = _this7.state === 'day' ? _this7.colorDay.bgc : _this7.colorNight.bgc;
    };

    eventChange();

    selector.onclick = function (e) {
      if (e.which != 1) return;
      _this7.state = _this7.state === 'day' ? 'night' : 'day';
      eventChange();
      drawStuff();
    };
  }

  var selectorFullView = document.querySelector('canvas#full-view');
  var selectorPreView = document.querySelector('canvas#pre-view');
  var theme = new Theme(document.querySelector('.themeswitch-btn'), 'Switch to Night Mode', 'Switch to Day mode');
  var fullView = new Canvas(selectorFullView, selectorFullView.getContext('2d'), 400, theme);
  var preView = new Canvas(selectorPreView, selectorPreView.getContext('2d'), 100, theme);
  var containerWidth = 0;
  var preLines = [];
  var fullLines = [];
  var visibleField = undefined;
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    containerWidth = document.querySelector('.container').offsetWidth;
    fullView.selector.width = containerWidth;
    fullView.width = containerWidth;
    fullView.height = document.querySelector('.container').offsetHeight > 530 ? document.querySelector('.container').offsetHeight - 370 : 160;
    fullView.selector.height = fullView.height;
    preView.selector.width = containerWidth;
    preView.width = containerWidth;
    preView.selector.height = preView.height;

    if (visibleField !== undefined) {
      if (visibleField.x1 < 0) {
        visibleField.x2 = visibleField.x2 + visibleField.x1;
        visibleField.x1 = 0;
      } else if (visibleField.x2 > visibleField.canvas.width) {
        visibleField.x1 = visibleField.x1 + visibleField.canvas.width - visibleField.x2;
        visibleField.x2 = visibleField.canvas.width;
      }
    }

    drawStuff();
  }

  resizeCanvas();
  visibleField = new VisibleField(preView, preView.width * 0.7, preView.width, theme);
  var checkButtons = [];
  ajax_get('chart_data.json', function (data_input) {
    var data = data_input[0];
    var x,
        y = [];

    for (var props in data.types) {
      if (data.types.hasOwnProperty(props)) {
        var value = data.types[props];
        if (value === 'line') y.push(props);
        if (value === 'x') x = props;
      }
    }

    y.forEach(function (y_one) {
      var val = {};
      var arr_x = data.columns.filter(function (e) {
        return e[0] === x;
      })[0].filter(function (e, index) {
        return index !== 0;
      });
      var arr_y = data.columns.filter(function (e) {
        return e[0] === y_one;
      })[0].filter(function (e, index) {
        return index !== 0;
      });

      for (var i = 0; i < arr_x.length; i++) {
        val[arr_x[i]] = arr_y[i];
      }

      preLines.push(new Line(preView, val, data.names[y_one], data.colors[y_one], 1.5));
    });
    preLines.forEach(function (line) {
      return line.setLineParameters(preLines, 5);
    });
    preLines.forEach(function (line) {
      return fullLines.push(new Line(fullView, function () {
        var vals = {};

        for (var key in line.val) {
          if (line.val.hasOwnProperty(key)) {
            var element = line.val[key];
            key >= line.pxToTime(visibleField.x1)[0] && key <= line.pxToTime(visibleField.x2)[0] ? vals[key] = element : null;
          }
        }

        return vals;
      }(), line.name, line.color, 2.5));
    });
    fullLines.forEach(function (line) {
      return line.setLineParameters(fullLines, 25);
    });
    visibleField.onEvent();
    fullView.onGetValue(fullLines);
    preLines.forEach(function (e) {
      checkButtons.push(new CheckButton(document.querySelector('#check-block'), e, theme));
    });
    drawStuff();
  });

  function drawStuff() {
    if (preLines.length === 0) return;
    preView.clear();
    fullView.clear();
    preLines.forEach(function (e) {
      return e.draw();
    });
    preLines.filter(function (e) {
      return e.visible === true;
    }).length && visibleField.draw();
    fullLines.forEach(function (e) {
      var line = preLines.filter(function (el) {
        return el.visible === true && el.name === e.name;
      })[0];

      if (line) {
        e.val = {};

        for (var key in line.val) {
          if (line.val.hasOwnProperty(key)) {
            var element = line.val[key];
            key >= line.pxToTime(visibleField.x1)[0] && key <= line.pxToTime(visibleField.x2)[0] ? e.val[key] = element : null;
          }
        }

        e.visible = true;
      } else {
        e.visible = false;
      }

      e.draw();
    });
    fullView.drawGrid(fullLines.filter(function (e) {
      return e.visible === true;
    }));
  }
}

;
window.onload = init;