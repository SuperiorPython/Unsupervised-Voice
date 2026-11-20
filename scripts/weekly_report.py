"""Weekly channel report. Plain Python, standard library only, no AI.

Reads the video table in README.md, takes the YouTube link of every row, asks the
YouTube Data API for the channel and those videos, and writes:
  reports/YYYY-MM-DD.md       the readable report
  reports/latest.md           a copy of the newest report
  reports/data/YYYY-MM-DD.json  the numbers, used next week to show changes

Environment: YT_API_KEY (required), YT_HANDLE (default unsupervisedvoice).
"""
import datetime
import glob
import json
import os
import re
import sys
import urllib.parse
import urllib.request

README = "README.md"
API = "https://www.googleapis.com/youtube/v3/"
ID_PATTERNS = [
    r"youtu\.be/([A-Za-z0-9_-]{11})",
    r"youtube\.com/watch\?[^)\s]*?v=([A-Za-z0-9_-]{11})",
    r"youtube\.com/(?:shorts|live|embed)/([A-Za-z0-9_-]{11})",
]


def api(endpoint, **params):
    params["key"] = os.environ["YT_API_KEY"]
    url = API + endpoint + "?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"YouTube API error {e.code} on {endpoint}: {e.read().decode()[:300]}")


def video_id(text):
    for p in ID_PATTERNS:
        m = re.search(p, text)
        if m:
            return m.group(1)
    return None


def read_table(path=README):
    """Rows of the README video table as dicts. Needs the header starting '| # |'."""
    rows, in_table = [], False
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if line.startswith("| # |"):
            in_table = True
            continue
        if not in_table:
            continue
        if not line.startswith("|"):
            break
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 7 or set(cells[0]) <= set("-: "):
            continue
        idea = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", cells[1])
        rows.append({"num": cells[0], "idea": idea, "released": cells[5].lower(),
                     "links": cells[6], "vid": video_id(cells[6])})
    return rows


def num(x):
    return int(x) if x is not None else 0


def delta(now, before):
    if before is None:
        return ""
    d = now - before
    return f" ({d:+d})"


def load_previous(today):
    files = sorted(f for f in glob.glob("reports/data/*.json") if os.path.basename(f)[:-5] < today)
    return json.load(open(files[-1])) if files else None


def main():
    handle = os.environ.get("YT_HANDLE", "unsupervisedvoice").lstrip("@")
    today = datetime.date.today().isoformat()
    rows = read_table()

    ch = api("channels", part="snippet,statistics", forHandle=handle).get("items")
    if not ch:
        sys.exit(f"No channel found for handle @{handle}.")
    ch = ch[0]
    cs = ch["statistics"]
    channel = {"title": ch["snippet"]["title"], "subs": num(cs.get("subscriberCount")),
               "views": num(cs.get("viewCount")), "videos": num(cs.get("videoCount"))}

    ids = [r["vid"] for r in rows if r["vid"]]
    stats = {}
    if ids:
        for item in api("videos", part="snippet,statistics", id=",".join(ids[:50])).get("items", []):
            s = item["statistics"]
            stats[item["id"]] = {"title": item["snippet"]["title"],
                                 "published": item["snippet"]["publishedAt"][:10],
                                 "views": num(s.get("viewCount")), "likes": num(s.get("likeCount")),
                                 "comments": num(s.get("commentCount"))}

    prev = load_previous(today)
    pc = (prev or {}).get("channel", {})
    pv = (prev or {}).get("videos", {})

    out = [f"# Weekly report: {channel['title']} (@{handle})", "", f"Generated {today}. "
           + (f"Changes are against the report from {prev['date']}." if prev else "First report, so no changes shown yet."),
           "", "## Channel", "",
           f"- Subscribers: {channel['subs']}{delta(channel['subs'], pc.get('subs'))}",
           f"- Total views: {channel['views']}{delta(channel['views'], pc.get('views'))}",
           f"- Public videos: {channel['videos']}{delta(channel['videos'], pc.get('videos'))}", "",
           "## Videos", ""]
    if stats:
        out += ["| # | Idea | Published | Views | Likes | Comments |", "|---|---|---|---|---|---|"]
        for r in rows:
            s = stats.get(r["vid"])
            if not s:
                continue
            p = pv.get(r["vid"], {})
            out.append(f"| {r['num']} | {r['idea']} | {s['published']} | {s['views']}{delta(s['views'], p.get('views'))} "
                       f"| {s['likes']}{delta(s['likes'], p.get('likes'))} | {s['comments']}{delta(s['comments'], p.get('comments'))} |")
    else:
        out.append("No videos with a YouTube link in the README table yet.")

    notes = []
    for r in rows:
        if r["released"] == "yes" and not r["vid"]:
            notes.append(f"- Video {r['num']} ({r['idea']}) is marked released but has no readable YouTube link in the Links column.")
        if r["vid"] and r["vid"] not in stats:
            notes.append(f"- Video {r['num']} ({r['idea']}): the API returned nothing for its link (private, deleted, or a typo).")
    if notes:
        out += ["", "## Needs fixing", ""] + notes

    out += ["", "## vidIQ and Studio numbers (paste by hand)", "",
            "The API doesn't expose click-through rate, retention or vidIQ scores. Paste them here if you want them on record.", "",
            "- CTR: ", "- Average view duration / retention: ", "- vidIQ score or keyword notes: ", ""]

    os.makedirs("reports/data", exist_ok=True)
    text = "\n".join(out)
    open(f"reports/{today}.md", "w", encoding="utf-8", newline="\n").write(text)
    open("reports/latest.md", "w", encoding="utf-8", newline="\n").write(text)
    json.dump({"date": today, "channel": channel, "videos": stats},
              open(f"reports/data/{today}.json", "w"), indent=2)
    print(f"Wrote reports/{today}.md")


if __name__ == "__main__":
    main()
