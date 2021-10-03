from sanic import Sanic, Request
from sanic.response import json, file

from youtube_dl import YoutubeDL
import asyncio
import time
import uuid
import re
import os


class Downloader:
    def __init__(self, key: str):
        self.created_at = time.time()
        self.finished_at = 999999999999999

        self.key = key

        self._now = (0, 0)

    @staticmethod
    async def info(query: str):
        ytdl = YoutubeDL({"noplaylist": True, "quiet": True})

        if re.match(r"^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$", query):
            info = await asyncio.to_thread(ytdl.extract_info, query, download=False)
        else:
            result = await asyncio.to_thread(
                ytdl.extract_info, f"ytsearch:{query}", download=False
            )

            info = result["entries"][0]

        return {
            "id": info["id"],
            "title": info["title"],
            "thumbnail": info["thumbnails"][-1]["url"],
            "uploader": info["uploader"],
        }

    def _progress_hook(self, data):
        downloaded_bytes = data["downloaded_bytes"]
        total_bytes = data["total_bytes"]

        self._now = (1, round(downloaded_bytes / total_bytes * 100, 2))

    def get_status(self):
        status_map = {0: "created", 1: "downloading", 2: "finished"}[self._now[0]]

        return {
            "status": status_map,
            "progress": self._now[1],
        }

    async def download(self, url: str, audio: bool = False):
        options = {
            "format": "best",
            "merge-output-format": "mp4",
            "outtmpl": f"./temp/{self.key}.%(ext)s",
            "progress_hooks": [self._progress_hook],
            "noplaylist": True,
            "quiet": True,
        }

        if audio:
            options["format"] = "bestaudio"
            options["postprocessors"] = [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ]

        ytdl = YoutubeDL(options)

        await asyncio.to_thread(ytdl.download, [url])

        self._now = (2, 100.0)
        self.finished_at = time.time()

    async def remove(self):
        ls = await asyncio.to_thread(os.listdir, "./temp")

        for i in ls:
            if self.key in i:
                await asyncio.to_thread(os.remove, f"./temp/{i}")


app = Sanic(__name__)
app.ctx.downloads = {}


async def remove_downloads():
    while True:
        await asyncio.sleep(60)

        for key, download in list(app.ctx.downloads.items()):
            if (
                download.get_status()["status"] == "finished"
                and time.time() - download.finished_at > 60 * 10
            ) or time.time() - download.created_at > 60 * 60:
                await download.remove()
                del app.ctx.downloads[key]


@app.get("/info")
async def route_info(req: Request):
    info = await Downloader.info(req.args.get("query"))

    return json(info)


@app.post("/download")
async def route_download(req: Request):
    key = str(uuid.uuid4())

    url = req.json.get("url", "")
    audio = bool(req.json.get("audio", False))

    if not re.match(r"^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$", url):
        return json({"error": "invalid url"}, 400)

    app.ctx.downloads[key] = Downloader(key)

    asyncio.create_task(app.ctx.downloads[key].download(url, audio))

    return json({"key": key})


@app.get("/status")
async def route_status(req: Request):
    key = req.args.get("key")

    if key not in app.ctx.downloads:
        return json({"error": "invalid key"}, 400)

    return json(app.ctx.downloads[key].get_status())


@app.get("/file")
async def route_file(req: Request):
    key = req.args.get("key")

    if key not in app.ctx.downloads:
        return json({"error": "invalid key"}, 400)

    ls = await asyncio.to_thread(os.listdir, "./temp")

    for i in ls:
        if key in i:
            return await file(f"./temp/{i}")

    return json({"error": "file not found"}, 404)


if not os.path.isdir("./temp"):
    os.makedirs("./temp")

app.add_task(remove_downloads())
app.run("0.0.0.0")
