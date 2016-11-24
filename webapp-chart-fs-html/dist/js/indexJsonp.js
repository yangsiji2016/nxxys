$(function () {
    // 请求地址前缀
    var prefixUrlValue = "http://114.55.112.51:1777/";
    //插入产品列表
    ReadProductList.init({
        prefixUrl: prefixUrlValue
    }).insertProductList();
});

function success_jsonpCallback(result) {

}

/**
 * 读取产品列表
 */
;
(function ($) {
    var ReadProductList = function (obj) {

        //配置节点信息
        this._init(obj);
    };
    ReadProductList.prototype = {
        constructor: ReadProductList,
        //配置节点信息
        _init: function (obj) {
            this.prefixUrl = obj.prefixUrl;
            this.productList = $("#product-list");  //产品列表区域
            window['sumProductOneValue'] = [];         //全局产品列表的数据
        },
        //外部接口插入产品列表
        insertProductList: function () {
            this._readAjax({
                callBack: this._insertProductList
            });
        },
        //读取产品列表的ajax
        _readAjax: function (obj) {
            var _this = this;
            $.ajax({
                url: _this.prefixUrl + "read/productEventJP.html",
                type: "GET",
                dataType: 'jsonp',
                async: false,
                jsonp: "callback", //服务端用于接收callback调用的function名的参数
                jsonpCallback: "success_jsonpCallback", //callback的function名称,服务端会把名称和data一起传递回来
                data: {
                    "productId": obj.productId
                },
                success: function (result) {
                    obj.callBack && obj.callBack.call(_this, result);
                }
            });
        },
        //插入产品列表
        _insertProductList: function (result) {
            var _this = this;
            if (result.code == 0) {
                var titleTempStr = ""; //临时存放的标题字符串
                var titleStr = ""; //总存放的标题字符串
                //console.log(result.data);
                var newArry = this._sortArry(result.data, "sortIndex");
                $.each(newArry, function (n, value) {
                    if (value.isDefaultVisible) {
                        window['sumProductOneValue'].push(value);  //插入产品列表数据
                        //涨跌  ：最新价格-昨收
                        var changePrice = (value.price - value.preClosePrice);
                        //涨幅 ：（最新价格-昨收）/昨收*100
                        var change = (changePrice / value.preClosePrice) * 100;
                        //存储临时标题数组
                        titleTempStr = '\
                                    <tr data-symbol="' + value.symbol + '"data-digits="' + value.digits + '">\
                                        <td>' + value.symbol + '</td>\
                                        <td>' + value.productName + '</td>\
                                        <td class="price">' + value.price.toFixed(value.digits) + '</td>\
                                        <td class="changePrice">' + changePrice.toFixed(value.digits) + '</td>\
                                        <td class="change">' + change.toFixed(2) + '%</td>\
                                        <td class="preClose">' + value.preClosePrice + '</td>\
                                        <td>' + value.openPrice + '</td>\
                                        <td>' + value.highPrice + '</td>\
                                        <td>' + value.lowPrice + '</td>\
                                        <td class="totalVolume">' + value.totalVolume + '</td>\
                                        <td class="amount">' + value.amount + '</td>\
                                    </tr>';
                        titleStr += titleTempStr;
                    }
                });
                this.productList.html(titleStr);    //插入商品

                //描绘历史行情
                HistoryQuote.init({
                    prefixUrl: _this.prefixUrl
                }).DescribeQuote();
                //更新行情
                Quote.init({
                    prefixUrl: _this.prefixUrl
                }).updatePrice();
            }
        },
        //冒泡排序，从小到大
        _sortArry: function (arr, key) {
            var temp = "";
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < len - i - 1; j++) {
                    if (arr[j][key] > arr[j + 1][key]) {
                        temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp;
                    }
                }
            }
            return arr;
        }
    };

    //启动函数
    ReadProductList.init = function (obj) {
        return new this(obj);
    };
    //外部接口
    window['ReadProductList'] = ReadProductList;
})(jQuery);


/**
 * 描绘历史行情图模块
 */
