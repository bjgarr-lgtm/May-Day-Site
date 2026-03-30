param(
  [string]$InputDir = ".\archive-pdfs",
  [string]$OutputDir = ".\public\archive",
  [string]$PdftoppmPath = "pdftoppm"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $InputDir)) {
  throw "Input directory not found: $InputDir"
}

if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$pdfs = Get-ChildItem -Path $InputDir -Filter *.pdf | Sort-Object Name

foreach ($pdf in $pdfs) {
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($pdf.Name).ToLower() `
    -replace '[^a-z0-9]+','-' `
    -replace '^-|-$',''

  $target = Join-Path $OutputDir $slug
  if (!(Test-Path $target)) {
    New-Item -ItemType Directory -Force -Path $target | Out-Null
  }

  $prefix = Join-Path $target "page"

  Write-Host "Converting $($pdf.Name) -> $target"
  & $PdftoppmPath -png -r 180 $pdf.FullName $prefix

  $generated = Get-ChildItem -Path $target -Filter "page-*.png" | Sort-Object Name
  $i = 1
  foreach ($file in $generated) {
    $newName = ("page-{0:D3}.png" -f $i)
    if ($file.Name -ne $newName) {
      Rename-Item -Path $file.FullName -NewName $newName
    }
    $i++
  }
}

Write-Host "Done."
