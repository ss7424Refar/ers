var express = require('express');
var endPoint = express();

const path = require('path')
targetPath = path.join(__dirname, '/resource/hello.xlsm')
const xlsx = require("node-xlsx");
var moment = require('moment');

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
    res.end('Hello World');
});

// http://localhost:8081/detail?form={}
endPoint.get('/detail', function (req, res) {

    var formData = req.query.formData;
    if ('undefined' === typeof(formData)) {
        return res.end(JSON.stringify({
            total:0,
            rows:[]
        }))
    }

    // 获取参数
    formData = JSON.parse(formData)
    var keyword = formData.keyword;
    var start = formData.start;
    var end = formData.end;

    var sheet = xlsx.parse(targetPath);

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
    // 四舍五入
    result = fixed(result)

    // 处理result成total和rows的形式
    res.end(JSON.stringify(sendFinal(req.query.offset, req.query.limit, result)))

});


endPoint.get('/setOption', function (req, res) {
    var cosOption = [{
        "value" : null,
        "text"  : "请选择客户信息"
    }]

    var sheet = xlsx.parse(targetPath);

    sheet.forEach(function (item, index, array) {
        if ('客户信息' === item['name']) {
            for(var rowid in item['data']){
                if (rowid >= 1) {
                    var rows = item['data'][rowid];
                    // 这里会产生empty之类的信息, 所以转换两次成null
                    var rown = JSON.parse(JSON.stringify(rows));

                    if (null !== rown[0]){
                        var temp = {
                            "value"      : rown[0],
                            "text"      : rown[0]
                        };
                        cosOption.push(temp);
                    }
                }
            }
        }
    })
    res.end(JSON.stringify(cosOption))
})


endPoint.get('/report', function (req, res) {
    var formData = req.query.formData;
    if ('undefined' === typeof(formData)) {
        return res.end(JSON.stringify({
            total:0,
            rows:[]
        }))
    }

    // 获取参数
    formData = JSON.parse(formData)
    var start = formData.start;
    var end = formData.end;

    // 取得 应收款录入
    var dataArray = [];
    // 取得客户上期结账
    var cosArray = [];

    var sheet = xlsx.parse(targetPath);

    sheet.forEach(function (item, index, array) {
        if ('应收账款录入' === item['name']) {
            for(var rowid in item['data']){
                if (rowid >= 2) {
                    var rows = item['data'][rowid];
                    // 这里会产生empty之类的信息, 所以转换两次成null
                    var rown = JSON.parse(JSON.stringify(rows));

                    if (null !== rown[0]){
                        var temp = {
                            // "date"       : new Date(1900, 0, rown[0] - 1).toLocaleDateString(),
                            "date"       : moment(new Date(1900, 0, rown[0] - 1)).format('YYYY-MM-DD'),
                            "custom"     : rown[2],
                            "money"      : formatter(rown[8]),
                            "paper_money": formatter(rown[9]),
                            "get"        : formatter(rown[11]),
                            "remark"     : formatter(rown[12])
                        };
                        dataArray.push(temp);

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
                        var temp = {
                            "no"          : cosArray.length + 1,
                            "custom"      : rown[0],
                            "first_money" : formatter(rown[1]),
                            "paper_money" : 0   // 因为excel上面都是没有单元格.
                        };
                        cosArray.push(temp);

                    }
                }
            }

        }
    })

    // report表数据
    var result = []

    // 再定义t单位的变量. 用于底部合计
    t1 = 0; t2 = 0; t3 = 0; t4 =0; t5 = 0; t6 = 0; t7 = 0; t8 = 0;
    cosArray.forEach(function (itemC, indexC, arrayC) {
        // 初期上期应收款
        var last = Number(itemC['first_money'])
        // 上期未收款
        var last2 = Number(itemC['paper_money'])

        // 合计
        var m = 0; // 借方金额
        var p = 0; // 开票金额
        var g = 0; // 贷方金额
        var r = 0; // 备注
        var thisMoney = 0;
        var thisMoney2 = 0;

        // 从应收录入里找客户
        dataArray.forEach(function (itemD, indexD, arrayD) {
            if (itemC['custom'] === itemD['custom']) {
                // 客户信息中的 【期初应收账款余额】 + 小于起始时间的【借方金额】-【贷方(收款)】,
                if (moment(itemD['date']).isBefore(start)) {
                    last = last + Number(itemD['money']) - Number(itemD['get']);
                    // 客户信息中的【期初未开票余额】 + 小于起始时间的【借方金额】 - 【已开票/开票金额】
                    last2 = last2 + Number(itemD['money']) - Number(itemD['paper_money']);
                } else if (moment(itemD['date']).isBetween(start, end, null, '[]')) {
                    // 借方金额
                    m = m +  Number(itemD['money']);
                    p = p + Number(itemD['paper_money']);
                    g = g + Number(itemD['get']);
                    r = r + Number(itemD['remark']);
                }
            }

            // 期末余额
            thisMoney = last + m - g; // 上期应收账款余额 + 借方发生额 - 贷方发生额
            thisMoney2 = last2 + m - p; // 上期未开票金额 + 借方发生额 - 已开票金额

        })
        // 真就一个个变量合计呗
        t1 = t1 + last;
        t2 = t2 + last2;
        t3 = t3 + m;
        t4 = t4 + p;
        t5 = t5 + g;
        t6 = t6 + thisMoney;
        t7 = t7 + thisMoney2;
        t8 = t8 + r;

        temp = {
            "no"         : itemC['no'],
            "custom"     : itemC['custom'],
            "last"       : last,
            "last2"      : last2,
            "money"      : m,
            "paper"      : p,
            "get"        : g,
            "direct"     : setDirect(thisMoney),
            "thisMoney"  : thisMoney,
            "thisMoney2" : thisMoney2,
            "remark"     : r,
        }

        result.push(temp)
        if (indexC === cosArray.length - 1) {
            result.push({
                "no"         : null,
                "custom"     : '合计',
                "last"       : t1,
                "last2"      : t2,
                "money"      : t3,
                "paper"      : t4,
                "get"        : t5,
                "direct"     : null,
                "thisMoney"  : t6,
                "thisMoney2" : t7,
                "remark"     : t8
            })
        }
    })

    // 四舍五入
    result = fixed(result)

    res.end(JSON.stringify(sendFinal(req.query.offset, req.query.limit, result)))
})

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
    } else if (0 === Number(data)) {
        return '平'
    } else {
        return '贷'
    }
}

// 四舍五入
function fixed(arr) {
    arr.forEach(function (item, index) {
        for (let key in item) {

            if(typeof item[key] !== 'number'){
                continue;
            }
            if (!isNaN(item[key])) {
                item[key] = Math.round(item[key] * 100) / 100
            }

        }
        arr[index] = item;
    })

    return arr;
}

function sendFinal(offset, limit, arr) {

    // 处理result成total和rows的形式
    offset = Number(offset) // 不是数字分页会全量数据.
    limit = Number(limit)

    arrN = {
        "total": arr.length,
        "rows": (offset + limit >= arr.length) ? arr.slice(offset, arr.length) : arr.slice(offset, offset + limit)
    };

    return arrN
}

endPoint.use(function (err, req, res, next) {
    // set locals, only providing error in development
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page

    res.status(err.status || 500).json(err.message);
});

// start server
var server = endPoint.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("ers express server is on http://%s:%s", host, port)

});