;
(function ($) {
    var HistoryQuote = function (obj) {
        //配置节点信息
        this._init(obj);
    };
    HistoryQuote.prototype = {
        constructor: HistoryQuote,
        //配置节点信息
        _init: function (obj) {
            this.prefixUrl = obj.prefixUrl;
            this.historyQuoteChoseBox = $("#history-quote-chose-list");    //历史行情选择区域
            this.historyQuoteChoseList = this.historyQuoteChoseBox.find("li");  //历史行情选择区域列表们
            this.productListBox = $("#product-list");               //商品列表区域
            this.productListBoxList = this.productListBox.find("tr");//商品列表们
            this.quotoPic = $("#quoto-pic");            //canvas的整体画布
            this.quotoBg = $("#quoto-bg");              //canvas画布的背景
            this.historyQuoteObj = {};                  //历史行情的缓存数据
            this.getArryData = [];                      //绘制数组的数据
            this.lastSymbol = "";                       //上一个激活的symbol
        },
        //描绘历史行情
        DescribeQuote: function () {
            var _this = this;

            //行情图进行选择点击
            this.historyQuoteChoseBox.on("click", "li", function () {
                var $this = $(this);
                if ($this.hasClass("active")) return false;    //不重复点击
                var index = $this.index();
                //行情变更的方法
                _this._changeQuote(index);
            });

            //选择商品名进行点击，来改变行情图
            this.productListBox.on("click", "tr", function () {
                var $this = $(this);
                var index = $this.index();
                if ($this.hasClass("active")) return false;
                _this.productListBoxList.removeClass("active").eq(index).addClass("active");
                window['productOneValue'] = window['sumProductOneValue'][index];                  //产品信息数据
                _this.activeSymbol = _this.productListBoxList.filter(".active").data("symbol");   //当前行情图激活的symbol
                //首次默认分时图进行点击
                _this.historyQuoteChoseList.removeClass("active").first().trigger("click");
            });

            //进行商品列表首个默认点击
            this.productListBoxList.first().trigger("click");


        },
        //历史行情的ajax请求
        _readAjax: function (obj) {
            var _this = this;
            $.ajax({
                url: _this.prefixUrl + "read/historicalDataEventJP.html",
                type: "GET",
                dataType: 'jsonp',
                jsonp: "callback", //服务端用于接收callback调用的function名的参数
                jsonpCallback: "success_jsonpCallback", //callback的function名称,服务端会把名称和data一起传递回来
                data: {
                    "symbol": obj.symbol,
                    "periodType": obj.periodType,
                    "requestDate": (new Date()).getTime()
                },
                success: function (result) {
                    obj.callBack && obj.callBack.call(_this, result);
                },
                beforeSend: function () {
                    _this.quotoBg.show();
                },
                complete: function () {
                    _this.quotoBg.hide();
                }
            });
        },
        /**
         * 行情变更的func
         * @param index 当前激活中的行情选择框的索引
         * @private
         */
        _changeQuote: function (index) {
            var _this = this;
            this.historyQuoteChoseList.removeClass("active").eq(index).addClass("active");
            this.value = this.historyQuoteChoseList.eq(index).html();       //当前共享的value
            this.periodType = this._readQuoteHtml(this.value);      //简化周期类型
            this.line = this._readLineType(this.value);             //线的种类
            var autoRreshTime = this._autoRreshTime(this.value);    //自动刷新的时间
            var oneQuotoChoses = this.historyQuoteChoseList.eq(index);  //当前激活中的行情选择框的索引
            var cacheSymbol = this.activeSymbol;                    //闭包环境下的symbol，用来清除不同symbol之间的缓存
            var cachePeriodType = this._readQuoteHtml(this.value);  //闭包换下下的线的周期类型，用来清除不同symbol之间的缓存


            if (this.historyQuoteObj[this.activeSymbol + this.periodType] && cacheSymbol == this.lastSymbol) {        //若有缓存，从缓存中取
                this._drawQuotePic(this.historyQuoteObj[this.activeSymbol + this.periodType]);
                oneQuotoChoses.timer = setTimeout(function () {
                    _this.historyQuoteObj[cacheSymbol + cachePeriodType] = null;
                    if (oneQuotoChoses.hasClass("active") && _this.productListBoxList.filter(".active").data("symbol") == cacheSymbol) {
                        _this._changeQuote(index);
                    }
                    clearTimeout(oneQuotoChoses.timer);
                    oneQuotoChoses.timer = null;
                }, autoRreshTime);
            } else {                                              //直接后台读取更新历史行情
                this._readAjax({                         //读取历史行情
                    periodType: this.periodType,               //当前周期类型
                    symbol: _this.activeSymbol,            //symbol
                    callBack: this._getAjaxData
                });
                oneQuotoChoses.timer = setTimeout(function () {
                    _this.historyQuoteObj[cacheSymbol + cachePeriodType] = null;
                    if (oneQuotoChoses.hasClass("active") && _this.productListBoxList.filter(".active").data("symbol") == cacheSymbol) {
                        _this._changeQuote(index);
                    }
                    clearTimeout(oneQuotoChoses.timer);
                    oneQuotoChoses.timer = null;
                }, autoRreshTime);
            }

            this.lastSymbol = cacheSymbol;

        },
        /**
         * 从历史行情里读取ajax数据
         * @param result    读取到的s数据
         * @private
         */
        _getAjaxData: function (result) {
            var _this = this;
            if (result.code == 0) {       //后台取得数据
                this.getArryData = [];
                $.each(result.data, function (n, value) {   //历史行情的数据读取出来缓存
                    _this.getArryData.push(value);
                });
                this.getArryData.reverse();
                //进行历史行情数据的缓存
                this.historyQuoteObj[this.activeSymbol + this.periodType] = this.getArryData;
            }
            //进行行情图的描绘
            this._drawQuotePic(this.getArryData);

        },
        /**
         * 描绘历史行情图
         * datas 传入的历史行情数据
         * @private
         */
        _drawQuotePic: function (datas) {
            var dateTimeType = "";
            switch (this.value) {
                case "分时":
                case "M1":
                case "M5":
                case "M15":
                case "M30":
                case "H1":
                case "H4":
                    dateTimeType = 'time';
                    break;
                case "D1":
                case "W1":
                case "MN1":
                    dateTimeType = 'date';
                    break;
            }
            //console.log(window['productOneValue']);

            this.quotoPic.vkChart({         //启动绘图插件
                datas: datas,
                dataTimeType: dateTimeType,
                lineType: this.line,
                dataShowCount: 60
            });
        },
        //分时线自动刷新所对应的时间
        _autoRreshTime: function (value) {
            switch (value) {
                case "分时":
                    return 60000;
                    break;
                case "M1":
                    return 60000;
                    break;
                case "M5":
                    return 300000;
                    break;
                case "M15":
                    return 900000;
                    break;
                case "M30":
                    return 1800000;
                    break;
                case "H1":
                    return 3600000;
                    break;
                default:
                    return 3600000;
                    break;
            }
        },
        /**
         * 根据周期类型判断输出值
         * @param value        周期类型
         * @returns {number}    周期类型简华值
         */
        _readQuoteHtml: function (value) {
            switch (value) {
                case "分时":
                    return 1;
                    break;
                case "M1":
                    return 1;
                    break;
                case "M5":
                    return 2;
                    break;
                case "M15":
                    return 3;
                    break;
                case "M30":
                    return 4;
                    break;
                case "H1":
                    return 5;
                    break;
                case "H4":
                    return 6;
                    break;
                case "D1":
                    return 7;
                    break;
                case "W1":
                    return 8;
                    break;
                case "MN1":
                    return 9;
                    break;
            }
        },
        /**
         * 根据周期类型，判断描绘的线的种类
         * @param value        周期类型
         * @returns {*}        线的种类
         */
        _readLineType: function (value) {
            if (value == "分时") {
                return "mins";
            } else {
                return "kline";
            }
        }
    };
    //启动函数
    HistoryQuote.init = function (obj) {
        return new this(obj);
    };
    //外部接口
    window['HistoryQuote'] = HistoryQuote;
})(jQuery);

