var audioArrayElements = document.getElementsByClassName("songs");
var lastPlayed = 0;
var audioArraySrc = [];

/*
 * Playlist:
 * 1 - Running Down to Cuba (1:32)
 * 2 - Leave Her Johnny     (2:12)
 * 3 - Drunken Sailor       (1:30)
 * 4 - Randy Dandy 'O       (1:38)
 * 5 - Fish in the Sea      (1:34)
*/


// store the src elements of the songs to play
jQuery(document).ready(function () {
    for (let index = 0; index < audioArrayElements.length; index++) {
        const element = audioArrayElements[index];
        
        audioArraySrc[index] = element.getAttribute("src");
    }
})

/**
 * Start or Stop the execution of audio file
 * 
 * @param {object} e html button pressed
 */
function letTheMusicFlow(e) {
    if (e.checked) {
        restoreSrc();
        audioArrayElements[lastPlayed].play();

        for (let j = 0; j < audioArrayElements.length; j++) {
            const song = audioArrayElements[j];
            
            song.addEventListener('ended', function(e) {
                var currentSong = e.target;
                var next = $(currentSong).nextAll('audio');

                lastPlayed++;

                if(next.length) {
                    $(next[0]).trigger('play');
                } else {
                    // $(next[0]).trigger('play');
                    lastPlayed = 0;
                    audioArrayElements[lastPlayed].play();
                }
            })
        }
    } else {
        for (let i = 0; i < audioArrayElements.length; i++) {
            const element = audioArrayElements[i];
            
            element.setAttribute("src", "");
        }

        audioArrayElements[0].play();
    }
}

/** restore the src parameter of audio html elements after checking the corresponging button*/
function restoreSrc() {
    for (let index = 0; index < audioArraySrc.length; index++) {
        const element = audioArraySrc[index];
        
        audioArrayElements[index].setAttribute("src", element);
    }
}