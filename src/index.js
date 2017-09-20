'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var rhymes = require('./rhymes');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

//Define the prompts
var afterRhymeMessage = "... <p>Do you want to hear another rhyme? ... Say another name,\n say 'random',\n or say 'stop' to end our session.</p>"

var languageStrings = {
    "en": {
        "translation": {
            "RHYMES": rhymes.RHYME_EN_US, //source for the RhymeIntent
            "SKILL_NAME": "Old Mother Goose",
            "WELCOME_MESSAGE": "<audio src='https://s3.amazonaws.com/alexasoundscarnival/magicintroSFX.mp3'/> <p>Hello! Welcome to %s, a collection of classic nursery rhymes.</p> <p>You can name a rhyme like 'Jack and Jill' ... say 'Random' and I pick a rhyme for you ... or say 'List' for a list of available rhymes sent to your Alexa app.</p> ... <p>What rhyme would you like to hear?</p>",
            "WELCOME_REPROMPT": "For instructions on what you can say, please say Help Me.",
            "DISPLAY_CARD_TITLE": "%s - %s.",
            "HELP_MESSAGE": "You can name a rhyme like 'Jack and Jill' or say 'Random' and I will pick a rhyme for you. What rhyme would you like to hear?",
            "HELP_REPROMPT": "You can name a rhyme like 'Jack and Jill' or say 'Random' and I will pick a rhyme for you. What rhyme would you like to hear?",
            "STOP_MESSAGE": "Bye bye now!",
            "RHYME_REPEAT_MESSAGE": "Say Repeat to repeat the last rhyme or message.",
            "RHYME_NOT_FOUND_MESSAGE": "I\'m sorry, I currently do not know ",
            "RHYME_NOT_FOUND_WITH_ITEM_NAME": "the rhyme for %s. ",
            "RHYME_NOT_FOUND_WITHOUT_ITEM_NAME": "that rhyme. ",
            "RHYME_NOT_FOUND_REPROMPT": "... <p>What other rhyme do you want me to recite? Or say 'Random' and I will pick a rhyme for you.</p>",
		}
	}
};

var handlers = {
	//When the app first launches
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
	
	//When the user says Random
	'RandomIntent': function () {
		var randomRhyme = require('./random');
		var pickRhyme = randomRhyme[Math.floor(Math.random() * randomRhyme.length)];

		this.attributes['speechOutput'] = pickRhyme + "..." + "<audio src='https://s3.amazonaws.com/alexasoundscarnival/alert_chime_bell_light.mp3'/>" + afterRhymeMessage;
		this.attributes['repromptSpeech'] = this.t("RHYME_REPEAT_MESSAGE");
		this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
	
	//When the user says List
	'ListIntent': function () {
		//List of available rhymes
		var listGet = "patty cake \npeas pudding \nwillie boy \njack and jill \ncross patch \nlittle jack horner \nto market \nrock a bye \nbonny lass \nmary had a pretty bird \na donkey walks on four legs \none a penny \npussy cat \ndance little baby \nsimple simon \nlittle girl little girl \ngoosey goosey gander \nthere was an old woman \nhickety pickety \nlittle boy blue \nhumpty dumpty \nthree little kittens \nlittle bo peep \njack be nimble \nrub a dub dub \nthe little black dog \nboys and girls \ndaffy down dilly \na duck and a drake \nmatthew mark luke and john \nsee saw \nmary mary \nhop away \nthis little piggy \nonce i saw a little bird \ntom tom the pipers son \nthirty days hath september \nthere were two blackbirds \nthe queen of hearts \nmolly and i \nwhen little fred went to bed \npeter peter pumpkin eater \nhey diddle diddle \nhickory dickory dock \nbah bah black sheep \ncock a doodle doo \nlittle miss muffet \none two buckle my shoe \nlittle betty blue \nthere was a crooked man \nthree blind mice \nsing a song of sixpence \nrobin the bobbin \nas i was going along";
		var cardTitle = "List of Nursery Rhymes";
		var listGetStarted = "<p>I have sent a list of available rhymes to your Alexa app.</p> <p>...</p> <p>What rhyme do you want to hear? ... Say a name,\n say 'random',\n or say 'stop' to end our session.</p>";
		var afterListMessage = "<p>What rhyme do you want to hear? ... Say a name,\n say 'random',\n or say 'stop' to end our session.</p>"

		this.attributes['repromptSpeech'] = afterListMessage;
		this.emit(':askWithCard', listGetStarted, this.attributes['repromptSpeech'], cardTitle, listGet);
    },
	
	//When the user names a specific rhyme
    'RhymeIntent': function () {
        var itemSlot = this.event.request.intent.slots.Item;
        var itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        var cardTitle = this.t("DISPLAY_CARD_TITLE", this.t("SKILL_NAME"), itemName);
        var rhymes = this.t("RHYMES");
        var rhyme = rhymes[itemName];

        if (rhyme) {
            this.attributes['speechOutput'] = rhyme + "..." + "<audio src='https://s3.amazonaws.com/alexasoundscarnival/alert_chime_bell_light.mp3'/>" + afterRhymeMessage;
            this.attributes['repromptSpeech'] = this.t("RHYME_REPEAT_MESSAGE");
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        } else {
            var speechOutput = this.t("RHYME_NOT_FOUND_MESSAGE");
            var repromptSpeech = this.t("RHYME_NOT_FOUND_REPROMPT");
            if (itemName) {
                speechOutput += this.t("RHYME_NOT_FOUND_WITH_ITEM_NAME", itemName);
            } else {
                speechOutput += this.t("RHYME_NOT_FOUND_WITHOUT_ITEM_NAME");
            }
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
	
	
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
	
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
	
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
	
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
	
    'SessionEndedRequest':function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
	
    'Unhandled': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
	
};