$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
Push-Location $taskRoot
try {
    npm --prefix database run validate
    if ($LASTEXITCODE -ne 0) { throw 'Falha na validação dos dados.' }
    npm --prefix web/frontend run build
    if ($LASTEXITCODE -ne 0) { throw 'Falha no build do frontend.' }
    $taskWebRoot = Join-Path $taskRoot 'web/backend/GuiaDaTi.Api/wwwroot'
    $expectedRoot = [System.IO.Path]::GetFullPath((Join-Path $taskRoot 'web/backend/GuiaDaTi.Api/wwwroot'))
    if ([System.IO.Path]::GetFullPath($taskWebRoot) -ne $expectedRoot -or -not $expectedRoot.StartsWith($taskRoot + [System.IO.Path]::DirectorySeparatorChar)) { throw 'Destino de build inválido.' }
    if (Test-Path -LiteralPath $taskWebRoot) { Remove-Item -LiteralPath $taskWebRoot -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $taskWebRoot | Out-Null
    # Copia somente os arquivos públicos, excluindo o bundle usado para renderizar no build.
    Get-ChildItem -LiteralPath (Join-Path $taskRoot 'web/frontend/dist') -Force |
        Where-Object { $_.Name -ne 'server' } |
        Copy-Item -Destination $taskWebRoot -Recurse -Force
    dotnet build web/backend/GuiaDaTi.Api
    if ($LASTEXITCODE -ne 0) { throw 'Falha no build do backend.' }
} finally { Pop-Location }
