//
Created by Roman on 05.06.2020.
app.vue

<template lang="pug">
    div
        trading-vue(:data="chart",
                    :overlays="overlays",
                    :width="this.width",
                    :height="this.height",
                    :color-back="colors.colorBack",
                    :color-grid="colors.colorGrid",
                    :color-text="colors.colorText",
                    ref="tradingVue")
</template>

<script>
    import { TradingVue, DataCube  } from 'trading-vue-js'
    import ov from  '@/ov.js'

    export default {
        name: 'app',
        components: { TradingVue },
        methods: {
            onResize(event) {
                this.width = window.innerWidth
                this.height = window.innerHeight
            },
            fp(){
                let date = new Date();

                return {
                    chart: {
                        type: "Candle",
                        data: [
                            [
                                date.getTime(),
                                1,
                                utils.getRandomIntInclusive(-50, 50),
                                0,
                                0,
                                0
                            ]
                        ]
                    }
                }
            },
            addData(){
                let date = new Date();

                let startRange = date.setMinutes(date.getMinutes()-2);
                let endRange = date.setMinutes(date.getMinutes()+1);

                this.$refs.tradingVue.setRange(startRange, endRange)

                this.chart.merge('chart.data', [
                    [
                        date.getTime(),
                        utils.getRandomIntInclusive(1, 100),
                        utils.getRandomIntInclusive(-80, 20),
                        0,
                        0,
                        0
                    ]
                ])

                setTimeout(()=> this.addData(), utils.getRandomIntInclusive(200, 1000))
            }

        },
        mounted() {
            window.addEventListener('resize', this.onResize)

            this.$nextTick(() => {
                this.addData();
            })
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onResize)
        },
        data() {
            return {
                chart: new DataCube(this.fp()),
                width: window.innerWidth - 30,
                height: window.innerHeight - 30,
                colors: {
                    colorBack: '#202736',
                    colorGrid: '#293041',
                    colorText: '#F8F8F8',
                },
                overlays: [ov]
            }
        }
    }
</script>

<style>
    .container {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
        pointer-events: none;
    }
</style>