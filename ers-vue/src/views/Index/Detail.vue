<template>
    <div class="detail">
        <h3><b-badge variant="dark">查询条件</b-badge></h3>
        <!--<b-form @submit="onSubmit" @reset="onReset">-->
            <!--<b-row>-->
                <!--<b-col md="4">-->
                    <!--<b-form-group label-cols-sm="2" label="资产编号:">-->
                        <!--<b-input-group>-->
                            <!--<b-form-input v-model="form.fixed"></b-form-input>-->
                        <!--</b-input-group>-->
                    <!--</b-form-group>-->
                <!--</b-col>-->
            <!--</b-row>-->

            <!--<b-row>-->
                <!--<b-col offset-md="4">-->
                    <!--<b-button variant="info" type="submit">查询</b-button>-->
                <!--</b-col>-->
                <!--<b-col md="7">-->
                    <!--<b-button variant="primary" type="reset">重置</b-button>-->
                <!--</b-col>-->
            <!--</b-row>-->
        <!--</b-form>-->

        <hr>

        <BootstrapTable ref="table" :columns="columns" :options="options"></BootstrapTable>
    </div>
</template>

<script>
    export default {
        name: "Detail",
        data() {
            return {
                columns: [
                    {
                        field: 'date',
                        title: '日期'
                    },
                    {
                        field: 'no',
                        title: '凭证号码/单号'
                    },
                    {
                        field: 'name',
                        title: '摘要/品名'
                    },
                    {
                        field: 'specs',
                        title: '规格'
                    }, {
                        field: 'unit',
                        title: '单位'
                    }, {
                        field: 'nums',
                        title: '数量'
                    }, {
                        field: 'price',
                        title: '单价'
                    }, {
                        field: 'money',
                        title: '金额'
                    }, {
                        field: 'paper_money',
                        title: '开票金额'
                    }, {
                        field: 'paper_nums',
                        title: '发票号码'
                    }, {
                        field: 'get',
                        title: '贷方',
                    }, {
                        field: 'direct',
                        title: '方向',
                    }, {
                        field: 'last',
                        title: '余额',
                    }, {
                        field: 'last2',
                        title: '未开票余额',
                    }, {
                        field: 'remark',
                        title: '备注',
                    }
                ],
                options: {
                    classes: 'table table-bordered table-hover table-striped table-sm',
                    url: 'http://localhost:8081/detail',
                    sidePagination: 'server',
                    pagination: 'true',
                    pageNumber:1,
                    pageSize: 20,
                    pageList: [10, 25, 50],
                    queryParams: function(params) {
                        params.keyword = '浙江金徕 玻璃纸'
                        params.start = '2020-04-01'
                        params.end = '2020-04-30'
                        return params
                    },
                    locale: 'zh-CN'
                }
            }
        },
        // created(){
        //     // this.convert();
        // },
        methods: {
            // convert: function () {
            //     this.$http.get("http://localhost:8081/").then(res => {
            //         console.log(res)
            //     })
            // }




        }
    }
</script>

<style scoped>

</style>
