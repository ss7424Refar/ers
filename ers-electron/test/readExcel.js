var xlsx = require("node-xlsx");
var moment = require('moment');

var sheet = xlsx.parse("/home/refar/WebstormProjects/ers/ers-electron/resource/1.xlsx");

var keyword = '江西中科泰盛';
var start = '2020-04-01';
var end = '2020-04-30';

// 取得 应收款录入
var dataArray = [];
for(var rowid in sheet[1]['data']){
    if (rowid >= 2) {
        var rows = sheet[1]['data'][rowid];
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
                    "paper_nums" : formatter(rown[10]),
                    "get"        : formatter(rown[11]),
                    "remark"     : formatter(rown[12])
                };
                dataArray.push(temp);
            }

        }
    }
}

// 取得客户上期结账
var cosArray = [];
for(var rowid in sheet[0]['data']){
    if (rowid >= 1) {
        var rows = sheet[0]['data'][rowid];
        // 这里会产生empty之类的信息, 所以转换两次成null
        var rown = JSON.parse(JSON.stringify(rows));

        if (null !== rown[0]){
            if (keyword === rown[0]) {
                var temp = {
                    "custom"      : rown[0],
                    "first_money" : formatter(rown[1]),
                    "paper_money" : formatter(rown[2])
                };
                cosArray.push(temp);
                break;
            }

        }
    }
}

// 计算上期结转
var last = 0;
dataArray.forEach(function (item, index, array) {
    if (moment(item['date']).isBefore(start)) {
        last = last + Number(item['money']);
    }
});

last = (last + Number(cosArray[0]['first_money'])).toFixed(2);

// 小数点后两位
console.log(last)

// 排序
var newArray = [];
dataArray.forEach(function (item, index, array) {
    if (moment(item['date']).isBetween(start, end, null, '[]')) {
        newArray.push(item)
    }
});

newArray.sort(sortBy('date'))
console.log(newArray);


function formatter(data) {
    return null == data ? 0 : data;

}

function sortBy(field) {
    return function(a,b) {
        return a[field] <=b[field]?-1:1;
    }
}
