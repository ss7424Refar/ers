<template>
    <div id="report">

        <h3><b-badge variant="dark">查询条件</b-badge></h3>
        <b-form @reset="onReset" @submit="onSubmit">
            <b-row>
                <b-col md="4">
                    <b-form-group label-cols-sm="2" label="开始时间:">
                        <b-form-datepicker v-model="form.start" class="mb-2" label-no-date-selected="请输入开始时间"></b-form-datepicker>
                    </b-form-group>
                </b-col>
                <b-col md="4">
                    <b-form-group label-cols-sm="2" label="结束时间:">
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
        <h3>
            <b-badge variant="dark">查询结果</b-badge>
        </h3>
        <BootstrapTable ref="table" :columns="columns" :options="options" @on-load-error="onLoadError"></BootstrapTable>
    </div>
</template>

<script>
    export default {
        name: "Report",
        data() {
            return {
                form: {
                    start: null,
                    end: null,
                },
                cosOptions: null,
                columns: [
                    {
                        field: 'no',
                        title: '序号'
                    },
                    {
                        field: 'custom',
                        title: '客户名称'
                    },
                    {
                        field: 'last',
                        title: '上期应收款余额'
                    },
                    {
                        field: 'last2',
                        title: '上期未开票金额'
                    }, {
                        field: 'money',
                        title: '借方发生额'
                    }, {
                        field: 'paper',
                        title: '已开票金额'
                    }, {
                        field: 'get',
                        title: '贷方发生额',
                    }, {
                        field: 'direct',
                        title: '方向',
                    }, {
                        field: 'thisMoney',
                        title: '期末余额',
                    }, {
                        field: 'thisMoney2',
                        title: '未开票余额',
                    }, {
                        field: 'remark',
                        title: '备注',
                    }
                ],
                options: {
                    classes: 'table table-bordered table-hover table-striped table-sm',
                    url: 'http://localhost:8081/report',
                    sidePagination: 'server',
                    pagination: 'true',
                    pageNumber:1,
                    pageSize: 20,
                    pageList: [10, 25, 50],
                    queryParams: function(params) {
                        params.start = ''
                        params.end = ''
                        return params
                    },
                    locale: 'zh-CN'
                }
            }
        },
        methods: {
            onLoadError: function (status, jqXHR) {
                this.message(jqXHR.responseText)
            },
            onSubmit: function (evt) {
                evt.preventDefault()

                if (null == this.form.start || null == this.form.end) {
                    this.message('请填入完整的筛选条件!')
                    return;
                }
                if (this.$moment(this.form.start).isAfter(this.$moment(this.form.end))) {
                    this.message('开始时间请小于结束时间!')
                    return;
                }
                let formData = JSON.stringify(this.form)
                this.options.queryParams = function (params) {
                    params.formData = formData
                    return params
                }

            },
            onReset: function (evt) {
                this.form.start = null
                this.form.end = null
            },
            message: function (msg) {
                this.$bvToast.toast(msg, {
                    title: '/(ㄒoㄒ)/~~我是可爱的信息提示',
                    variant: 'warning',
                    // autoHideDelay: 5000,
                    solid: true
                })
            }
        }
    }
</script>

<style scoped>

</style>
