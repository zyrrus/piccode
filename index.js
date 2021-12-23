const express = require("express");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

// Utils

const genLines = (text) => {
    const lines = text.split("\n").map((line, index) => {
        console.log(line);
        if (line.length == 0)
            return `<tspan id="line${index}" x="5" dy="1.25em" visibility="hidden">.</tspan>`;
        else
            return `<tspan id="line${index}" x="5" dy="1.25em">${line}</tspan>`;
    });

    return lines.join("");
};

const getDimensions = (text) => {
    const lines = text.split("\n");

    const height = lines.length + 1;
    const width = lines.reduce(
        (longest, currentWord) =>
            currentWord.length > longest.length ? currentWord : longest,
        ""
    ).length;

    return [Math.max(10 + width * 3, 50), height * 6 + 15];
};

// Routes

app.get("/box/:text", (req, res) => {
    const text = req.params.text;

    // Dimensions
    const [width, height] = getDimensions(text);
    console.log(width, height);

    // Text
    const font = "monospace";
    const fontsize = "5";

    // Colors
    const close = "#" + (req.query.close || "ff605c");
    const restore = "#" + (req.query.restore || "ffbd44");
    const minimize = "#" + (req.query.minimize || "00ca4e");
    const background = "#" + (req.query.bg || "222222");
    const foreground = "#" + (req.query.fg || "dedede");

    res.setHeader("content-type", "image/svg+xml");
    return res.status(200).send(`
        <svg width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}" version="1.1" id="code" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
            <rect
                style="fill:${background};stroke:${background};stroke-width:10;stroke-linejoin:round;stroke-miterlimit:24.2;stroke-dasharray:none;stroke-opacity:1"
                id="background" width="${width - 10}" height="${
        height - 10
    }" x="5" y="5" ry="0" />
            <g id="buttons" transform="translate(7.5, 7.5)">
                <circle style="fill:${close}" id="exit" cx="0" cy="0" r="2.5" />
                <circle style="fill:${restore}" id="restore" cx="7.5" cy="0" r="2.5" />
                <circle style="fill:${minimize}" id="minimize" cx="15" cy="0" r="2.5" />
            </g>
            <text id="textbox"
                style="font-style:normal;font-weight:normal;font-size:${fontsize}px;font-family:${font};white-space:pre;fill:${foreground};fill-opacity:1;stroke:none;"
                x="5" y="13.5">${genLines(text)}
            </text>
        </svg>
    `);
});

app.listen(PORT, () => {
    console.log("Server started listening on port : ", PORT);
});
