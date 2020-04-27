var xlsx = require("node-xlsx");

var sheet = xlsx.parse("./../resource/1.xlsx");

console.clear()
var array = [];
for(var rowid in sheet[1]['data']){
    if (rowid >= 2) {
        var rows = sheet[1]['data'][rowid];
        // 这里会产生empty之类的信息, 所以转换两次成null
        var rown = JSON.parse(JSON.stringify(rows));

        // console.log(rown)
        if (null !== rown[0]){
            // console.log(rows)
            var temp = {
                "date"      : new Date(1900, 0, rown[0] - 1).toLocaleString(),
                "no"        : rown[1],
                "custom"    : rown[2],
                "name"      : rown[3],
                "specs"     : rown[4],
                "unit"      : rown[5],
                "nums"      : rown[6],
                "price"     : rown[7],
                "money"     : rown[8],
                "k_money"   : rown[9],
                "k_nums"    : rown[10],
                "get"       : rown[11],
                "remark"    : rown[12]
            };
            array.push(temp);

        }
    }

}

// array.forEach(function (item, index, array) {
//     console.log(index)
// })
console.log(array[639])
