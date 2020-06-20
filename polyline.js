"use strict";

//----- Класс полилиния
class Polyline {

    constructor(pos) {

        this.fill_color = document.getElementById("fill_color");
        this.fill_opacity = document.getElementById("fill_opacity");
        this.stroke_color = document.getElementById("stroke_color");
        this.opacity = document.getElementById("opacity");
        this.stroke_width = document.getElementById("stroke_width");

        this.el = document.createElementNS('http://www.w3.org/2000/svg','path');
        this.el.setAttribute('stroke', this.stroke_color.value);
        this.el.setAttribute('stroke-width', this.stroke_width.value);
        this.el.setAttribute("shape-rendering", "geometricPrecision");
        this.el.setAttribute("stroke-linejoin", "round");
        this.el.setAttribute('fill', "#ffffff");
        this.el.setAttribute('fill-opacity', "0");
        this.el.setAttribute('opacity', this.opacity.value);

        this.setPosition(pos);

    }

    setPosition(pos) {

        this.el.setAttribute("d", "M" + pos.x1  + "," + pos.y1);

    }

    getSvgEl() {
        return this.el;
    }
}
//-----

//----- Класс нарисовать полилиния
class DrawPolyline {

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

            let polyline = new Polyline({
                x1: this.clickX,
                y1: this.clickY,
            });

            this.current = polyline;
            this.el.appendChild(polyline.getSvgEl());
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

            this.current.getSvgEl()
            this.moveX = Math.round(EO.pageX - getCoords(this.el).left);
            this.moveY = Math.round(EO.pageY - getCoords(this.el).top);

            let pathData = this.current.getSvgEl().getAttribute("d");
            pathData = pathData + " L" + this.moveX + "," + this.moveY;
            this.current.getSvgEl().setAttribute("d", pathData)

        }

    }

}
//-----