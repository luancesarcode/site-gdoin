"""Validate and package only the new GDOIN website for GitHub Pages."""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import shutil
import sys


REPOSITORY = Path(__file__).resolve().parents[2]
SOURCE = REPOSITORY / "site"
OUTPUT = REPOSITORY / "_site"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = []
        self.references = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        for attr in ("src", "href"):
            if attrs.get(attr):
                self.references.append(attrs[attr])


def validate():
    files = {path.relative_to(SOURCE).as_posix(): path for path in SOURCE.rglob("*") if path.is_file()}
    pages = {name: Page(path) for name, path in files.items() if path.suffix == ".html"}
    errors = []

    def check_reference(owner, reference):
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            return
        # Reject paths escaping the published directory; check exact case for Linux.
        target = (owner.parent / unquote(url.path)).resolve() if url.path else owner
        if not target.is_relative_to(SOURCE):
            errors.append(f"{owner.name}: path outside the website: {reference}")
            return
        name = target.relative_to(SOURCE).as_posix()
        if name not in files:
            errors.append(f"{owner.name}: missing file or wrong case: {reference}")
        elif url.fragment and name in pages and unquote(url.fragment) not in pages[name].ids:
            errors.append(f"{owner.name}: missing anchor: {reference}")

    for name, page in pages.items():
        for identifier, count in Counter(page.ids).items():
            if count > 1:
                errors.append(f"{name}: duplicate id: {identifier}")
        for reference in page.references:
            check_reference(page.path, reference)

    for path in files.values():
        if path.is_symlink():
            errors.append(f"Symbolic links are not published: {path.name}")
        if path.suffix == ".css":
            for match in re.finditer(r"url\(\s*(['\"]?)(.*?)\1\s*\)", path.read_text(encoding="utf-8")):
                check_reference(path, match.group(2))

    if errors:
        print("Website validation failed:\n" + "\n".join(errors), file=sys.stderr)
        raise SystemExit(1)
    print(f"Validated {len(pages)} pages, local links, anchors and CSS assets.")


def main():
    validate()
    if "--check" in sys.argv:
        return
    if OUTPUT.exists():
        raise SystemExit("The _site output already exists; use a fresh checkout for packaging.")
    # Source is deliberately restricted: legacy mirrors, access files and tools
    # elsewhere in the repository never enter the deployment artifact.
    shutil.copytree(SOURCE, OUTPUT, ignore=shutil.ignore_patterns("*.prompt.txt"))
    (OUTPUT / ".nojekyll").touch()
    print(f"Packaged the new website into {OUTPUT.name}/.")


if __name__ == "__main__":
    main()
