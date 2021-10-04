import asyncio
import os
import re
import time
import uuid
import json as json_m

import aiohttp
from sanic import Request, Sanic
from sanic.response import file, json
from youtube_dl import YoutubeDL

DATA_REGEX = re.compile(r'(?:window\["ytInitialData"]|ytInitialData)\W?=\W?({.*?});')


class Downloader:
    def __init__(self, key: str, url: str, audio: bool = False):
        self.created_at = time.time()
        self.finished_at = 999999999999999

        self.key = key
        self.url = url
        self.audio = audio
        self.title = ""

        self._now = (0, 0)

    @staticmethod
    async def info(query: str):
        async with aiohttp.ClientSession() as sess:
            if re.match(r"^(https?://)?(www.youtube.com|youtu.?be)/.+$", query):
                async with sess.get(
                    query,
                    headers={
                        "x-youtube-client-name": "1",
                        "x-youtube-client-version": "2.20201030.01.00",
                    },
                ) as resp:
                    raw: str = await resp.text()
                    data = DATA_REGEX.search(raw)
                    data = json_m.loads(data.group(1))

                    renderer = data["contents"]["videoPrimaryInfoRenderer"]

                    return {
                        "id": renderer["videoId"],
                        "title": renderer["title"]["runs"][0]["text"],
                        "webpage_url": "https://www.youtube.com/watch?v="
                        + renderer["videoId"],
                        "duration": sum(
                            [
                                int(value) * (60 ** index)
                                for index, value in enumerate(
                                    reversed(
                                        renderer["lengthText"]["simpleText"].split(":")
                                    )
                                )
                            ]
                        ),
                    }
            else:
                async with sess.get(
                    "https://www.youtube.com/results",
                    headers={
                        "x-youtube-client-name": "1",
                        "x-youtube-client-version": "2.20201030.01.00",
                    },
                    params={"search_query": query},
                ) as resp:
                    raw: str = await resp.text()
                    data = DATA_REGEX.search(raw)
                    data = json_m.loads(data.group(1))

                    renderer = data["contents"]["twoColumnSearchResultsRenderer"][
                        "primaryContents"
                    ]["sectionListRenderer"]["contents"][0]["itemSectionRenderer"][
                        "contents"
                    ][0][
                        "videoRenderer"
                    ]
                    return {
                        "id": renderer["videoId"],
                        "title": renderer["title"]["runs"][0]["text"],
                        "webpage_url": "https://www.youtube.com/watch?v="
                        + renderer["videoId"],
                        "uploader": renderer["ownerText"]["runs"][0]["text"],
                        "duration": sum(
                            [
                                int(value) * (60 ** index)
                                for index, value in enumerate(
                                    reversed(
                                        renderer["lengthText"]["simpleText"].split(":")
                                    )
                                )
                            ]
                        ),
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

    async def download(self):
        options = {
            "format": "best",
            "merge-output-format": "mp4",
            "outtmpl": f"./temp/{self.key}.%(ext)s",
            "progress_hooks": [self._progress_hook],
            "noplaylist": True,
            "quiet": True,
        }

        if self.audio:
            options["format"] = "bestaudio"
            options["postprocessors"] = [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ]

        ytdl = YoutubeDL(options)

        info = await asyncio.to_thread(ytdl.extract_info, self.url)

        self.title = info["title"]
        self._now = (2, 100.0)
        self.finished_at = time.time()

    async def remove(self):
        ext = "mp3" if self.audio else "mp4"
        await asyncio.to_thread(os.remove, f"./temp/{self.key}.{ext}")


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

    if not re.match(r"^(https?://)?(www\.youtube\.com|youtu\.?be)/.+$", url):
        return json({"error": "invalid url"}, 400)

    app.ctx.downloads[key] = Downloader(key, url, audio)

    asyncio.create_task(app.ctx.downloads[key].download())

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

    download = app.ctx.downloads[key]
    ext = "mp3" if download.audio else "mp4"

    location = f"./temp/{download.key}.{ext}"
    filename = f"{download.title}.{ext}"

    return await file(location, filename=filename)


if not os.path.isdir("./temp"):
    os.makedirs("./temp")

app.add_task(remove_downloads())
app.run("0.0.0.0")
