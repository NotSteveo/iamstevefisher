#!/usr/bin/env python3
"""One-off script: download every image/video referenced in content-crawl.json
into public/, and write lib/asset-map.json mapping remote CDN URL -> local path.
Not needed after the initial import; safe to delete once assets are committed.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRAWL = os.path.join(ROOT, "data", "content.json")
PUBLIC_IMAGES = os.path.join(ROOT, "public", "images")
PUBLIC_VIDEOS = os.path.join(ROOT, "public", "videos")
ASSET_MAP = os.path.join(ROOT, "lib", "asset-map.json")

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif")


def sanitize(name):
    return re.sub(r"[^a-zA-Z0-9._-]", "-", name)


def collect_urls(node, images, videos):
    if isinstance(node, dict):
        for key in ("url", "coverImage"):
            val = node.get(key)
            if isinstance(val, str) and val.lower().split("?")[0].endswith(IMAGE_EXTS):
                images.add(val)
        for key in ("mp4", "poster"):
            v = node.get(key)
            if isinstance(v, str):
                if key == "poster":
                    images.add(v)
                else:
                    videos.add(v)
        for v in node.values():
            collect_urls(v, images, videos)
    elif isinstance(node, list):
        for v in node:
            collect_urls(v, images, videos)


def download(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    result = subprocess.run(["curl", "-sL", "-f", url, "-o", dest])
    if result.returncode != 0:
        print(f"FAILED: {url}", file=sys.stderr)
        if os.path.exists(dest):
            os.remove(dest)
        return False
    return True


def main():
    with open(CRAWL) as f:
        data = json.load(f)

    images = set()
    videos = set()
    collect_urls(data, images, videos)

    asset_map = {}
    ok, fail = 0, 0

    for url in sorted(images):
        basename = sanitize(url.split("/")[-1])
        dest = os.path.join(PUBLIC_IMAGES, basename)
        if download(url, dest):
            asset_map[url] = f"/images/{basename}"
            ok += 1
        else:
            fail += 1

    for url in sorted(videos):
        basename = sanitize(url.split("/")[-1])
        dest = os.path.join(PUBLIC_VIDEOS, basename)
        if download(url, dest):
            asset_map[url] = f"/videos/{basename}"
            ok += 1
        else:
            fail += 1

    os.makedirs(os.path.dirname(ASSET_MAP), exist_ok=True)
    with open(ASSET_MAP, "w") as f:
        json.dump(asset_map, f, indent=2, sort_keys=True)

    print(f"Downloaded {ok} assets, {fail} failed. Map written to {ASSET_MAP}")


if __name__ == "__main__":
    main()
