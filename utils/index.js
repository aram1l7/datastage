function cleanValue(value) {
  return value.replace(/["\\]/g, "");
}

function parseDSXFile(text) {
  let obj = {};
  let currentSection = "";
  let currentJob = null;
  let currentRecord = null;
  let currentSubrecord = null;
  let headerInfo = {};
  let isBinarySection = false;
  let binaryData = {};

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

    if (line.startsWith("BEGIN DSJOB") || line.startsWith("BEGIN DSEXECJOB")) {
      currentSection = line.startsWith("BEGIN DSJOB") ? "DSJOB" : "DSEXECJOB";
      currentJob = {}; // Initialize a new current job object
      obj[currentSection] = currentJob;
      isBinarySection = false;
      continue;
    }

    if (
      (currentSection === "DSJOB" || currentSection === "DSEXECJOB") &&
      (line.startsWith("Identifier") ||
        line.startsWith("DateModified") ||
        line.startsWith("TimeModified"))
    ) {
      const [key, value] = line.split(/"(.+)"/).filter(Boolean);
      currentJob[key.trim()] = value.trim();
      continue;
    }

    if (line.startsWith("BEGIN DSRECORD")) {
      currentSection = "DSRECORD";
      currentRecord = {};
      currentRecord.DSSUBRECORDS = [];
      currentJob.DSRECORDS = currentJob.DSRECORDS || [];
      currentJob.DSRECORDS.push(currentRecord); // Add the record to the current job's DSRECORD array
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
        const trimmedValue = value ? cleanValue(value.trim()) : value;

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
      const [key, value] = line.split(/\s(.+)/);

      binaryData[currentSection][key] = cleanValue(value);
    }
  }

  obj = {
    HEADER: headerInfo,
    ...obj,
    ...binaryData,
  };

  return obj;
}

module.exports = { parseDSXFile };
