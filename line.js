"use strict";

//----- Класс линий
class Line {

    constructor(pos) {
        this.stroke_color = document.getElementById("stroke_color");
        this.opacity = document.getElementById("opacity");
        this.stroke_width = document.getElementById("stroke_width");


        this.el = document.createElementNS('http://www.w3.org/2000/svg','line');
        this.el.setAttribute('stroke', this.stroke_color.value);
        this.el.setAttribute('stroke-width', this.stroke_width.value);
        this.el.setAttribute('opacity', this.opacity.value);

        this.setPosition(pos);

    }

    setPosition(pos) {

        this.el.setAttribute('x1', pos.x1);
        this.el.setAttribute('y1', pos.y1);
        this.el.setAttribute('x2', pos.x2);
        this.el.setAttribute('y2', pos.y2);

    }

    getPosition() {

        return {
            x1: this.el.getAttribute('x1'),
            y1: this.el.getAttribute('y1'),
            x2: this.el.getAttribute('x2'),
            y2: this.el.getAttribute('y1'),
        };

    }

    getSvgEl() {
        return this.el;
    }
}


class DrawLine {

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
        
        if (this.drawStart) {

            this.clickX = Math.round(EO.pageX - getCoords(this.el).left);
            this.clickY = Math.round(EO.pageY - getCoords(this.el).top);

            let line = new Line({
                x1: this.clickX,
                y1: this.clickY,
                x2: this.clickX,
                y2: this.clickY
            });

            this.current = line;
            this.el.appendChild(line.getSvgEl());
        }
        
    }

    mouseUp(EO) {

        EO = EO || window.event;

        if (this.current == null) {
            return
        }

        if (this.current.getSvgEl().getBoundingClientRect().width == 0) {

            this.current = null;
            let lastChild = svg.lastChild;
            svg.removeChild(lastChild);
            this.sel.updateSelection(null);

        } else {

            this.sel.updateSelection(this.current.getSvgEl())
            this.current = null;
            
        }
        
        

    }

    mouseMove(EO) {

        /* EO.preventDefault(); */

        if (this.drawStart && this.current) {

            this.moveX = Math.round(EO.pageX - getCoords(this.el).left);
            this.moveY = Math.round(EO.pageY - getCoords(this.el).top);

            let pos = this.current.getPosition();
            pos.x2 = this.moveX;
            pos.y2 = this.moveY;
            this.current.setPosition(pos);

        }

    }

}
