var express = require('express');
var endPoint = express();

var allowCrossDomain = function (req, res, next) {
    // 所有的接口都可以访问
    res.header('Access-Control-Allow-Origin', '*');
    // 自定义中间件，设置跨域需要的响应头
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
}
endPoint.use(allowCrossDomain)

// 仅用于调试
endPoint.get('/', function (req, res) {
    res.send('Hello World');
});

// http://localhost:8081/detail?custom=hello&date=2020-01
endPoint.get('/detail', function (req, res) {
   // 获取参数
    var keyword = req.query.keyword;
    var start = req.query.start;
    var end = req.query.end;

    var xlsx = require("node-xlsx");
    var moment = require('moment');

    var sheet = xlsx.parse("/home/refar/WebstormProjects/ers/ers-electron/resource/1.xlsx");

    // var keyword = '宜昌光电';
    // var start = '2020-04-01';
    // var end = '2020-04-30'; // 需要换成当月.

    // 取得 应收款录入
    var dataArray = [];
    // 取得客户上期结账
    var cosArray = [];

    sheet.forEach(function (item, index, array) {
        if ('应收账款录入' === item['name']) {
            for(var rowid in item['data']){
                if (rowid >= 2) {
                    var rows = item['data'][rowid];
                    // 这里会产生empty之类的信息, 所以转换两次成null
                    var rown = JSON.parse(JSON.stringify(rows));

                    if (null !== rown[0]){
                        if (keyword === rown[2]) {
                            var temp = {
                                // "date"       : new Date(1900, 0, rown[0] - 1).toLocaleDateString(),
                                "date"       : moment(new Date(1900, 0, rown[0] - 1)).format('YYYY-MM-DD'),
                                "no"         : rown[1],
                                "custom"     : rown[2],
                                "name"       : rown[3],
                                "specs"      : rown[4],
                                "unit"       : rown[5],
                                "nums"       : rown[6],
                                "price"      : rown[7],
                                "money"      : formatter(rown[8]),
                                "paper_money": formatter(rown[9]),
                                "paper_nums" : formatter2(rown[10]),
                                "get"        : formatter(rown[11]),
                                "remark"     : formatter(rown[12])
                            };
                            dataArray.push(temp);
                        }

                    }
                }
            }
        }
        if ('客户信息' === item['name']) {
            for(var rowid in item['data']){
                if (rowid >= 1) {
                    var rows = item['data'][rowid];
                    // 这里会产生empty之类的信息, 所以转换两次成null
                    var rown = JSON.parse(JSON.stringify(rows));

                    if (null !== rown[0]){
                        if (keyword === rown[0]) {
                            var temp = {
                                "custom"      : rown[0],
                                "first_money" : formatter(rown[1]),
                                "paper_money" : 0   // 因为excel上面都是没有单元格.
                            };
                            cosArray.push(temp);
                            break;
                        }

                    }
                }
            }

        }
    })

    // 余额
    var last = Number(cosArray[0]['first_money']);
    // 未开票余额
    var last2 = Number(cosArray[0]['paper_money']);
    // 在范围内的数据
    var newArray = [];
    dataArray.forEach(function (item, index, array) {
        // 计算上期结转 - 余额
        if (moment(item['date']).isBefore(start)) {
            // 客户信息中的 【期初应收账款余额】 + 小于起始时间的【借方金额】-【贷方(收款)】,
            last = last + Number(item['money']) - Number(item['get']);
            // 客户信息中的【期初未开票余额】 + 小于起始时间的【借方金额】 - 【已开票/开票金额】
            last2 = last2 + Number(item['money']) - Number(item['paper_money']);
        }

        if (moment(item['date']).isBetween(start, end, null, '[]')) {
            newArray.push(item)
        }
    });


    last = last.toFixed(2);
    last2 = last2.toFixed(2);

    // 排序
    newArray.sort(sortBy('date'))

    var result = []
    // 借方金额
    var total_money = 0;
    // 开票金额
    var total_pager_money = 0;
    // 贷方
    var total_get = 0;
    // 重量
    var total_remark = 0;

    // 先插入第一行特殊情况
    result.push(
        {
            "date"       : null,
            "no"         : null,
            "name"       : '上期结转',
            "specs"      : null,
            "unit"       : null,
            "nums"       : null,
            "price"      : null,
            "money"      : null,
            "paper_money": null,
            "paper_nums" : null,
            "get"        : null,
            "direct"     : setDirect(last),
            "last"       : last,
            "last2"      : last2,
            "remark"     : null
        }
    )

    // 统计当月
    newArray.forEach(function (item, index, array) {
        if (0 === index) {
            // 余额
            var line_last = last + Number(item['money']) - Number(item['get'])
            // 未开票余额
            var line_last2 = last2 + Number(item['money']) - Number(item['paper_money'])
        } else {
            // 余额
            var line_last = temp.last + Number(item['money']) - Number(item['get'])
            // 未开票余额
            var line_last2 = temp.last2 + Number(item['money']) - Number(item['paper_money'])

        }

        // 好像不加var是全局变量
        temp = {
            "date"       : item['date'],
            "no"         : item['no'],
            "name"       : item['name'],
            "specs"      : item['specs'],
            "unit"       : item['unit'],
            "nums"       : item['nums'],
            "price"      : item['price'],
            "money"      : item['money'],
            "paper_money": item['paper_money'],
            "paper_nums" : item['paper_nums'],
            "get"        : item['get'],
            "direct"     : setDirect(line_last),
            "last"       : line_last,
            "last2"      : line_last2,
            "remark"     : item['remark']
        }

        // 合计
        total_money = total_money + Number(temp.money)
        total_pager_money = total_money + Number(temp.paper_money)
        total_get = total_get + Number(temp.get)
        total_remark = total_remark + Number(temp.remark)

        result.push(temp)

        // 判断最后
        if ((newArray.length - 1) ===  index) {
            var temp2 = {
                "date"       : (moment(item['date']).month() + 1) + '月', // 月份从0开始
                "no"         : null,
                "name"       : '本月合计',
                "specs"      : null,
                "unit"       : null,
                "nums"       : null,
                "price"      : null,
                "money"      : total_money,
                "paper_money": total_pager_money,
                "paper_nums" : null,
                "get"        : total_get,
                "direct"     : setDirect(line_last),
                "last"       : line_last,
                "last2"      : line_last2,
                "remark"     : total_remark
            }
            result.push(temp2)
        }

    })

    res.end(JSON.stringify(result))

});

function formatter(data) {
    return null == data ? 0 : data;
}

function formatter2(data) {
    return null == data ? null : data;
}

function sortBy(field) {
    return function(a,b) {
        return a[field] <=b[field]?-1:1;
    }
}

function setDirect(data) {
    if (Number(data) > 0) {
        return '借'
    } else if (0 === Number('data')) {
        return '平'
    } else {
        return '贷'
    }
}

// start server
var server = endPoint.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("ers, 访问地址为 http://%s:%s", host, port)

});
