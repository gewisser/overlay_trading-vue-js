import { Overlay } from 'trading-vue-js'
import Konva from 'konva';

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Flag {
    constructor(parent) {
        this.show_ = false;
        this.suffix_ = '$';
        this.canDelete_ = false;
        this.timestamp_ = -1;


        this.lb = document.createElement('div');
        this.lb.className = 'container label'
        parent.appendChild(this.lb);

        this.stage = new Konva.Stage({
            container: this.lb,
            width: 100,
            height: 80,
        });

        var layer = new Konva.Layer();

        var tooltip = new Konva.Label({
            x: 50,
            y: 65,
            opacity: 0.75,
            scaleX: 0,
            scaleY: 0
        });

        tooltip.add(
            new Konva.Tag({
                fill: '#25C50A',
                pointerDirection: 'down',
                pointerWidth: 10,
                pointerHeight: 10,
                lineJoin: 'round',
                shadowColor: '#25C50A',
                shadowBlur: 10,
                shadowOffsetX: 10,
                shadowOffsetY: 10,
                shadowOpacity: 0.5,
            })
        );

        this.text = new Konva.Text({
            text: '50$',
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 5,
            fill: 'white',
        })

        tooltip.add(this.text);

        var circle = new Konva.Circle({
            x: 50,
            y: 65,
            radius: 6,
            fill: '#5FADF2'
        });

        layer.add(tooltip).add(circle);
        this.stage.add(layer);

        this.tween = new Konva.Tween({
            node: tooltip,
            duration: 2,
            scaleX: 1,
            scaleY: 1,
            easing: Konva.Easings.ElasticEaseOut
        });

    }

    set timestamp(val){
        this.timestamp_ = val;
    }

    get timestamp() {
        return this.timestamp_;
    }

    set canDelete(val) {
        this.canDelete_ = val;
    }

    get canDelete() {
        return this.canDelete_;
    }

    set suffix(val){
        this.suffix_ = val;
    }

    get suffix(){
        return this.suffix_;
    }

    get value(){
        return this.text.text();
    }

    set value(val) {
        this.text.text(val+this.suffix_);

        if (val > 0 && !this.show_) {
            this.tween.play();
            this.show_ = true;

            setTimeout(() =>{
                this.tween.reverse();
            }, getRandomIntInclusive(5000, 20000));
        } else if (val <= 0 && this.show_) {
            this.tween.reverse();
            this.show_ = false;
        }
    }

    get show() {
        return this.show_;
    }

    SetXY(x, y) {
        this.lb.style.left = x - 50+'px';
        this.lb.style.top = y - 65+'px';
        this.canDelete_ = false;
    }

    Destroy(){
        this.stage.destroy();
        this.lb.remove();
    }
}

class FlagFactory {
    constructor(parent) {
        this.parent = parent;
        this.flagFactory = [];
    }

    StartFactory(){
        for (var flag of this.flagFactory) {
            flag.canDelete = true;
        }
    }

    AddUpdate(timestamp, value, suffix, x, y) {
        let flag_ = undefined;

        for (let flag of this.flagFactory) {
            if (flag.timestamp === timestamp) {
                flag_ = flag;
                break;
            }
        }

        if (flag_ === undefined) {
            flag_ = new Flag(this.parent);
            flag_.timestamp = timestamp;
        }

        flag_.value = value;
        flag_.suffix = suffix;
        flag_.SetXY(x, y);

        this.flagFactory.push(flag_);
    }

    DestroyUnused(){
        for (let i = this.flagFactory.length - 1; i >= 0; i--) {
            let flag = this.flagFactory[i];
            if (flag.canDelete) {
                flag.Destroy();
                this.flagFactory.splice(i, 1);
            }
        }
    }
}

export default {
    name: 'tt',
    mixins: [Overlay],
    methods: {
        pre_draw(ctx) {
            this.FlagFactory.StartFactory();
        },

        post_draw(ctx){
            const layout = this.$props.layout;

            if (this.$props.data.length === 0)
                return;

            let Last = this.$props.data[this.$props.data.length - 1];

            let x = layout.t2screen(Last[0]);
            let y = layout.$2screen(Last[1]);

            ctx.lineWidth = 1;
            ctx.strokeStyle = '#2B84B6'

            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(layout.width, y);
            ctx.stroke();

            this.cc.style.left = x-24+'px';
            this.cc.style.top = y-24+'px';

            this.FlagFactory.DestroyUnused();
        },
        draw(ctx) {
            const layout = this.$props.layout
            ctx.beginPath();

            let hLines = [];
            let x,y;


            for (let p of this.$props.data) {
                x = layout.t2screen(p[0])
                y = layout.$2screen(p[1])


                if (p[2] > 0) {
                    hLines.push([x, y]);
                    this.FlagFactory.AddUpdate(p[0], p[2], '$', x, y);
                 }

                ctx.lineTo(x, y)
            }

            if (this.$props.data.length > 0) {
                let fx = layout.t2screen(this.$props.data[0][0]);

                ctx.fillStyle = 'rgba(95, 173, 242, 0.2)';
                ctx.lineTo(x, y);
                ctx.lineTo(x, layout.height);
                ctx.lineTo(fx, layout.height)
                ctx.fill();
            }

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#5fadf2';
            ctx.miterLimit = 1;


            for (let p of this.$props.data) {
                x = layout.t2screen(p[0])
                y = layout.$2screen(p[1])
                ctx.lineTo(x, y)
            }

            ctx.stroke()


            ctx.lineWidth = 1;
            ctx.strokeStyle = '#25C50A'

            ctx.beginPath();

            for (let l of hLines) {
                ctx.moveTo(0, l[1]);
                ctx.lineTo(layout.width, l[1]);
            }

            ctx.stroke()
        },
        use_for() { return ['Candle'] },
        data_colors() { return [this.color] },
        createAnimLast(){
            let trading_grid = this.$el.parentElement;
            this.cc = document.createElement('div');
            this.cc.className = 'container'
            trading_grid.appendChild(this.cc);

            var stage = new Konva.Stage({
                container: this.cc,
                width: 48,
                height: 48,
            });

            var layer = new Konva.Layer();

            var circle = new Konva.Circle({
                x: 24,
                y: 24,
                radius: 20,
                fill: '#E1F0FD',
                opacity: 0.2
            });

            var circle2 = new Konva.Circle({
                x: 24,
                y: 24,
                radius: 8,
                fill: '#E1F0FD'
            });

            var circle3 = new Konva.Circle({
                x: 24,
                y: 24,
                radius: 4,
                fill: '#25C50A'
            });


            layer.add(circle).add(circle2).add(circle3);

            stage.add(layer);

            var period = 3000;

            var anim = new Konva.Animation(function (frame) {
                var scale = Math.sin((frame.time * 2 * Math.PI) / period) + 0.1;
                // scale x and y
                circle.scale({ x: scale, y: scale });
            }, layer);

            anim.start();
        }
    },
    computed: {
        color() {
            return this.$props.settings.color
        }
    },

    mounted(){
        let vue_legend = document.getElementsByClassName('trading-vue-legend');
        if (vue_legend.length > 0) {
            vue_legend[0].style.display = 'none'
        }

        this.createAnimLast();

        this.FlagFactory = new FlagFactory(this.$el.parentElement);
    }
}