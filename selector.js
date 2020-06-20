"use strict";

//----- Класс выделения фигур
class Selector {

    constructor(el) {

        this.el = el;

        this.selectionEl = document.createElement("span");
        /* this.rotateEl = document.createElement("span"); */
        this.resizeRTEl = document.createElement("span");
        this.resizeLTEl = document.createElement("span");
        this.resizeRBEl = document.createElement("span");
        this.resizeLBEl = document.createElement("span");

        this.selectionEl.setAttribute("id", "select");
        /* this.rotateEl.setAttribute("id", "rotate"); */
        this.resizeRTEl.setAttribute("id", "resizeRT");
        this.resizeLTEl.setAttribute("id", "resizeLT");
        this.resizeRBEl.setAttribute("id", "resizeRB");
        this.resizeLBEl.setAttribute("id", "resizeLB");

        /* this.selectionEl.appendChild(this.rotateEl); */
        this.selectionEl.appendChild(this.resizeRTEl);
        this.selectionEl.appendChild(this.resizeLTEl);
        this.selectionEl.appendChild(this.resizeRBEl);
        this.selectionEl.appendChild(this.resizeLBEl);

        document.getElementById("svg_area").appendChild( this.selectionEl );

        this.selected = null;
        this.selectStart = false;
        this.offset = { x: 0, y: 0, x2: 0, y2: 0, width: 0, height: 0 };
        this.pathMome;
        this.pathX;
        this.pathY;
        this.resizeEl = "";
        this.resizeEl_X;
        this.resizeEl_Y;
        this.resizeEl_width;
        this.resizeEl_height;
        this.resizeEl_data;
        this.resizerID;
        this.mouseD = false;
        this.mouseOverCheck = false;
        this.centerPosition;
        this.rotating;
        this.allowChanges = false;
        this.opacity = document.getElementById("opacity");
        this.opacity.addEventListener("input", this.changeOpacity.bind(this));

        this.fillColor = document.getElementById("fill_color");
        this.fillColor.addEventListener("change", this.changeFillColor.bind(this));

        this.strokeColor = document.getElementById("stroke_color");
        this.strokeColor.addEventListener("change", this.changeStrokeColor.bind(this));

        this.strokeWidth = document.getElementById("stroke_width");
        this.strokeWidth.addEventListener("input", this.changeStrokeWidth.bind(this));

        this.mouseOverListener = this.mouseOver.bind(this);
        document.getElementById("svg_area").addEventListener("mouseover", this.mouseOverListener);

        this.mouseOutListener = this.mouseOut.bind(this);
        document.getElementById("svg_area").addEventListener("mouseout", this.mouseOutListener);

        document.addEventListener("keydown", this.deleteElement.bind(this));

        document.getElementById("btn_delete").addEventListener("click", this.deleteElement.bind(this));

        document.getElementById("btn_clone").addEventListener("click", this.cloneElement.bind(this));

        document.getElementById("btn_front").addEventListener("click", this.bringElementToFront.bind(this));

        document.getElementById("btn_back").addEventListener("click", this.sendElementToBack.bind(this));

    }

    changeOpacity() {

        if (!this.resizeEl || !this.allowChanges) {
            return
        }
        this.resizeEl.setAttribute('opacity', this.opacity.value);

    }

    changeFillColor() {

        if (!this.resizeEl || !this.allowChanges || this.resizeEl.tagName == "line") {
            return
        }
        this.resizeEl.setAttribute('fill', this.fillColor.value);

    }

    changeStrokeColor() {

        if (!this.resizeEl || !this.allowChanges) {
            return
        }
        this.resizeEl.setAttribute('stroke', this.strokeColor.value);

    }

    changeStrokeWidth() {
        
        if (!this.resizeEl || !this.allowChanges) {
            return
        }
        this.resizeEl.setAttribute('stroke-width', this.strokeWidth.value);
        this.updateSelection(this.resizeEl);
        
    }


