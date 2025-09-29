import { DraggingBehavior, Utility } from "modules";
import { Container, Graphics, Polygon, Text } from "pixi.js";

const PLOT_PADDING = 250;

const PLOT_FILL_COLOR = 0x0096ff;
const PLOT_FILL_ALPHA = 0.25;

const POINT_RADIUS = 3;
const POINT_COLOR = 0x00ffff;
const POINT_COLOR_ACTIVE = 0xffffff;
const POINT_ALPHA = 0.5;
const POINT_ALPHA_ACTIVE = 1;

const POLYGON_COLOR = 0xff0000;
const POLYGON_ALPHA = 0.25;

const LABEL_COLOR = "black";
const LABEL_STROKE_COLOR = "white";
const LABEL_FONT_SIZE = 14;
const LABEL_STROKE_THICKNESS = 3;

const LINE_WIDTH = 2;
const LINE_COLOR = 0xfb77ee;

const NEAR_DISTANCE = 15;

export default class EditPlot {
    display = new Container();
    graphics = new Graphics();
    label = new Text("", {
        fontFamily: "Arial",
        fontSize: LABEL_FONT_SIZE,
        fill: LABEL_COLOR,
        stroke: LABEL_STROKE_COLOR,
        strokeThickness: LABEL_STROKE_THICKNESS,
    });

    vertices = [];

    data = {};

    activePoint = null;
    cursorPoint = null;

    isDragPoint = false;

    keydownHandler;

    /**
     *
     * @param {Object} param0
     * @param {Array} param0.vertices
     */
    constructor({ vertices = [] } = {}) {
        this.vertices = [...vertices];

        this.display.eventMode = "static";

        const draggingBehavior = DraggingBehavior.setup(this.display, {
            onDragStart: this.onPlotDragStart,
            //onDragMove: this.onPlotDragMove,
            onDragEnd: this.onPlotDragEnd,
        });

        draggingBehavior.defaultMove = () => {};

        this.display.on("pointermove", this.onPlotDragMove);

        document.addEventListener("keydown", (event) => {
            const keyName = event.key;

            if (keyName === "Enter") {
                this.dumpData();
            }

            this.keydownHandler && this.keydownHandler(event);
        });

        this.updatePoints();

        this.display.addChild(this.graphics, this.label);
    }

    onPlotDragStart = (event) => {
        let point;

        if (this.activePoint) {
            point = this.activePoint;
        } else {
            let pos = event.data.getLocalPosition(this.display);

            point = { x: pos.x, y: pos.y };

            this.insertPointNearPoint(point, this.findNearPoint(point));

            this.activePoint = point;
        }

        if (point) {
            this.isDragPoint = true;
        }
    };

    onPlotDragMove = (e) => {
        this.cursorPoint = e.data.getLocalPosition(this.display);

        if (this.isDragPoint) {
            let pos = e.data.getLocalPosition(this.display);

            this.activePoint.x = pos.x;
            this.activePoint.y = pos.y;
        } else {
            this.activePoint = this.findNearPoint(
                e.data.getLocalPosition(this.display),
                NEAR_DISTANCE,
            );
        }

        this.updatePoints();
    };

    onPlotDragEnd = () => {
        this.isDragPoint = false;
    };

    drawBack() {
        const min = { x: 0, y: 0 },
            max = { x: 0, y: 0 },
            firstVertex = this.vertices[0];

        if (firstVertex) {
            min.x = firstVertex.x;
            min.y = firstVertex.y;

            max.x = firstVertex.x;
            max.y = firstVertex.y;
        }

        this.vertices.forEach((vertex) => {
            min.x = vertex.x < min.x ? vertex.x : min.x;
            min.y = vertex.y < min.y ? vertex.y : min.y;
            max.x = vertex.x > max.x ? vertex.x : max.x;
            max.y = vertex.y > max.y ? vertex.y : max.y;
        });

        this.graphics.beginFill(PLOT_FILL_COLOR, PLOT_FILL_ALPHA);
        this.graphics.drawRect(
            min.x - PLOT_PADDING,
            min.y - PLOT_PADDING,
            max.x - min.x + 2 * PLOT_PADDING,
            max.y - min.y + 2 * PLOT_PADDING,
        );
    }

    drawPoints() {
        this.vertices.forEach((vertex) => {
            this.drawPoint(vertex);
        });

        this.graphics.endFill();
    }

    drawPoint(point) {
        if (this.activePoint === point) {
            this.graphics.beginFill(POINT_COLOR_ACTIVE, POINT_ALPHA_ACTIVE);
        } else {
            this.graphics.beginFill(POINT_COLOR, POINT_ALPHA);
        }

        this.graphics.drawCircle(point.x, point.y, POINT_RADIUS);
    }

