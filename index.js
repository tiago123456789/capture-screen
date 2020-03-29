const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const process = require("child_process");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(cors());
app.use(express.static(__dirname + "/public"));


app.get("/", (request, response) => {
    response.render("index");
});

app.post("/images-to-videos", async (request, response) => {
    const capturedScreenshot = request.body;
    await createDirectory(`images/${capturedScreenshot.id}`)
    const promisesFileCreation = capturedScreenshot.frames.map((frame, index) => {
        return transformContentImagebase64ToImage(
            getPathnameImage(capturedScreenshot.id, frame, index), frame
        );
    });

    Promise.all(promisesFileCreation).then(() => {
        process.exec(`ffmpeg -framerate 1 -i ./images/${capturedScreenshot.id}/img-%02d.png -filter:v "setpts=2.0*PTS" ./videos/${capturedScreenshot.id}.mp4`, (error) => {
            if (error) {
                return response.json({ error });
            }
            return response.json(capturedScreenshot); 
        });
    });

});

function getPathnameImage(id, frame, index) {
    index = index.toString().length == 1 ? `0${index}` : index;
    return `images/${id}/img-${index}.png`;
}

function extractContentImageFromUrlBase64(url) {
    return url.split(';base64,').pop();
}

function createDirectory(name) {
    return new Promise((resolve, reject) => {
        fs.mkdir(name, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

function transformContentImagebase64ToImage(name, image) {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            name,
            extractContentImageFromUrlBase64(image.img),
            { encoding: 'base64' },
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
    });
}

app.listen(3000, function (error) {
    if (error) {
        console.log(error);
    }

    console.log("Server running!!!!");
});

