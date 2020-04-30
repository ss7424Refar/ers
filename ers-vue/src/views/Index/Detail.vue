<template>
    <div class="detail">
        <h3><b-badge variant="dark">查询条件</b-badge></h3>
        <b-form @reset="onReset" @submit="onSubmit">
            <b-row>
                <b-col md="4">
                    <b-form-group label-cols-sm="2" label="客户信息:">
                        <b-form-select v-model="form.keyword" :options="cosOptions"></b-form-select>
                    </b-form-group>
                </b-col>
                <b-col md="4">
                    <b-form-group label-cols-sm="2" label="开始时间:">
                        <b-form-datepicker v-model="form.start" class="mb-2" label-no-date-selected="请输入开始时间"></b-form-datepicker>
                    </b-form-group>
                </b-col>
                <b-col md="4">
                    <b-form-group label-cols-sm="2" label="终止时间:">
                        <b-form-datepicker v-model="form.end" class="mb-2" label-no-date-selected="请输入结束时间"></b-form-datepicker>
                    </b-form-group>
                </b-col>
            </b-row>

            <b-row>
                <b-col offset-md="4">
                    <b-button variant="info" type="submit">查询</b-button>
                </b-col>
                <b-col md="7">
                    <b-button variant="primary" type="reset">重置</b-button>
                </b-col>
            </b-row>
        </b-form>

        <hr>

        <BootstrapTable ref="table" :columns="columns" :options="options" @on-load-error="onLoadError"></BootstrapTable>
    </div>
</template>

<script>
    export default {
        name: "Detail",
        data() {
            return {
                form: {
                    keyword: null,
                    start: null,
                    end: null,
                },
                cosOptions: null,
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
                        params.keyword = null
                        params.start = ''
                        params.end = ''
                        return params
                    },
                    locale: 'zh-CN'
                }
            }
        },
        mounted(){
            this.setOption();
        },
        methods: {
            setOption: function () {
                this.$http.get("http://localhost:8081/setOption").then(res => {
                    this.cosOptions = res.data;
                })
            },
            onLoadError: function (status, jqXHR) {
                this.message(jqXHR.responseText)
            },
            onSubmit: function (evt) {
                evt.preventDefault()

                if (null == this.form.start || null == this.form.end || null == this.form.keyword) {
                    this.message('请填入完整的筛选条件!')
                    return;
                }

                let formData = JSON.stringify(this.form)
                this.options.queryParams = function (params) {
                    params.formData = formData
                    return params
                }

            },
            onReset: function (evt) {
                this.form.keyword = null
                this.form.start = null
                this.form.end = null
            },
            message: function (msg) {
                this.$bvToast.toast(msg, {
                    title: '/(ㄒoㄒ)/~~我是可爱的信息提示',
                    variant: 'primary',
                    // autoHideDelay: 5000,
                    solid: true
                })
            }
        }
    }
</script>

<style scoped>

</style>
