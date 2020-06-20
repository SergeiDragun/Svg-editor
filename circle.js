"use strict";

//----- Класс круг
class Circle {

    constructor(pos) {
        this.fill_color = document.getElementById("fill_color");
        this.stroke_color = document.getElementById("stroke_color");
        this.opacity = document.getElementById("opacity");
        this.stroke_width = document.getElementById("stroke_width");
        
        this.el = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
        this.el.setAttribute('stroke', this.stroke_color.value);
        this.el.setAttribute('stroke-width', this.stroke_width.value);
        this.el.setAttribute('fill', this.fill_color.value);
        this.el.setAttribute('opacity', this.opacity.value);

        this.setPosition(pos);

    }

    setPosition(pos) {

        this.el.setAttribute('cx', pos.cx);
        this.el.setAttribute('cy', pos.cy);
        this.el.setAttribute('rx', pos.rx);
        this.el.setAttribute('ry', pos.ry);

    }

    getPosition() {

        return {
            cx: this.el.getAttribute('cx'),
            cy: this.el.getAttribute('cy'),
            rx: this.el.getAttribute('rx'),
            ry: this.el.getAttribute('ry'),
        };

    }

    getSvgEl() {
        return this.el;
    }

}
//-----

//----- Класс "нарисовать овал"
class DrawCircle {

    constructor(el, sel) {

        this.el = el;
        this.clickX;
        this.clickY;
        this.moveX;
        this.moveY;
        this.drawStart = false;
        this.sel = sel;
        this.mouseMoveListener;
        this.mouseUpListener;
        this.mouseDownListener;
    }

    addListeners() {
        this.mouseDownListener = this.mouseDown.bind(this);
        this.el.addEventListener("mousedown", this.mouseDownListener);

        this.mouseUpListener = this.mouseUp.bind(this);
        document.addEventListener("mouseup", this.mouseUpListener);

        this.mouseMoveListener = this.mouseMove.bind(this);
        document.addEventListener("mousemove", this.mouseMoveListener);

    }

    removeListeners() {

        this.el.removeEventListener("mousedown", this.mouseDownListener);
        document.removeEventListener("mouseup", this.mouseUpListener);
        document.removeEventListener("mousemove", this.mouseMoveListener);

    }


    mouseDown(EO) {

        EO = EO || window.event;

        if (this.drawStart) {
            this.clickX = Math.round(EO.pageX - getCoords(this.el).left);
            this.clickY = Math.round(EO.pageY - getCoords(this.el).top);

            let circle = new Circle({
                cx: this.clickX,
                cy: this.clickY,
                rx: 0,
                ry: 0
            });

            this.current = circle;
            this.el.appendChild(circle.getSvgEl());
        }

    }

    mouseUp(EO) {

        EO = EO || window.event;

        if (this.current == null) {
            return;
        }

        if (this.current.getSvgEl().getBoundingClientRect().width == 0) {
            
            this.current = null;
            let lastChild = svg.lastChild;
            svg.removeChild(lastChild);
            this.sel.updateSelection(null);

        } else {
            
            this.sel.updateSelection(this.current.getSvgEl());
            this.current = null;
        }

        
        
    }

    mouseMove(EO) {

        EO = EO || window.event;
        /* EO.preventDefault(); */

        if (this.drawStart && this.current) {
             
            let pos = this.current.getPosition();

            this.moveX = Math.round(EO.pageX - getCoords(this.el).left);
            this.moveY = Math.round(EO.pageY - getCoords(this.el).top);

            pos.rx = EO.shiftKey ? Math.abs(this.clickY - this.moveY): Math.abs(this.clickX - this.moveX);
            pos.ry = Math.abs(this.clickY - this.moveY);

            this.current.setPosition(pos);

        }

    }
    
}
//-----