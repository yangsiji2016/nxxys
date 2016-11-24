/**
 * jquery行情图插件
 * 需传入对象集合参数,必传入：
 * datas:Array  //为传入的数据集合数组
 * dataTimeType:time或者data  //传入想画一日图还是多日图
 * lineType:kline或者mins   //传入线的种类，想画k线图还是分时图
 */
;(function($){

    var VkChart = function(element,options){
        this.element = element;     //当前的节点
        this.options = $.extend({}, $.fn.vkChart.defaults, options);    //当前参数信息
        this.datas = this.options.datas;            //传入的数据集合
        this.sumHeight = this.element.height();     //当前画布的高度
        this.sumWidth = this.element.width();       //当前画布的宽度
        this.regionHeight = this.sumHeight - 140;   //价格曲线之间的高度

        //配置基本节点信息
        this._init();
        //配置函数信息
        this._initEvent();
    };

    VkChart.prototype = {
        constructor:VkChart,
        //配置基本节点信息
        _init:function(){
            var options = this.options;

            //画布的大小不能在CSS中定义,插入画布和2条k线和y线
            var str = '\
                <div class="vkY" style="display:none;z-index:1000;width:1px;height:'+(this.regionHeight + options.volumeHeight)+'px;position:absolute;background:'+options.tipColor+';top:'+options.region.y+'px;left:0px;"></div>\
                <div class="vkX" style="display:none;z-index:1000;width:'+this.sumWidth+'px;height:1px;position:absolute;background:'+options.tipColor+';top:'+options.region.y+'px;left:0px;"></div>\
                <canvas style="z-index:999;" width="'+this.sumWidth+'" height="'+this.sumHeight+'"></canvas>\
                ';
            this.element.html(str);

            this.jqCanvas = this.element.find("canvas");
            this.canvas = this.jqCanvas[0];
            this.cxt = this.canvas.getContext("2d");    //绘画对象
            this.cxt.backgroundAlpha = 0;   //设置背景透明
            this.vkY = this.element.find(".vkY");   //y轴线
            this.vkX = this.element.find(".vkX");   //x轴线

            if(options.lineType=="kline"){     //如果是k线图的话,就抓取指定数量的数据段
                //if (options.tempData.dataEndIndex == -1) {
                //    options.tempData.dataEndIndex = this.datas.length - 1;
                //}
                //this.datas = this.datas.slice(options.tempData.dataEndIndex + 1 - options.dataShowCount, options.tempData.dataEndIndex + 1);
                if(this.datas.length==120){
                    if (options.tempData.dataEndIndex == -1) {
                        options.tempData.dataEndIndex = this.datas.length - 1;
                    }
                    this.datas = this.datas.slice(options.tempData.dataEndIndex + 1 - options.dataShowCount, options.tempData.dataEndIndex + 1);
                }else if(this.datas.length>=60){
                    this.datas = this.datas.slice(this.datas.length-60, this.datas.length);
                }
            }
        },
        //配置基本函数信息
        _initEvent:function(){
            var options = this.options;
            //画顶部说明文信息,参数0为初始化,从产品模块里取最高和最低价
            this._paintText(0,true);
            //画底部时间信息
            this._paintTime();
            //计算出数据量的最大最小值，作为画图的参考
            this._countDatas();
            //绘制基础共享页面
            this._paintBasePage();

            //绘制k线
            if(options.lineType=="kline"){      //绘制k线
                this._paintKline();
            }else if(options.lineType=="mins"){ //绘制分时
                this._paintMins();
            }

            //绘制画量
            this._paintVolume();

            //绘制ma平均线       //todo标记
            this._paintKlineMaLine(3, options.lineColor3);
            this._paintKlineMaLine(7, options.lineColor7);
            this._paintKlineMaLine(10, options.lineColor10);

            //绘制事件
            this._bindMoveEvent();
        },
        /**
         * 重新绘制最高和最低价
         * obj 为传入的参数集合
         */
        repaintHighLow:function(obj){
            var cxt = this.cxt;
            var options = this.options;
            var oneWidth = Math.floor(this.sumWidth / 3);   //3分之1的canvas宽度
            if(obj.low){
                cxt.clearRect(oneWidth, 20, oneWidth, 40);   //清理一步分画布
            }else if(obj.high){
                cxt.clearRect(oneWidth, 0, oneWidth, 20);   //清理一步分画布
            }

            cxt.font = "12px 宋体";
            cxt.textBaseline = "top";
            cxt.textAlign = "left";
            cxt.fillStyle = options.riseColor;
            if(obj.high){
                cxt.fillText("最高："+obj.high, oneWidth, 5);
            }
            cxt.fillStyle = options.fallColor;
            if(obj.low){
                cxt.fillText("最低："+obj.low, oneWidth, 25);
            }
        },
        /**
         * 绘制顶部数据的详细信息
         * @param index 数据段的索引
         * @param flag 若为true表示从产品模块里取最高和最低，若为false表示从历史行情模块里取
         * @private
         */
        _paintText:function(index,flag){
            var cxt = this.cxt;     //画图对_this.temp.象
            var options = this.options; //参数信息
            var oneWidth = Math.floor(this.sumWidth / 3);   //3分之1的canvas宽度
            if(flag){
                var productValue = window['productOneValue'];       //产品的数据集合
            }
            var datas = this.datas[index];

            var close = flag?productValue.closePrice:datas.closePrice;
            var open = flag?productValue.openPrice:datas.openPrice;
            var time = this._getTimeDate(datas.barDate);
            var high = flag ? productValue.highPrice : datas.highPrice;
            var low = flag ? productValue.lowPrice : datas.lowPrice;
            var isRise = close > open;
            var isFall = close < open;
            var diffCloseOpen = (close - open).toFixed(2);
            var color = (isRise ? options.riseColor : (isFall ? options.fallColor : options.normalColor));
            //重置顶部信息画布
            cxt.clearRect(0, 0, this.sumWidth, options.region.y - 1);
            cxt.font = "20px 雅黑";
            cxt.fillStyle = color;
            cxt.textBaseline = "top";
            cxt.textAlign = "left";

            //插入增长或者下滑数量
            cxt.fillText((isRise ? "↑" : (isFall ? "↓" : " ")) + diffCloseOpen, 5, 5);
            //插入增长或者下滑数量的百分比
            var newAdd = (diffCloseOpen * 100 / open).toFixed(2);
            if(isNaN(newAdd)){
                newAdd = (0).toFixed(2);
            }
            cxt.fillText("(" + newAdd + "%)", 5, 35);

            cxt.font = "12px 宋体";
            cxt.fillStyle = options.riseColor;
            cxt.fillText("最高：" + high.toFixed(2), oneWidth, 5);
            cxt.fillStyle = options.fallColor;
            cxt.fillText("最低：" + low.toFixed(2), oneWidth, 25);
            cxt.fillStyle = "#917295";
            cxt.fillText("成交：" + datas.volume.toFixed(2), oneWidth, 45);
            cxt.fillText("时间：" + time, oneWidth * 2, 45);
            cxt.fillStyle = options.riseColor;
            cxt.fillStyle = (isRise ? options.fallColor : (isFall ? options.riseColor : options.normalColor));
            cxt.fillText("今开：" + open.toFixed(2), oneWidth * 2, 5);
            cxt.fillStyle = (isRise ? options.riseColor : (isFall ? options.fallColor : options.normalColor));
            cxt.fillText("昨收：" + close.toFixed(2), oneWidth * 2, 25);

        },
        //画底部时间信息
        _paintTime:function(){
            var _this = this;
            var data = this.datas;
            var cxt = this.cxt;
            var options = this.options;
            var timesArry = [];
            var dataLength = data.length;
            var space = Math.round(dataLength / options.timeCount); //总共时间段数总划分为5段位
            //返回格式化后的时间数据
            for(var i=0;i<options.timeCount;i++){
                var j=dataLength - 1 - i * space;
                j = j < 0 ? 0 : j;
                timesArry.push(this._getTimeDate(new Date(data[(j)].barDate)));   //插入每个时间段的最前的时间
                if(i==(options.timeCount-1)){
                    if (j > space * 0.6) {
                        timesArry.push(this._getTimeDate(new Date(data[0].barDate)));      //插入最早的时间
                    }
                }
            }
            timesArry.reverse();    //时间倒叙，从早期时间到晚期时间
            var timesLengthHalf = parseInt(timesArry.length / 2);
            var oneWidth = Math.floor(this.sumWidth / (timesArry.length - 1));

            //底部固定时间的描绘
            var y = options.region.y + _this.regionHeight + options.volumeHeight;
            $.each(timesArry, function(i, time) {
                var x = oneWidth * i;
                cxt.font = "12px 宋体";
                cxt.fillStyle = "#917295";
                cxt.textBaseline = "top";
                cxt.textAlign = i < timesLengthHalf ? "left" : (i == timesLengthHalf ? "center" : "right");
                cxt.fillText(time, x, y);
            });
        },
        /**
         * 计算出最大最小的数据量,为画图提供数据
         * @private
         */
        _countDatas:function(){
            var _this = this;
            var options = this.options;
            this.temp = {
                //y轴上的最低价格
                maxVolume:0,     //最大的画量
                maxDiffPrice:0,   //最高或者最大价格与第一个收盘价格的差值
                leftPriceArrysInY:[],   //在y轴左边上的价格数组
                rightPricePercentArrysIny:[],    //在y轴右边上的价格数组
                minLowPrice:0,          //最低的low价格
                maxHighPrice:0,          //最高的high价格
                datasLenght:this.datas.length   //数据的总个数
            };

            //进行数据价格的计算
            var centerClose = this.datas[0].closePrice;      //第一个数据段的close收盘价格,放在当中位置

            //y轴数据的描绘
            $.each(this.datas, function (i, value) {
                if(i==0){
                    _this.temp.minLowPrice = value.lowPrice;
                    _this.temp.maxHighPrice = value.highPrice;
                    _this.temp.maxVolume = value.volume;
                }else{
                    _this.temp.minLowPrice = Math.min(_this.temp.minLowPrice, value.lowPrice);
                    _this.temp.maxHighPrice = Math.max(_this.temp.maxHighPrice, value.highPrice);
                    _this.temp.maxVolume = Math.max(_this.temp.maxVolume, value.volume);
                }
            });
            var diffCenterLow = Math.abs(centerClose - _this.temp.minLowPrice);        //中间段close的价格与最低low价格的差值绝对值
            var diffCenterHigh = Math.abs(centerClose - _this.temp.maxHighPrice);      //中间段close的价格与最高high价格的差值绝对值
            if(diffCenterLow>diffCenterHigh){       //中间段close与最低价格差值最大
                this.temp.maxDiffPrice = diffCenterLow;
            }else{                                  //中间段close与最高价格差值最大
                this.temp.maxDiffPrice = diffCenterHigh;
            }
            var diffPartPrice = (this.temp.maxDiffPrice / (options.horizontalLineCount - 1));  //每个水平线段之间的价格差值
            var val = 0;                //y轴上的价格
            var percent = 0;            //y轴上的价格减去第一个close在除以第一个close的百分比
            for(var i= 0,j=options.horizontalLineCount+2;i<j;i++){
                val = this.temp.minLowPrice + i * diffPartPrice;
                this.temp.leftPriceArrysInY.push(val);
                percent = ((val-centerClose)/centerClose*100);
                this.temp.rightPricePercentArrysIny.push(percent);
            }
            this.temp.rightPricePercentArrysIny.reverse();
            this.temp.leftPriceArrysInY.reverse();    //重大到小排序

        },
        /**
         * 绘制基础共享页面
         * @private
         */
        _paintBasePage:function(){
            var cxt = this.cxt;
            var options = this.options;
            //画边框
            cxt.beginPath();
            cxt.strokeStyle = options.borderColor;
            cxt.rect(options.region.x, options.region.y, this.sumWidth, this.regionHeight);
            cxt.stroke();
            //水平线
            var horizontalMiddleIndex = (options.horizontalLineCount + options.horizontalLineCount % 2) / 2;
            var horizontalSplitCount = options.horizontalLineCount + 1;
            for (var i = 1; i <= options.horizontalLineCount; i++) {
                var color = (i == horizontalMiddleIndex ? options.middleLineColor : options.otherSplitLineColor);
                var y = options.region.y + this.regionHeight * i / horizontalSplitCount;
                this._paintLine(cxt, options.region.x, y, this.sumWidth, y, color);
            }
            //垂直线
            var verticalSplitCount = options.verticalLineCount + 1;
            for (var i = 1; i <= options.verticalLineCount; i++) {
                var x = options.region.x + this.sumWidth * i / verticalSplitCount;
                this._paintLine(cxt, x, options.region.y, x, options.region.y + this.sumHeight, options.otherSplitLineColor);
            }

            var horzinMiddleIndex = Math.floor((options.horizontalLineCount + 2)/2);  //中间线的索引
            var diffPartHeight = this.regionHeight / (options.horizontalLineCount+1);   //每个线段之间的高度
            for(var i= 0,j=this.temp.leftPriceArrysInY.length;i<j;i++){
                var y = options.region.y+i*diffPartHeight;
                var color = i < horzinMiddleIndex ? options.riseColor : (i == horzinMiddleIndex ? options.normalColor : options.fallColor);
                cxt.font = options.yScalerFont;
                cxt.fillStyle = color;
                cxt.textBaseline = "top";
                cxt.textAlign = "left";
                cxt.fillText(this.temp.leftPriceArrysInY[i].toFixed(2), 0, y);       //描绘左边的价格
                cxt.textAlign = "right";
                cxt.fillText(this.temp.rightPricePercentArrysIny[i].toFixed(2)+"%", this.sumWidth, y);   //描绘右边的百分比
            }
        },
        /**
         *  画k线的价格线
         */
        _paintKline:function(){
            var _this = this;
            var cxt = this.cxt;
            var options = this.options;
            //进行价格线的描绘
            var minYprice = this.temp.leftPriceArrysInY[this.temp.leftPriceArrysInY.length - 1];    //价格线的最低价格
            var xSpace = this.sumWidth / this.datas.length;     //传入多少数量的数据段来划分整个画布的宽度
            //var barWidth = xSpace * 0.8;                        //每个画布宽度的0.8
            var barWidth = this.sumWidth / this.datas.length * 0.8;
            //遍历全部的数据段画价格线
            $.each(this.datas, function (i, value) {
                var x = xSpace * i;
                //各种high,low,open,close价格的y轴
                var highY = _this.regionHeight + options.region.y - ((value.highPrice - minYprice) / (2 * _this.temp.maxDiffPrice)) * _this.regionHeight;
                var lowY = _this.regionHeight + options.region.y - ((value.lowPrice - minYprice) / (2 * _this.temp.maxDiffPrice)) * _this.regionHeight;
                var openY = _this.regionHeight + options.region.y - ((value.openPrice - minYprice) / (2 * _this.temp.maxDiffPrice)) * _this.regionHeight;
                var closeY = _this.regionHeight + options.region.y - ((value.closePrice - minYprice) / (2 * _this.temp.maxDiffPrice)) * _this.regionHeight;

                var isRise = value.closePrice > value.open;
                var isFall = value.closePrice < value.open;
                var color = isRise ? options.riseColor : (isFall ? options.fallColor : options.normalColor);
                //画出high和low之间的区域
                _this._paintLine(cxt,x+barWidth*0.6,highY,x+barWidth*0.6,lowY,color);
                //画出收仓和开盘的价格
                cxt.fillStyle = color;
                if (isRise) {
                    cxt.fillRect(x + barWidth * 0.1, closeY, barWidth, (openY - closeY) < 1 ? 1 : openY - closeY);
                } else {
                    cxt.fillRect(x + barWidth * 0.1, openY, barWidth, (closeY - openY) < 1 ? 1 : closeY - openY);
                }
            });
        },
        /**
         * 画出分时图的价格线
         * @private
         */
        _paintMins:function(){
            var _this = this;
            var cxt = this.cxt;
            var options = this.options;

            //价格线
            var xSpace = this.sumWidth / this.datas.length;
            cxt.beginPath();
            cxt.strokeStyle = options.priceLineColor;
            cxt.lineWidth = 1;
            cxt.moveTo(options.region.x, this.regionHeight / 2 + options.region.y);
            $.each(this.datas, function(i, value) {
                var x = xSpace * i + 0.5 * xSpace;
                var y = _this.regionHeight - ((value.closePrice - _this.temp.minLowPrice) / 2) / _this.temp.maxDiffPrice * _this.regionHeight + options.region.y;
                if(isNaN(y)){
                    y= _this.regionHeight + options.region;
                }
                cxt.lineTo(x, y);
            });

            cxt.stroke();

        },
        /**
         * 画出画量
         * @private
         */
        _paintVolume:function(){
            var cxt = this.cxt;
            var _this = this;
            var options = this.options;
            $.each(this.datas, function (i, value) {
                var oneWidth = _this.sumWidth / _this.datas.length;
                var h = value.volume / _this.temp.maxVolume * (options.volumeHeight- options.volumeMarginTop);
                if(isNaN(h)){h=30;}
                var x = oneWidth * i + oneWidth * 0.1;
                var w = oneWidth * 0.8;
                var y = options.volumeHeight - h + options.region.y + _this.regionHeight;
                var close = value.closePrice;
                var preClose = (i == 0 ? value.closePrice : _this.datas[i - 1].closePrice);
                var isRise = close > preClose;
                var isFall = close < preClose;
                var color = isRise ? options.riseColor : (isFall ? options.fallColor : options.normalColor);
                cxt.fillStyle = color;
                cxt.fillRect(x, y, w, h);
            });
        },
        /**
         * 绘制k线的ma线的方法
         * @param index 绘制多少ma线的索引
         * @param color 绘制线的颜色
         * @returns {boolean}
         * @private
         */
        _paintKlineMaLine:function(index,color){
            var cxt = this.cxt;
            var options = this.options;

            var ma5CloseArry = [];  //ma5的close价格
            var tempArry = [];      //临时数组
            var xSpace = this.sumWidth / this.datas.length;     //传入多少数量的数据段来划分整个画布的宽度
            var barWidth = this.sumWidth / this.datas.length * 0.8;
            for(var i=0;i<this.datas.length-index;i++){
                tempArry = this.datas.slice(i, i+index);
                var sumClosePrice = 0;
                for(var j= 0;j<tempArry.length;j++){
                    sumClosePrice += tempArry[j].closePrice;
                }
                ma5CloseArry.push(sumClosePrice / index);
            }
            cxt.beginPath();
            cxt.strokeStyle = color;
            cxt.lineWidth = 1;
            var x = 0;      //x坐标的画线
            for(var i= 0,j=ma5CloseArry.length;i<j;i++){
                if(options.lineType=="kline"){
                    x = xSpace * (index+i) + barWidth*0.6;
                }else if(options.lineType=="mins"){
                    x = xSpace * (index+i) + 0.5 * xSpace;
                }
                y = this.regionHeight + options.region.y - ((ma5CloseArry[i] - this.temp.minLowPrice) / (2 * this.temp.maxDiffPrice)) * this.regionHeight;
                if(isNaN(y)){
                    y = this.regionHeight + options.region.y;
                }
                if(i==0){
                    cxt.moveTo(x, y);
                }else{
                    cxt.lineTo(x, y);
                }
            }
            cxt.stroke();
        },
        /**
         * 为canvas绑定在上面位移时，数据量的动态变化
         * @private
         */
        _bindMoveEvent:function(){
            var _this = this;
            var options = this.options;
            var pos = 0;        //滑到的x坐标
            this.jqCanvas.on("touchstart", function (e) {
                e.preventDefault();
            })
            .on("touchmove mousemove", function (e) {
                if (e.type == "mousemove") {
                    pos = e.clientX - _this.jqCanvas.offset().left;
                } else {
                    pos = e.originalEvent.changedTouches[0].clientX - _this.jqCanvas.offset().left;
                }
                var index = Math.floor(pos / _this.sumWidth * _this.temp.datasLenght);
                //判断如果位移出canvas 往左取到第一个数据 //往右取到最后个数据
                if (index <= 0) {
                    index = 0;
                } else if (index >= _this.temp.datasLenght) {
                    index = _this.temp.datasLenght - 1;
                }
                var x = index * _this.sumWidth / (_this.temp.datasLenght) + _this.sumWidth / _this.temp.datasLenght / 2;
                var y = _this.regionHeight - ((_this.datas[index].closePrice - _this.temp.minLowPrice) / 2) / _this.temp.maxDiffPrice * _this.regionHeight + options.region.y - 1;
                    if(isNaN(y)){
                        var y = _this.regionHeight  + options.region.y - 1;
                    }
                //绘制数据详细信息
                _this._paintText(index);
                _this.vkY.show().css("left", x);
                _this.vkX.show().css("top", y);
            })
            .on("touchend mouseleave", function () {
                _this._paintText(0,true);
                _this.vkY.hide();
                _this.vkX.hide();
            });
        },
        /**
         * 画横线或者竖线
         * @param ctx   //canvas画图对象
         * @param x0    //起点x
         * @param y0    //起点y
         * @param x1    //终点x
         * @param y1    //终点y
         * @param color //线条颜色
         * @private
         */
        _paintLine:function(ctx, x0, y0, x1, y1, color){
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        },
        /**
         * 将传入的时间进行格式化
         * @param time  传入的时间数据
         * @private     返回格式化后的时间
         */
        _getTimeDate:function(time){
            var options = this.options;
            if(options.dataTimeType=="time"){
                return moment(time).format("HH:mm");
            }else if(options.dataTimeType=="date"){
                return moment(time).format("MM-DD");
            }
        }
    };

    /**
     * 绑定函数插入放在jquery上
     * @param options   传入的参数集合
     * @returns {*}     返回这个jquery节点
     */
    $.fn.vkChart = function(options){
        return this.each(function () {
            var _this = $(this),
                instance = new VkChart(_this, options);
            _this.data("vkChart", instance);
        });
    };

    /**
     * 默认配置参数
     * @type {{}}   参数集合
     */
    $.fn.vkChart.defaults = {
        middleLineColor : "#4b4b4b",
        priceLineColor : "#3E41FD",
        otherSplitLineColor : '#4b4b4b',
        //MA3
        lineColor3: "#4b4b4b",
        //MA7
        lineColor7: "#0000ff",
        //MA10
        lineColor10: "#32cd9a",
        //价格线区域
        region: {
            x: 0,
            y: 65.5
        },
        //水平线与垂直线的条数
        horizontalLineCount: 3,
        verticalLineCount: 1,
        maxDotsCount: 120,
        borderColor : '#4b4b4b',
        tipColor : '#464544',
        fallColor : '#06770F',
        riseColor : '#F44D1F',
        normalColor : '#FFFFFF',
        timeCount:5, //底部时间段数
        volumeHeight: 60,       //底部画量的画板高度
        volumeMarginTop: 7,     //最高画量距离顶部的高度
        yScalerFont: '10px 宋体',
        dataShowCount: 60,
        tempData:{
            //显示的数据条数
            dataEndIndex: -1
        }

    };


})(jQuery);