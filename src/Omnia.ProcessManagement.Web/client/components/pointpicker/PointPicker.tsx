import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { IPointPicker } from './IPointPicker';
import { PointPickerStyles } from './PointPicker.css';
import { Point } from '../../fx/models';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Localize, Inject, Utils } from "@omnia/fx";
import { OmniaTheming } from '@omnia/fx/ux';
import { clearInterval, setInterval, clearTimeout, setTimeout } from 'timers';


enum Directions {
    up = "Up",
    right = "Right",
    center = "Center",
    down = "Down",
    left = "Left",

    leftUp = "LeftUp",
    rightUp = "RightUp",
    leftDown = "LeftDown",
    rightDown = "RightDown",
}

@Component
export class PointPicker extends Vue implements IWebComponentInstance, IPointPicker {
    @Prop() model: Point;
    @Prop() onModelChange: (model: Point) => void;
    @Prop() label: string;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;

    intervalHolder = null;
    readyTimeout = null;
    isMouseDown: boolean = false;
    created() {
        window.addEventListener('mouseup', this.onMouseUp)
    }

    beforeDestroy() {
        window.removeEventListener('mouseup', this.onMouseUp)
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    updateModel(direction: Directions, px: number) {
        if (direction == Directions.center) {
            this.model = { x: 0, y: 0 };
            this.onModelChange(this.model);
        }
        else {
            let x = this.model.x || 0;
            let y = this.model.y || 0;

            y += px * (direction == Directions.up || direction == Directions.leftUp || direction == Directions.rightUp ? -1 : direction == Directions.down || direction == Directions.leftDown || direction == Directions.rightDown ? 1 : 0);
            x += px * (direction == Directions.left || direction == Directions.leftUp || direction == Directions.leftDown ? -1 : direction == Directions.right || direction == Directions.rightUp || direction == Directions.rightDown ? 1 : 0);

            this.model = { x: x, y: y };
            this.onModelChange(this.model);
        }
    }

    onMouseDown(direction: Directions) {
        this.isMouseDown = true;
        clearInterval(this.intervalHolder);
        clearTimeout(this.readyTimeout);

        this.updateModel(direction, 1);
        this.readyTimeout = setTimeout(() => {
            if (direction != Directions.center) {
                this.intervalHolder = setInterval(() => {
                    this.updateModel(direction, 2);
                }, 50);
            }
        }, 200);
    }

    onMouseUp(e: MouseEvent) {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            e.stopImmediatePropagation();
            clearInterval(this.intervalHolder);
            clearTimeout(this.readyTimeout);
        }
    }

    /**
     * Render 
     * @param h
     */
    render(h) {
        let color = this.omniaTheming.themes.primary.base;

        return (
            <div>
                {this.label && <div class="pb-3 v-label theme--light">{this.label}</div>}
                <div class={PointPickerStyles.container}>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.leftUpArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.leftUp) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-up</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.upArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.up) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-up</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.rightUpArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.rightUp) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-up</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.leftArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.left) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-left</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.center} text fab small color={color} onClick={() => { this.onMouseDown(Directions.center) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-compress-arrows-alt</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.rightArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.right) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-right</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.leftDownArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.leftDown) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-down</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.downArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.down) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-down</v-icon>
                    </v-btn>
                    <v-btn ripple={false} elevation='0' class={PointPickerStyles.rightDownArrow} text fab small color={color}  onMousedown={() => { this.onMouseDown(Directions.rightDown) }}>
                        <v-icon color={PointPickerStyles.iconColor} small>fal fa-arrow-down</v-icon>
                    </v-btn>
                </div>
            </div>
        )
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, PointPicker, { destroyTimeout: 1000 });
});
