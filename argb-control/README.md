# Posto ARGB Control 1.0.0

Aplicativo Windows para controlar a iluminação ARGB da MSI MAG B550 TOMAHAWK via OpenRGB SDK.

## Atualização automática

O aplicativo usa `electron-updater` com GitHub Releases. O workflow `.github/workflows/release-argb.yml` gera o instalador Windows e publica os metadados quando uma tag `argb-v*` é criada.

A atualização é baixada em segundo plano e instalada na próxima abertura.

## Publicar nova versão

1. Altere `version` em `package.json`.
2. Faça commit/push.
3. Crie uma tag como `argb-v1.0.1`.
4. O GitHub Actions gera `Posto-ARGB-Control-Setup-1.0.1.exe` e `latest.yml`.

## OpenRGB

Abra o OpenRGB e deixe o SDK Server habilitado na porta 6742.

## Observação de assinatura

O build inicial não possui certificado Authenticode; por isso a verificação de assinatura do instalador está desabilitada. Para distribuição pública, recomenda-se adicionar assinatura de código Windows.
