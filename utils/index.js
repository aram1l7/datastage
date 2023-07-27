function parseDSXFile(text) {
  let obj = {};
  let currentSection = "";
  let currentKey = "";
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

      // Split line by the first occurrence of a double quote
      const [key, value] = line.split(/"(.+)/).filter(Boolean);

      // Update the headerInfo object with key-value pairs
      headerInfo[key] = value;
      continue;
    }

    if (line.startsWith("BEGIN")) {
      currentSection = line.substring(6).trim();

      if (
        currentSection === "DSSUBRECORD" ||
        currentSection === "DSRECORD" ||
        currentSection === "DSBPBINARY"
      ) {
        if (!obj[currentSection]) {
          obj[currentSection] = [];
        }
        obj[currentSection].push({});
      } else {
        obj[currentSection] = {};
      }
      continue;
    }

    if (line.startsWith("END")) {
      currentSection = "";
      currentKey = "";
      continue;
    }

    if (currentSection) {
      if (!currentKey) {
        currentKey = line.split(/\s(.+)/)[0]; // Update this line to only get the first part of the line before the space
      } else {
        const [key, value] = line.split(/\s+(.+)/);

        if (currentSection === "HEADER") {
        } else {
          if (obj[currentSection][obj[currentSection].length - 1]) {
            if (
              !obj[currentSection][obj[currentSection].length - 1][currentKey]
            ) {
              obj[currentSection][obj[currentSection].length - 1][currentKey] =
                value;
            } else {
              if (
                !Array.isArray(
                  obj[currentSection][obj[currentSection].length - 1][
                    currentKey
                  ]
                )
              ) {
                obj[currentSection][obj[currentSection].length - 1][
                  currentKey
                ] = [
                  obj[currentSection][obj[currentSection].length - 1][
                    currentKey
                  ],
                ];
              }
              obj[currentSection][obj[currentSection].length - 1][
                currentKey
              ].push(value);
            }
          } else {
            console.error(`Error: No current section for line ${lineNumber}`);
          }
        }
        currentKey = "";
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
