function parseDSXFile(text) {
  let obj = {};
  let currentSection = "";
  let currentSubrecord = {};
  let headerInfo = {};
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    if (line.startsWith("BEGIN HEADER")) {
      currentSection = "HEADER";
      continue;
    }

    if (currentSection === "HEADER") {
      if (line.startsWith("END HEADER")) {
        currentSection = "";
        continue;
      }

      const [key, value] = line.split(/"(.+)"/).filter(Boolean);
      headerInfo[key.trim()] = value.trim();
      continue;
    }

    if (line.startsWith("BEGIN")) {
      currentSection = line.substring(6).trim();
      if (!obj[currentSection]) {
        obj[currentSection] = [];
      }
      currentSubrecord = {};
      obj[currentSection].push(currentSubrecord);
      continue;
    }

    if (line.startsWith("END")) {
      currentSection = "";
      continue;
    }

    if (currentSection) {
      const keyValueMatch = line.match(/^(\w+)\s+"?(.*)"?$/);
      if (keyValueMatch) {
        const [, key, value] = keyValueMatch;
        currentSubrecord[key.trim()] = value.trim();
      } else {
        console.warn(`Warning: Invalid line format in section ${currentSection}, line ${lineNumber}`);
      }
    } else {
      console.error(`Error: No current section for line ${lineNumber}`);
    }
  }

  obj = {
    ...obj,
    HEADER: headerInfo,
    DSJOB: undefined,
    DSEXECJOB: undefined,
    DSBPSOURCE: undefined,
    CASE: undefined,
  };

  return obj;
}



module.exports = { parseDSXFile };