/**
 * 进行行情更新
 */
;
(function ($) {
    var Quote = function (obj) {
        //配置节点信息
        this._init(obj);
    };
    Quote.prototype = {
        constructor: Quote,
        //配置节点信息
        _init: function (obj) {
            this.prefixUrl = obj.prefixUrl;
            this.productBox = $("#product-list");  //产品列表模块
            this.productList = this.productBox.find("tr");  //产品列表们
            this.quotoPic = $("#quoto-pic");            //canvas的整体画布
        },
        //变更价格和历史行情的价格
        updatePrice: function () {
            var _this = this;
            setInterval(function () {
                _this._readAjax({
                    fn1: _this._updateAllPrice
                });
            }, 1000);
        },
        //读取行情的ajax
        _readAjax: function (obj) {
            var _this = this;
            $.ajax({
                url: _this.prefixUrl + "read/quoteEventJP.html",
                type: "GET",
                dataType: 'jsonp',
                jsonp: "callback", //服务端用于接收callback调用的function名的参数
                jsonpCallback: "success_jsonpCallback", //callback的function名称,服务端会把名称和data一起传递回来
                timeout: 1300,
                data: {
                    "requestDate": (new Date()).getTime()
                },
                success: function (result) {
                    obj.fn1 && obj.fn1.call(_this, result);
                }
            });
        },
        //更新最新价格和历史行情价格
        _updateAllPrice: function (result) {
            var _this = this;
            var trIndex = this.productList.filter(".active").index();  //当前激活tr的索引
            var trSymbol = this.productList.filter(".active").data("symbol");   //当前激活的symbol
            if (result.code == 0) {
                this.productList.each(function () {
                    var $this = $(this);
                    var symbol = $this.data("symbol");
                    var digits = $this.data("digits");
                    var priceBox = $this.find(".price");
                    var preCloseBox = $this.find(".preClose");
                    var changePriceBox = $this.find(".changePrice");
                    var changeBox = $this.find(".change");
                    var amountBox = $this.find(".amount");
                    var totalVolumeBox = $this.find(".totalVolume");
                    //昨收
                    var preClose = preCloseBox.html();
                    //价格
                    var price = priceBox.html();
                    $.each(result.data, function (n, value) {
                        if (symbol == value.symbol) {
                            var newPrice = value.price;
                            if (preClose > newPrice) {
                                priceBox.css("backgroundColor", "green");
                            } else if (preClose < newPrice) {
                                priceBox.css("backgroundColor", "red");
                            } else {
                                priceBox.css("backgroundColor", "black");
                            }
                            //涨跌  ：最新价格-昨收
                            var changePrice = (newPrice - preClose);
                            //涨幅 ：（最新价格-昨收）/昨收*100
                            var change = (changePrice / preClose) * 100;
                            changePriceBox.html(changePrice.toFixed(digits));
                            changeBox.html(change.toFixed(2) + "%");
                            //总成交量
                            var totalVolume = value.totalVolume;
                            if (totalVolume == 0) { //当volum 当前成交量为0时，显示上一次的成交量preVolume
                                totalVolume = value.preVolume;
                            }
                            totalVolumeBox.html(totalVolume);
                            //成交金额
                            amountBox.html(value.amount);
                            //最新价格
                            priceBox.html(newPrice);
                        }
                        if (trSymbol == value.symbol) {
                            var vkChart = _this.quotoPic.data("vkChart");   //读取出行情图的实例对象
                            var downPrice = value.price;
                            var oneProductValue = window['productOneValue'];
                            if (downPrice < oneProductValue.low) {              //若行情价格小于产品最低价，则进行行情图最低价的更新
                                oneProductValue.low = downPrice;
                                vkChart.repaintHighLow({
                                    low: downPrice
                                });
                            } else if (downPrice > oneProductValue.high) {       //若行情价格大于产品最低价，则进行行情图最高价的更新
                                oneProductValue.high = downPrice;
                                vkChart.repaintHighLow({
                                    high: downPrice
                                });
                            }
                        }

                    });
                });
            }
        }
    };
    //外部接口
    Quote.init = function (obj) {
        return new this(obj);
    };
    //外部接口
    window['Quote'] = Quote;
})(jQuery);