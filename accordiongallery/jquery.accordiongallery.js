/* 
Accordion Gallery
Ghinda - Cristian Colceriu
www.ghinda.net

v1.0 - 7:40 PM 11/8/2010
*/

// jQuery.support.transition
// check for CSS3 transition
jQuery.support.transition = (function(){ 
    var thisBody = document.body || document.documentElement,
    thisStyle = thisBody.style,
    support = thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.OTransition !== undefined || thisStyle.transition !== undefined;
    return support; 
})();

(function($) {
	// plugin definition
	$.fn.accordionGallery = function(options) {	
		// build main options before element iteration		
		var defaults = {
			theme: 'air',
			maxHeight: 360,
			scrollSpeed: 2000,
			minSliceWidth: 100,
			maxSliceWidth: 500,
			maxSliceHeight: 480
		};
		var options = $.extend(defaults, options);
		/* Make options error-proof, because users never read the documentation.
		 * Convert some options to integers
		 */
		 options.maxHeight = parseInt(options.maxHeight);
		 options.scrollSpeed = parseInt(options.scrollSpeed);
		 options.minSliceWidth = parseInt(options.minSliceWidth);
		 options.maxSliceWidth = parseInt(options.maxSliceWidth);
		 options.maxSliceHeight = parseInt(options.maxSliceHeight);
		
		// iterate and reformat each matched element		
		return this.each(function() {
			// get the gallery jQuery object
			var $gallery = $(this);
			// get each section of the gallery
			var $gallerySections = $gallery.find('section');
			// add the "accordiongallery" and theme classes to the gallery
			$gallery.addClass('accordiongallery ' + options.theme);
			
			// itinerate over each section			
			$gallerySections.each(function() {				
				var $currentSection = $(this);
				
				var initAria = function() {
					 $currentSection.attr({
						'aria-live': 'assertive',
						'aria-atomic': 'true',
						'relevant': 'additions'
					 });					 
				}();
				
				var section = function() {
					// image links in the current section
					var $sectionItems = $currentSection.find('a');
					// wrap thumbs in extra markup
					$sectionItems.wrapAll('<div class="accordiongallery-thumbs" aria-live="polite" />');
					var $sectionItemsContainer = $('.accordiongallery-thumbs', $currentSection);					
					
					// stop vertical scrolling the thumbs
					var stopScroll = function() {
						section.$scroller.stop();
					};
					
					// scroll vertical thumbs up
					var scrollUp = function() {			
						section.$scroller.stop().animate({'top': 0}, options.scrollSpeed);
					};
					
					// scroll vertical thumbs down
					var scrollDown = function() {
						section.$scroller.stop().animate({'top': options.maxHeight - section.$scroller.height()  }, options.scrollSpeed);					
					};
					
					// check if thumbs have a bigger height than the maximum allowed(maxSliceHeight)
					if($sectionItemsContainer.height()>options.maxHeight) {
						// if so, wrap in additional markup
						$sectionItemsContainer.height(options.maxHeight).wrapInner('<div class="accordiongallery-scroller" />');
						var $scroller = $('.accordiongallery-scroller', $currentSection);
						
						$sectionItemsContainer.before('<a class="accordiongallery-scrollup">Scroll up</a>').after('<a class="accordiongallery-scrolldown">Scroll down</a>');
						// add events to vertical scrollers
						var $scrollup = $('.accordiongallery-scrollup', $currentSection);
						$scrollup.hover(scrollUp, stopScroll);
						
						var $scrolldown = $('.accordiongallery-scrolldown', $currentSection);
						$scrolldown.hover(scrollDown, stopScroll);
					};					
										
					// add the original height of the current section as a new attribute					
					// using timeout to avoid issues with Webkit and Transitions
					// Webkit browsers show CSS transitions onload, providing wrong values for height when these are present
					var originalHeight;
					setTimeout(function() {
						originalHeight = $currentSection.height();				
						// We assign the actual size of the section to the .. section
						// That's because Webkit doesn't know how to transition from height:auto						
						$currentSection.css('height', originalHeight);						
					
						$currentSection.attr('data-originalheight', originalHeight);
					}, 100);
					
					// if CSS3 transition support is found, add transition class
					setTimeout(function() {
						if(jQuery.support.transition) $currentSection.addClass('agtransitions');
					}, 200);
					
					// return public vars
					return {
						$scroller: $scroller,
						$container: $sectionItemsContainer,
						$scrollup: $scrollup,
						$scrolldown: $scrolldown,
						$items: $sectionItems
					}
				}();
				
				var gallery = function() {
					// get all sections except the current one
					var $sections = $gallerySections.not($currentSection);			
					
					// an empty object to be used for the image properties
					var image = {};
					
					// open up the image view
					var imageView = function() {
						// image object for the new image
						var loadimage = new Image(); 
						loadimage.src = image.url;
						// loader
						var loadercode = '<p class="accordiongallery-loader">Loading... </p>';
						// actual large image
						var previewcode = '<img src="' + loadimage.src + '" ';						
						if(image.title) previewcode += 'alt="' + image.title + '" ';
						previewcode += 'class="accordiongallery-active-image"/>';
						// image caption
						var captioncode = '<p class="image-caption">';
						if(image.title) {
							captioncode += image.title;
						};
						captioncode += '</p>';
						// scrolling horizontal thumbs
						var scrollercode = '<a class="accordiongallery-scrollleft" style="visibility: hidden">Scroll left</a><div class="accordiongallery-preview-thumbs"><div class="accordiongallery-preview-scroller">';
						if(section.$scroller) scrollercode += section.$scroller.html()
							else scrollercode += section.$container.html();
						scrollercode += '</div></div><a class="accordiongallery-scrollright" style="visibility: hidden">Scroll right</a>';
						
						previewcode += captioncode + scrollercode;
						previewcode = loadercode + '<div class="accordiongallery-preview" style="visibility: hidden; opacity: 0">' + previewcode + '</div>';
						
						// append the code			
						$currentSection.append(previewcode);
						
						// get objects for manipulation
						var $imageView = $('.accordiongallery-preview', $currentSection);
						var $loader = $('.accordiongallery-loader', $currentSection);						
						var $scrollleft = $('.accordiongallery-scrollleft', $imageView);
						var $scrollright = $('.accordiongallery-scrollright', $imageView);						
						var $thumbcontainer = $('.accordiongallery-preview-thumbs', $imageView);
						var	$thumbs = $('a', $thumbcontainer);
						var $image = $('.accordiongallery-active-image', $imageView);
						var $caption =  $('.image-caption', $imageView);						
						if(!$caption.text()) $caption.hide();
						
						var $scroller = $('.accordiongallery-preview-scroller', $imageView);						
						var scrollerwidth = $scroller.find('a').outerWidth(true) * $scroller.find('a').length;						
						
						$scroller.width(scrollerwidth);
						
						// image done loading
						var imageLoaded = function(error) {						
							$loader.css({
								'visibility': 'hidden',
								'opacity': 0
							});
							$imageView.css({
								'visibility': 'visible',
								'opacity': 1
							});
							
							// error loading image
							if(error==true) {
								$image.css('width', '100%');								
								$image.attr('alt', 'Error loading image. Please try refreshing. ');
							};
						};
						// attach events
						loadimage.onload = function() {
							imageLoaded(false)
						};
						loadimage.onerror = function() {
							imageLoaded(true);
						};
						
						loadimage.src = image.url;
						
						// hide vertical thumb list and scrollers
						section.$container.hide();						
						if(section.$scrollup) {
							section.$scrollup.hide();
							section.$scrolldown.hide();
						};
						
						// calculate width of horizontal thumbs and append scrollers if needed
						if(scrollerwidth>$thumbcontainer.width()) {
							var scrollLeft = function() {
								$scroller.stop().animate({'left': 0 }, options.scrollSpeed);
							};
							
							var scrollRight = function() {
								$scroller.stop().animate({'left': $thumbcontainer.outerWidth() -$scroller.outerWidth() }, options.scrollSpeed);
							};
							
							var stopScroll = function() {
								$scroller.stop();
							};
							
							$scrollleft.hover(scrollLeft, stopScroll);
							$scrollright.hover(scrollRight, stopScroll);
							
							$scrollleft.css('visibility','visible');
							$scrollright.css('visibility','visible');
						};
						
						// image switcher
						var switchImage = function() {
							// show loader
							$loader.css({
									'visibility': 'visible',
									'opacity': 1
								});
								
							// create new image
							var image = new Image(); 							
							image.title = $(this).attr('title');							
							
							// done loading							
							var imageLoaded = function(error) {								
								if(error==true) {
									$image.css('width', '100%');
									$image.attr('alt', 'Error loading image. Please try refreshing. ');
								} else {									
									$image.attr({
										'src': image.src,
										'title': image.title,
										'alt': image.title
									});
									
									if(image.title) {
										$caption.show();
										$caption.text(image.title);
									} else {
										$caption.hide();
									};
								};
								
								$loader.css({
									'visibility': 'hidden',
									'opacity': 0
								});
							};
							
							image.onload = function() {
								imageLoaded(false)
							};
							image.onerror = function() {
								imageLoaded(true);
							};
							
							image.src = $(this).attr('href');							
							
							return false;
						};
						
						$thumbs.click(switchImage);						
					};
					
					var originalWidth;
					// close all slices
					var close = function() {						
						// remove the current preview
						$('.accordiongallery-preview', $currentSection).hide(0, function() {
							$(this).remove();
						});
						// show the vertical thumbs and scrollers
						section.$container.fadeIn(700);
						if(section.$scrollup) {
							section.$scrollup.fadeIn(700);
							section.$scrolldown.fadeIn(700);
						};
						
						$sections.removeClass('inactive-section');
						$currentSection.removeClass('active-section');
						
						// animate width
						if(!jQuery.support.transition) {				
							$currentSection.stop().animate({
								'width': originalWidth,
								'height': $currentSection.attr('data-originalheight')
							}, 300);
							
							$sections.each(function() {
								$(this).stop().animate({
									'width': originalWidth,
									'height': $(this).attr('data-originalheight')
								}, 300);
							});
							
						} else {
							$currentSection.css({
								'width': originalWidth,
								'height': $currentSection.attr('data-originalheight')*1
							});
							$sections.each(function() {
								$(this).css({
									'width': originalWidth,
									'height': $(this).attr('data-originalheight')*1
								});
							});							
						};
						
						$sections.unbind('click');						
					};
					
					// open slice
					var open = function() {
						// get image attributes						
						image.url = $(this).attr('href');
						image.title = $(this).attr('title');
						// get the currentsection
						var $activeSection = $('.active-section', $gallery);						
						if($activeSection) {						
							$('.accordiongallery-preview', $activeSection).hide(0, function() {
								$(this).remove();
							});
							// remove the loader node
							$('.accordiongallery-loader', $activeSection).hide(0, function() {
								$(this).remove();
							});
							
							$('.accordiongallery-thumbs', $activeSection).fadeIn(500);							
							$('.accordiongallery-scrollup', $activeSection).fadeIn(500);
							$('.accordiongallery-scrolldown', $activeSection).fadeIn(500);
						};
												
						$sections.removeClass('active-section').addClass('inactive-section');
						$currentSection.addClass('active-section').removeClass('inactive-section');						
						// enlarge width with css3 or animate
						if(!jQuery.support.transition) {				
							$currentSection.stop().animate({
								'width': options.maxSliceWidth,
								'height': options.maxSliceHeight
							}, 300);
							
							$sections.each(function() {
								$(this).stop().animate({
									'width': options.minSliceWidth,
									'height': $(this).attr('data-originalheight')
								}, 300);
							});							
						} else {							
							$currentSection.css({
								'width': options.maxSliceWidth,
								'height': options.maxSliceHeight
							});							
							$sections.each(function(){								
								$(this).css({
									'width': options.minSliceWidth,									
									'height': $(this).attr('data-originalheight') * 1
								});								
							});
						};
						
						// hide any visible loader
						$startedLoader = $('.accordiongallery-loader', $sections);
						$startedLoader.css({
							'visibility': 'hidden',
							'opacity': 0
						});
						
						// unbind any event from the section
						$currentSection.unbind('click');
						$sections.click(gallery.close);						
						
						// init imageView
						imageView();
						return false;
					};
					
					// init gallery
					var init = function() {
						$currentSection.find('a:has(img)').click(gallery.open);
						// calculate the originalWidth in a second
						// we're doing this because Webkit browsers show a zero width if CSS transitions are present
						setTimeout(function() {
							originalWidth = $currentSection.width();							
						}, 100);
					};
					
					// return public vars
					return {
						init: init,
						open: open,
						close: close
					}					
				}();
				
				// fire init gallery
				gallery.init();
			
			});
		});
	};
})(jQuery);