    addSelectListeners() {

        this.mouseDownListener = this.mouseDown.bind(this);
        this.el.addEventListener("mousedown", this.mouseDownListener);

        this.mouseUpListener = this.mouseUp.bind(this);
        document.addEventListener("mouseup", this.mouseUpListener);

        this.mouseMoveListener = this.mouseMove.bind(this);
        document.addEventListener("mousemove", this.mouseMoveListener);

    }

    removeSelectListeners() {

        this.el.removeEventListener("mousedown", this.mouseDownListener);
        document.removeEventListener("mouseup", this.mouseUpListener);
        document.removeEventListener("mousemove", this.mouseMoveListener);
        document.getElementById("svg_area").addEventListener("mouseover", this.mouseOverListener);

    }

    addResizeListeners() {

        this.mouseDownResizeListener = this.mouseDownResize.bind(this);
        this.resizeRTEl.addEventListener("mousedown", this.mouseDownResizeListener);
        this.resizeRBEl.addEventListener("mousedown", this.mouseDownResizeListener);
        this.resizeLTEl.addEventListener("mousedown", this.mouseDownResizeListener);
        this.resizeLBEl.addEventListener("mousedown", this.mouseDownResizeListener);
        /* this.rotateEl.addEventListener("mousedown", this.mouseDownResizeListener); */

        this.mouseUpResizeListener = this.mouseUpResize.bind(this);
        document.addEventListener("mouseup", this.mouseUpResizeListener);

        this.mouseMoveResizeListener = this.mouseMoveResize.bind(this);
        document.addEventListener("mousemove", this.mouseMoveResizeListener);

    }

    removeResizeListeners() {

        this.resizeRTEl.removeEventListener("mousedown", this.mouseDownResizeListener);
        this.resizeRBEl.removeEventListener("mousedown", this.mouseDownResizeListener);
        this.resizeLTEl.removeEventListener("mousedown", this.mouseDownResizeListener);
        this.resizeLBEl.removeEventListener("mousedown", this.mouseDownResizeListener);
        this.rotateEl.removeEventListener("mousedown", this.mouseDownResizeListener);
        document.removeEventListener("mouseup", this.mouseUpResizeListener);
        document.removeEventListener("mousemove", this.mouseMoveResizeListener);
    }

    updateSelection(element) {

        if (element !== null) {

            if (element.tagName == "path") {
                this.resizeRTEl.style = "display: none";
                this.resizeRBEl.style = "display: none";
                this.resizeLTEl.style = "display: none";
                this.resizeLBEl.style = "display: none";
            } else {
                this.resizeRTEl.style = "display: block";
                this.resizeRBEl.style = "display: block";
                this.resizeLTEl.style = "display: block";
                this.resizeLBEl.style = "display: block";
            }

            this.resizeEl = element;
            let strWidth = (this.resizeEl.getAttribute("stroke-width"));
            let wArea = document.getElementById("workarea");
            let rect = getCoords(element);
            this.selectionEl.style.left = rect.left - 5 + wArea.scrollLeft - 40 - +strWidth/2 + "px";
            this.selectionEl.style.top = rect.top - 5 +  wArea.scrollTop - 52 - +strWidth/2 + "px"; 
            this.selectionEl.style.width = rect.width + 10  + +strWidth + "px";
            this.selectionEl.style.height = rect.height + 10 + +strWidth + "px";
            this.selectionEl.style.display = "block";
            this.allowChanges = true;
        } else {
            this.selectionEl.style.display = "none";
            this.allowChanges = false;
        }

    }

    deleteElement(EO) {

        EO = EO || window.event;
        if (EO.key == "Delete" && this.allowChanges ) {
            svg.removeChild(this.resizeEl);
            this.updateSelection(null)
        }

        if (EO.which == 1 && this.allowChanges) {
            svg.removeChild(this.resizeEl);
            this.updateSelection(null);
        } 
        
    }

