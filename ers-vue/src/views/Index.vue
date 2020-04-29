<template>
    <div>
        <Head></Head>
        <b-row>
            <b-col md="2">
                <side-bar></side-bar>
            </b-col>
            <b-col md="10">
                <router-view/>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import Head from '@/components/common/Head'
    import SideBar from '@/components/common/SideBar'
    export default {
        name: "Index",
        components: {
          Head,
          SideBar
        }
    }
</script>

<style scoped>

</style>
