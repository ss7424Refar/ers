var express = require('express');
var endPoint = express();

var allowCrossDomain = function (req, res, next) {
    // 所有的接口都可以访问
    res.header('Access-Control-Allow-Origin', '*');
    // 自定义中间件，设置跨域需要的响应头
    res.header('Access-Control-Allow-Headers', '*');
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
    var custom = req.query.custom;
    var date = req.query.date;

    console.clear();
    var xlsx = require("node-xlsx");

    var sheet = xlsx.parse("./resource/1.xlsx");

    var array = [];
    for(var rowid in sheet[1]['data']){
        if (rowid >= 2) {
            var rows = sheet[1]['data'][rowid];
            var rown = JSON.stringify(rows);
            var rown2 = JSON.parse(rown);

            console.log(rown)
        //     if (typeof(rows[0]) != "undefined"){
        //         console.log(rows)
        //         var temp = {
        //             "date"      : new Date(1900, 0, rown2[0] - 1).toLocaleString(),
        //             "no"        : rows[1],
        //             "custom"    : rows[2],
        //             "name"      : rows[3],
        //             "specs"     : rows[4],
        //             "unit"      : rows[5],
        //             "nums"      : rows[6],
        //             "price"     : rows[7],
        //             "money"     : rows[8],
        //             "k_money"   : rows[9],
        //             "k_nums"    : rows[10],
        //             "get"       : rows[11],
        //             "remark"    : rows[12]
        //         };
        //         array.push(temp);
        //
        //     }
        }

    }

    // console.log(JSON.stringify(array))

});






// start server
var server = endPoint.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("ers, 访问地址为 http://%s:%s", host, port)

});
