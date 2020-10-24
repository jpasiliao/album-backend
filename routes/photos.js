const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const helper = require('../helper/filter');

import { sentenceCase } from "sentence-case";

const baseUrl = 'http://localhost:8888/photos/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './photos/' + req.body.album.toLowerCase());
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.put('/', upload.array('documents', 10), (req, res, next) => {

    const album = req.body.album;
    const files = req.files;
    let data = [];

    if (files.length > 0) {
        files.map(img => {
            data.push({
                album: sentenceCase(album),
                name: img.originalname,
                path: "/albums/" + album.toLowerCase() + "/" + img.originalname,
                raw: baseUrl + album.toLowerCase() + "/" + img.originalname
            });
        });
        res.status(200);
        res.json({ message: "OK", data: data }).send();
    } else {
        res.status(400);
        res.json({ message: "No file to be upload" }).end();
    }

});

router.post('/list', (req, res, next) => {

    const limit = req.body.limit;
    const skip = req.body.skip;

    if (limit == undefined || skip == undefined) {
        res.status(400).json({ message: "Invalid request!!! Missing Skip or limit" }).end();
    } else {
        res.status(200).json({ message: "OK", documents: consolidateImg().skip(skip).limit(limit), count: consolidateImg().length, skip: skip, limit: limit }).send();
    }

});

router.delete('/', (req, res, next) => {

    const data = req.body;

    if (data.length > 0) {
        deleteImages(data, res);
        res.status(200).json({ message: "OK" }).send();
    } else {
        console.error(err);
        res.status(400).json({ message: "No file to be deleted" }).end();
    }

});

router.delete('/:album/:filename', (req, res, next) => {

    try {
        fs.unlinkSync('./photos/' + req.params.album + '/' + req.params.filename);
        res.json({ message: "OK" }).send();
    } catch (err) {
        console.error(err);
        if (err.code == "ENOENT") {
            res.status(400).json({ message: "File Not found" }).send();
        } else {
            res.status(400).send(err);
        }

    }

});

function consolidateImg() {

    const albums = [];
    let images = [];

    fs.readdirSync('./photos').map(dir => {
        albums.push(dir);
    })

    albums.map(album => {
        fs.readdirSync('./photos/' + album).map(img => {
            images.push({
                id: generateId(),
                album: sentenceCase(path.parse(album, img).base),
                name: img,
                path: '/albums/' + sentenceCase(path.parse(album, img).base) + "/" + img,
                raw: baseUrl + path.parse(album, img).base + "/" + img
            });
        });
    });

    return images;

};

function deleteImages(data, res){
    data.map(d => {
        let file = d.documents.split(',');
        let path = d.album.toLowerCase();
        file.map(f => {
            try {
                fs.unlinkSync('./photos/' + path + '/' + f);
            } catch (err) {
                console.error(err);
                if (err.code == "ENOENT") {
                    res.status(400).json({ message: "File Not found" }).send();
                } else {
                    res.status(400).send(err);
                }
            }
        });
    });
};

function generateId() {
    const char =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const ID_LENGTH = 32;
    let refNo = "";
    for (var i = 0; i < ID_LENGTH; i++) {
        refNo += char.charAt(Math.floor(Math.random() * char.length));
    }
    return refNo;
};


module.exports = router;