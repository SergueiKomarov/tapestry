#!/usr/bin/env python3
"""Check static page discoverability without third-party dependencies."""

import json
import unittest
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://www.tapestryholistic.health"


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.titles = []
        self.metadata = {}
        self.canonicals = []
        self.links = []
        self.ids = set()
        self.schemas = []
        self.in_title = False
        self.in_schema = False
        self.schema_text = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "title":
            self.in_title = True
            self.titles.append("")
        if tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key:
                self.metadata.setdefault(key, []).append(attrs.get("content", ""))
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag in ("a", "link") and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag in ("img", "script") and attrs.get("src"):
            self.links.append(attrs["src"])
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_schema = True
            self.schema_text = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_schema:
            self.schemas.append(json.loads(self.schema_text))
            self.in_schema = False

    def handle_data(self, data):
        if self.in_title:
            self.titles[-1] += data
        if self.in_schema:
            self.schema_text += data


def page_url(path):
    relative = path.relative_to(ROOT).as_posix()
    return ORIGIN + "/" + relative.removesuffix("index.html")


class SeoChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pages = {}
        for path in ROOT.rglob("*.html"):
            if any(part.startswith(".") for part in path.relative_to(ROOT).parts):
                continue
            page = Page()
            page.feed(path.read_text(encoding="utf-8"))
            cls.pages[page_url(path)] = (path, page)

    def test_metadata_schema_and_links(self):
        titles = set()
        descriptions = set()
        for url, (path, page) in self.pages.items():
            with self.subTest(page=str(path.relative_to(ROOT))):
                self.assertEqual(len(page.titles), 1)
                title = page.titles[0].strip()
                self.assertTrue(title)
                self.assertNotIn(title, titles)
                titles.add(title)
                description = page.metadata.get("description", [])
                self.assertEqual(len(description), 1)
                self.assertTrue(description[0].strip())
                self.assertNotIn(description[0], descriptions)
                descriptions.add(description[0])
                self.assertEqual(page.canonicals, [url])
                for key in ("og:type", "og:title", "og:description", "og:url", "og:site_name",
                            "og:image", "og:image:alt", "twitter:card", "twitter:title",
                            "twitter:description", "twitter:image", "twitter:image:alt"):
                    self.assertEqual(len(page.metadata.get(key, [])), 1, key)
                    self.assertTrue(page.metadata[key][0].strip(), key)
                self.assertEqual(page.metadata["og:url"], [url])
                for key in ("og:image", "twitter:image"):
                    image = urlsplit(page.metadata[key][0])
                    self.assertEqual(f"{image.scheme}://{image.netloc}", ORIGIN)
                    self.assertTrue((ROOT / image.path.lstrip("/")).is_file())
                types = {schema.get("@type") for schema in page.schemas}
                if url == ORIGIN + "/":
                    business = next(s for s in page.schemas if s.get("@type") == "LocalBusiness")
                    self.assertTrue(all(business.get(k) for k in ("name", "url", "telephone", "address")))
                else:
                    self.assertIn("BreadcrumbList", types)
                if "/blog/" in url and url != ORIGIN + "/blog/":
                    article = next(s for s in page.schemas if s.get("@type") == "BlogPosting")
                    self.assertTrue(all(article.get(k) for k in ("headline", "datePublished", "author")))
                    self.assertEqual(article["mainEntityOfPage"], url)
                for link in page.links:
                    target = urlsplit(urljoin(url, link))
                    if f"{target.scheme}://{target.netloc}" != ORIGIN:
                        continue
                    file_path = ROOT / unquote(target.path).lstrip("/")
                    if file_path.is_dir():
                        file_path /= "index.html"
                    self.assertTrue(file_path.is_file(), f"broken local link: {link}")
                    if target.fragment and file_path.suffix == ".html":
                        target_url = ORIGIN + target.path
                        target_page = self.pages.get(target_url)
                        self.assertIsNotNone(target_page, f"unknown page: {link}")
                        self.assertIn(unquote(target.fragment), target_page[1].ids, f"missing fragment: {link}")

    def test_sitemap_covers_pages(self):
        tree = ET.parse(ROOT / "sitemap.xml")
        urls = [item.text for item in tree.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        self.assertEqual(len(urls), len(set(urls)))
        self.assertEqual(set(urls), set(self.pages))

    def test_robots_and_fertility_navigation(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8").lower()
        self.assertIn("user-agent: *", robots)
        self.assertIn("allow: /", robots)
        self.assertNotIn("disallow:", robots)
        self.assertIn("sitemap: " + ORIGIN.lower() + "/sitemap.xml", robots)
        self.assertIn("/fertility/", self.pages[ORIGIN + "/"][1].links)


if __name__ == "__main__":
    unittest.main()
