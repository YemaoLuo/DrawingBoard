let canvas = document.getElementById("drawing-board");
let ctx = canvas.getContext("2d");
let penColor = 'black';
let penColor2 = penColor;
let penWidth = 2;
let shapeLineWidth = document.getElementById("shape-lineWidth");
let lineWidthHidden = document.getElementById("lineWidth-hidden");
let flag = false;
let eraserState = false;
let eraser = document.getElementById("eraser")
let pen = document.getElementById("pen")
let toolClear = document.getElementById('clear');
let historyData = [];
let toolReturn = document.getElementById("return");
let penColorSelected = document.querySelector('.penColor')
let penColorHidden = document.getElementById('penColor-hidden')
let timer = null
let save = document.getElementById('save')

pen.classList.add('active');
ctx.willReadFrequently = true;

const socket = new WebSocket("ws://" + window.location.host + "/updateDrawing");

function canvasSetSize() {
    let pageWidth = window.innerWidth;
    let pageHeight = window.innerHeight;
    canvas.width = pageWidth;
    canvas.height = pageHeight;
}

function autoSetSize() {
    canvasSetSize();
    window.onresize = function () {
        canvasSetSize();
    }
}

autoSetSize();

penColorSelected.onclick = function () {
    if (lineWidthHidden.style.display === "block") {
        lineWidthHidden.style.display = "none";
    }
    if (penColorHidden.style.display === "none") {
        penColorHidden.style.display = "flex";
    } else {
        penColorHidden.style.display = "none";
    }
}
penColorHidden.onmouseleave = function () {
    clearTimeout(timer)
    timer = setTimeout(() => {
        penColorHidden.onmouseleave = function () {
            penColorHidden.style.display = "none";
        }
    }, 1000)
}
document.querySelector('.penColorItem:first-child').onclick = function () {
    penColor = 'black'
    penColor2 = penColor
}
document.querySelector('.penColorItem:nth-child(2)').onclick = function () {
    penColor = 'red'
    penColor2 = penColor
}
document.querySelector('.penColorItem:nth-child(3)').onclick = function () {
    penColor = 'blue'
    penColor2 = penColor
}
document.querySelector('.penColorItem:nth-child(4)').onclick = function () {
    penColor = 'orange'
    penColor2 = penColor
}
document.querySelector('.penColorItem:nth-child(5)').onclick = function () {
    penColor = 'green'
    penColor2 = penColor
}
document.querySelector('.penColorItem:nth-child(6)').onclick = function () {
    penColor = 'gray'
    penColor2 = penColor
}

let penLineWidth = penWidth;
shapeLineWidth.onclick = function () {
    if (penColorHidden.style.display === "flex") {
        penColorHidden.style.display = "none";
    }

    if (lineWidthHidden.style.display === "none") {
        lineWidthHidden.style.display = "block";
    } else {
        lineWidthHidden.style.display = "none";
    }
}
lineWidthHidden.onmouseleave = function () {
    clearTimeout(timer)
    timer = setTimeout(() => {
        lineWidthHidden.onmouseleave = function () {
            lineWidthHidden.style.display = "none";
        }
    }, 1000)
}
document.querySelector("#lineWidth-hidden>div:first-child").onclick = function () {
    penLineWidth = 1;
    penWidth = penLineWidth;
}
document.querySelector("#lineWidth-hidden>div:nth-child(2)").onclick = function () {
    penLineWidth = 2;
    penWidth = penLineWidth;
}
document.querySelector("#lineWidth-hidden>div:nth-child(3)").onclick = function () {
    penLineWidth = 4;
    penWidth = penLineWidth;
}
document.querySelector("#lineWidth-hidden>div:nth-child(4)").onclick = function () {
    penLineWidth = 8;
    penWidth = penLineWidth;
}
document.querySelector("#lineWidth-hidden>div:nth-child(5)").onclick = function () {
    penLineWidth = document.querySelector("#lineWidth-hidden>div:nth-child(5)>input").value;
    penWidth = penLineWidth;
}

function getUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function pcDrawLine() {
    canvas.onmousedown = function (e) {
        if (penColorHidden.style.display === "flex") {
            penColorHidden.style.display = "none";
        }
        if (lineWidthHidden.style.display === "block") {
            lineWidthHidden.style.display = "none";
        }
        if (eraserState) {
            penColor = "white"
            penLineWidth = 31
        }
        if (historyData.length === 20) {
            historyData.shift();
        }
        historyData.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const mouseX = e.pageX - this.offsetLeft;
        const mouseY = e.pageY - this.offsetTop;
        flag = true;
        ctx.beginPath();
        ctx.lineWidth = penLineWidth;
        ctx.strokeStyle = penColor;
        ctx.moveTo((mouseX), (mouseY));
    };

    canvas.onmousemove = function (e) {
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        if (flag) {
            ctx.lineTo((mouseX), (mouseY));
            ctx.stroke();
        }
    }

    canvas.onmouseup = function (e) {
        flag = false;
        const url = canvas.toDataURL();
        const uuid = getUuid();
        for (let i = 0; i < url.length; i += 100) {
            const message = {
                'id': uuid,
                'data': url.substring(i, i + 100)
            }
            socket.send(JSON.stringify(message).toString());
        }
        const message = {
            'id': uuid,
            'data': "END"
        }
        socket.send(JSON.stringify(message).toString());
    }

    canvas.onmouseleave = function (e) {
        flag = false;
    }
}

pcDrawLine();

eraser.onclick = function () {
    if (penColorHidden.style.display === "flex") {
        penColorHidden.style.display = "none";
    }
    if (lineWidthHidden.style.display === "block") {
        lineWidthHidden.style.display = "none";
    }
    eraserState = true;
    eraser.classList.add('active');
    pen.classList.remove('active');
    penLineWidth = 31
    penColor = 'white'
};

pen.onclick = function () {
    if (penColorHidden.style.display === "flex") {
        penColorHidden.style.display = "none";
    }
    if (lineWidthHidden.style.display === "block") {
        lineWidthHidden.style.display = "none";
    }
    eraserState = false;
    pen.classList.add('active');
    eraser.classList.remove('active');
    penLineWidth = penWidth
    penColor = penColor2
};

toolClear.onclick = function () {
    if (penColorHidden.style.display === "flex") {
        penColorHidden.style.display = "none";
    }
    if (lineWidthHidden.style.display === "block") {
        lineWidthHidden.style.display = "none";
    }
    if (historyData.length === 20) {
        historyData.shift();
    }
    historyData.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

toolReturn.onclick = function () {
    if (penColorHidden.style.display === "flex") {
        penColorHidden.style.display = "none";
    }
    if (lineWidthHidden.style.display === "block") {
        lineWidthHidden.style.display = "none";
    }
    if (historyData.length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(historyData[historyData.length - 1], 0, 0);
        historyData.pop();
    }
}

save.onclick = function () {
    if (penColorHidden.style.display === "flex") {
        penColorHidden.style.display = "none";
    }
    if (lineWidthHidden.style.display === "block") {
        lineWidthHidden.style.display = "none";
    }
    let imgUrl = canvas.toDataURL("image/png");
    let saveA = document.createElement("a");
    document.body.appendChild(saveA);
    saveA.href = imgUrl;
    saveA.download = "pic" + (new Date).getTime();
    saveA.target = "_blank";
    saveA.click();
};

socket.onopen = function (event) {
    console.log("WebSocket connection opened.");
};

socket.onmessage = function (event) {
    console.log("Received message:", event.data);
    const message = event.data;
    const newImage = new Image();
    newImage.src = message;
    newImage.onload = function () {
        ctx.drawImage(newImage, 0, 0);
    };
};

socket.onclose = function (event) {
    console.log("WebSocket connection closed.");
};

socket.onerror = function (error) {
    console.error("WebSocket error:", error);
};