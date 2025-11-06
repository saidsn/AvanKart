import fs from "fs";
import path from "path";

const iconsDir = path.join(process.cwd(), "public", "stratis");
const outputCSS = path.join(process.cwd(), "public", "icons.css");

const iconMap = new Map();

const traverseFolders = (dir, relativePath = "") => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      traverseFolders(fullPath, path.join(relativePath, file));
    } else if (file.endsWith(".svg")) {
      const iconName = path.basename(file, ".svg");

      // Aynı isimde ikon varsa hangi klasörlerde olduğunu göster
      if (iconMap.has(iconName)) {
        iconMap.get(iconName).push(relativePath);
      } else {
        iconMap.set(iconName, [relativePath]);
      }
    }
  });
};

traverseFolders(iconsDir);

let cssContent = `/* Auto-generated icon classes */\n\n`;
cssContent += `.icon { 
  display: inline-block; 
  width: 1em; 
  height: 1em; 
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: currentColor;
}\n\n`;

iconMap.forEach((folders, iconName) => {
  const iconPath = `/public/stratis/${folders[0]}/${iconName}.svg`;
  cssContent += `.stratis-${iconName} { 
    -webkit-mask-image: url('${iconPath}'); 
    mask-image: url('${iconPath}'); 
  }\n`;

  // Eğer bir ikon birden fazla klasörde varsa uyarı ver
  if (folders.length > 1) {
    console.log(`⚠️  Aynı isimde birden fazla ikon bulundu: ${iconName} (${folders.join(", ")})`);
  }
});

// CSS dosyasını yaz
fs.writeFileSync(outputCSS, cssContent);
console.log("✅ Icons CSS başarıyla oluşturuldu!");
