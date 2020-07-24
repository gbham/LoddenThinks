<template>
  <div>   
      
    <button ref="loddenBtn" style="display:none" v-on:click="setlodden()">Lodden</button> 
    <br>
    <button ref="player1Btn" style="display:none" v-on:click="setPlayer1()">Player1</button>  
    <br>    
    <button ref="player2Btn" style="display:none" v-on:click="setPlayer2()">Player2</button>         
    <br>

    <textarea 
        ref="listOfPlayersDisplay" 
        width="1920" 
        height="1080"           
        wrap=hard          
        rows=3
        cols=25
        style="border: 1px solid black; display:none">
    </textarea>   

    <br>

    <p>
        <textarea 
            ref="questionDisplay" 
            width="1920" 
            height="1080" 
            wrap=hard          
            rows= 2
            cols= 25
            placeholder="Enter the question here ..."
            style="border: 1px solid black; display:none">
        </textarea>  
        <br>             
        <textarea 
            ref="loddenAnswerInput" 
            width="1920" 
            height="1080" 
            wrap=hard          
            rows= 1
            cols= 25
            placeholder="Enter the answer here ..."
            style="border: 1px solid black; display:none">
        </textarea>
        <br> 
        <button ref="setQuestionBtn" style="display:none" v-on:click="setQuestionAndAnswer()">Set Question</button>  
    </p>

    <br>

    <textarea 
        ref="textDisplay" 
        width="1920" 
        height="1080"           
        wrap=hard          
        rows= 20
        cols= 25
        style="border: 1px solid black;">
    </textarea>   

    <br>
    
    <textarea 
        ref="textInput"               
        width="1920" 
        height="1080"           
        wrap=hard          
        rows= 1
        cols= 25
        style="border: 1px solid black; display:none">
    </textarea> 

    <br>

    <button ref="sendBtn" style="display:none" v-on:click="move()">Send</button>    
    <button ref="settleBtn" style="display:none" v-on:click="settle()">Settle</button> 

    <br><br><br>
    
    <button ref="createGroupBtn" style="display:none" v-on:click="createGroup()">Create Group</button> 
    <button ref="joinGroupBtn" style="display:none" v-on:click="joinGroup()">Join Group</button>     
    <textarea 
        ref="userGroupInput"               
        width="1920" 
        height="1080"           
        wrap=hard          
        rows= 1
        cols= 25
        style="border: 1px solid black; display:none">
    </textarea> 
    
    <button ref="createPlayerBtn" style="display:block" v-on:click="createPlayer()">Create Player</button> 
    <textarea 
        ref="userInfoInput"               
        width="1920" 
        height="1080"           
        wrap=hard          
        rows= 1
        cols= 25
        style="border: 1px solid black; display:block">
    </textarea> 
     
  </div>
</template>

