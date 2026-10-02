param([string]$Ref = 'origin/main')
$ErrorActionPreference = 'Stop'
if ($Ref -notmatch '^[a-zA-Z0-9][a-zA-Z0-9._/-]*$') { throw 'Referencia Git invalida.' }
$taskRoot = Split-Path $PSScriptRoot -Parent
Push-Location $taskRoot
try {
    git submodule update --init database
    if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel inicializar os dados.' }
    $pending = git -C database status --porcelain
    if ($LASTEXITCODE -ne 0 -or $pending) { throw 'O catalogo tem alteracoes locais. Preserve-as antes de atualizar.' }
    git -C database fetch origin
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao buscar dados.' }
    git -C database checkout --detach $Ref
    if ($LASTEXITCODE -ne 0) { throw 'Referencia nao encontrada.' }
    & (Join-Path $PSScriptRoot 'build.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao validar a nova versao.' }
    Write-Output 'Dados atualizados e build validado. Revise e registre o ponteiro database em um commit da aplicacao.'
} finally { Pop-Location }
