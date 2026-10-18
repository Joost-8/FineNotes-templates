import os
import sys

import pymupdf

out = sys.argv[1]
for name in sorted(os.listdir(out)):
    if not name.endswith(".pdf"):
        continue
    doc = pymupdf.open(os.path.join(out, name))
    stem = name[:-4]
    fonts = sorted({f[3] for p in doc for f in p.get_fonts()})
    print(stem, "pages", doc.page_count, "size", [round(v, 1) for v in doc[0].rect[2:]], "fonts", fonts)
    for i, page in enumerate(doc):
        links = page.get_links()
        if links:
            kinds = [(l.get("kind"), l.get("page"), l.get("name")) for l in links]
            print("  page", i + 1, "links", kinds)
        page.get_pixmap(dpi=110).save(os.path.join(out, "png", f"{stem}-{i + 1}.png"))