    deletePoint(point) {
        this.vertices = this.vertices.filter((_point) => {
            return _point !== point;
        });

        this.activePoint = null;

        this.updatePoints();
    }

    updatePoints() {
        this.graphics.clear();

        this.drawBack();
        this.drawPointsPolygon();
        this.drawPoints();
        this.drawLabel();
        this.drawLines();
    }

    drawLabel() {
        this.label.visible = false;

        if (!this.activePoint) {
            return;
        }

        this.label.text =
            this.vertices.indexOf(this.activePoint) +
            ":  " +
            Math.round(this.activePoint.x) +
            " " +
            Math.round(this.activePoint.y);
        this.label.position = {
            x: this.activePoint.x + 10,
            y: this.activePoint.y - 20,
        };
        this.label.visible = true;
    }

    drawLines() {
        if (!this.cursorPoint) {
            return;
        }

        let point = this.findNearPoint(this.cursorPoint);

        let index = this.vertices.indexOf(point);

        let indexPrev = index === 0 ? this.vertices.length - 1 : index - 1;
        let indexNext = index === this.vertices.length - 1 ? 0 : index + 1;

        let prev = this.vertices[indexPrev];
        let next = this.vertices[indexNext];

        let distPrev = this.getDistanceFromPointToLine(prev, point, this.cursorPoint);
        let distNext = this.getDistanceFromPointToLine(next, point, this.cursorPoint);

        this.graphics.lineStyle(LINE_WIDTH, LINE_COLOR, 1);
        this.graphics.moveTo(point.x, point.y);
        distPrev < distNext
            ? this.graphics.lineTo(prev.x, prev.y)
            : this.graphics.lineTo(next.x, next.y);
        this.graphics.endFill();
    }

    drawPointsPolygon() {
        this.graphics.beginFill(POLYGON_COLOR, POLYGON_ALPHA);

        const vertexes = [];

        this.vertices.forEach((point) => {
            vertexes.push(point.x, point.y);
        });

        this.graphics.drawShape(new Polygon(vertexes));
    }

    insertPointNearPoint(point, nearPoint) {
        let index = this.vertices.indexOf(nearPoint);

        if (this.vertices.length < 2) {
            this.vertices.push(point);
        } else {
            let indexPrev = index === 0 ? this.vertices.length - 1 : index - 1;
            let indexNext = index === this.vertices.length - 1 ? 0 : index + 1;

            let prev = this.vertices[indexPrev];
            let next = this.vertices[indexNext];

            let distPrev = this.getDistanceFromPointToLine(prev, nearPoint, this.cursorPoint);
            let distNext = this.getDistanceFromPointToLine(next, nearPoint, this.cursorPoint);

            let insertIndex;

            if (distPrev < distNext) {
                insertIndex = Math.max(index, indexPrev);

                if (
                    (index === 0 && indexPrev === this.vertices.length - 1) ||
                    (indexPrev === 0 && index === this.vertices.length - 1)
                ) {
                    insertIndex = 0;
                }
            } else {
                insertIndex = Math.max(index, indexNext);

                if (
                    (index === 0 && indexNext === this.vertices.length - 1) ||
                    (indexNext === 0 && index === this.vertices.length - 1)
                ) {
                    insertIndex = 0;
                }
            }

            this.vertices.splice(insertIndex, 0, point);
        }

        this.updatePoints();
    }

    findNearPoint(point, maxDistance) {
        let nearPoint = null;

        for (let i = 0; i < this.vertices.length; i++) {
            let dist = Utility.distanceBetweenObjects(point, this.vertices[i]);

            if (maxDistance && dist > maxDistance) {
                continue;
            }

            if (!nearPoint) {
                nearPoint = this.vertices[i];
            } else if (dist < Utility.distanceBetweenObjects(point, nearPoint)) {
                nearPoint = this.vertices[i];
            }
        }

        return nearPoint;
    }

    getDistanceFromPointToLine(p1, p2, p) {
        if (this.getScalar(p1, p2, p) < 0) {
            return Utility.distanceBetweenObjects(p2, p);
        }

        return (
            Math.abs((p2.y - p1.y) * p.x - (p2.x - p1.x) * p.y + p2.x * p1.y - p2.y * p1.x) /
            Utility.distanceBetweenObjects(p1, p2)
        );
    }

    getScalar(p1, p2, p) {
        let _p1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        let _p = { x: p.x - p2.x, y: p.y - p2.y };

        return _p.x * _p1.x + _p.y * _p1.y;
    }

    dumpData() {
        let out = "";

        this.vertices.forEach((point) => {
            out += `{x: ${Math.round(point.x)}, y: ${Math.round(point.y)}}, `;
        });

        console.log("vertices: [" + out + "]");
    }
}
