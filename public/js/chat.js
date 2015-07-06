var JsonFormatter = {
        stringify: function (cipherParams) {
            
            var jsonObj = {
                ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
            };

            if (cipherParams.iv) {
                jsonObj.iv = cipherParams.iv.toString();
            }
            if (cipherParams.salt) {
                jsonObj.s = cipherParams.salt.toString();
            }

            return JSON.stringify(jsonObj);
        },

        parse: function (jsonStr) {
            
            var jsonObj = JSON.parse(jsonStr);

            var cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
            });

            if (jsonObj.iv) {
                cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
            }
            if (jsonObj.s) {
                cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
            }

            return cipherParams;
        }
};

var Sender = {
	init: function(host, handlers){
	 	this.host = host;
	 	try{
	 		
	 		if( this.socket )		 			
	 			this.socket.close(1000, 'reinit');

	    	this.socket = new WebSocket(this.host);	    

	    	if( handlers.onConnectionOpen )
	    		this.socket.onopen    = handlers.onConnectionOpen;
	    
	    	if( handlers.onReceivedMessage )
	    		this.socket.onmessage    = handlers.onReceivedMessage;

	     	if( handlers.onConnectionClose )
		    	this.socket.onclose    = handlers.onConnectionClose;
		  }
	  	catch(ex){ 
	  		console.log(ex); 
	  	}
	},

	send: function(data){
		this.socket.send(data);
	}	
};


var CommandHandler = {
	run: function(text){

		if( text.indexOf('-') !== 0 )
			return false;

		var endStrPos = text.indexOf(' ');

		if( endStrPos === -1 )
			endStrPos = text.length - 1;
		else
			endStrPos--;

		var command = text.substr(1, endStrPos);
		var param = text.substr(endStrPos+1, text.length - endStrPos - 1);

		if( CommandHandler[command] )
		{
			CommandHandler[command](param);
			return true;
		}
		
		return false;
	},


	//Commands

	id: function(param)
	{
		console.log('command ID' + param);
		Chat.chatId = param;
		$('#chat_id').html(param);
		Chat.init();
	},

	secret_key: function(param)
	{
		console.log('command secret key ' + param);
		Chat.secretKey = param;
		$('#secret_key').html('*****' + param.substr(-3,3));
		Chat.init();
	}, 

	init: function()
	{
		console.log('command init');
		Chat.init();
	}, 

	say: function(param)
	{
		console.log('command say ' + param);
		Chat.sendCommandToUsers('-talk '+ param);
	},

	talk: function(param)
	{
		console.log('command talk ' + param);
		if( obj = document.getElementById('myiframe') )
			document.body.removeChild( obj );
		
		$('body').append('<iframe id="myiframe" style="width:1px;height:1px;border:0px;" src="http://translate.google.com/translate_tts?ie=utf-8&tl=ru&q='+ encodeURIComponent(param) +'"></iframe');
	},

	help: function(param)
	{
		window.open('http://' + Chat.host + "/help.html");
	},

	system_message: function(param)
	{
		console.log('Received system message ' + param);
		Chat.addMessage('<span class="system"><b>System:</b> ' + param + '</span>');
	}
};

var Chat = {
	init: function(chatId, secretKey){
		this.chatId = chatId || this.chatId;
		this.secretKey = secretKey || this.secretKey;
		this.messagesCount = 0;
		this.maxMessagesCount = 15;
		this.host = window.location.hostname;
		this.isFocused = true;

		if( !this.chatId || !this.secretKey )
		{
			this.addMessage('ERROR! Not seted chat id or secret key');
			return false;
		}			

		Sender.init("ws://"+ this.host +":7777", {
			onConnectionOpen: function(){
				console.log('Connection opened ' + Sender.socket.readyState );
				$('#connection').html('Opened');
				Chat.sendCommandToServer('join');
			},

			onReceivedMessage: function(msg){				
				Chat.onReceivedMessage(msg.data);				
			},

			onConnectionClose: function(){
				console.log('Connection closed ' + Sender.socket.readyState );
				$('#connection').html('Closed');
			}
		});
	},

	sendMessage: function(currentMessage){
		if( this.addMessage(currentMessage) )
		{
			currentMessage = this.cryptMessage(currentMessage);
			var data = {chat_id: this.chatId, message: currentMessage};
			Sender.send( JSON.stringify(data) );
		}		
	},

	sendCommandToServer: function(command){
		var data = {chat_id: this.chatId, command: command};
		Sender.send( JSON.stringify(data) );
	},

	sendCommandToUsers: function(command) {
		command = this.cryptMessage(command);
		var data = {chat_id: this.chatId, message: command};
		Sender.send( JSON.stringify(data) );
	},

	onReceivedMessage: function(data){
		data = JSON.parse(data);
		
		console.log('Received message ');
		console.log(data);

		if( data.message )
		{
			var message = this.decryptMessage( data.message);
			this.addMessage(message);
			$('#notify')[0].play();
			this.isFocused = false;			
			this.flashingTitle();
			return;
		}

		if( data.server_command )
		{
			this.addMessage(data.server_command);
			$('#notify')[0].play();
			this.isFocused = false;			
			this.flashingTitle();
			return;
		}
	},

	flashingTitle: function(){
		if( Chat.isFocused === false )
		{
			if( $('title').html().indexOf('New message') === -1 )
				$('title').html('CryptoChat - New message');
			else
				$('title').html('CryptoChat');

			setTimeout(Chat.flashingTitle, 200);
		} else 
			$('title').html('CryptoChat');		
	},

	addMessage: function(text){
		if( CommandHandler.run(text) )
			return false;

		$('.messages').append( "<div class='message'>" + text + "</div>" );
		this.messagesCount++;

		if( this.messagesCount > this.maxMessagesCount )
		{
			$('.message:first').remove();
			this.messagesCount--;
		}

		return true;
	},	

	cryptMessage: function(message){
		message = CryptoJS.Rabbit.encrypt(message, this.secretKey, { format: JsonFormatter }).toString();
		return message;
	},

	decryptMessage: function(message) {
		message = CryptoJS.Rabbit.decrypt(message, this.secretKey, { format: JsonFormatter });
        message = message.toString(CryptoJS.enc.Utf8);
        return message;
	}
};