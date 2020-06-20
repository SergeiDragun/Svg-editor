"use strict";

//----- Класс квадрат
class Rectangle {

    constructor(pos) {
        this.fill_color = document.getElementById("fill_color");
        this.stroke_color = document.getElementById("stroke_color");
        this.opacity = document.getElementById("opacity");
        this.stroke_width = document.getElementById("stroke_width");

        this.el = document.createElementNS('http://www.w3.org/2000/svg','rect');
        this.el.setAttribute('stroke', this.stroke_color.value);
        this.el.setAttribute('stroke-width', this.stroke_width.value);
        this.el.setAttribute('fill', this.fill_color.value);
        this.el.setAttribute('opacity', this.opacity.value);

        this.setPosition(pos);

    }

    setPosition(pos) {

        this.el.setAttribute('x', pos.x);
        this.el.setAttribute('y', pos.y);
        this.el.setAttribute('width', pos.width);
        this.el.setAttribute('height', pos.height);

    }

    getPosition() {

        return {
            x: this.el.getAttribute('x'),
            y: this.el.getAttribute('y'),
            width: this.el.getAttribute('width'),
            height: this.el.getAttribute('height'),
        };

    }

    getSvgEl() {

        return this.el;

    }
}
//-----

//----- Класс "нарисовать квадрат"
class DrawRectangle {

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

            let rectangle = new Rectangle({
                x: this.clickX,
                y: this.clickY,
                width: 0,
                height: 0
            });

            this.current = rectangle;
            this.el.appendChild(rectangle.getSvgEl());

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
            
            this.sel.updateSelection(this.current.getSvgEl())
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

            if ( (this.clickY - this.moveY) < 0 ) {
                pos.height = Math.abs(this.clickY - this.moveY);
            } else {
                pos.y = this.moveY;
                pos.height = this.clickY - this.moveY;
            }
            
            if ( (this.clickX - this.moveX) < 0 ) {
                pos.width = EO.shiftKey ? pos.height : Math.abs(this.clickX - this.moveX);
            } else {
                pos.x = this.moveX;
                pos.width = this.clickX - this.moveX;
            }
            this.current.setPosition(pos);
        }

    }
    
}
//-----