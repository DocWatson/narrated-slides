var narratedSlides = {
	// variable to track which slide you're on
	currentSlide: 0,
	// variable to hold array of slides
	slides: null,
	// variable to hold total slides
	totalSlides: 0,

	/**
	 * function to disable previous and next buttons based on certain conditions
	 */
	checkControls: function(){
		//at the beginning
		if (narratedSlides.currentSlide === 0) {
			// TODO: disable the prev button
		} else {
			// TODO: un-disable the prev button
		}

		//at the end
		if (narratedSlides.currentSlide === narratedSlides.totalSlides) {
			// TODO: disable the next button
		} else {
			// TODO: un-disable the next button
		}
	},

	/**
	 * function to run when a slide-viewer is detected
	 * @return {Void}
	 */
	init: function() {
		//load the slides
		narratedSlides.getSlides();

		//set up the launcher button
		$('.slide-viewer').on(
			'click',
			'.launch-slides',
			function() {
				// TODO: launch the viewer logic
			}
		);
	},

	/**
	 * function to load the slide information from the JSON file
	 */
	getSlides: function() {
		// make a JSON request for the slides
		$.getJSON('slides/slides.json', function(json) {
			// set the return to the slides variable
		  narratedSlides.slides = json;
			narratedSlides.totalSlides = narratedSlides.slides.slideDeck.length;
			// after getting the json, run the setup function to build nav controls
			narratedSlides.setupControls();
		});
	},

	/**
	 * function to load in a specified slide
	 * @param {Integer} targetSlide - the index of the slide to load from the
	 * array
	 */
	loadSlide: function(targetSlide) {
		narratedSlides.currentSlide = targetSlide;
		console.log(narratedSlides.currentSlide);
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
		$.each(narratedSlides.slides.slideDeck, function(index, value){
			// TODO: build the slide nav pips
		});
	}
}

$(document).ready(function(){
	if($('.slide-viewer').length > 0 ){
		narratedSlides.init();
	}
});
