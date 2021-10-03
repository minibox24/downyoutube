from youtube_dl import YoutubeDL
import asyncio
import time
import re


class Downloader:
    def __init__(self, key: str):
        self.created_at = time.time()

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
