This patch gives you a bulk workflow so you do not enter 204 pages by hand like a doomed Victorian clerk.

What it adds
- scripts/generate-labor-archive.mjs
- scripts/convert-pdfs-to-images.ps1
- src/archive/laborArchiveCollections.config.js
- src/archive/laborArchiveData.js

How to use

1. Put all archive PDFs in:
   archive-pdfs/

2. Convert them in bulk to page images:
   powershell -ExecutionPolicy Bypass -File .\scripts\convert-pdfs-to-images.ps1

This creates:
   public/archive/<slug>/page-001.png
   public/archive/<slug>/page-002.png
   etc.

3. Edit:
   src/archive/laborArchiveCollections.config.js

Only one entry per collection or section. Not one per page.

Example:
- aberdeen-free-speech
- william-mckay
- laura-law
- everett-centralia-seattle
- misc-labor-history

4. Generate the site data automatically:
   node .\scripts\generate-labor-archive.mjs

This writes:
   src/archive/laborArchiveData.js

5. Build and deploy.

Important notes

- You do not upload pages one by one into code.
- You bulk drop images into public/archive folders.
- The generator script makes the page list automatically.
- If you want page level titles and summaries later, add them after the bulk import is working.

About your Acrobat errors

Acrobat is choking because these PDFs are weirdly encoded or image extraction is not straightforward.
This patch avoids Acrobat entirely and uses pdftoppm in batch.

You need pdftoppm installed on your machine.
Fastest Windows route is Poppler.
If pdftoppm is already in PATH, the script will just work.
If not, pass the path manually:

powershell -ExecutionPolicy Bypass -File .\scripts\convert-pdfs-to-images.ps1 -PdftoppmPath "C:\path\to\pdftoppm.exe"

Recommended archive folder shape

public/archive/
  aberdeen-free-speech/
  william-mckay/
  laura-law/
  everett-centralia-seattle/
  misc-labor-history/

This is the sane workflow.
