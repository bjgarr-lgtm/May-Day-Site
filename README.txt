Build fix patch.

Why the build failed:
src/pages/LaborHistoryPage.jsx imports ../archive/laborArchiveData
but that file does not exist in the repo.

This zip adds:
- src/archive/laborArchiveData.js
- src/pages/LaborHistoryPage.jsx

What to do:
Drop these files into the repo, replacing the page file if needed, then redeploy.

Notes:
This only fixes the actual build error shown in your log.
It does not add page images. The archive page will still build even if the images are not there yet.
