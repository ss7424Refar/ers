<template>
    <div class="detail">
        <b-row>
            <b-alert show variant="warning">查询</b-alert>

        </b-row>
        <hr>
    </div>
</template>

<script>
    export default {
        name: "Detail",
        data() {
            return {
                title: "静态数据"
            }
        },
        created(){
            this.convert();
        },
        methods: {
            convert: function () {
                this.$http.get("http://localhost:8081/").then(res => {
                    console.log(res)
                })
            }
        }
    }
</script>

<style scoped>

</style>