    cloneElement(EO) {

        EO = EO || window.event;

        if (this.resizeEl && this.allowChanges) {
            let x = 20;
            let y = 20;
            let newEl = this.resizeEl.cloneNode(true);
    
            if (this.resizeEl.hasAttribute("transform")) {
                let transformCoords = this.resizeEl.getAttribute("transform").match(/\d+/g);
                x = +transformCoords[0];
                y = +transformCoords[1];
                let move = "translate(" + (x + 20) + "," + (y + 20) + ")";
                newEl.setAttributeNS(null,"transform",move);
            } else {
                let move = "translate("+x+","+y+")";
                newEl.setAttributeNS(null,"transform",move);
            }

            svg.appendChild(newEl);
            this.resizeEl = newEl;
            this.updateSelection(this.resizeEl);
        }
        
        
    }

    bringElementToFront(EO) {

        EO = EO || window.event;

        if (this.resizeEl && this.allowChanges) {
            svg.appendChild(this.resizeEl);
        }

    }

    sendElementToBack(EO) {

        EO = EO || window.event;

        if (this.resizeEl && this.allowChanges) {
            svg.prepend(this.resizeEl);
        }

    }
    

    mouseDownResize(EO) {

        EO = EO || window.event;

        this.mouseD = true;
        this.resizerID = EO.target.id;
        let clickEvent = new Event('click');
        document.getElementById("btn_select").dispatchEvent(clickEvent);
        let target = this.resizeEl;

        switch(this.resizeEl.tagName) {

            case "rect":
                this.offset.width = parseFloat( target.getAttribute( "width" ) ) - EO.clientX;
                this.offset.height = parseFloat( target.getAttribute( "height" ) ) - EO.clientY;
                this.offset.x = parseFloat( target.getAttribute( "x" ) ) - EO.clientX;
                this.offset.y = parseFloat( target.getAttribute( "y" ) ) - EO.clientY;
                this.resizeEl_X = +target.getAttribute("x");
                this.resizeEl_Y = +target.getAttribute("y");
                this.resizeEl_width = +target.getAttribute("width");
                this.resizeEl_height = +target.getAttribute("height");
                this.updateSelection(target);
                break;

            case "ellipse":
                this.offset.width = parseFloat( target.getAttribute( "rx" ) ) - EO.clientX;
                this.offset.height = parseFloat( target.getAttribute( "ry" ) ) - EO.clientY;
                this.resizeEl_width = +target.getAttribute("rx");
                this.resizeEl_height = +target.getAttribute("ry");
                this.updateSelection(target);
                break; 

            case "line":
                this.resizeEl_X1 = +target.getAttribute("x1");
                this.resizeEl_Y1 = +target.getAttribute("y1");
                this.offset.x = parseFloat( target.getAttribute( "x1" ) ) - EO.clientX;
                this.offset.y = parseFloat( target.getAttribute( "y1" ) ) - EO.clientY;
                this.resizeEl_X2 = +target.getAttribute("x2");
                this.resizeEl_Y2 = +target.getAttribute("y2");
                this.offset.x2 = parseFloat( target.getAttribute( "x2" ) ) - EO.clientX;
                this.offset.y2 = parseFloat( target.getAttribute( "y2" ) ) - EO.clientY;
                this.updateSelection(target);
                break; 
                
            case "path":
                this.resizeEl_data = target.getAttribute("d");
                this.updateSelection(target);
                break;  

            default:
                break;
                
        }
    }

    mouseUpResize(EO) {

        EO = EO || window.event;

        this.mouseD = false;

        switch (EO.target.id) {
            case "resizeRB":
            case "resizeLB":
            case "resizeRT":
            case "resizeLB":
            case "rotate":
            this.mouseOverCheck = true;
            break;
        
        default:
            break;
        }
    }

