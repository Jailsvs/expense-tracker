# PWA Icons

Este diretório deve conter os ícones do PWA nos seguintes tamanhos:

## Ícones Necessários:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Como Gerar os Ícones:

### Opção 1: Usar um serviço online
1. Vá para https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem 512x512px do logo
3. Baixe o pacote de ícones gerado
4. Coloque todos os arquivos .png neste diretório

### Opção 2: Usar ImageMagick (linha de comando)

```bash
# A partir de uma imagem base de 512x512px chamada logo.png

convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

### Opção 3: Criar um ícone simples temporário

Use este emoji como ícone temporário até ter um logo definitivo:
💰 (emoji de dinheiro)

Ou use este ícone de wallet em SVG como base.

## Recomendações de Design:

- Use fundo sólido (azul royal #1e40af)
- Ícone branco ou claro sobre o fundo
- Design simples e reconhecível
- Evite texto muito pequeno
- Margem de segurança de 10% nas bordas
