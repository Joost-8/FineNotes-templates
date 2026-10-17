# FineNotes templates

Free paper templates for [FineNotes](https://github.com/Joost-8/FineNotes),
handwritten notebooks for Obsidian. Each one shows up in FineNotes' template
gallery (**Browse template gallery** in the command palette). **Add to My
templates** puts every page of it next to the built-in papers.

## What a template is

One folder in `templates/`, named after the template's id (lower case, words
joined by dashes):

```
templates/weekly-planner/
  template.json   what it is, who made it, its licence
  planner.pdf     the paper: a PDF, PNG or JPEG
  preview.png     a picture of its first page, about 600 px wide
```

Only **PDF, PNG and JPEG** files are accepted, up to **40 MB**, checked by
their contents and not just their names. These formats cannot run code, so a
template is safe to open. Links inside a PDF, such as a planner's month tabs
or an index, keep working in FineNotes.

### template.json

```json
{
  "id": "weekly-planner",
  "name": "Weekly planner",
  "author": "Your name",
  "description": "Monday start, with an index page that links to each day.",
  "version": "1",
  "licence": "cc-by",
  "category": "planner",
  "tags": ["weekly", "hyperlinked"],
  "file": "planner.pdf",
  "preview": "preview.png",
  "pages": 8
}
```

- **licence**, one of:
  - `personal`: personal use only;
  - `commercial`: personal and commercial use;
  - `cc-by`: CC BY 4.0, share and adapt with credit;
  - `cc0`: no rights reserved.
- **category**, one of `planner`, `study`, `journal`, `work`, `paper` or
  `other`.
- **shop** (optional): for a template you sell, give its page in your own shop
  (Etsy, Gumroad and the like) as `"shop": "https://…"`, and leave out `file`.
  FineNotes links to it and sells nothing itself.

## Adding yours

1. Fork this repository and add your folder under `templates/`.
2. Run `node scripts/build-index.mjs --check` to see that it passes.
3. Open a pull request. The same check runs on it, then it is reviewed by a
   person.

You can also open an issue with the **Submit a template** form and attach
your files.

Only submit designs that are yours to share. To have a template taken down,
open an issue.

## For maintainers

`index.json` is built from every `template.json` with
`node scripts/build-index.mjs`, and on every push to `main` by the workflow in
`.github/workflows`. FineNotes reads it from
`https://raw.githubusercontent.com/Joost-8/FineNotes-templates/main/index.json`.
To retire a template while keeping old links working, add `"retired": true` to
its `template.json`.
