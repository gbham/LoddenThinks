const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http);

var players = [];
var groups = [];
var allSockets = []; //whole reason for this is since I want to send the entire players[] array to the client sometimes (maybe dont need to anymore). Well I cant send players[0] or groups[0][1] with the socket inside, so I changed socket to socketID for players[] and groups[]


Http.listen(3000, () => {
    console.log("Listening at :3000...");
});


Socketio.on("connection", socket => {    

    socket.on("disconnect", () => {  

        // switch(socket)
        // {
        //     case looden.socket:
        //         Socketio.emit("playerDisconnected", looden.name);
        //         break;
            
        //     case player1.socket:
        //         Socketio.emit("playerDisconnected", player1.name);
        //         break;

        //     case player2.socket:
        //         Socketio.emit("playerDisconnected", player2.name);
        //         break;

        // }
    });

    //The input validation (only checking if player guess is higher than previous player guess) is done at client level for now
    //This function is called when a player submits a new guess
    socket.on("move", value => {        
        
        var groupName = GetGroupName(socket); 

        var groupIndex = GetGroupIndex(groupName);

        var desiredGrpSockets = GetGroupSockets(groupIndex);

        var player1Socket = GetPlayerSocketFromRole(groupIndex, "player1");
        var player2Socket = GetPlayerSocketFromRole(groupIndex, "player2");

        var player1Index = GetPlayerIndexInGrp(groupIndex, "player1");
        var player2Index = GetPlayerIndexInGrp(groupIndex, "player2");  
        
        var player1 = groups[groupIndex][player1Index];
        var player2 = groups[groupIndex][player2Index];

        if(socket.id == player1Socket.socket.id)
        {   
            player1.guess = Number(value);

            for(var i = 0; i < desiredGrpSockets.length; i++)
            {                
                desiredGrpSockets[i].socket.emit("playerMove", player1Socket.name, value);
            } 

            player1Socket.socket.emit("hidePlayerControls");
            player2Socket.socket.emit("showPlayerControls"); 
        }
        else if(socket.id == player2Socket.socket.id)
        {
            player2.guess = Number(value);

            for(var i = 0; i < desiredGrpSockets.length; i++)
            {                
                desiredGrpSockets[i].socket.emit("playerMove", player2Socket.name, value);
            } 

            player1Socket.socket.emit("showPlayerControls");
            player2Socket.socket.emit("hidePlayerControls"); 
        }
    });

    //This function is called when a player settles and agrees to take the "under" on the other players guess
    socket.on("settle", function() {       

        var groupName = GetGroupName(socket); 

        var groupIndex = GetGroupIndex(groupName);  
        
        var desiredGrpSockets = GetGroupSockets(groupIndex);            

        var player1Index = GetPlayerIndexInGrp(groupIndex, "player1");
        var player2Index = GetPlayerIndexInGrp(groupIndex, "player2");
        var loodenIndex = GetPlayerIndexInGrp(groupIndex, "looden");

        var player1 = groups[groupIndex][player1Index];
        var player2 = groups[groupIndex][player2Index];
        var looden = groups[groupIndex][loodenIndex];      

        var underPlayer;
        var overPlayer;

        //At this point in the code, the player with the lowest guess value is the one that settled. They have settled for everything under the other players value
        if(player1.guess < player2.guess)
        {            
            player1.guess = player2.guess;            

            underPlayer = player1;
            overPlayer = player2; 
        }
        else
        {
            player2.guess = player1.guess;

            underPlayer = player2;
            overPlayer = player1;            
        }        

        if(underPlayer.guess > looden.answer) 
        {
            for(var i = 0; i < desiredGrpSockets.length; i++)
            {                
                desiredGrpSockets[i].socket.emit("declareWinner", "theUnder", underPlayer.name, underPlayer.guess, looden.answer);
                desiredGrpSockets[i].socket.emit("hidePlayerControls");
            } 
        }
        else
        {
            for(var i = 0; i < desiredGrpSockets.length; i++)
            {                
                desiredGrpSockets[i].socket.emit("declareWinner", "theOver", overPlayer.name, overPlayer.guess, looden.answer);
                desiredGrpSockets[i].socket.emit("hidePlayerControls");
            } 
        }

        looden.gameover = true;
    });        

    //This function assigns the looden role to the appropiate player and then relays that info to the rest of the group
    socket.on("assignLooden", () => {            
                    
        socket.emit("hidePlayerSelectionControls");  
        
        var loodenName; 
        var groupIndex;

        //Finding out what user is "socket" in this function
        for(var i = 0; i < groups.length; i++)
        {
            for(var x = 1; x < groups[i].length; x++)
            {
                //something fishy with this bit of code, sometimes this IF statement wasnt being entered when it always should
                if(groups[i][x].socketID == socket.id)
                {                        
                    groupIndex = i;
                    groups[i][x].role = "looden";
                    groups[i][x].ready = true;                        

                    loodenName = groups[i][x].name;                     
                }
            } 
        }

        var desiredGrpSockets = GetGroupSockets(groupIndex);            

        for(var i = 0; i < desiredGrpSockets.length; i++)
        {                
            desiredGrpSockets[i].socket.emit("loodenIs", loodenName);
        }    

        //Its important that groups[groupIndex] is used instead of desiredGrpSockets, as desiredGrpSockets only contains sockets
        CheckIfPlayersAreReady(groups[groupIndex]);
    });        

    //This function assigns the player1 role to the appropiate player and then relays that info to the rest of the group
    socket.on("assignPlayer1", (player1Name) => {  

        socket.emit("hidePlayerSelectionControls");  

        var player1Name; 
        var groupIndex;

        //Finding out what user is "socket" in this function
        for(var i = 0; i < groups.length; i++)
        {
            for(var x = 1; x < groups[i].length; x++)
            {
                //something fishy with this bit of code, sometimes this IF statement wasnt being entered when it always should
                if(groups[i][x].socketID == socket.id)
                {                        
                    groupIndex = i;
                    groups[i][x].role = "player1";
                    groups[i][x].ready = true;                        

                    player1Name = groups[i][x].name;                     
                }
            } 
        }

        var desiredGrpSockets = GetGroupSockets(groupIndex);            

        for(var i = 0; i < desiredGrpSockets.length; i++)
        {                
            desiredGrpSockets[i].socket.emit("player1Is", player1Name);
        }   

        //Its important that groups[groupIndex] is used instead of desiredGrpSockets, as desiredGrpSockets only contains sockets
        CheckIfPlayersAreReady(groups[groupIndex]);

    });        
    
    //This function assigns the player2 role to the appropiate player and then relays that info to the rest of the group
    socket.on("assignPlayer2", (player2Name) => {  
                        
        socket.emit("hidePlayerSelectionControls");  

        var player2Name; 
        var groupIndex;

        //Finding out what user is "socket" in this function
        for(var i = 0; i < groups.length; i++)
        {
            for(var x = 1; x < groups[i].length; x++)
            {
                //something fishy with this bit of code, sometimes this IF statement wasnt being entered when it always should
                if(groups[i][x].socketID == socket.id)
                {                        
                    groupIndex = i;
                    groups[i][x].role = "player2";
                    groups[i][x].ready = true;                        

                    player2Name = groups[i][x].name;                     
                }
            } 
        }

        var desiredGrpSockets = GetGroupSockets(groupIndex);            

        for(var i = 0; i < desiredGrpSockets.length; i++)
        {                
            desiredGrpSockets[i].socket.emit("player2Is", player2Name);
        }           

        //Its important that groups[groupIndex] is used instead of desiredGrpSockets, as desiredGrpSockets only contains sockets
        CheckIfPlayersAreReady(groups[groupIndex]);

    });

    socket.on("setQuestionAndAnswer", (question, answer) => {                           
                    
        var groupName = GetGroupName(socket);             

        var groupIndex = GetGroupIndex(groupName); 

        var desiredGrpSockets = GetGroupSockets(groupIndex); 
        
        for(var i = 0; i < desiredGrpSockets.length; i++)
        {                
            desiredGrpSockets[i].socket.emit("gameReady", question);
        }      

        var player1Socket = GetPlayerSocketFromRole(groupIndex, "player1");
        player1Socket.socket.emit("showPlayerControls");

        var loodenIndex = GetPlayerIndexInGrp(groupIndex, "looden");
        var looden = groups[groupIndex][loodenIndex];

        looden.answer = answer;
        looden.question = question;
            
    });

    socket.on("createPlayer", (name) => {                        
        CreatePlayer(socket, name);               
    });

    socket.on("createGroup", (groupName) => {                        
        CreateGroup(socket, groupName);               
    });

    socket.on("joinGroup", (groupName) => {                        
        JoinGroup(socket, groupName);               
    });
    
    function GetPlayerSocketFromRole(groupIndex, role)
    {
        for(var i = 1; i < groups[groupIndex].length; i++)
        {
            for(var x = 0; x < allSockets.length; x++)
            {                     
                if(groups[groupIndex][i].role == role)
                {
                    if(groups[groupIndex][i].socketID == allSockets[x].socket.id)
                    {
                        return allSockets[x];                            
                    }
                }                    
            }                 
        }
    }

    function GetPlayerSocketFromID(socketID)
    {
        for(var x = 0; x < allSockets.length; x++)
        {
            //I want to send the whole players array sometimes, but I cant send socket, so I replaced socket with socketID then I have to cover the resulting issues here
            if(allSockets[x].socket.id == socketID)
            {
                return allSockets[x];                
            }
        }
    }
    
    function GetPlayerIndexInGrp(groupIndex, role)
    {
        for(var i = 1; i < groups[groupIndex].length; i++)
        {                                    
            if(groups[groupIndex][i].role == role)
            {     
                var playerIndex = i;                   
                return playerIndex;
            }                
        }
    }

    function GetGroupName(socket)
    {
        for(var i = 0; i < players.length; i++)
        {
            if(socket.id == players[i].socketID)
            {     
                var groupName = players[i].group; 
                return groupName;
            }
        }            
    }

    function GetGroupIndex(groupName)
    {            
        for(var i = 0; i < groups.length; i++)
        {                
            if(groups[i][0] == groupName)
            {
                var groupIndex = i;
                return groupIndex;
            }      
        }            
    }

    //If all roles have been assigned then commence game by asking Looden for a question and answer (group[0] is the group name)
    function CheckIfPlayersAreReady(group)
    {
        if(group[1].ready==true && group[2].ready==true && group[3].ready==true)
        {   
            for(var i = 1; i < group.length; i++)
            {
                if(group[i].role == "looden")                    
                {                        
                    for(var x = 0; x < allSockets.length; x++)
                    {                            
                        if(group[i].socketID == allSockets[x].socket.id)
                        {                                
                            allSockets[x].socket.emit("askLoodenForQuestionAndAnswer");
                            break;                                
                        }
                    }
                }
            } 
        }
    }

    function CreatePlayer(socket, name) 
    {
        //ensure all are needed
        var player = {
            socketID: socket.id,
            name: name,
            ready: false,
            guess: 0,
            group: null,
            role: null,
            question: null, //atm, only the looden player is getting the question assigned, keep this in mind
            gameover: false //not sure if I will even need this anymore
        };        
        
        //Not sure if I actually need the "name" here in the end
        var newSocket = {
            name: name,
            socket: socket
        };

        allSockets.push(newSocket);
        
        players.push(player);   

        socket.emit("hideCreatePlayerControls");
        socket.emit("showCreateAndJoinGroupControls"); 
    }

    //Currently no validation done on whether the group is a duplicate
    function CreateGroup(socket, groupName)  
    {  
        var player = GetDesiredPlayer(socket);
        player.group = groupName;

        var group = [groupName, player]; 
        groups.push(group);         
        
        var playerSocket = GetPlayerSocketFromID(player.socketID)

        var groupIndex = GetGroupIndex(groupName);

        playerSocket.socket.emit("printGroup", groups[groupIndex]);
        
    }

    //Currently no validation done on whether the group exists or has space   
    function JoinGroup(socket, groupName)  
    {
        var player = GetDesiredPlayer(socket);

        player.group = groupName; 

        var groupIndex = GetGroupIndex(groupName); 

        groups[groupIndex].push(player); 
        
        var desiredGrpSockets = GetGroupSockets(groupIndex);            

        for(var i = 0; i < desiredGrpSockets.length; i++)
        {                
            desiredGrpSockets[i].socket.emit("printGroup", groups[groupIndex]);
        }          
        
        CheckIfGroupIsFull(groupIndex);         
    }

    function CheckIfGroupIsFull(groupIndex) 
    {
        //1 position is the group name and the other 3 are for the players
        if(groups[groupIndex].length == 4)
        {     
            var desiredGrpSockets = GetGroupSockets(groupIndex);            

            for(var i = 0; i < desiredGrpSockets.length; i++)
            {                
                desiredGrpSockets[i].socket.emit("showRoleSelectionControls");
            }  
        }
    }

    //Finds the player that matches the socket being communicated with
    function GetDesiredPlayer(socket)
    {
        for(var i = 0; i < players.length; i++)
        {
            if(players[i].socketID == socket.id)
            {                    
                return players[i];
            }
        }
    }

    //Keep in mind, the global groups[] array has each index 0 as the group name, well this function returns desiredGrpSockets, which does not contain the group name at position 0
    //This may cause unneeded confusion so may need to simplify down the line
    function GetGroupSockets(groupNumber)
    {
        var desiredGrpSockets = [];            
                    
        for(var i = 1; i < groups[groupNumber].length; i++)
        {
            for(var x = 0; x < allSockets.length; x++)
            {
                if(allSockets[x].socket.id == groups[groupNumber][i].socketID)
                {                        
                    desiredGrpSockets.push(allSockets[x]);
                }
            } 
        }

        return desiredGrpSockets;
    }
});

