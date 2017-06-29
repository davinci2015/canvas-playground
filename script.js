function Circle({radius, fillStyle, x, y, dx, dy}) {
    this.radius = radius;
    this.fillStyle = fillStyle;
    this.position = {x, y};
    this.movement = {dx, dy};
}

const canvasHandler = {
    canvas: null,
    observers: [],

    getCanvas2dContext: function () {
        return this.canvas.getContext("2d");
    },

    init: function (width, height) {
        this.canvas = document.getElementById("playground");
        this.canvas.width = width;
        this.canvas.height = height;
    },

    addObserver: function (observer) {
        if (typeof observer.canvasUpdate !== "function") {
            throw new Error("Observer 'canvasUpdate' function is not defined!");
        }
        this.observers.push(observer);
    },

    notifyObservers(newData) {
        this.observers.forEach(listener => {
            listener.canvasUpdate(newData);
        });
    },

    updateCanvasSize: function (newWidth, newHeight) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.notifyObservers({
            width: newWidth,
            height: newHeight
        });
    }
};

const drawHandler = {
    ctx: null,
    canvas: {
        height: null,
        width: null,
    },

    init: function (canvasWidth, canvasHeight, context) {
        this.ctx = context;
        this.canvas.height = canvasHeight;
        this.canvas.width = canvasWidth;
    },

    canvasUpdate: function (newProps) {
        this.canvas.height = newProps.height;
        this.canvas.width = newProps.width;
    },

    drawCircles: function (circles) {
        this.clearCanvas();
        circles.forEach(circle => {
            this.ctx.beginPath();
            this.ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = circle.fillStyle;
            this.ctx.fill();
        });
    },

    checkCollision: function (circles) {
        circles.forEach(circle => {
            if (circle.position.y >= this.canvas.height - circle.radius) {
                circle.movement.dy = -circle.movement.dy;
            } else if (circle.position.y <= circle.radius) {
                circle.movement.dy = Math.abs(circle.movement.dy);
            } else if (circle.position.x >= this.canvas.width - circle.radius) {
                circle.movement.dx = -circle.movement.dx;
            } else if (circle.position.x <= circle.radius) {
                circle.movement.dx = Math.abs(circle.movement.dx);
            }

            circle.position.x += circle.movement.dx;
            circle.position.y += circle.movement.dy;
        })
    },

    clearCanvas: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

const canvasHeight = window.innerHeight;
const canvasWidth = window.innerWidth;

canvasHandler.init(canvasWidth, canvasHeight);
drawHandler.init(canvasWidth, canvasHeight, canvasHandler.getCanvas2dContext());
canvasHandler.addObserver(drawHandler);

let circles = [];
let drawingInterval = null;
let generateInterval = null;
const $text = document.getElementById("text");
const inactiveClassName = "inactive";

document.addEventListener("mousedown", function (e) {
    generateInterval = setInterval(function() {
        circles.push(new Circle({
            radius: 20,
            fillStyle: "#E7E247",
            x: e.clientX,
            y: e.clientY,
            dx: Math.random() * 5,
            dy: Math.random() * 5,
        }));
    }, 200);

    if (!drawingInterval) {
        $text.className += ` ${inactiveClassName}`;
        drawingInterval = setInterval(function () {
            drawHandler.checkCollision(circles);
            drawHandler.drawCircles(circles);
        }, 5);
    }
});

document.addEventListener("mouseup", function() {
    clearInterval(generateInterval);
});

window.addEventListener("resize", function () {
    canvasHandler.updateCanvasSize(window.innerWidth, window.innerHeight);
});