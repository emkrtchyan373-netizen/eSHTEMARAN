Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\erikm\OneDrive\Desktop\materials\ONLYLOGO.png'
$destDir = 'c:\Users\erikm\OneDrive\Desktop\FIGMAcode\public\assets'

$original = [System.Drawing.Image]::FromFile($srcPath)

# Use fresh filenames that don't exist yet
$targets = @(
    @{ size = 192; file = "pwa-192.png"; purpose = "any" },
    @{ size = 512; file = "pwa-512.png"; purpose = "any" },
    @{ size = 192; file = "pwa-192-mask.png"; purpose = "maskable" },
    @{ size = 512; file = "pwa-512-mask.png"; purpose = "maskable" }
)

foreach ($t in $targets) {
    $sz = $t.size
    $bitmap = New-Object System.Drawing.Bitmap($sz, $sz)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.DrawImage($original, 0, 0, $sz, $sz)
    $graphics.Dispose()

    $outFile = "$destDir\" + $t.file
    $bitmap.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()

    $fileSize = (Get-Item $outFile).Length
    Write-Host "Saved $($t.file) - $fileSize bytes"
}

$original.Dispose()
Write-Host "All done!"
