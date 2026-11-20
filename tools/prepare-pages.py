"""Stage the playable Pages mirror using the same ignore rules as Workers Assets."""
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def tracked(*options):
    names = subprocess.check_output(["git", "ls-files", "-z", "--cached", *options], cwd=ROOT)
    return {Path(os.fsdecode(name)) for name in names.split(b"\0") if name}


def prepare(destination):
    destination.mkdir(parents=True)
    public = tracked() - tracked("--ignored", "--exclude-from=.assetsignore")
    for name in sorted(public):
        output = destination / name
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / name, output)

    index = destination / "index.html"
    html = index.read_text(encoding="utf-8")
    head, end, body = html.partition("</head>")
    if not end:
        raise ValueError("Expected a complete homepage head")
    index.write_text(head + '<meta name="robots" content="noindex, follow">\n' + end + body,
                     encoding="utf-8")


if __name__ == "__main__":
    prepare(Path(sys.argv[1]))
