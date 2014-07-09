var narratedSlides = {
	// variable to track which slide you're on {int}
	currentSlide : 0,
	// variable to track error state {string}
	error        : '',
	// variable to determine whether there are terms of use or not
	hasTerms     : false,
	// variable to hold array of slides {array}
	slides       : null,
	// variable to hold total slides {int}
	totalSlides  : 0,

	/**
	 * function to disable previous and next buttons based on certain conditions
	 */
	checkControls: function(){
		//at the beginning
		if (narratedSlides.currentSlide === 0) {
			$('.slide-viewer-prev').addClass('disabled');
		} else {
			$('.slide-viewer-prev').removeClass('disabled');
		}

		//at the end
		if (narratedSlides.currentSlide + 1 === narratedSlides.totalSlides) {
			$('.slide-viewer-next').addClass('disabled');
		} else {
			$('.slide-viewer-next').removeClass('disabled');
		}

		//loop through each pip and use classes to determine if it is active or not
		$('.pip').each(function(index) {
			if($(this).data('index') === narratedSlides.currentSlide) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
	},
	/**
	 * function to determine whether to display the terms of use before beginning
	 * presentation
	 */
	checkHasTerms: function(){
		if(narratedSlides.slides.hasOwnProperty('termsSlide')) {
			narratedSlides.hasTerms = true;
		}
	},
	/**
	 * function to make sure a checkbox exists for Terms of Use acceptance
	 */
	checkHasTermsCheckbox: function() {
		//if a slide-viewer-checkbox doesn't exist, make sure we have one
		if($('.slide-viewer-checkbox').length < 1){
			//create checkbox with proper labels and class
			var proceedCheckbox = $('<input type="checkbox" class="slide-viewer-checkbox" name="proceed-checkbox">');
			var proceedCheckboxLabel = $('<label class="slide-viewer-checkbox-label">');

			//insert some kind of acceptance text
			proceedCheckboxLabel.text('I have read and accept the Terms of Use.');

			//append the elements to the proper places
			proceedCheckbox.prependTo(proceedCheckboxLabel);
			proceedCheckboxLabel.appendTo('.slide-viewer');
		}
	},
	/**
	 * function to make sure the .slide-viewer-terms container exists
	 */
	checkHasTermsContainer: function(type){
		if($('.slide-viewer-terms').length < 1) {
			alert('The class .slide-viewer-terms was not found. Wrap your terms of use with an element using this class');
			return false;
		} else {
			//add a class of the type of proceedOn event to the container, if provided
			if(type !== "") {
				$('.slide-viewer-terms').addClass('slide-viewer-proceed-'+type);
			}
			//make sure there is a proceed button
			narratedSlides.checkHasTermsContainerButton();
			return true;
		}
	},
	/**
	 * function to make sure a button exists in the slive-viewer-terms container
	 */
	checkHasTermsContainerButton: function(){
		if($('.slide-viewer .slide-viewer-proceed').length < 1) {
			//if a button is not found, make one and append it.
			var termsButton = $('<button class="slide-viewer-proceed">');
			termsButton.text("Proceed");
			termsButton.appendTo('.slide-viewer');
		} else {
			return true;
		}
	},
	/**
	 * function to enable the slide viewer controls
	 */
	enableControls: function() {
		$('.slide-controls').addClass('active');
	},
	/**
	 * function to load the slide information from the JSON file
	 */
	getSlides: function() {
		//make a JSON request for the slides
		$.getJSON('slides/slides.json', function(json) {
			//set the return to the slides variable
		  narratedSlides.slides = json;
			//get the total number of slides
			narratedSlides.totalSlides = narratedSlides.slides.slideDeck.length;
			//prepare prev and next buttons
			narratedSlides.checkControls();
			//check to see if we should display terms before starting the slides
			narratedSlides.checkHasTerms();
			//check the hashtag of the page to see where the presentation should begin
			narratedSlides.getStartingSlide();
			//after getting the json, run the setup function to build nav controls
			narratedSlides.setupControls();
		})
		//fail promise displays an error if the slides couldn't be loaded
		.fail(function() {
			narratedSlides.error = "Failure to load JSON file.";
			alert("There was an error loading the slide deck.");
		});
	},
	/**
	 * function to determine which slide to start with, based on hash
	 */
	getStartingSlide: function() {
		var hash = window.location.hash;
		//default it to 0 (the first slide)
		var index = 0;

		//loop through the slides and look for the hash, set it to current if found
		$.each(narratedSlides.slides.slideDeck, function(index, value){
			if('#'+value.slug == hash) {
				narratedSlides.currentSlide = index;
			}
		});
	},
	/**
	* function to run when a slide-viewer is detected
	* @return {Void}
	*/
	init: function() {
		//load the slides
		// NOTE: A lot of important functionality setup depends on the slides
		// getting loaded; look in the callback to see what's going on
		narratedSlides.getSlides();

		//set up the launcher button
		$('.slide-viewer').on(
			'click',
			'.launch-slides',
			function() {
				if(narratedSlides.hasTerms) {
					narratedSlides.loadTermsSlide();
				} else {
					narratedSlides.loadSlide(narratedSlides.currentSlide);
					narratedSlides.enableControls();
				}
			}
		);

		$('audio').on(
			'ended',
			function() {
				console.log('AUDIO OVER');
			}
		);
	},
	/**
	 * function to load in a specified slide
	 * @param {Integer} targetSlide - the index of the slide to load from the
	 * array
	 */
	loadSlide: function(targetSlide) {
		console.log("TargetSlide: "+ targetSlide);
		//make sure the slide we're trying to load is in fact a number
		if(!isNaN(targetSlide)) {
			//ensure the number is an integer
			narratedSlides.currentSlide = parseInt(targetSlide,10);
			$.get(
				narratedSlides.slides.slideDeck[narratedSlides.currentSlide].file,
				function(response){
					//display the html file
					$('.slide-area').html(response);
					//make sure the interface is updated properly
					narratedSlides.checkControls();
				}
			)
			//fail promise to indicate if there was a failure loading the slide
			//(likely a 404 or improperly typed path in the JSON)
			.fail(function(){
				alert("There was an error loading this slide. Slide #"+targetSlide+1);
			});
		} else {
			narratedSlides.error = "Index given was not a number.";
			alert("The player did not receive a valid Slide Deck Index.");
		}
	},
	/**
	 * function to load the Terms of Use Slide and set up acceptance parameters
	 */
	loadTermsSlide: function() {
		$.get(
			narratedSlides.slides.termsSlide.file,
			function(response){
				//display the html file
				$('.slide-area').html(response);
				narratedSlides.setupTermsProceed();
			}
		)
		//fail promise to indicate if there was a failure loading the slide
		//(likely a 404 or improperly typed path in the JSON)
		.fail(function(){
			alert("There was an error loading the terms of use slide.");
		});
	},

	/**
	 * function to easily load the next slide in the deck
	 */
	loadNextSlide: function(){
		narratedSlides.loadSlide(narratedSlides.currentSlide + 1);
	},

	/**
	 * function to easily load the previous slide in the deck
	 */
	loadPrevSlide: function() {
		narratedSlides.loadSlide(narratedSlides.currentSlide - 1);
	},

	/**
	 * function to set up the slide viewer's controls
	 */
	setupControls: function() {
		//set up the pips
		narratedSlides.setupSlidePips();

		//set up the next button
		$('.slide-viewer').on(
			'click',
			'.slide-viewer-next',
			function(e) {
				e.preventDefault();
				if(!$(this).hasClass('disabled')){
					narratedSlides.loadNextSlide();
				}
			}
		);

		//set up the prev button
		$('.slide-viewer').on(
			'click',
			'.slide-viewer-prev',
			function(e) {
				e.preventDefault();
				if(!$(this).hasClass('disabled')){
					narratedSlides.loadPrevSlide();
				}
			}
		);
	},
	/**
	 * function to prepare clickable pips to jump to specific slides
	 */
	setupSlidePips: function() {
		//create a nav element
		var nav = $('<nav class="slide-pips">');

		//create pips for each slide in the deck
		$.each(narratedSlides.slides.slideDeck, function(index, value){
			var pip = $('<a class="pip">');
			//set the hash
			pip.attr('href','#'+value.slug);
			//set the title
			pip.attr('title',value.title);
			//use the index internally for changing slides
			pip.data('index', index);
			pip.text(index+1);

			//click event to jump directly to the slide
			pip.click(function(e){
				//if it is active, don't load the next slide
				if(!$(this).hasClass('active')) {
					narratedSlides.loadSlide($(this).data('index'),10);
				}
			});
			//append the pip to the nav
			pip.appendTo(nav);
		});

		//append the nav to the controls
		nav.appendTo('.slide-controls');
	},
	/**
	 * function to set up the terms of use checkbox click event
	 */
	setupTermsCheckbox: function() {
		$('.slide-viewer-checkbox').click(function(){
			//if the box has been checked, enable the proceed button
			if($(this).is(':checked')) {
				$('.slide-viewer-proceed').prop('disabled', false);
			} else {
				//otherwise, make sure it's disabled
				$('.slide-viewer-proceed').prop('disabled', true);
			}
		});
	},
	/**
	 * function to set up how to proceed through the terms of use slide
	 */
	setupTermsProceed: function() {
		console.log('Terms Proceed+'+ narratedSlides.slides.termsSlide.hasOwnProperty('proceedOn'));
		//ensure that a proceed on property exists
		if(narratedSlides.slides.termsSlide.hasOwnProperty('proceedOn')) {
			console.log('proceedOn: '+narratedSlides.slides.termsSlide.proceedOn);
			switch(narratedSlides.slides.termsSlide.proceedOn) {
				//if the proceed condition is to scroll
				case "scroll":
					if(narratedSlides.checkHasTermsContainer("scroll")) {
						//disable the proceed button
						$('.slide-viewer-proceed').prop('disabled',true);
						narratedSlides.setupTermsScroll();
					}
					break;
				//if the proceed condition is to check a box
				case "checkbox":
					if(narratedSlides.checkHasTermsContainer("checkbox")) {
						$('.slide-viewer-proceed').prop('disabled',true);
						//make sure there's a checkbox, and set up it's functionality
						narratedSlides.checkHasTermsCheckbox();
						narratedSlides.setupTermsCheckbox();
					}
					break;
				default:
					//no proceed conditions, but make sure a button exists
					narratedSlides.checkHasTermsContainerButton();
			}
		} else {
			//no proceed conditions, but make sure a button exists
			narratedSlides.checkHasTermsContainerButton();
		}

		narratedSlides.setupTermsProceedButton();
	},
	/**
	 * function to proceed through the terms of use
	 */
	setupTermsProceedButton: function(){
		if($('.slide-viewer-proceed').length < 1) {
			alert('The proceed button does not exist.');
		} else {
			$('.slide-viewer-proceed').click(function(){
				$(this).remove();
				$('.slide-viewer-checkbox-label').remove();
				narratedSlides.loadSlide(narratedSlides.currentSlide);
				narratedSlides.enableControls();
			});
		}
	},
	/**
	 * function to watch the scroll event
	 */
	setupTermsScroll: function(){
		//keep an eye on the scroll event
		$('.slide-viewer-proceed-scroll').bind('scroll', function() {
			var scrollDistance = $(this).scrollTop() + $(this).innerHeight();
			if(scrollDistance >= this.scrollHeight) {
				//if scrolled to the end, enable the button
				$('.slide-viewer-proceed').prop('disabled',false);
			} else {
				//otherwise, keep it disabled
				$('.slide-viewer-proceed').prop('disabled',true);
			}
		});
	}
}

$(function(){
	if($('.slide-viewer').length > 0 ){
		narratedSlides.init();
	}
});
