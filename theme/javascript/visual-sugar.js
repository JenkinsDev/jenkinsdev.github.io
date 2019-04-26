/**
 * Poor naming scheme of the file, but this file will just hold
 * basic visual 'sugar' for the front-end of the template.  Nothing
 * too data intensive, basic fading in of text, etc.
 *
 * @author David Jenkins
 */
(function(window, document, undefined) {
    function load_random_subheader() {
        var subHeaderEle = document.getElementById('sub-header');
        var subHeaderTexts = [
          'Satire Is Life.',
          'Cool Code Is Cool.',
          'Into The Mind.',
          'Poe\'s Law, Emotes For All!',
          'Progress Is When You Cringe At Something From The Past.'
        ];
        var randInd = Math.floor(Math.random() * subHeaderTexts.length);

        subHeaderEle.innerHTML = subHeaderTexts[randInd];
    }

    window.onload = load_random_subheader;
})(window, document, undefined);
