var club = document.getElementById("clubs");
var setClub = document.getElementById("setClub");
var clubCode = document.getElementById("clubCode");
var friendName = document.getElementById("friendName");
var lobbyMember = document.getElementById("lobbyMember");
var clubKeys = {

};
var clubInfo = {
  lol: {
    clubsData: "",
  },
};
club.addEventListener("focus", function () {
  friendName.classList.add("clubCodeFocus");
});
club.addEventListener("blur", function () {
  friendName.classList.remove("clubCodeFocus");
});
club.addEventListener("change", function () {
  clubInfo["lol"]["clubsData"] = clubKeys[club.value];
  makeRequest("PUT", clubInfo, "/lol-chat/v1/me");
});
setClub.addEventListener("mousedown", function () {
  if (
    clubCode.value === "" &&
    friendName.value === "" &&
    lobbyMember.value === ""
  ) {
    const dialogOptions = {
      type: "error",
      title: "Error",
      message:
        "Custom club data, friends name, or lobby member cannot be empty",
    };
    return dialog.showMessageBox(dialogOptions);
  } else if (friendName.value !== "") {
    const optionsCopy = Object.assign({}, options);
    optionsCopy["url"] = `${optionsCopy["url"]}/lol-chat/v1/friends`;
    optionsCopy["method"] = "GET";
    request(optionsCopy, function (error, response) {
      if (response.statusCode !== 404) {
        var friends = JSON.parse(response.body);
        for (var i = 0; i < friends.length; i++) {
          if (
            friendName.value.toUpperCase() === friends[i].name.toUpperCase()
          ) {
            if (
              friends[i].availability === "offline" ||
              friends[i].availability === "mobile"
            ) {
              dialogOptions = {
                type: "error",
                title: "Error",
                message: "That friend is offline",
              };
            } else if (friends[i].lol.clubsData === undefined) {
              dialogOptions = {
                type: "error",
                title: "Error",
                message: "That friends club data could not be found",
              };
            } else {
              clubInfo["lol"]["clubsData"] = friends[i].lol.clubsData;
              makeRequest("PUT", clubInfo, "/lol-chat/v1/me");
              clubCode.value = friends[i].lol.clubsData;
              return;
            }
            return dialog.showMessageBox(dialogOptions);
          }
        }
        dialogOptions = {
          type: "error",
          title: "Error",
          message: "Could not find that friend",
        };
        dialog.showMessageBox(dialogOptions);
      } else {
        dialogOptions = {
          type: "error",
          title: "Error",
          message: "There was an error connecting to the friends list",
        };
        dialog.showMessageBox(dialogOptions);
      }
    });
  } else if (lobbyMember.value !== "") {
    var optionsCopy = Object.assign({}, options);
    optionsCopy["url"] = `${optionsCopy["url"]}/lol-lobby/v2/lobby`;
    optionsCopy["method"] = "GET";
    request(optionsCopy, function (error, response) {
      if (response.statusCode !== 404) {
        var chat = JSON.parse(response.body);
        var ID = chat.chatRoomId;
        optionsCopy = Object.assign({}, options);
        optionsCopy["url"] = `${optionsCopy["url"]}/lol-chat/v1/me`;
        optionsCopy["method"] = "GET";
        request(optionsCopy, function (error, response) {
          var summoner = JSON.parse(response.body);
          var summonerID = summoner.id;
          var server = summonerID.substring(summonerID.indexOf("@")+1, summonerID.length);
          var server = server.substring(0, server.indexOf("."));
          var chatID = `${ID.substring(
            0,
            ID.indexOf("@")
          )}@sec.${server}.pvp.net`;
          var lobby = `/lol-chat/v1/conversations/${chatID}/participants`;
          optionsCopy = Object.assign({}, options);
          optionsCopy["url"] = `${optionsCopy["url"]}${lobby}`;
          optionsCopy["method"] = "GET";
          request(optionsCopy, function (error, response) {
            var participants = JSON.parse(response.body);
            for (var i = 0; i < participants.length; i++) {
              if (
                lobbyMember.value.toUpperCase() ===
                participants[i].name.toUpperCase()
              ) {
                clubInfo["lol"]["clubsData"] = participants[i].lol.clubsData;
                clubCode.value = participants[i].lol.clubsData;
                return makeRequest("PUT", clubInfo, "/lol-chat/v1/me");
              }
            }
            dialogOptions = {
              type: "error",
              title: "Error",
              message: "Could not find that lobby member",
            };
            return dialog.showMessageBox(dialogOptions);
          });
        });
      } else {
        dialogOptions = {
          type: "error",
          title: "Error",
          message: "You are not in a lobby",
        };
        dialog.showMessageBox(dialogOptions);
      }
    });
  } else {
    clubInfo["lol"]["clubsData"] = clubCode.value;
    makeRequest("PUT", clubInfo, "/lol-chat/v1/me");
  }
});
