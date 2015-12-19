/**
 * Created by xxx on 19.12.15.
 */
var setAlwaysFocus = function(selector, onBlurHandler)
{
    $(selector).blur(function(){
        setTimeout(function(){
            $(selector).focus();
        }, 50);
    });

    if(onBlurHandler)
        onBlurHandler();

    $(selector).focus();
};

var disableAlwaysFocus = function(selector)
{
    $(selector).off('blur');
};

$(document).ready(function(){
    $('.detail').hide();

    jQuery.fn.center = function () {
        this.css("position","absolute");
        this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
                $(window).scrollTop()) + "px");
        this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                $(window).scrollLeft()) + "px");
        return this;
    };

    $('#start-form').center().show();
    $('#start-form-label1').textillate({ in: { effect: 'shake', shuffle: true, delay: 10} });
    $('#start-form-label2').textillate({ in: { effect: 'shake', shuffle: true } });
    $('#start-form-label3').textillate({ in: { effect: 'shake', shuffle: true} });

    setAlwaysFocus('#ch');

    $('#ch').on('keydown', function(e){
        if(e.keyCode == 13)
        {
            disableAlwaysFocus('#ch');
            setAlwaysFocus('#k');
        }
    });

    $('#k').on('keydown', function(e){
        if(e.keyCode == 13)
        {
            disableAlwaysFocus('#k');
            $('#start-form').hide();
            setAlwaysFocus('.current-message');
            $('.detail').show();
            Chat.init($('$ch').val(), $('#k').val());
        }
    });
});