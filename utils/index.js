function parseDSXFile(text) {
  let obj = {};
  let currentSection = "";
  let currentRecord = {};
  let currentSubrecord = {};
  let headerInfo = {};
  let isBinarySection = false;
  let binaryData = {}; // Sto

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

    if (line.startsWith("BEGIN DSRECORD")) {
      currentSection = "DSRECORD";
      currentRecord = {};
      currentRecord.DSSUBRECORDS = [];
      obj.DSRECORD = obj.DSRECORD || [];
      obj.DSRECORD.push(currentRecord);
      continue;
    }

    if (line.startsWith("BEGIN DSSUBRECORD")) {
      currentSection = "DSSUBRECORD";
      currentSubrecord = {};
      currentRecord.DSSUBRECORDS.push(currentSubrecord);
      continue;
    }

    if (line.startsWith("BEGIN DSBPBINARY")) {
      currentSection = "DSBPBINARY";
      isBinarySection = true;
      binaryData[currentSection] = {}; // Initialize binaryData to an empty object
      continue;
    }

    if (line.startsWith("END DSBPBINARY")) {
      currentSection = "";
      isBinarySection = false;
      continue;
    }

    if (line.startsWith("END")) {
      currentSection = "";
      continue;
    }

    if (currentSection === "DSRECORD" || currentSection === "DSSUBRECORD") {
      const keyValueMatch = line.match(/^(\w+)\s+"?(.*)"?$/);
      if (keyValueMatch) {
        const [, key, value] = keyValueMatch;
        const trimmedKey = key.trim();
        const trimmedValue = value ? value.trim() : value;

        if (currentSection === "DSRECORD") {
          currentRecord[trimmedKey] = trimmedValue;
        } else {
          currentSubrecord[trimmedKey] = trimmedValue;
        }
      } else {
        console.warn(
          `Warning: Invalid line format in section ${currentSection}, line ${lineNumber}`
        );
      }
    } else if (isBinarySection) {
      // Process DSBPBINARY section here
      const [key, value] = line.split(/\s(.+)/);
      binaryData[currentSection][key] = value; // Store binary data as key-value pairs
    } else {
      console.error(`Error: No current section for line ${lineNumber}`);
    }
  }

  obj = {
    ...obj,
    HEADER: headerInfo,
    ...binaryData,
  };

  return obj;
}

module.exports = { parseDSXFile };
