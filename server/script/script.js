const exec = require("child_process").exec;
const fs = require("fs");
const readline = require("readline");
const path = require("path");
//const xlsx = require("xlsx");

const startScript = options => {
  /*@ANDRE-TANCHIA ho passato l'oggetto res a startScript ma non è elegante come cosa,
      dovreste cambiare requestedRoute.js e far si che il modulo sia async in maniera
      da poter utilizzare await ed attendere l'elaborazione del file altrimenti
      per com'è fatto adesso manda risposta vuota*/

  //create command string
  let cmd = "./script/isomir_sea";
  for (var key in options) {
    cmd = cmd + " -" + key + " " + options[key];
  }

  let data;

  child = exec(cmd, async (error, stdout, stderr) => {
    if (error !== null) {
      console.log("exec error: " + error);
      return;
    }
    //filename
    let dir = "./script/" + fileName.slice(0, -4);

    data = await processData(dir);
  });

  return data;
};

const processData = async dir => {
  return new Promise((resolve, reject) => {
    getAlligmentInfo(dir).then(() =>
      getAllignmentData(dir).then(data => {
        deleteFolderRecursive(dir);
        resolve(data);
      })
    );
  });
};

const getAllignmentData = async dir => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(dir + "/tagMir-all.tab");
      const sheet_name_list = workbook.SheetNames;

      resolve(xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list]));
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

const getAlligmentInfo = async dir => {
  return new Promise((resolve, reject) => {
    let fileInterface = readline.createInterface({
      input: fs.createReadStream(dir + "/align.log")
    });

    let lines = [];
    fileInterface.on("line", line => {
      lines.push(line);
      console.log(line);
    });

    fileInterface.on("close", () => {
      //here i have to take the infomations about the alignment
      //[file interface.lenght , file interface.lenght --1]
      resolve();
    });
  });
};

const deleteFolderRecursive = path => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = { startScript };
