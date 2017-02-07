# ModChatSaver
Enables TagPro moderators to save users chat.


---

When navigating to a user/IP chat page, a "Save Chat" button will be visible. Clicking "Save Chat" will save the current chat on the page, this includes Game ID, Chat Timestamp, etc.

When you are visiting the chat page of a user that you have saved chat for previously, a "Load Chat (#)" button will be visible, with the number in the brackets telling you how many chats you have saved for this user. Clicking the button will display a drop-down list of every chat saved for the user. The time and date of when you saved the chats are the options.

Clicking on a drop-down option will replace the chat page with the saved chat, you can revert back to the "real time" chat view by clicking on the drop-down option "Now".

Chats are saved per server, so any chats you save on Chord can only be viewed on Chord, Origin only on Origin. I don't think this is too much of an issue as I'd have thought everyone uses Mod Tools on their favourite server.

I have added the ability to import/export your saved chats. You can access the Mod Chat Saver Settings by adding &settings to the end of any chat page, e.g: [http://tagpro-chord.koalabeast.com/moderate/chat?userId=52ebba0fbf26b8391d551528&hours=36&settings](http://tagpro-chord.koalabeast.com/moderate/chat?userId=52ebba0fbf26b8391d551528&hours=36&settings) or this works just as well: [http://tagpro-chord.koalabeast.com/moderate/chat?&settings](http://tagpro-chord.koalabeast.com/moderate/chat?&settings)

Export Chats will collect up all of your saved chats (for your current server) and put them into a text file. Import Chats takes a text file as input and imports every new saved chat found in the file.
