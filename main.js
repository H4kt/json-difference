const fs = require('fs');

// Define your file paths here
const baseDir = "sample/";
const files = ["file_1.json", "file_2.json"];

// Read contents and parse JSON
const filesWithKeys = files.map(it => ({
  name: it,
  content: JSON.parse(fs.readFileSync(`${baseDir}${it}`, 'utf8'))
}));

// Construct a set of keys within all given files
const keys = filesWithKeys.map(it => gatherKeys(it.content))
  .reduce((acc, it) => {
    it.forEach(item => acc.add(item));
    return acc;
  });

// Discover all the missing keys per file
const missingByFile = new Map();

filesWithKeys.forEach(file => {
  keys.forEach(key => {

    if (hasKey(file.content, key)) {
      return
    }

    let missing = missingByFile.get(file);
    if (!missingByFile.has(file)) {
      missing = [];
      missingByFile.set(file, missing);
    }

    missing.push(key);

  });
});

if (missingByFile.size === 0) {
  console.log("Found no missing keys");
  return;
}

for (const file of missingByFile.keys()) {
  console.log(`Keys missing in ${file.name}`);
  missingByFile.get(file).forEach(it => console.log(it));
}

function gatherKeys(json, section = "", discoveredKeys = new Set()) {

  if (typeof json !== "object") {
    return discoveredKeys
  }

  const keys = Object.keys(json);
  const sectionPrefix = section !== "" ? `${section}.` : "";

  keys.forEach(it => {

    const section = `${sectionPrefix}${it}`;

    discoveredKeys.add(section);
    gatherKeys(json[it], section, discoveredKeys);

  });

  return discoveredKeys
}

function hasKey(json, key) {

  const path = key.split(".");

  let current = json;
  for (const section of path) {

    if (!(section in current)) {
      return false;
    }

    current = current[section];

  }

  return true;
}