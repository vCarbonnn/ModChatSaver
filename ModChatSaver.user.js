// ==UserScript==
// @name         Mod Chat Saver
// @namespace    http://www.reddit.com/u/vCarbonnn
// @updateURL    https://github.com/vCarbonnn/ModChatSaver/raw/master/ModChatSaver.user.js
// @version      1.1
// @description  Enables TagPro moderators to save users chat.
// @author       Carbon
// @include      http://tagpro-*.koalabeast.com/moderate/chat*
// ==/UserScript==

var VERSION = "Version 1.1";
var baseKey;
var fullChat = "";
var savedCount = 0;
var chatCurrentlyLoaded = "Now";

var JOIN_STRING = "::";
var JOIN_STRING_END = ":;";
var JOIN_STRING_TIMESTAMP = "###";
var CHAT_POS_STRING = "chat?";
var HOURS_POS_STRING = "hours";
var BASE_KEY_INITIAL = "saved_chat:";

function setKey() {
	var url = window.location.href;
	var chatPosition = url.indexOf(CHAT_POS_STRING) + 5;
	var keyType = url.substr(chatPosition, 1);
	var hourPosition = url.indexOf(HOURS_POS_STRING) - 1;
	if(keyType === "u") { //user
		chatPosition += 7;
	} else { //ip
		chatPosition += 3;
	}
	baseKey = BASE_KEY_INITIAL + url.slice(chatPosition, hourPosition);
	console.log(baseKey);
}

function setUpButtons(removeButtons) {
	if(removeButtons) {
		if(document.getElementById("loadChatButton")) {
			document.getElementById("loadChatButton").remove();
		}
		if(document.getElementById("saveChatButton")) {
			document.getElementById("saveChatButton").remove();
		}
		if(document.getElementById("savedChatDropDown")) {
			document.getElementById("savedChatDropDown").remove();
		}
	}

	var count = getKeyCountFromStorage();
	if(count > 0) {
		$(".buttons").append("<button id='loadChatButton' class='small'>Load Chat ("+count+")</button>");
		count--;
		document.getElementById("loadChatButton").addEventListener('click', function() {
			document.getElementById("loadChatButton").disabled = true;
			$(".buttons").append("<select id='savedChatDropDown' class='small'></select>");
			document.getElementById("savedChatDropDown").style.marginLeft = "10px";
			document.getElementById("savedChatDropDown").appendChild(new Option("Now", "Now"));
			for(var i=0; i<=count; i++) {
				var keyToAdd = baseKey + "_" + i;
				addOptionToSelect(keyToAdd);
		    	}
		    	document.getElementById("savedChatDropDown").addEventListener("click", dropDownSelected);
		});
	}
	$(".buttons").append("<button id='saveChatButton' class='small'>Save Chat</button>");
	document.getElementById("saveChatButton").addEventListener('click', function() {
		saveChat();
		saveChatToStorage();
		setUpButtons(true);
	});
}

function getKeyCountFromStorage() {
	var value = keyCheck(true);
	savedCount = 0;
	if(value !== null) {
		savedCount = value.substr(value.length - 1);
	}
	return savedCount;
}

function addOptionToSelect(keyToAdd) {
	console.log("Adding: " + keyToAdd);
	var dateOfKey = getKeyDate(keyToAdd);
	document.getElementById("savedChatDropDown").appendChild(new Option(dateOfKey, keyToAdd));
}

function getKeyDate(key) {
	var fullValue = localStorage.getItem(key);
	var timestampEndPosition = fullValue.indexOf(JOIN_STRING_TIMESTAMP);
	return fullValue.substr(0, timestampEndPosition);
}

function dropDownSelected() {
	var list = document.getElementById("savedChatDropDown");
    var keyToLoad = list.options[list.selectedIndex].value;
    if(keyToLoad != "Now" && chatCurrentlyLoaded != keyToLoad) {
    	updateTableWithSavedChat(keyToLoad);
    	chatCurrentlyLoaded = keyToLoad;
    	document.getElementById("loadChatButton").style= "display:none;";
    	document.getElementById("saveChatButton").style= "display:none;";
    } else if(keyToLoad == "Now" && chatCurrentlyLoaded != keyToLoad) {
    	document.getElementById("filterButton").click();
    	chatCurrentlyLoaded = keyToLoad;
    	document.getElementById("loadChatButton").style= "inline-block;";
    	document.getElementById("saveChatButton").style= "inline-block;";
    }
}

function saveChat() {
	var allRows = document.getElementById("reportRows").children;
	for(var i=0; i<allRows.length; i++) {
		var singleRowElements = allRows[i].children;
		var gameId = singleRowElements[0].textContent;
		var timestamp = singleRowElements[1].textContent;
		var ip = singleRowElements[2].children[0].textContent;
		var userId = singleRowElements[3].children[0].textContent;
		var playerId = singleRowElements[4].textContent;
		var name = singleRowElements[5].textContent;
		var message = singleRowElements[6].textContent;
		var to = singleRowElements[7].textContent;
		addRow(joinStrings(gameId, timestamp, ip, userId, playerId, name, message, to));
	}
}

function joinStrings(gameId, timestamp, ip, userId, playerId, name, message, to) {
	var joinedString = gameId + JOIN_STRING + timestamp + JOIN_STRING + ip + JOIN_STRING + userId + JOIN_STRING;
		joinedString += playerId + JOIN_STRING + name + JOIN_STRING + message + JOIN_STRING + to + JOIN_STRING_END;
	return joinedString;
}

function addRow(singleRow) {
	fullChat += singleRow;
}

