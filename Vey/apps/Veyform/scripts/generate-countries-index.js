const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Path to data directory (relative to script location)
const dataPath = path.join(__dirname, '../../../../data');
const outputPath = path.join(__dirname, '../public/countries-index.json');

function getAllYamlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllYamlFiles(filePath, fileList);
    } else if (file.endsWith('.yaml') && !filePath.includes('libaddressinput')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function generateCountriesIndex() {
  console.log('Generating countries index...');
  
  const yamlFiles = getAllYamlFiles(dataPath);
  const countries = [];
  
  yamlFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);
      
      if (data && data.iso_codes && data.iso_codes.alpha2) {
        const countryInfo = {
          code: data.iso_codes.alpha2,
          name: data.name?.en || 'Unknown',
          localName: data.name?.local?.[0]?.value || data.name?.en,
          languages: (data.languages || []).map(lang => ({
            name: lang.name,
            code: lang.code,
            script: lang.script,
            role: lang.role,
            countryName: lang.country_name,
            fieldLabels: lang.field_labels
          })),
          addressFormat: {
            order: data.address_format?.order_variants?.[0]?.order || data.address_format?.order || [],
            postalCode: data.address_format?.postal_code,
            building: data.address_format?.building,
            floor: data.address_format?.floor,
            room: data.address_format?.room
          },
          continent: data.continent,
          subregion: data.subregion
        };
        
        countries.push(countryInfo);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
  
  // Sort by country name
  countries.sort((a, b) => a.name.localeCompare(b.name));
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(countries, null, 2));
  console.log(`Generated countries index with ${countries.length} countries at ${outputPath}`);
}

generateCountriesIndex();
