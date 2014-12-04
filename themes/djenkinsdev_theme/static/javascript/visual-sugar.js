/**
 * Poor naming scheme of the file, but this file will just hold
 * basic visual 'sugar' for the front-end of the template.  Nothing
 * too data intensive, basic fading in of text, etc.
 *
 * @author David Jenkins
 */
(function(window, document, undefined) {
    function load_random_subheader() {
        var sub_header_ele = document.getElementById('sub-header'),
            header_text = '',
            sub_header_text_array = [
                'The Mind Of David.',
                'Cool Code Is Cool.'
            ];

        // We want to be able to display a random sub header text for each page load.  To do that we will
        // go ahead and do a tiny bit of JS randomness and choose the text based on its index.
        header_text = sub_header_text_array[Math.floor(Math.random() * sub_header_text_array.length)];
        sub_header_ele.innerHTML = header_text;
    }

    window.onload = load_random_subheader;
})(window, document, undefined);