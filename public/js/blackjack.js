window.onload = (function() {

	/*
	The following defines 3 constructors for objects used in this game of
	Blackjack. They are: Card, which specifies a suit and value; Hand, which
	is essentially an array of Card objects with specified methods; Deck,
	which is an array of Card objects containing one of each combination for
	a total of 52 cards, excluding Jokers.
	*/

	// suit parameter is any of the strings: spades, clubs, hearts, diamonds
	// value paramter is any of: 1,2,3,4,5,6,7,8,9,10,jack,queen,king,ace
	function Card(suit, value) {
		this.regex = /^([2-9]|10)$/;
		if (!(this.regex.test(value) || value == "jack" || value == "queen" ||
	value == "king" || value == "ace") || !(suit == "spades" || suit == "clubs" ||
	suit == "hearts" || suit == "diamonds"))
			throw new Error("Invalid Card parameters!");
		else {
			this.suit = suit;
			this.value = value;
		}
	}
	// getValue gives the number values associated with face values
	Card.prototype.getValue = function() {
		var v = this.value;
		if (this.regex.test(v)) return this.value;
		else if (v == "jack" || v == "queen" || v == "king") return 10;
		else if (v == "ace") return 1;
	};
	// a custom toString method
	Card.prototype.toString = function() {
		return this.value + " of " + this.suit;
	};
	// grabs the proper sprite based on the cards suit and face value
	Card.prototype.draw = function(node,isCardUp) {
		var card, x, y;
		if (isCardUp) {
			card = makeEl("div","card");

			switch (this.suit) {
			case "spades":
				y = 375;
				break;
			case "clubs":
				y = 0;
				break;
			case "hearts":
				y = 250;
				break;
			case "diamonds":
				y = 125;
				break;
			}

			switch (this.value) {
			case "ace":
				x = 0;
				break;
			case 2:
				x = 100;
				break;
			case 3:
				x = 200;
				break;
			case 4:
				x = 300;
				break;
			case 5:
				x = 400;
				break;
			case 6:
				x = 500;
				break;
			case 7:
				x = 600;
				break;
			case 8:
				x = 700;
				break;
			case 9:
				x = 800;
				break;
			case 10:
				x = 900;
				break;
			case "jack":
				x = 1000;
				break;
			case "queen":
				x = 1100;
				break;
			case "king":
				x = 1200;
				break;
			}

			card.style.background = "url(/images/cards.png) -" + x + "px -" + y + "px";
			node.appendChild(card);
		} else {
			card = makeEl("div","card");
			card.style.background = "url(/images/cards.png) -200px -500px";
			node.appendChild(card);
		}
	};

	// defines the Hand object that will track what cards are in play for each
	// player
	function Hand(player) {
		if (player) this.player = player;
		this.cards = [];
	}
	// empties the Hand
	Hand.prototype.clear = function() {
		this.cards = [];
	};
	// adds a Card to the Hand
	Hand.prototype.addCard = function(card) {
		if (card == null) throw new Error("Can't add a blank card to the hand!");
		else this.cards.push(card);
	};
	// gets the Card at the given integer position, throws an error if an invalid
	// parameter is given
	Hand.prototype.getCard = function(pos) {
		if (!(typeof pos === "number")) {
			throw new Error("getCard() must take a number as its argument.")
			return;
		}
		if ((pos+1) > this.size() || pos < 0)
			throw new Error("Invalid position in the hand!");
		else
			return this.cards[pos];
	}
	// sets a simple method to return the length of the cards array in the Hand,
	// which is indicative of the number of cards the given Hand has
	Hand.prototype.size = function() { return this.cards.length; };
	// counts and returns the Blackjack value of the given Hand, sets Aces to
	// have a value of 1 or 11 where appropriate
	Hand.prototype.getHandValue = function() {
		var val = 0;
		var isAce = false;
		// count up the total value of the hand and mark if an ace is present
		for (var i = 0; i < this.size(); i++) {
			val += this.cards[i].getValue();
			if (this.cards[i].value == "ace") isAce = true;
		}

		if (isAce && val + 10 <= 21)
			val += 10;

		return val;
	};

	// defines the Deck object that will hold each possible Card and provide
	// appropriate methods
	function Deck() {
		this.cards = [];
		this.used = 0;
		var suits = ["spades","clubs","hearts","diamonds"];
		var vals = [2,3,4,5,6,7,8,9,10,"jack","queen","king","ace"];
		var cardCt = 0;

		for (var s = 0; s < suits.length; s++) {
			for (var v = 0; v < vals.length; v++) {
				this.cards[cardCt] = new Card(suits[s],vals[v]);
				cardCt++;
			}
		}
		this.length = this.cards.length;
	}
	// randomizes the order of Cards in the Deck
	Deck.prototype.shuffle = function() {
		var rand, temp;
		for (var i = this.length-1; i > 0; i--) {
			rand = Math.round(Math.random()*(i+1));
			temp = this.cards[i];
			this.cards[i] = this.cards[rand];
			this.cards[rand] = temp;
		}
		this.used = 0;
	};
	// returns the Card at the top of the Deck, note that the cards array isn't
	// altered, the position is mereley tracked by the .used property
	Deck.prototype.dealCard = function() {
		if (this.used == this.length)
			throw new Error("No cards left in the deck!");
		else {
			this.used++;
			return this.cards[this.used - 1];
		}
	};

	/* -----------------------------------------------------------------------------
	The following begins the implementation of the actual Blackjack game details
	*/

	// start by implementing the game of Blackjack with necessary high scope
	// variables

	var deck = new Deck(),			// the deck to be used
	player = new Hand("player"),	// the hand for the player
	dealer = new Hand("dealer"),	// the hand for the dealer
	hitButton, standButton, newGameButton, cashOutButton,
	message = document.getElementById("message"),	// where messages will be shown
	table = document.getElementById("card_table"),	// the table where cards will be drawn
	bank = document.getElementById("funds"),	// the amount the player has to bet
	startBank, bet,
	gameOver = false, isReset = false,	// gameOver determines whether the player has run out of money or cashed out, isReset determines whether it's time to set up a new round
	firstDealerCard;	// the element where the dealer's face-down card is stored

	deck.shuffle(); 	// the deck is shuffled at initialization

	newGameButton = document.getElementById("new_game");
	hitButton = document.getElementById("hit");
	standButton = document.getElementById("stand");
	cashOutButton = document.getElementById("cash_out");

	newGameButton.addEventListener("click",buttonListener);

	/* -----------------------------------------------------------------------------
	The following are the listeners used for reacting to appropriate events.
	There is a single listener that handles all button clicks, buttonListener,
	and a listener for 'Enter' key presses when necessary, inputHandler
	*/

	// define what happens on a button click
	function buttonListener(e) {
		var button = e.target;
		if (button.id == "new_game") {
			toggleButton(button);
			button.removeEventListener("click",buttonListener);

			if (gameOver) {
				reset();
				var input = document.getElementById("bank_input");
				message.innerHTML = "How much are you playing with" +
				" this game?<br />Set an amount and press 'enter'";
				input.style.display = "block";
				input.addEventListener("keydown",inputHandler);
				input.focus();
			}
			else if (isReset) {
				reset();
				startGame();
			} else {
				var input = document.getElementById("bank_input");
				message.innerHTML = "How much are you playing with" +
				" this game?<br />Set an amount and press 'Enter'";
				input.style.display = "block";
				input.addEventListener("keydown",inputHandler);
				input.focus();
			}
		} else if (button.id == "hit") {
			doHit();
		} else if (button.id == "stand") {
			playDealer();
		} else if (button.id == "cash_out") {
			message.innerHTML = "Thanks for playing!<br />" +
			"You started with $" + startBank + " and ended with $" + bank.textContent +
			".<br /><br />To start again click 'New Game'";
			toggleButton(cashOutButton);
			cashOutButton.removeEventListener("click",buttonListener);
			gameOver = true;
			reset();
		}
		e.stopPropagation();
	}

	// used for setting the bank and bets, listens for 'Enter' key presses
	function inputHandler(e) {
		var regex = /^(\d{1,4}|10000)$/;
		if (e.keyCode == 13) {
			if (regex.test(e.target.textContent)) {
				if (e.target.id == "bank_input") {
					startGame(e.target);
				} else if (e.target.id == "bet_input") {
					try {
						setBet(e.target);
					} catch (error) {
						message.innerHTML = error.message +
						" Enter a valid amount";
						e.target.innerText = "";
					}
				}
			} else {
				message.innerHTML = "You must enter a whole-number " +
				"amount up to 10,000!";
				e.target.textContent = ""
				e.target.focus();
			}
			e.preventDefault();
		}
	}

	/* ----------------------------------------------------------------------------
	Set up some utility functions.
	*/

	// create a DOM element with an optional given class
	function makeEl(el, className) {
		var elt = document.createElement(el);
		if (className) elt.className = className;
		return elt;
	}
	// activates and deactivates a button visually only, there is no check for state
	// so the implementation of this simple function must be controlled carefully.
	// Takes a DOM element that is to be used as a button.
	function toggleButton(ele) {
		ele.classList.toggle("button-active");
		ele.classList.toggle("button-disabled");
	}
	// used at each New Game state, simply clears the game while keeping track of
	// whether it's a total restart or just a new hand
	function reset() {
		if (gameOver) {
			document.getElementById("bet_input").style.display = "none";
			startBank = 0;
			bank.innerText = "0";
			gameOver = false;
		} else {
			toggleButton(cashOutButton);
			cashOutButton.removeEventListener("click",buttonListener);
		}
		isReset = false;
		player.clear();
		dealer.clear();
		deck.shuffle();
		tableClear();
		showPoints(dealer,false);
		showPoints(player,false);
	}
	// takes a Hand and a boolean value to determine whether to display the points
	// of the given Hand in the side panel
	function showPoints(hand,show) {
		var val = hand.getHandValue(),
		points;
		if (hand.player == "player") {
			points = document.getElementById("p");
			if (show)
				points.innerText = "Player: " + val;
			 else
				 points.innerText = "";
		} else if (hand.player == "dealer") {
			points = document.getElementById("d");
			if (show)
				points.innerText = "Dealer: " + val;
			else
				points.innerText = "";
		}
	}
	// called by the hitButton element on a click, adds a Card to the player Hand
	// from the Deck, calls drawCard, and calls checkPlayerTurn to check whether
	// it is time to calculate win/loss, if it is then it calls playDealer
	function doHit() {
		player.addCard(deck.dealCard());
		drawCard(player);
		if(!checkPlayerTurn()) playDealer();
	}
	// updates player's point count and returns whether it's still the player's turn
	function checkPlayerTurn() {
		showPoints(player,true);
		var val = player.getHandValue();
		if (val > 21 || val == 21 || player.size() >= 5)
			return false;
		else
			return true;
	}
	// activate the bet input and initialize the bank as well as deal and call
	// drawCard() for each Hand, sets the players points to visible by calling
	// showPoints()
	function startGame(el) {
		var betInput = document.getElementById("bet_input");
		if (el) {
			document.getElementById("funds").innerText = el.innerText;
			startBank = Number(el.textContent);
			el.style.display = "none";
			el.innerText = "";
			el.removeEventListener("keydown",inputHandler);
			betInput.style.display = "block";
		}
		message.innerHTML = "Enter the amount of your bet and press 'Enter'!";
		betInput.innerText = "";
		betInput.addEventListener("keydown",inputHandler);
		betInput.setAttribute("contenteditable","true");
		betInput.focus();

		// deal the starting cards to each player
		table.style.display = "block";
		drawLabels(15,15,document.getElementById("card_panel"));

		player.addCard(deck.dealCard()); drawCard(player);
		player.addCard(deck.dealCard()); drawCard(player);
		dealer.addCard(deck.dealCard()); drawCard(dealer);
		dealer.addCard(deck.dealCard()); drawCard(dealer);

		showPoints(player,true);
	}
	// gets the placed bet amount from the DOM element passed to it, if the bet
	// is too large it throws an exception, otherwise it activates hitButton and
	// standButton as the game is now in progress. Its last step simply checks
	// the beginning dealt cards to see if there is any point in allowing the
	// player to Hit or Stand, if not it moves on to playDealer()
	function setBet(ele) {
		var funds = Number(bank.textContent);
		bet = Number(ele.textContent);

		if (bet > funds)
			throw new Error("You placed an invalid bet!");
		else {
			ele.setAttribute("contenteditable","false");
			toggleButton(hitButton);
			toggleButton(standButton);
			hitButton.addEventListener("click",buttonListener);
			standButton.addEventListener("click",buttonListener);

			if (checkPlayerTurn())
				message.innerHTML = "<br />Click 'Hit' or 'Stand'";
			 else
				playDealer();
		}
	}
	// Takes a boolean value to determine whether the hand was a loss or win and
	// updates the bank accordingly. If the bank reaches 0 it sets the variable
	// gameOver to true to signal a total restart will be necessary
	function payout(didPlayerWin) {
		if (didPlayerWin) {
			bank.innerText = Number(bank.textContent) + 2*bet;
		} else {
			bank.innerText = Number(bank.textContent) - bet;
			if (Number(bank.textContent) <= 0) gameOver = true;
		}
		return gameOver;
	}
	// This function is where the actual Blackjack rules are implemented and checked
	// to find the result and set up for the next hand or a new game.
	function playDealer() {
		toggleButton(hitButton);
		hitButton.removeEventListener("click",buttonListener);
		toggleButton(standButton);
		standButton.removeEventListener("click",buttonListener);
		// show the first dealer card
		showFirstDealerCard();

		var valD = dealer.getHandValue();
		var valP = player.getHandValue();

		if (valD >= 16 || (valD < 16 && valP > 21)) {
			if (valD == 21 || valD == valP || valD > valP || valP > 21) {
				if (payout(false)) {
					gameOver = true;
					message.innerHTML = "The dealer wins " + valD + " to " + valP +
					".<br />You lost $" + bet + " and you've gone broke!" +
					"<br /><br />To start again click 'New Game'";
				} else {
					message.innerHTML = "The dealer wins " + valD + " to " + valP +
					".<br />You lose $" + bet + "<br /><br />To play again click 'New Game'";
				}
			} else if (valP > valD) {
				message.innerHTML = "You Win " + valP + " to " + valD + "!" +
				"<br />You get $" + (2*bet) +
				".<br /><br />To play again click 'New Game'";
				payout(true);
			}
		} else {
			while (valD < 16) {
				dealer.addCard(deck.dealCard());
				drawCard(dealer, false);
				valD = dealer.getHandValue();
			}

			if (valD > 21) {
				message.innerHTML = "You Win " + valP + " to " + valD + "!" +
				"<br />You get $" + (2*bet) +
				".<br /><br />To play again click 'New Game'";
				payout(true);
			}
			else if (valD == 21 || valD == valP || valD > valP || valP > 21) {
				if (payout(false)) {
					gameOver = true;
					message.innerHTML = "The dealer wins " + valD + " to " + valP +
					".<br />You lost $" + bet + " and you've gone broke!" +
					"<br /><br />To start again click 'New Game'";
				} else {
					message.innerHTML = "The dealer wins " + valD + " to " + valP +
					".<br />You lose $" + bet + "<br /><br />To play again click 'New Game'";
				}
			} else if (valP > valD) {
				message.innerHTML = "You Win " + valP + " to " + valD + "!" +
				"<br />You get $" + (2*bet) +
				".<br /><br />To play again click 'New Game'";
				payout(true);
			}
		}
		showPoints(dealer,true);
		isReset = true;

		if (!gameOver) {
			toggleButton(cashOutButton);
			cashOutButton.addEventListener("click",buttonListener);
		}
		toggleButton(newGameButton);
		newGameButton.addEventListener("click",buttonListener);
	}

	/* ----------------------------------------------------------------------------
	The following functions are used to provide graphical representations of the
	game elements.
	*/

	// in position (x,y) in the given node this draws a vertical label for DEALER
	// for dealer cards and PLAYER for player cards
	function drawLabels(x,y,node) {
		var wrapper = makeEl('div','label');
		var p = makeEl('p');
		p.innerText = "D\nE\nA\nL\nE\nR\n\nP\nL\nA\nY\nE\nR";
		wrapper.appendChild(p);
		wrapper.style.top = y + "px";
		wrapper.style.left = x + "px";
		node.appendChild(wrapper);
	}
	// used at a New Game to wipe the labels and prevent duplication
	function clearLabels() {
		var label = document.querySelector(".label");
		label.parentNode.removeChild(label);
		return false;
	}
	// given a Hand object this determines if it's the dealer or the player by their
	// .player property and acts accordingly. If it's the first dealer card, it is
	// drawn face-down
	function drawCard(hand) {
		var card, row, ele;
		if (hand.player == "dealer") {
			row = document.getElementById("dealer");
			card = hand.getCard(hand.size() - 1);
			ele = makeEl("th");
			if (hand.size() == 1) {
				card.draw(ele, false);
				firstDealerCard = ele;
			}
			else
				card.draw(ele, true);
			row.appendChild(ele);

		} else if (hand.player == "player") {
			row = document.getElementById("player");
			card = hand.getCard(hand.size() - 1);
			ele = makeEl("th");
			card.draw(ele, true);
			row.appendChild(ele);
		}
	}
	// Used to replace the face-down image of the first dealer card with a face-up
	// representation. It takes the variable firstDealerCard which holds a reference
	// to the DOM element holding the appropriate card, wipes it of child nodes and
	// adds a face-up representation.
	function showFirstDealerCard() {
		while (firstDealerCard.hasChildNodes()) {
			firstDealerCard.removeChild(firstDealerCard.lastChild);
		}
		dealer.cards[0].draw(firstDealerCard,true);
	}
	// Used to empty the table element holding the card visualizations as well as
	// the labels for PLAYER and DEALER
	function tableClear() {
		var tableElements = document.querySelectorAll("th");
		Array.prototype.forEach.call(tableElements,function(element){
			element.parentNode.removeChild(element);
		});
		clearLabels();
		return false;
	}

})
