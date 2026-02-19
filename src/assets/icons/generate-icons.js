#!/usr/bin/env node

/**
 * Gera todos os ícones PNG necessários para PWA a partir do SVG.
 * 
 * Uso:
 *   npm install sharp --save-dev
 *   node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, 'icon.svg');
const outputDir = __dirname;

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA...\n');

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`✅ ${size}x${size} → icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ${size}x${size}:`, error.message);
    }
  }

  console.log('\n✨ Ícones gerados com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('  1. Verifique os arquivos .png gerados nesta pasta');
  console.log('  2. Commit e push para o GitHub');
  console.log('  3. Aguarde o deploy automático');
  console.log('  4. Acesse o site no Chrome mobile');
}

// Validar se o SVG existe
if (!fs.existsSync(inputSvg)) {
  console.error('❌ Erro: icon.svg não encontrado!');
  console.error('   Certifique-se de que icon.svg está na mesma pasta.');
  process.exit(1);
}

generateIcons().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
