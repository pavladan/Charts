"use strict"
console.log('source:' + 'https://github.com/pavladan/pavladan.github.io');

function init() {
  function ajax_get(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
                var data = JSON.parse(xmlhttp.responseText);
            } catch(err) {
                console.log(err.message + " in " + xmlhttp.responseText);
                return;
            }
            callback(data);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
  
  function Canvas (selector,context,height,theme){
    this.selector = selector;
    this.context = context;
    this.height = height;
    this.width = 0;
    this.colorGrid =  theme.state === 'day' ? theme.colorDay.lines: theme.colorNight.lines;
  }
  Canvas.prototype.clear = function(){
    document.querySelector('#stat') && document.querySelector('.container').removeChild(document.querySelector('#stat'));
    this.context.clearRect (0,0,this.width,this.height);
  }
  Canvas.prototype.drawGrid = function(lines, colRows = 6, colCols = 6){
    if(lines.length===0)return;
    let numberToPx=(value)=>{return -(lines[0].ky*(value))+this.height-lines[0].ySpace;}
    let cc=this.context;
    let rowHeight = Math.ceil(lines[0].yRange.max/colRows / 10) * 10;
    for (let i=0; i<colRows; i++){
      cc.beginPath();
      cc.moveTo(0,numberToPx(rowHeight*i));
      cc.lineTo(this.width,numberToPx(rowHeight*i));
      cc.strokeStyle = this.colorGrid;
      cc.globalAlpha =0.8;
      cc.lineWidth = 0.5;
      cc.stroke();
      cc.font = "14px sans-serif";
      cc.fillStyle= this.colorGrid;
      cc.fillText(rowHeight*i,0,numberToPx(rowHeight*i)-7)
    }
    let  keys = Object.keys(lines[0].val);
    let colWidht = (keys[keys.length-1] - keys[0]) / colCols;
    for (let i=0;i<colCols;i++){
      let col = this.approxim(keys,Number(keys[0])+colWidht*i);
      let date = new Date();
      date.setTime(col);
      date = date.toString().split(' ');
      date = date[1] + ' ' + date[2];
      cc.font = this.width >300 ?"14px sans-serif":"10px sans-serif";
      cc.fillText(date,lines[0].timeToPx(col)[0],this.height);
    }
  }
  Canvas.prototype.drawVerticalLine = function(lines, currentX){
    let currentPX = lines[0].timeToPx(currentX)[0];
    let cc = this.context;
    let points =[];
    cc.beginPath();
    cc.moveTo(currentPX, 0);
    cc.lineTo(currentPX, this.height-25);
    cc.strokeStyle = this.colorGrid;
    cc.lineWidth = 0.5;
    cc.globalAlpha =0.5;
    cc.stroke();
    lines.forEach(line => {
      let currentPX = line.timeToPx(currentX);
      cc.beginPath();
      cc.arc(currentPX[0],currentPX[1],5,0,2*Math.PI);
      cc.strokeStyle = line.color;
      cc.fillStyle = theme.state === 'day'? theme.colorDay.bgc: theme.colorNight.bgc;
      cc.globalAlpha = 1;
      cc.lineWidth = line.lineWidth;
      cc.fill();
      cc.stroke();
      points.push(currentPX[1]);
    });
  }
  Canvas.prototype.drawStat = function(lines,currentX,e){
    let container = document.querySelector('.container');
    let timeStat = new Date();
    timeStat.setTime(currentX);
    timeStat = timeStat.toString().split(' ');
    timeStat = timeStat[0] + ', ' + timeStat[1] + ' ' + timeStat[2];
    let points=[];
    lines.forEach(line => {
      let currentPX = line.timeToPx(currentX);
      points.push(currentPX[1]);
    });
    let moveStat = stat=>{
      if(e.pageX<2*container.offsetLeft)
        stat.style.left = 0 + 'px';
      else if(e.pageX+stat.offsetWidth>document.body.offsetWidth)
        stat.style.left = document.body.offsetWidth - 2*container.offsetLeft - stat.offsetWidth  + 'px';
      else
        stat.style.left = e.pageX - container.offsetLeft -stat.offsetWidth*0.5 + 'px';
      stat.style.top = this.selector.offsetTop + 'px';
      while(points.filter(e=> e +20>=stat.offsetTop - this.selector.offsetTop && e - 20<= stat.offsetTop - this.selector.offsetTop + stat.offsetHeight).length > 0 && stat.offsetTop+stat.offsetHeight < this.selector.offsetTop+this.selector.offsetHeight){
        stat.style.top = stat.offsetTop + 10 +'px';
      }
    }
    if (container.querySelector('#stat') === null){
      let stat = document.createElement('div');
      stat.id='stat';
      stat.style.cssText = `position:absolute; background-color: ${ theme.state === 'day' ? theme.colorDay.bgc: theme.colorNight.bgc}; top:${this.selector.offsetTop}px; box-shadow: 0 0 4px rgba(0,0,0,0.3); border-radius: 5px; padding:10px;`
      let date = document.createElement('div');
      date.className='date';
      date.innerText = timeStat;
      date.style.cssText = 'font-weight:700; margin-bottom:10px;'
      let listLine = document.createElement('ul');
      listLine.className=('listLine');
      listLine.style.cssText ='display:flex;justify-content:space-between;margin:-5px;'
      lines.forEach(line => {
        let oneLine = document.createElement('li');
        oneLine.style.cssText ='list-style: none; margin:5px;';
        let valuePoint = document.createElement('div');
        valuePoint.className = 'valuePoint'
        valuePoint.innerText = line.val[currentX];
        valuePoint.style.cssText =`font-weight:900; font-size:17px; color:${line.color}; margin-bottom:5px;`;
        let namePoint = document.createElement('div');
        namePoint.className = 'namePoint';
        namePoint.innerText = line.name;
        namePoint.style.cssText =`font-weight:500; font-size:17px; color:${line.color};`;
        oneLine.appendChild(valuePoint);
        oneLine.appendChild(namePoint);
        listLine.appendChild(oneLine);
      });
      stat.appendChild(date);
      stat.appendChild(listLine);
      container.appendChild(stat);
      moveStat(stat);
    }else{
      let stat = container.querySelector('#stat');
      moveStat(stat);
      container.querySelector('.date').innerText = timeStat;
      lines.forEach((line,i) => {
        container.querySelectorAll('.valuePoint')[i].innerText = line.val[currentX];
        container.querySelectorAll('.namePoint')[i].innerText = line.name;
      });
    }
  }
  Canvas.prototype.approxim = function (mass, value){
    return mass.reduce((prev, curr)=>{
      return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
    });
  }
  Canvas.prototype.onGetValue = function(lines){
    let counter = 0;
    let moveEvent = e=>{
      let eL;
      let newE;
      if ((e.clientX)&&(e.clientY)){ eL = e.layerX; newE = e;}
      else if (e.touches){ eL = e.touches[0].clientX-this.selector.parentElement.offsetLeft;newE = e.touches[0];}
      if(lines.filter(e=>e.visible===true).length === 0)return;
      if (e.target === this.selector){
        this.clear();
        this.drawGrid(lines.filter(e=>e.visible===true));
        let currentX = this.approxim(Object.keys(lines.filter(e=>e.visible===true)[0].val),lines.filter(e=>e.visible===true)[0].pxToTime(eL)[0]);
        lines.forEach(line => {
          line.draw();
        });
        this.drawVerticalLine(lines.filter(e=>e.visible===true), currentX);
        this.drawStat(lines.filter(e=>e.visible===true),currentX,newE);
        counter ++;  
      }else if((e.path || (e.composedPath && e.composedPath())).filter(e=>e === document.querySelector('#stat')).length === 0 && counter > 0  ){
        this.clear();
        this.drawGrid(lines.filter(e=>e.visible===true));
        lines.forEach(line => {
          line.draw();
        });
        counter = 0;
      } 
    }
    document.onmousemove = moveEvent;
    document.ontouchmove = moveEvent;
  }

  function Line(canvas,val,name,color,lineWidth,isVisible){
    this.canvas = canvas;
    this.val = val;
    this.name = name;
    this.color = color;
    this.lineWidth = lineWidth;
    this.visible = isVisible === undefined ? true : isVisible;
  }
  Line.prototype.setLineParameters = function (lines, ySpace=0){
    this.lines = lines;
    this.ySpace = ySpace;
    let y_all = Array.prototype.concat(...lines.filter(e=>e.visible ===true).map((e)=>Object.values(e.val)));
    this.yRange = {min: Math.min(...y_all), max: Math.max(...y_all)};
    let x = Object.keys(this.val);
    this.xRange = {min: Math.min(...x), max: Math.max(...x)};
    this.kx = (this.canvas.width/(this.xRange.max-this.xRange.min));
    this.ky = ((this.canvas.height-2*this.ySpace)/(this.yRange.max));  
  }
  Line.prototype.timeToPx = function(value){
    return [this.kx*(value-this.xRange.min), -(this.ky*(this.val[value]))+this.canvas.height-this.ySpace];   
  }
  Line.prototype.pxToTime = function(value){
    return [value/this.kx+this.xRange.min, this.val[value/this.kx+this.xRange.min]];   
  }
  Line.prototype.draw = function(){
    this.setLineParameters(this.lines,this.ySpace);
    if (this.visible ===false)return;
    let cc=this.canvas.context;
    cc.beginPath();
    cc.lineWidth = this.lineWidth;
    cc.moveTo(0, this.timeToPx(0)[1]);
    Object.keys(this.val).forEach(x=>{
      cc.lineTo(...this.timeToPx(x)); 
    });
    cc.strokeStyle = this.color;
    cc.globalAlpha =1;
    cc.stroke();
  }
  function VisibleField(canvas, x1, x2,theme){
    this.canvas = canvas;
    this.x1 = x1;
    this.x2 = x2;
    this.sideWidth = 10;
    this.lineWidth = 2;
    this.minWidth = 10;
    this.theme = theme;
  }
  VisibleField.prototype.draw = function(x1 = this.x1, x2 = this.x2){
    let canvasWidth = this.canvas.width;
    let canvasHeight = this.canvas.height;
    let cc=this.canvas.context;
    cc.beginPath();
    cc.rect(x1,0,this.sideWidth,canvasHeight);
    cc.rect(x2,0,-this.sideWidth,canvasHeight);
    cc.rect(x1+this.sideWidth,0,x2-x1-2*this.sideWidth,this.lineWidth);
    cc.rect(x1+this.sideWidth,canvasHeight,x2-x1-2*this.sideWidth,-this.lineWidth);
    cc.globalAlpha = 0.4;
    cc.fillStyle = this.theme.state === 'day' ? this.theme.colorDay.lines: this.theme.colorNight.lines;
    cc.fill();
    cc.beginPath();
    cc.rect(0,0,x1,canvasHeight);
    this.canvas.context.rect(x2,0,canvasWidth,canvasHeight);
    cc.fillStyle = this.theme.state === 'day' ? this.theme.colorDay.visibleField: this.theme.colorNight.visibleField;
    cc.globalAlpha =0.4;
    cc.fill();
  }
  VisibleField.prototype.onEvent = function(){
    this.canvas.selector.onmousemove = e=>{
      if (e.layerX >= this.x1 + this.sideWidth && e.layerX <= this.x2 - this.sideWidth){
        this.canvas.selector.style.cursor = 'grab';
      }else if (e.layerX >= this.x1 && e.layerX < this.x1 + this.sideWidth || e.layerX <= this.x2 && e.layerX > this.x2 - this.sideWidth){
        this.canvas.selector.style.cursor = 'col-resize';
      }else{
        this.canvas.selector.style.cursor = 'default';
      }
    }
    let touchDown = e=>{
      let moveAllField = eC=>{
        this.canvas.selector.style.cursor = 'grabbing';
        if(this.x1 + eC - downX < 0){
          this.x2 = this.x2 - this.x1;  
          this.x1 = 0;  
          if(checkCount === 0){
            drawStuff(); 
            downX = eC;
            checkCount++;
          }
        }else if(this.x2 + eC - downX > this.canvas.width){
           this.x1 = this.x1 + this.canvas.width - this.x2;
           this.x2 = this.canvas.width;
           if(checkCount === 0){
            drawStuff(); 
            downX = eC;
            checkCount++;
          }
        }else{
          this.x1 += eC - downX;
          this.x2 += eC - downX;
          drawStuff(); 
          downX = eC;
          checkCount = 0;
        }
      }
      let moveLeftSide = eC=>{
        this.canvas.selector.style.cursor = 'col-resize';
        if (this.x1 + eC - downX < 0){
          this.x1 = 0;  
          if(checkCount === 0){
            drawStuff(); 
            downX = eC;
            checkCount++;
          }
        }else if (this.x1 + 2*this.sideWidth + this.minWidth + eC - downX >= this.x2){
          this.x1 = this.x2 - 2*this.sideWidth - this.minWidth;
          if(checkCount === 0){
            drawStuff(); 
            downX = eC;
            checkCount++;
          }
        }else{ 
          this.x1 += eC - downX;  
          drawStuff(); 
          downX = eC;
          checkCount = 0;
        }
      }
      let moveRightSide = eC=>{
        this.canvas.selector.style.cursor = 'col-resize';
        if (this.x2 + eC - downX > this.canvas.width){
          this.x2 = this.canvas.width;  
          if(checkCount === 0){
            drawStuff(); 
            downX = eC;
            checkCount++;
          }
        }else if (this.x2 - 2*this.sideWidth - this.minWidth + eC - downX < this.x1){
          this.x2 = this.x1 + 2*this.sideWidth + this.minWidth;
          if(checkCount === 0){
            drawStuff(); 
            downX = eC;
            checkCount++;
          }
        }else{ 
          this.x2 += eC - downX;  
          drawStuff(); 
          downX = eC;
          checkCount = 0;
        }
      }
      let downX;
      let tempMoveEvent;
      let eL;
      let checkCount = 0;
      if ((e.clientX)&&(e.clientY)) {
        if (e.which != 1) return;
        downX = e.clientX;
        eL = e.layerX;
        tempMoveEvent = document.onmousemove;
      }else if (e.touches){
        e.preventDefault();
        downX = e.touches[0].clientX;
        eL = e.touches[0].clientX - this.canvas.selector.parentElement.offsetLeft;
        tempMoveEvent = document.ontouchmove;
      }    
      if (eL >= this.x1 + this.sideWidth && eL <= this.x2 - this.sideWidth){
        if ((e.clientX)&&(e.clientY)) document.onmousemove = e=>moveAllField(e.clientX);
        else if (e.touches) document.ontouchmove =e=>moveAllField(e.touches[0].clientX);
      }
      else if (eL >= this.x1 && eL < this.x1 + this.sideWidth){
        if ((e.clientX)&&(e.clientY)) document.onmousemove = e=> moveLeftSide (e.clientX);
        else if (e.touches) document.ontouchmove = e=> moveLeftSide (e.touches[0].clientX);
      }
      else if (eL <= this.x2 && eL > this.x2 - this.sideWidth){
        if ((e.clientX)&&(e.clientY)) document.onmousemove = e=> moveRightSide(e.clientX);
        else if (e.touches) document.ontouchmove = e=> moveRightSide(e.touches[0].clientX);
      }
      if ((e.clientX)&&(e.clientY)) document.onmouseup = ()=> document.onmousemove = tempMoveEvent;
      else if (e.touches) document.ontouchend = ()=> document.ontouchmove = tempMoveEvent;
    }
    this.canvas.selector.addEventListener('mousedown', touchDown,false);
    this.canvas.selector.addEventListener('touchstart', touchDown,false);
  }

  function CheckButton (parent,line,theme,idname){
    this.parent = parent;
    this.line = line;
    if (idname) this.idname=idname;
    else this.idname = 'id_' + line.name.replace(/[^a-zA-Z0-9]/g,'');
    this.init(theme);
    this.onEvent();
  }
  CheckButton.prototype.init = function(theme){
    this.checkbox = document.createElement('input');
    this.checkbox.type = "checkbox";
    this.checkbox.id = this.idname;
    this.checkbox.checked = true;
    this.checkbox.onchange = this.onchange;
    this.label = document.createElement('label');
    this.label.htmlFor = this.idname;
    let styleBorder = document.createElement("style");
    let styleBefore = document.createElement("style");
    styleBorder.type='text/css';
    styleBefore.type='text/css';
    document.head.appendChild(styleBorder).innerHTML = `#${this.idname} + label{border:1px solid ${ theme.state === 'day' ? theme.colorDay.lines: theme.colorNight.lines}50;}`
    document.head.appendChild(styleBefore).innerHTML = `#${this.idname} + label::before{border:1px solid ${this.line.color};} #${this.idname}:checked + label::before{background-color: ${this.line.color};}`
    this.label.appendChild(document.createTextNode(this.line.name));
    this.parent.appendChild(this.checkbox);
    this.parent.appendChild(this.label);
  }
  CheckButton.prototype.onEvent = function(){
    this.checkbox.onchange = e=>{
      if (this.checkbox.checked === false){  
        this.line.visible=false; 
      }else if(this.checkbox.checked ===true){
        this.line.visible =true;
      }
      drawStuff();
    }
  }
  
  function Theme(selector,textDay,textNight,firstState='day'){
    this.state = firstState;
    this.colorDay = {
      text: "#43484b",
      bgc: "#fff",
      visibleField: "#dfe6eb",
      lines:"#8199a8"
    };
    this.colorNight = {
      text: "#e8ecee",
      bgc: "#242f3e",
      visibleField: "#151d28",
      lines: "#344658"
    };
    let eventChange = ()=>{
      selector.innerText = this.state ==='day'? textDay : textNight;
      document.body.style.color = this.state === 'day'? this.colorDay.text :this.colorNight.text;
      document.body.style.backgroundColor = this.state === 'day'? this.colorDay.bgc: this.colorNight.bgc;
    }
    eventChange();
    selector.onclick = e=>{
      if (e.which != 1) return;
      this.state = this.state === 'day'? 'night': 'day';
      eventChange();
      drawStuff();
    }
  }
  
  let selectorFullView = document.querySelector('canvas#full-view');
  let selectorPreView = document.querySelector('canvas#pre-view');
  let theme = new Theme(document.querySelector('.themeswitch-btn'),'Switch to Night Mode','Switch to Day mode');
  let fullView= new Canvas(selectorFullView,selectorFullView.getContext('2d'),400,theme);
  let preView= new Canvas(selectorPreView,selectorPreView.getContext('2d'),100,theme);
  let containerWidth=0;
  let preLines=[];
  let fullLines=[];
  let visibleField=undefined;
  
  
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    containerWidth=document.querySelector('.container').offsetWidth;
    fullView.selector.width = containerWidth;
    fullView.width = containerWidth;
    fullView.height = document.querySelector('.container').offsetHeight > 530 ? document.querySelector('.container').offsetHeight-370 : 160;
    fullView.selector.height = fullView.height;
    preView.selector.width = containerWidth;
    preView.width = containerWidth;
    preView.selector.height =preView.height;
    if (visibleField !== undefined){
      if (visibleField.x1<0){
        visibleField.x2 = visibleField.x2+visibleField.x1;
        visibleField.x1 = 0;
      }else if (visibleField.x2>visibleField.canvas.width){
        visibleField.x1 = visibleField.x1+visibleField.canvas.width-visibleField.x2;
        visibleField.x2 = visibleField.canvas.width;
      }
    }
    drawStuff(); 
  }
  resizeCanvas();
  
  visibleField = new VisibleField(preView, preView.width*0.7, preView.width,theme);
  let checkButtons = [];

  ajax_get('chart_data.json',data_input=>{
    let data=data_input[0];
    let x,y=[];
    for (const props in data.types) {
      if (data.types.hasOwnProperty(props)) {
        const value = data.types[props];
        if(value==='line') y.push(props);
        if(value==='x') x = props;
      }
    }
    y.forEach(y_one => {
      let val = {};
      let arr_x = data.columns.filter(e=>e[0]===x)[0].filter((e,index)=>index !==0); 
      let arr_y = data.columns.filter(e=>e[0]===y_one)[0].filter((e,index)=>index !==0);
      for (let i = 0; i < arr_x.length; i++) {
        val[arr_x[i]] = arr_y[i];      
      }
      preLines.push(new Line(preView,val,data.names[y_one],data.colors[y_one],1.5))
    });
    preLines.forEach(line=> line.setLineParameters(preLines,5));
    preLines.forEach(line=> fullLines.push(new Line(fullView,(()=>{
      let vals = {};
      for (const key in line.val) {
        if (line.val.hasOwnProperty(key)) {
          const element = line.val[key];
          key>=line.pxToTime(visibleField.x1)[0] && key<=line.pxToTime(visibleField.x2)[0] ? vals[key]=element : null;
        }
      }
      return vals;
    })(),line.name,line.color,2.5)));
    fullLines.forEach(line=> line.setLineParameters(fullLines,25)); 
    visibleField.onEvent();
    fullView.onGetValue(fullLines);
    preLines.forEach(e=>{checkButtons.push(new CheckButton(document.querySelector('#check-block'),e,theme))});
    drawStuff();
    
  });
  
  
  function drawStuff() {     
    if (preLines.length===0)return;
    preView.clear();
    fullView.clear();   
    preLines.forEach(e=>e.draw());
    preLines.filter(e=>e.visible===true).length && visibleField.draw();  
    fullLines.forEach(e=>{
      let line = preLines.filter(el=>el.visible===true && el.name === e.name)[0];
      if(line){
        e.val = {};
        for (const key in line.val) {
          if (line.val.hasOwnProperty(key)) {
            const element = line.val[key];
            key>=line.pxToTime(visibleField.x1)[0] && key<=line.pxToTime(visibleField.x2)[0] ? e.val[key]=element : null;
          }
        }
        e.visible = true;
      }else{
        e.visible = false;
      }
      e.draw();
    });   
    fullView.drawGrid(fullLines.filter(e=>e.visible ===true));
  }
};

window.onload=init;

