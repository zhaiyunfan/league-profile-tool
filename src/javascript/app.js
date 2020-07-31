const { dialog } = require("electron").remote;
const { remote } = require("electron");
const sidePanel = document.querySelectorAll("h3");
let activePanel = sidePanel[0];
const LCUConnector = require("lcu-connector");
const connector = new LCUConnector();
const request = require("request");
const exit = document.querySelector("#exit");
const options = {
  rejectUnauthorized: false,
  headers: {
    Accept: "application/json",
  },
};

try {
  const fs = require("fs");
  const file = fs.readFileSync("config\\clientPath.txt").toString();
  if (file.split("\\").join("/") !== "") {
    connector._dirPath = file.split("\\").join("/");
  }
} catch (err) {}
connector.on("connect", (data) => {
  options["url"] = `${data["protocol"]}://${data["address"]}:${data["port"]}`;
  options["headers"]["Authorization"] =
    "Basic " + btoa(`${data["username"]}:${data["password"]}`);
});
connector.on("disconnect", (data) => {
  dialog.showErrorBox(
    "Error",
    "The connection to the league client has been closed"
  );
  remote.BrowserWindow.getFocusedWindow().close();
});
connector.start();

exit.addEventListener("mouseover", function () {
  if (activePanel !== this) {
    this.classList.add("barMouseOver");
  }
});
exit.addEventListener("mouseleave", function () {
  if (activePanel !== this) {
    this.classList.remove("barMouseOver");
  }
});
exit.addEventListener("mousedown", function () {
  remote.BrowserWindow.getFocusedWindow().close();
});

for (var i = 0; i < sidePanel.length - 1; i++) {
  sidePanel[i].addEventListener("mouseover", function () {
    if (activePanel !== this) {
      this.classList.add("barMouseOver");
    }
  });
  sidePanel[i].addEventListener("mouseleave", function () {
    if (activePanel !== this) {
      this.classList.remove("barMouseOver");
    }
  });
  sidePanel[i].addEventListener("mousedown", function (e) {
    if (typeof e === "object" && e.button === 0) {
      activePanel.classList.remove("barMouseOver");
      activePanel = this;
      active();
    }
  });
}
active();
function active() {
  activePanel.classList.add("barMouseOver");
  const page = activePanel.id;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `./html/${page}.html`, true);
  xhr.onreadystatechange = function () {
    if (this.readyState !== 4) return;
    if (this.status !== 200) return;
    document.querySelector(".pane").innerHTML = this.responseText;
  };
  xhr.send();
  loadjs(page);
}
function loadjs(page) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `javascript/${page}.js`;
  script.defer = true;
  document.body.appendChild(script);
}
function makeRequest(method, body, endPoint) {
  const optionsCopy = Object.assign({}, options);
  optionsCopy[
    "url"
  ] = `${optionsCopy["url"]}${endPoint}`; 
  optionsCopy["method"] = method;
  optionsCopy["body"] = JSON.stringify(body);
  run(optionsCopy);
}

function callback(error, response) {
  let dialogOptions = {};
  if (!error && (response.statusCode === 201 || response.statusCode === 200 || response.statusCode === 204)) {
    dialogOptions = {
      type: "info",
      title: "Success",
      message: `The request has been made`,
    };
  } else {
    dialogOptions = {
      type: "error",
      title: "Error",
      message: "There was an error",
    };
  }
  dialog.showMessageBox(dialogOptions);
}

function run(command) {
  request(command, callback);
}
