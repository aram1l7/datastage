function parseDSXFile(dsxContent) {
  const lines = dsxContent.split("\n");
  const jsonResult = {};

  let currentSection = null;
  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("BEGIN ")) {
      currentSection = trimmedLine.slice(6);
      jsonResult[currentSection] = {};
    } else if (trimmedLine.startsWith("END ")) {
      currentSection = null;
    } else if (currentSection) {
      const [key, ...valueParts] = trimmedLine.split(' "');
      const value = valueParts.join(' "').slice(0, -1);
      jsonResult[currentSection][key] = value;
    }
  }

  return jsonResult;
}

module.exports = { parseDSXFile };