<script>
    import io from "socket.io-client";
    export default {
        name: "LoddenThinksGame",        
        data() {
             return {
                // socket: {},                
                currentValue: 0,                
                
            }
        },
        created() {
            this.socket = io("http://localhost:3000");
            
        },        
        mounted() {
            
            this.listOfPlayersDisplay = this.$refs.listOfPlayersDisplay;

            this.loddenBtn = this.$refs.loddenBtn;
            this.player1Btn = this.$refs.player1Btn; 
            this.player2Btn = this.$refs.player2Btn; 
            this.player1NameField = this.$refs.player1NameField;
            this.player2NameField = this.$refs.player2NameField;
            this.loddenNameField = this.$refs.loddenNameField;

            this.questionDisplay = this.$refs.questionDisplay;
            this.loddenAnswerInput = this.$refs.loddenAnswerInput;
            this.setQuestionBtn = this.$refs.setQuestionBtn;
            this.textDisplay = this.$refs.textDisplay;
            this.textInput = this.$refs.textInput;
            this.sendBtn = this.$refs.sendBtn;
            this.settleBtn = this.$refs.settleBtn;

            this.userInfoInput = this.$refs.userInfoInput;
            this.createPlayerBtn = this.$refs.createPlayerBtn;

            this.createGroupBtn = this.$refs.createGroupBtn;
            this.joinGroupBtn = this.$refs.joinGroupBtn;
            this.userGroupInput = this.$refs.userGroupInput;
            
            // this.socket.on("connect", () => {
            //     this.textDisplay.value += this.socket.id;

            // });

            this.socket.on("playerDisconnected", (playerName) => {
                this.textDisplay.value += "\n\nPlayer: " + playerName + " has disconnected. The game has been abandoned.";

                this.loddenBtn.style.display = "none";
                this.player1Btn.style.display = "none"; 
                this.player2Btn.style.display = "none";  

                this.listOfPlayersDisplay.value = "";
                this.listOfPlayersDisplay.style.display = "none";                  

                this.questionDisplay.value = "";
                this.loddenAnswerInput.value = "";
                this.questionDisplay.style.display = "none"; 
                this.loddenAnswerInput.style.display = "none";
                this.setQuestionBtn.style.display = "none";

                this.textInput.style.display = "none";
                this.sendBtn.style.display = "none";
                this.settleBtn.style.display = "none"; 
                                
            });

            this.socket.on("playerMove", (playerName, value) => {
                this.textDisplay.value += "\n\n"                 
                this.textDisplay.value += playerName + " has selected under [" + value + "]";  
                this.currentValue = value;                            
                
            });            

            this.socket.on("loddenIs", (name) => {  
                this.listOfPlayersDisplay.style.display = "initial";   
                this.listOfPlayersDisplay.value += name + " is lodden\n";
                this.loddenBtn.style.display = "none"; 
                
                
            });

            this.socket.on("player1Is", (name) => { 
                this.listOfPlayersDisplay.style.display = "initial";                
                this.listOfPlayersDisplay.value += name + " is Player1\n";                
                this.player1Btn.style.display = "none";  
            });
            
            this.socket.on("player2Is", (name) => {      
                this.listOfPlayersDisplay.style.display = "initial";          
                this.listOfPlayersDisplay.value += name + " is Player2\n";
                this.player2Btn.style.display = "none";  
            });

            this.socket.on("hidePlayerSelectionControls", () => {     
                
                this.loddenBtn.style.display = "none";                  
                this.player1Btn.style.display = "none";  
                this.player2Btn.style.display = "none";  
            });

            this.socket.on("askloddenForQuestionAndAnswer", () => {     
                                   
                this.questionDisplay.style.display = "block"; 
                this.loddenAnswerInput.style.display = "block";
                this.setQuestionBtn.style.display = "block";      
                
                //these need to be reset for when someone disconnects and the game restarts
                this.questionDisplay.readOnly = false;
                this.loddenAnswerInput.readOnly = false;                
            });

            this.socket.on("gameReady", (question) => {     
                
                this.setQuestionBtn.style.display = "none";
                this.questionDisplay.style.display = "block";   
                this.questionDisplay.value = "Q: " + question;
                this.questionDisplay.readOnly = true;
                this.loddenAnswerInput.readOnly = true;

                //currentValue needs to be reset here for game after the initial one
                this.currentValue = 0; 
            });

            this.socket.on("showPlayerControls", () => {     
                
                this.textInput.style.display = "initial";
                this.sendBtn.style.display = "initial";
                this.settleBtn.style.display = "initial";                
            });

            this.socket.on("hidePlayerControls", () => {     
                
                this.textInput.style.display = "none";
                this.sendBtn.style.display = "none";
                this.settleBtn.style.display = "none";
            });

            this.socket.on("declareWinner", (direction, winningName, winningGuess, loddenAnswer) => {
               
                if(direction == "theUnder")
                {
                    this.textDisplay.value = "\nThe winner is: " + winningName + ", with under [" + winningGuess + "]";
                }
                else if (direction == "theOver")
                {
                    this.textDisplay.value = "\nThe winner is: " + winningName + ", with [" + winningGuess + "] and over";
                }

                this.textDisplay.value += "\n\nlodden thought: " + loddenAnswer;
            });                          

            this.socket.on("printPlayers", (players) => {              
                this.textDisplay.value ="";

                for(var i = 0; i < players.length; i ++)
                {
                    this.textDisplay.value += "\n" + players[i].name;
                }                               
            });

            this.socket.on("printGroup", (group) => {                
                this.textDisplay.value = "\nGroup " + group[0] + ":\n";
                
                //Start at index 1 since position 0 is the name of the group
                for(var i = 1; i < group.length; i ++)
                {
                    this.textDisplay.value += "\n" + group[i].name;
                }                               
            });

            this.socket.on("printUsername", (username) => {                
                this.textDisplay.value = "\n" + username + " has connected";
            });

            this.socket.on("hideCreatePlayerControls", () => {
                this.createPlayerBtn.style.display = "none";
                this.userInfoInput.style.display = "none";
            });

            this.socket.on("showCreateAndJoinGroupControls", () => { 
                this.createGroupBtn.style.display = "block";
                this.joinGroupBtn.style.display = "block";
                this.userGroupInput.style.display = "block"; 
            });

            this.socket.on("hideCreateAndJoinGroupControls", () => { 
                this.createGroupBtn.style.display = "none";
                this.joinGroupBtn.style.display = "none";
                this.userGroupInput.style.display = "none"; 
            });

            this.socket.on("showRoleSelectionControls", () => {               
                this.loddenBtn.style.display = "block";
                this.player1Btn.style.display = "block";            
                this.player2Btn.style.display = "block";
            });            
        },
        methods: {
            //Sending in "this.$refs.textDisplay.value" as a param from the button tag that calls this method didnt work         
            move() { 
                this.textDisplay = this.$refs.textDisplay;
                this.textInput = this.$refs.textInput;

                var value = this.textInput.value;                 
                
                this.textInput.value = ""; 

                //Only the first digit was being used in the comparison, for example, it wasnt comparing "15" as a whole, instead it appeared to be only using the "1".
                //Not entirely sure what was happening but this appears to have resolved any issues, could have just been the values were being stored as strings
                if(Number(value) > Number(this.currentValue))
                {                   
                    this.socket.emit("move", value);
                }
                else
                {
                    this.textDisplay.value += "\n\nInvalid move, given value is below or equal to your opponents guess";
                }
            },

            settle() {
                this.socket.emit("settle");
            },

            setlodden() {                
                this.socket.emit("assignlodden");
            },

            setPlayer1() {                
                this.socket.emit("assignPlayer1");
            },

            setPlayer2() {                
                this.socket.emit("assignPlayer2");
            },

            setQuestionAndAnswer() {
                var question = this.$refs.questionDisplay.value;
                var answer = this.$refs.loddenAnswerInput.value;                

                this.socket.emit("setQuestionAndAnswer", question, answer);
            },
            
            createPlayer() {
                var username = this.$refs.userInfoInput.value;   
                var textDisplay = this.$refs.textDisplay;                

                this.socket.emit("is username available?", username); 

                this.socket.once("usernameAvailable?", (answer) =>
                {                    
                    if(answer)
                    {      
                        this.socket.emit("createPlayer", username);
                    }
                    else
                    {
                        textDisplay.value = "\n***Username unavailable***"
                    }
                }); 
            },

            createGroup() {
                var groupName = this.$refs.userGroupInput.value;
                var textDisplay = this.$refs.textDisplay;

                this.socket.emit("is group name available?", groupName);                

                this.socket.on("groupNameAvailable?", (answer) =>
                {                    
                    if(answer)
                    {
                        this.socket.emit("createGroup", groupName);
                    }
                    else
                    {
                        textDisplay.value = "\n***Group name unavailable***"
                    }
                });       
            },

            //Currently no validation done on whether the group exists
            joinGroup() {
                var groupName = this.$refs.userGroupInput.value;
                var textDisplay = this.$refs.textDisplay;
                
                this.socket.emit("does group exist and have space?", groupName);                

                this.socket.on("groupJoinable?", (answer) =>
                {                    
                    if(answer)
                    {
                        this.socket.emit("joinGroup", groupName);
                    }
                    else
                    {
                        textDisplay.value = "\n***Unable to join group***"
                    }
                });  
            }
        }
    }


</script>