function saveChatToStorage() {
	localStorage.setItem(keyCheck(false), (getDate() + JOIN_STRING_TIMESTAMP + fullChat));
	fullChat = "";
}

function getDate() {
	var fullDate = new Date();
	var localeDate = fullDate.toLocaleDateString();
	var localeTime = fullDate.toLocaleTimeString();
	return localeDate + " at " + localeTime;
}

function keyCheck(loadCheck) {
	if(localStorage.getItem(baseKey + "_0") === null) {
		if(loadCheck) {
			return null;
		} else {
			return baseKey + "_0";
		}
	}
	var keyExists = true;
	var count = 0;
	while(keyExists) {
		var keyToCheck = baseKey + "_" + (count++);
		if(localStorage.getItem(keyToCheck) === null) {
			return keyToCheck;
		}
	}
}

function updateTableWithSavedChat(keyToLoad) {
	var reportRows = document.getElementById("reportRows");
	while (reportRows.hasChildNodes()) {
		reportRows.removeChild(reportRows.lastChild);
	}
	var splitRows = getFullChat(keyToLoad);

	for(var i=0; i<splitRows.length-1; i++) {
		var rowTr = document.createElement("tr");
		var singleSplitRow = splitRows[i].split(JOIN_STRING);
		for(var j=0; j<8; j++) {
			var singleTh = document.createElement("th");
			singleTh.append(document.createTextNode(singleSplitRow[j]));
			rowTr.append(singleTh);
		}
		document.getElementById("reportRows").append(rowTr);
	}
}

function getFullChat(keyToLoad) {
	var fullValue = getChatFromStorage(keyToLoad);
	var timeDatePos = fullValue.indexOf(JOIN_STRING_TIMESTAMP) + 3;
	fullValue = fullValue.substr(timeDatePos);
	return fullValue.split(JOIN_STRING_END);
}

function getChatFromStorage(keyToLoad) {
	return localStorage.getItem(keyToLoad);
}

function importChat(base64Full) {
	var allChatStorage = atob(base64Full);
	var chatStorageSplit = allChatStorage.split("~/");
	var chatSplitlength = chatStorageSplit.length - 1;
	console.log("Importing " + (chatSplitlength) + " saved chats...");
	for(var i=0; i<chatSplitlength; i++) {
		console.log((i+1) + " of " + (chatSplitlength));
		var secondarySplit = chatStorageSplit[i].split("~#");
		var key = checkForMergeConflicts(secondarySplit[0]);
		var value = secondarySplit[1];
		localStorage.setItem(key, value);
	}
	return "Imported " + (chatSplitlength) + " saved chats.";
}

function checkForMergeConflicts(keyToCheck) {
	if(localStorage.getItem(keyToCheck) === null) {
		return keyToCheck;
	} else {
		var baseKey = keyToCheck.substr(0, keyToCheck.lastIndexOf("_") + 1);
		var currentIndex = keyToCheck.substr(keyToCheck.lastIndexOf("_") + 1);
		currentIndex++;
		var newKey = baseKey + currentIndex;
		console.log("merge conflict, attempting with key: "+newKey);
		return checkForMergeConflicts(newKey);
	}
}

function exportChat() {
	var savedChatKeys = [];
	for(var i in localStorage) {
		if(i.indexOf("saved_chat:") >= 0) {
			savedChatKeys.push(i);
	    }
	}
	var currentServer = tagpro.host.slice(tagpro.host.indexOf("-") + 1, tagpro.host.indexOf("."));
	console.log("Exporting " + savedChatKeys.length + " saved chats stored on " + currentServer + "...");
	var allChatStorage = "";
	for(var j=0; j<savedChatKeys.length; j++) {
		console.log((j+1) + " of " + savedChatKeys.length);
		allChatStorage += savedChatKeys[j] + "~#" + getChatFromStorage(savedChatKeys[j]) + "~/";
	}
	var allBase64 = btoa(allChatStorage);
	var filename = "savedChat_" + currentServer;
	download(filename, allBase64);
	return "Exported " + savedChatKeys.length + " saved chats to " + filename;
}

function download(filename, text) {
	var element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
	element.setAttribute("download", filename);

	element.style.display = "none";
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function loadSettings() {
	var filtersSection = document.getElementById("filters");
	document.getElementById("filters").title = VERSION;
	while (filtersSection.hasChildNodes()) {
		filtersSection.removeChild(filtersSection.lastChild);
	}
	document.getElementById("content").remove();

	$("#filters").append("<h2>Mod Chat Saver Settings</h2>");
	$("#filters").append("<h6>by Carbon</h6>");
	$("#filters").append("<input type='file' id='inputSavedChat' accept:'.txt'/>");
	$("#filters").append("<button id='importChat' class='small'>Import Saved Chats</button>");

	document.getElementById("importChat").addEventListener('click', function() {
		var file  = document.getElementById("inputSavedChat").files[0];
		if(file.type === "text/plain") {
			var reader = new FileReader();
			reader.onload = function(e) {
			  	var base64Full = reader.result;
				if(base64Full.length > 0) {
					var result = importChat(base64Full);
					alert(result);
				} else {
					alert("File couldn't be read correctly.");
				}
			};
			reader.readAsText(document.getElementById("inputSavedChat").files[0]);
		} else {
			alert("Not a text file.");
		}
	});

	$("#filters").append("<button id='exportChat' class='small'>Export Saved Chats</button>");
	document.getElementById("exportChat").addEventListener('click', function () {
		var result = exportChat();
		alert(result);
	});
}

if(window.location.href.indexOf("settings")>0) {
	loadSettings();
} else {
    setKey();
    setUpButtons(false);
}
