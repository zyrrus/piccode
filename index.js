const express = require("express");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

/// Utils

// Convert an array of strings to a long string of <tspan> tags
const genLines = (text) => {
    const lines = text.split("\n").map((line, index) => {
        if (line.length == 0)
            return `<tspan id="line${index}" x="5" dy="5" visibility="hidden">.</tspan>`;
        else return `<tspan id="line${index}" x="5" dy="5">${line}</tspan>`;
    });

    return lines.join("");
};

// Compute the minimum necessary width and height of the box
// to fit all the text
const getDimensions = (text) => {
    const lines = text.split("\n");

    const height = lines.length + 1;
    const width = lines.reduce(
        (longest, currentWord) =>
            currentWord.length > longest.length ? currentWord : longest,
        ""
    ).length;

    // Width: 10 (gaps of 5 on each side) + # of chars in longest string * character width
    // Height: (# of lines * line height) + (3 * line height for the top bar)
    return [Math.max(10 + width * 3, 50), height * 5 + 15];
};

// Routes

app.get("/box/:text", (req, res) => {
    const text = req.params.text;

    // Dimensions
    const [width, height] = getDimensions(text);

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
                style="fill:${background}"
                id="background" width="${width}" height="${height}" x="0" y="0" ry="5" />
            <g id="buttons" transform="translate(7.5, 7.5)">
                <circle style="fill:${close}" id="close" cx="0" cy="0" r="2.5" />
                <circle style="fill:${restore}" id="restore" cx="7.5" cy="0" r="2.5" />
                <circle style="fill:${minimize}" id="minimize" cx="15" cy="0" r="2.5" />
            </g>
            <text id="textbox"
                style="font-style:normal;font-weight:normal;font-size:${fontsize}px;font-family:${font};white-space:pre;fill:${foreground};fill-opacity:1;stroke:none;"
                x="0" y="15">${genLines(text)}
            </text>
        </svg>
    `);
});

app.listen(PORT, () => {});
