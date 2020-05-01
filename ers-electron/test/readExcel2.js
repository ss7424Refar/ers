var xlsx = require("node-xlsx");
var moment = require('moment');

const path = require('path')
targetPath = path.join(__dirname, '../resource/1.xlsx')

var sheet = xlsx.parse(targetPath);

// var keyword = '宜昌光电';
var start = '2020-04-01';
var end = '2020-04-30'; // 需要换成当月.

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



console.log(fixed(result))

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

function formatter(data) {
    return null == data ? 0 : data;
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
