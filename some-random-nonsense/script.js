const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const regions = [
    {
        id: "topLeftRect",
        label: "Top Left Rectangle",
        type: "rect",
        x: 110,
        y: 130,
        width: 260,
        height: 180,
        active: false
    },
    {
        id: "centerCircle",
        label: "Center Circle",
        type: "circle",
        x: 560,
        y: 780,
        radius: 95,
        active: false
    },
    {
        id: "bottomPoly",
        label: "Bottom Polygon",
        type: "polygon",
        points: [
            { x: 360, y: 1180 },
            { x: 520, y: 1110 },
            { x: 700, y: 1170 },
            { x: 650, y: 1340 },
            { x: 420, y: 1320 }
        ],
        active: false
    }
];

const state = {
    image: new Image(),
    imageLoaded: false,
    authoring: {
        enabled: false,
        points: [],
        hoverPoint: null,
        nextPolygonId: 1
    }
};

state.image.src = "images/85189d6b-8615-442b-9805-e139be629f3f.jpeg";

state.image.addEventListener("load", () => {
    state.imageLoaded = true;
    // Keep the canvas at the image's native size for 1:1 coordinates.
    canvas.width = state.image.width;
    canvas.height = state.image.height;
    draw();
});

state.image.addEventListener("error", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9b1c1c";
    ctx.font = "16px sans-serif";
    ctx.fillText("Could not load image.", 20, 40);
});

function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

function isPointInsidePolygon(point, polygonPoints) {
    let inside = false;
    const total = polygonPoints.length;

    for (let i = 0, j = total - 1; i < total; j = i, i += 1) {
        const xi = polygonPoints[i].x;
        const yi = polygonPoints[i].y;
        const xj = polygonPoints[j].x;
        const yj = polygonPoints[j].y;

        const intersects =
            yi > point.y !== yj > point.y &&
            point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

        if (intersects) {
            inside = !inside;
        }
    }

    return inside;
}

function pointInRegion(point, region) {
    if (region.type === "rect") {
        return (
            point.x >= region.x &&
            point.x <= region.x + region.width &&
            point.y >= region.y &&
            point.y <= region.y + region.height
        );
    }

    if (region.type === "circle") {
        const dx = point.x - region.x;
        const dy = point.y - region.y;
        return dx * dx + dy * dy <= region.radius * region.radius;
    }

    if (region.type === "polygon") {
        return isPointInsidePolygon(point, region.points);
    }

    return false;
}

function drawRegionPath(region) {
    ctx.beginPath();

    if (region.type === "rect") {
        ctx.rect(region.x, region.y, region.width, region.height);
        return;
    }

    if (region.type === "circle") {
        ctx.arc(region.x, region.y, region.radius, 0, Math.PI * 2);
        return;
    }

    if (region.type === "polygon") {
        const [first, ...rest] = region.points;
        ctx.moveTo(first.x, first.y);

        for (const point of rest) {
            ctx.lineTo(point.x, point.y);
        }

        ctx.closePath();
    }
}

function drawAuthoringOverlay() {
    if (!state.authoring.enabled) {
        return;
    }

    const { points, hoverPoint } = state.authoring;

    if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i += 1) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        if (hoverPoint) {
            ctx.lineTo(hoverPoint.x, hoverPoint.y);
        }

        ctx.strokeStyle = "rgba(12, 84, 190, 0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(12, 84, 190, 0.95)";
        ctx.fill();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(16, 16, 520, 92);

    ctx.fillStyle = "#ffffff";
    ctx.font = "15px sans-serif";
    ctx.fillText("Authoring mode: ON", 28, 42);
    ctx.font = "13px sans-serif";
    ctx.fillText("Click: add point | Enter: finalize polygon", 28, 64);
    ctx.fillText("Backspace: remove last | Esc: cancel | A: toggle", 28, 84);
    ctx.fillText(`Points: ${points.length}`, 28, 102);
}

function finalizeAuthoringPolygon() {
    const { points, nextPolygonId } = state.authoring;

    if (points.length < 3) {
        console.warn("Need at least 3 points to create a polygon region.");
        return;
    }

    const polygonId = `generatedPoly${nextPolygonId}`;
    const roundedPoints = points.map((point) => ({
        x: Math.round(point.x),
        y: Math.round(point.y)
    }));

    const newRegion = {
        id: polygonId,
        label: `Generated Polygon ${nextPolygonId}`,
        type: "polygon",
        points: roundedPoints,
        active: false
    };

    regions.push(newRegion);
    state.authoring.nextPolygonId += 1;
    state.authoring.points = [];
    state.authoring.hoverPoint = null;

    console.log("Generated region object:");
    console.log(
        JSON.stringify(
            {
                id: newRegion.id,
                label: newRegion.label,
                type: newRegion.type,
                points: newRegion.points,
                active: false
            },
            null,
            4
        )
    );

    draw();
}

function toggleAuthoringMode() {
    state.authoring.enabled = !state.authoring.enabled;

    if (!state.authoring.enabled) {
        state.authoring.points = [];
        state.authoring.hoverPoint = null;
    }

    canvas.style.cursor = state.authoring.enabled ? "crosshair" : "pointer";
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.imageLoaded) {
        return;
    }

    ctx.drawImage(state.image, 0, 0);

    for (const region of regions) {
        drawRegionPath(region);
        ctx.lineWidth = 2;
        ctx.strokeStyle = region.active
            ? "rgba(13, 148, 97, 0.95)"
            : "rgba(0, 0, 0, 0.35)";
        ctx.stroke();

        if (region.active) {
            ctx.fillStyle = "rgba(13, 148, 97, 0.25)";
            ctx.fill();
        }
    }

    drawAuthoringOverlay();
}

canvas.addEventListener("mousemove", (event) => {
    if (!state.authoring.enabled) {
        return;
    }

    state.authoring.hoverPoint = getCanvasPoint(event);
    draw();
});

canvas.addEventListener("click", (event) => {
    const point = getCanvasPoint(event);

    if (state.authoring.enabled) {
        state.authoring.points.push({
            x: Math.round(point.x),
            y: Math.round(point.y)
        });
        draw();
        return;
    }

    let toggled = null;

    // Iterate backward so later regions are considered "on top".
    for (let i = regions.length - 1; i >= 0; i -= 1) {
        const region = regions[i];

        if (pointInRegion(point, region)) {
            region.active = !region.active;
            toggled = region;
            break;
        }
    }

    if (!toggled) {
        return;
    }

    draw();
    console.log("Toggled region:", {
        id: toggled.id,
        label: toggled.label,
        active: toggled.active
    });
});

window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "a") {
        toggleAuthoringMode();
        return;
    }

    if (!state.authoring.enabled) {
        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();
        state.authoring.points.pop();
        draw();
        return;
    }

    if (event.key === "Escape") {
        state.authoring.points = [];
        state.authoring.hoverPoint = null;
        draw();
        return;
    }

    if (event.key === "Enter") {
        finalizeAuthoringPolygon();
    }
});
