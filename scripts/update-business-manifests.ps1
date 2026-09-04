param(
    [string]$BunGioDirectory,
    [string]$HarryPerfumeDirectory,
    [string]$BunGioOutputFile,
    [string]$HarryPerfumeOutputFile
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $BunGioDirectory) {
    $BunGioDirectory = Join-Path $projectRoot 'jobs\bun-gio-heo-minh-nhat'
}
if (-not $HarryPerfumeDirectory) {
    $HarryPerfumeDirectory = Join-Path $projectRoot 'jobs\harry-perfume'
}
if (-not $BunGioOutputFile) {
    $BunGioOutputFile = Join-Path $projectRoot 'jobs\bun-gio-heo-images.js'
}
if (-not $HarryPerfumeOutputFile) {
    $HarryPerfumeOutputFile = Join-Path $projectRoot 'jobs\harry-perfume-images.js'
}

$supportedExtensions = @('.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif')

function Escape-JavaScriptString {
    param([string]$Value)
    return ($Value -replace '\\', '\\' -replace "'", "\'")
}

function Write-JobManifest {
    param(
        [string]$ImageDirectory,
        [string]$OutputFile,
        [string]$ManifestVariable,
        [string]$FolderPrefix,
        [string]$DefaultAlt
    )

    if (-not (Test-Path -LiteralPath $ImageDirectory)) {
        Write-Warning "Directory not found: $ImageDirectory"
        return 0
    }

    $outputDirectory = Split-Path -Parent $OutputFile
    if (-not (Test-Path -LiteralPath $outputDirectory)) {
        New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    }

    $imageFiles = Get-ChildItem -LiteralPath $ImageDirectory -File |
        Where-Object { $supportedExtensions -contains $_.Extension.ToLowerInvariant() } |
        Sort-Object Name

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("window.$ManifestVariable = [")

    for ($index = 0; $index -lt $imageFiles.Count; $index += 1) {
        $file = $imageFiles[$index]
        $src = $FolderPrefix + '/' + $file.Name
        $alt = $DefaultAlt + ' - ' + [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $suffix = if ($index -lt ($imageFiles.Count - 1)) { ',' } else { '' }
        $lines.Add("    { src: '$(Escape-JavaScriptString $src)', alt: '$(Escape-JavaScriptString $alt)' }$suffix")
    }

    $lines.Add('];')
    $lines.Add('')

    $content = [string]::Join([Environment]::NewLine, $lines)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($OutputFile, $content, $utf8NoBom)

    return $imageFiles.Count
}

$bunGioCount = Write-JobManifest -ImageDirectory $BunGioDirectory -OutputFile $BunGioOutputFile -ManifestVariable 'bunGioHeoImageManifest' -FolderPrefix 'bun-gio-heo-minh-nhat' -DefaultAlt 'Bún Giò Heo Minh Nhật'
$perfumeCount = Write-JobManifest -ImageDirectory $HarryPerfumeDirectory -OutputFile $HarryPerfumeOutputFile -ManifestVariable 'harryPerfumeImageManifest' -FolderPrefix 'harry-perfume' -DefaultAlt 'Harry Perfume'

Write-Host "Updated Bun Gio Heo manifest: $BunGioOutputFile ($bunGioCount images)"
Write-Host "Updated Harry Perfume manifest: $HarryPerfumeOutputFile ($perfumeCount images)"