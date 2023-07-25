function parseDSXFile(dsxContent) {
  const lines = dsxContent.split("\n");
  const jsonResult = {};
  let currentSection = null;
  let dsRecords = [];

  for (const line of lines) {
    let trimmedLine = line.trim();

    if (
      trimmedLine.startsWith("BEGIN DSJOB") ||
      trimmedLine.startsWith("BEGIN DSEXECJOB")
    ) {
      currentSection = trimmedLine;
      jsonResult[currentSection] = {};
    } else if (
      trimmedLine.startsWith("END DSJOB") ||
      trimmedLine.startsWith("END DSEXECJOB")
    ) {
      currentSection = null;
    } else if (trimmedLine.startsWith("BEGIN DSRECORD")) {
      const record = {};
      while (!trimmedLine.startsWith("END DSRECORD")) {
        const [key, ...valueParts] = trimmedLine.split(' "');
        const value = valueParts.join(' "').slice(0, -1);
        record[key] = value;
        trimmedLine = lines.shift().trim();
      }
      dsRecords.push(record);
    } else if (trimmedLine.startsWith("BEGIN DSSUBRECORD")) {
      const subRecord = {};
      while (!trimmedLine.startsWith("END DSSUBRECORD")) {
        const [key, ...valueParts] = trimmedLine.split(' "');
        const value = valueParts.join(' "').slice(0, -1);
        subRecord[key] = value;
        trimmedLine = lines.shift().trim();
      }
      dsRecords[dsRecords.length - 1].DSSUBRECORDS =
        dsRecords[dsRecords.length - 1].DSSUBRECORDS || [];
      dsRecords[dsRecords.length - 1].DSSUBRECORDS.push(subRecord);
    } else if (currentSection) {
      const [key, ...valueParts] = trimmedLine.split(' "');
      const value = valueParts.join(' "').slice(0, -1);
      jsonResult[currentSection][key] = value;
    }
  }

  jsonResult["DSRECORDS"] = dsRecords;
  return jsonResult;
}

module.exports = { parseDSXFile };