    mouseMoveResize(EO) {

        EO = EO || window.event;

        if ( this.mouseD ) {
            switch (this.resizeEl.tagName) {
                case "rect":
                    if (this.resizerID == "resizeRB") {
                        
                        if ( (EO.clientX + this.offset.width) > 0 ) {
                            this.resizeEl.setAttribute( "width", EO.clientX + this.offset.width );
                        } else {
                            this.resizeEl.setAttribute( "x", this.resizeEl_X - Math.abs(EO.clientX + this.offset.width) );
                            this.resizeEl.setAttribute( "width", Math.abs(EO.clientX + this.offset.width) );
                        }

                        if ( (EO.clientY + this.offset.height) > 0) {
                            this.resizeEl.setAttribute( "height", EO.clientY + this.offset.height );
                        } else {
                            this.resizeEl.setAttribute( "y", this.resizeEl_Y - Math.abs(EO.clientY + this.offset.height) );
                            this.resizeEl.setAttribute( "height", Math.abs(EO.clientY + this.offset.height) );
                        }
                        
                    }

                    if (this.resizerID == "resizeLB") {

                        if ( EO.clientX + this.offset.x < this.resizeEl_X + this.resizeEl_width ) {
                            this.resizeEl.setAttribute( "x", EO.clientX + this.offset.x) ;
                            this.resizeEl.setAttribute( "width", (this.resizeEl_width - (EO.clientX + this.offset.x - this.resizeEl_X)));
                        } else {
                            this.resizeEl.setAttribute( "x", this.resizeEl_width + this.resizeEl_X) ;
                            this.resizeEl.setAttribute( "width", Math.abs(this.resizeEl_width - (EO.clientX + this.offset.x - this.resizeEl_X)) );
                        }

                        if ( (EO.clientY + this.offset.height) > 0 ) {
                            this.resizeEl.setAttribute( "height", EO.clientY + this.offset.height );
                        } else {
                            this.resizeEl.setAttribute( "y", this.resizeEl_Y - Math.abs(EO.clientY + this.offset.height) );
                            this.resizeEl.setAttribute( "height", Math.abs(EO.clientY + this.offset.height) );  
                        }

                    }

                    if (this.resizerID == "resizeRT") {

                        if ( (EO.clientX + this.offset.width) > 0 ) {
                            this.resizeEl.setAttribute( "width", EO.clientX + this.offset.width );
                        } else {
                            this.resizeEl.setAttribute( "x", this.resizeEl_X - Math.abs(EO.clientX + this.offset.width) );
                            this.resizeEl.setAttribute( "width", Math.abs(EO.clientX + this.offset.width) );
                        }

                        if (  EO.clientY + this.offset.y < this.resizeEl_Y + this.resizeEl_height  ) {
                            this.resizeEl.setAttribute( "y", EO.clientY + this.offset.y) ;
                            this.resizeEl.setAttribute( "height", (this.resizeEl_height - (EO.clientY + this.offset.y - this.resizeEl_Y)));
                        } else {
                            this.resizeEl.setAttribute( "y", this.resizeEl_height + this.resizeEl_Y) ;
                            this.resizeEl.setAttribute( "height", Math.abs(this.resizeEl_height - (EO.clientY + this.offset.y - this.resizeEl_Y)) );
                        }

                    }

                    if (this.resizerID == "resizeLT") {

                        if ( EO.clientX + this.offset.x < this.resizeEl_X + this.resizeEl_width ) {
                            this.resizeEl.setAttribute( "x", EO.clientX + this.offset.x) ;
                            this.resizeEl.setAttribute( "width", (this.resizeEl_width - (EO.clientX + this.offset.x - this.resizeEl_X)));
                        } else {
                            this.resizeEl.setAttribute( "x", this.resizeEl_width + this.resizeEl_X) ;
                            this.resizeEl.setAttribute( "width", Math.abs(this.resizeEl_width - (EO.clientX + this.offset.x - this.resizeEl_X)) );
                        }

                        if (  EO.clientY + this.offset.y < this.resizeEl_Y + this.resizeEl_height  ) {
                            this.resizeEl.setAttribute( "y", EO.clientY + this.offset.y) ;
                            this.resizeEl.setAttribute( "height", (this.resizeEl_height - (EO.clientY + this.offset.y - this.resizeEl_Y)));
                        } else {
                            this.resizeEl.setAttribute( "y", this.resizeEl_height + this.resizeEl_Y) ;
                            this.resizeEl.setAttribute( "height", Math.abs(this.resizeEl_height - (EO.clientY + this.offset.y - this.resizeEl_Y)) );
                        }

                    }
                    break;

                    case "ellipse":
                        if (this.resizerID == "resizeRB") {

                            (EO.clientX + this.offset.width > 0) ?
                            this.resizeEl.setAttribute( "rx", EO.clientX + this.offset.width ) :
                            this.resizeEl.setAttribute( "rx", Math.abs(EO.clientX + this.offset.width) );

                            (EO.clientY + this.offset.height > 0) ?
                            this.resizeEl.setAttribute( "ry", EO.clientY + this.offset.height ) :
                            this.resizeEl.setAttribute( "ry", Math.abs(EO.clientY + this.offset.height ) );
                                                      
                        }

                        if (this.resizerID == "resizeLB") {

                            (this.resizeEl_width > ((EO.clientX + this.offset.width) - this.resizeEl_width)) ?
                            this.resizeEl.setAttribute( "rx", this.resizeEl_width - ((EO.clientX + this.offset.width) - this.resizeEl_width)) :
                            this.resizeEl.setAttribute( "rx", Math.abs( this.resizeEl_width - ((EO.clientX + this.offset.width) - this.resizeEl_width)) );

                            (EO.clientY + this.offset.height > 0) ?
                            this.resizeEl.setAttribute( "ry", EO.clientY + this.offset.height ) :
                            this.resizeEl.setAttribute( "ry", Math.abs(EO.clientY + this.offset.height ) );
                                                      
                        }

                        if (this.resizerID == "resizeLT") {

                            (this.resizeEl_width > ((EO.clientX + this.offset.width) - this.resizeEl_width)) ?
                            this.resizeEl.setAttribute( "rx", this.resizeEl_width - ((EO.clientX + this.offset.width) - this.resizeEl_width)) :
                            this.resizeEl.setAttribute( "rx", Math.abs( this.resizeEl_width - ((EO.clientX + this.offset.width) - this.resizeEl_width)) );

                            (this.resizeEl_height > ((EO.clientY + this.offset.height) - this.resizeEl_height)) ?
                            this.resizeEl.setAttribute( "ry", this.resizeEl_height - ((EO.clientY + this.offset.height) - this.resizeEl_height) ) :
                            this.resizeEl.setAttribute( "ry", Math.abs(this.resizeEl_height - ((EO.clientY + this.offset.height) - this.resizeEl_height)) );
                                                      
                        }

                        if (this.resizerID == "resizeRT") {

                            (EO.clientX + this.offset.width > 0) ?
                            this.resizeEl.setAttribute( "rx", EO.clientX + this.offset.width ) :
                            this.resizeEl.setAttribute( "rx", Math.abs(EO.clientX + this.offset.width) );

                            (this.resizeEl_height > ((EO.clientY + this.offset.height) - this.resizeEl_height)) ?
                            this.resizeEl.setAttribute( "ry", this.resizeEl_height - ((EO.clientY + this.offset.height) - this.resizeEl_height) ) :
                            this.resizeEl.setAttribute( "ry", Math.abs(this.resizeEl_height - ((EO.clientY + this.offset.height) - this.resizeEl_height)) );
                                                      
                        }
                    case "line":

                        if (this.resizerID == "resizeRB") {
                            if (this.resizeEl_X1 < this.resizeEl_X2) {
                                this.resizeEl.setAttribute( "x2", EO.clientX + this.offset.x2 );
                            } else {
                                this.resizeEl.setAttribute( "x1", EO.clientX + this.offset.x );
                            }

                            if (this.resizeEl_Y1 < this.resizeEl_Y2) {
                                this.resizeEl.setAttribute( "y2", EO.clientY + this.offset.y2 );
                            } else {
                                this.resizeEl.setAttribute( "y1", EO.clientY + this.offset.y );
                            }

                        }

                        if (this.resizerID == "resizeLB") {

                            if (this.resizeEl_X1 < this.resizeEl_X2) {
                                this.resizeEl.setAttribute( "x1", EO.clientX + this.offset.x );
                            } else {
                                this.resizeEl.setAttribute( "x2", EO.clientX + this.offset.x2 );
                            }

                            if (this.resizeEl_Y1 < this.resizeEl_Y2) {
                                this.resizeEl.setAttribute( "y2", EO.clientY + this.offset.y2 );
                            } else {
                                this.resizeEl.setAttribute( "y1", EO.clientY + this.offset.y );
                            }
                                                      
                        }

                        if (this.resizerID == "resizeLT") {

                            if (this.resizeEl_X1 < this.resizeEl_X2) {
                                this.resizeEl.setAttribute( "x1", EO.clientX + this.offset.x );
                            } else {
                                this.resizeEl.setAttribute( "x2", EO.clientX + this.offset.x2 );
                            }

                            if (this.resizeEl_Y1 < this.resizeEl_Y2) {
                                this.resizeEl.setAttribute( "y1", EO.clientY + this.offset.y );
                            } else {
                                this.resizeEl.setAttribute( "y2", EO.clientY + this.offset.y2 );
                            }
                                                      
                        }

                        if (this.resizerID == "resizeRT") {

                            if (this.resizeEl_X1 < this.resizeEl_X2) {
                                this.resizeEl.setAttribute( "x2", EO.clientX + this.offset.x2 );
                            } else {
                                this.resizeEl.setAttribute( "x1", EO.clientX + this.offset.x );
                            }

                            if (this.resizeEl_Y1 < this.resizeEl_Y2) {
                                this.resizeEl.setAttribute( "y1", EO.clientY + this.offset.y );
                            } else {
                                this.resizeEl.setAttribute( "y2", EO.clientY + this.offset.y2 );
                            }
                                                      
                        }
                        break;

                    case "path":
        
                        
                        /* if (this.resizerID == "rotate") {
                            this.rotating = true;

                            var point = svg.createSVGPoint();
                            point.x = EO.clientX;
                            point.y = EO.clientY;

                            this.centerPosition = {
                                x: getCoords(this.resizeEl).left + getCoords(this.resizeEl).width/2,
                                y: getCoords(this.resizeEl).top + getCoords(this.resizeEl).height/2
                            }

                            var angle = angleBetweenPoints(point, this.centerPosition);
                            var transform = "rotate(" + angle + ")";
                            this.resizeEl.setAttribute('transform', transform);
                            this.selectionEl.style.transform = "rotate(" + angle + "deg)";
                        } */
                        

                default:
                    break;
            }

        this.updateSelection( this.resizeEl );

        }
    }

    
    mouseDown(EO) {

        EO = EO || window.event;
        let target = EO.target;

        if (this.selectStart) {

            switch ( target.tagName ) {

                case "ellipse":
                    this.selectionEl.style.display = "block";
                    this.selected = target;
                    this.offset.x = parseFloat( target.getAttribute( "cx" ) ) - EO.clientX;
                    this.offset.y = parseFloat( target.getAttribute( "cy" ) ) - EO.clientY;
                    this.updateSelection(target);
                    break;
    
                case "line":
                    this.selectionEl.style.display = "block";
                    this.selected = target;
                    this.offset.x = parseFloat( target.getAttribute( "x1" ) ) - EO.clientX;
                    this.offset.y = parseFloat( target.getAttribute( "y1" ) ) - EO.clientY;
                    this.offset.x2 = parseFloat( target.getAttribute( "x2" ) ) - EO.clientX;
                    this.offset.y2 = parseFloat( target.getAttribute( "y2" ) ) - EO.clientY;
                    this.updateSelection(target);
                    break;
    
                case "rect":
                    this.selectionEl.style.display = "block";
                    this.selected = target;
                    this.offset.x = parseFloat( target.getAttribute( "x" ) ) - EO.clientX;
                    this.offset.y = parseFloat( target.getAttribute( "y" ) ) - EO.clientY;
                    this.updateSelection(target);
                    break;

                case "path":
                    this.selectionEl.style.display = "block";
                    this.selected = target;
                    this.pathMove = target.getAttribute( "d" );
                    
                    let res = this.pathMove.split(" ").map(el => {
                        return el.slice(1)
                    })
                    .map(el => {
                        return el.split(",")
                    });

                    this.pathX = +res[0][0];
                    this.pathY = +res[0][1];
                    
                    this.offset.x = parseFloat( +res[0][0]  - EO.clientX );
                    this.offset.y = parseFloat( +res[0][1]  - EO.clientY );

                    this.updateSelection(target);
                    break;
                    
                default:
                    this.selectionEl.style.display = "none";
                    this.allowChanges = false;
                    break;
                    
            }
        }
        

    }

    mouseMove(EO) {

        EO = EO || window.event;
        
        if ( this.selected  && this.selectStart ) {
            disableAllDrawStart();

            switch (this.selected.tagName) {
                case "ellipse":
                    this.selected.setAttribute( "cx", EO.clientX + this.offset.x );
                    this.selected.setAttribute( "cy", EO.clientY + this.offset.y );
                    break;

                case "line":
                    this.selected.setAttribute( "x1", EO.clientX + this.offset.x );
                    this.selected.setAttribute( "y1", EO.clientY + this.offset.y );
                    this.selected.setAttribute( "x2", EO.clientX + this.offset.x2);
                    this.selected.setAttribute( "y2", EO.clientY + this.offset.y2);
                    break;

                case "rect":
                    this.selected.setAttribute( "x", EO.clientX + this.offset.x );
                    this.selected.setAttribute( "y", EO.clientY + this.offset.y );
                    break;

                case "path":
                    let res = this.pathMove.split(" ")
                    .map(el => {
                        return el.slice(1).split(",")
                    })
                    .map((el, i) => {
                        if (i == 0) {
                            return "M" + ( (el[0] <= this.pathX) ? 
                            ( EO.clientX + this.offset.x + (+el[0] - this.pathX) ) : 
                            ( EO.clientX + this.offset.x - (+el[0] - this.pathX) ) ) + "," + 
                            ( (el[1] <= this.pathY) ? 
                            ( EO.clientY + this.offset.y - (+el[1] - this.pathY) ) : 
                            ( EO.clientY + this.offset.y + (+el[1] - this.pathY) ) )
                        } else {
                            return "L" + ( EO.clientX + this.offset.x + (+el[0] - this.pathX) ) + "," + 
                            ( EO.clientY + this.offset.y + (+el[1] - this.pathY) );
                        }
                        
                    })
                    .join(" ");
                    

                    this.selected.setAttribute("d", res);
                    break;

                default:
                    break;
            }

        this.updateSelection( this.selected );

        }
    }

    mouseOver(EO) {

        EO = EO || window.event;
        let target = EO.target;
        
        if (this.selectStart) {
            switch(target.tagName) {
                case "ellipse":
                case "line":
                case "rect":
                case "path":
                target.style.cursor = "move";
                break;

            default:
                break;
            }
            
        }

    }

    mouseOut(EO) {

        EO = EO || window.event;
        let target = EO.target;
        switch(target.tagName) {
            case "ellipse":
            case "line":
            case "rect":
            case "path":
            target.style.cursor = "default";
            break;

        default:
            break;
        }
    }

    mouseUp(EO) {

        EO = EO || window.event;
        this.selected = null;

    }

}