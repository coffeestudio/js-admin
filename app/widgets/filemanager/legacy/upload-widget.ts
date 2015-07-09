/// <reference path="../../../include/jquery.d.ts"/>
/// <reference path="../../../include/jquery.form.d.ts"/>
/// <amd-dependency path="../../../components/jquery-form/jquery.form"/>
import $ = require('jquery');

$.fn.extend({
    uploadWidget: function (options) {
        var defaults = { action: '', slot: 'file', multiple: true, callback: function () {}, before: function () {}, init: function () {} };
        options = $.extend(defaults, options);
        return this.each(function () {
            var btn = $(this);
            var newfrm = $('<form/>');

            newfrm.attr({'action': options.action, 'method': 'POST', 'enctype': 'multipart/form-data'});
            newfrm.css({'position': 'absolute', 'overflow': 'hidden'});

            var inp = $('<input/>');
            inp.attr({'type': 'file', 'name': options.slot + (options.multiple ? '[]' : '')});
            if(options.multiple) inp.attr('multiple', '');
            inp.css({'margin': 0, 'padding': 0, 'border': 0, 'position': 'absolute', 'top': 0, 'left': 0, 'width': btn.width(), 'height': btn.height(), 'z-index': '2000', 'opacity': 0, 'cursor': 'pointer'});
            inp.change(function () { $(this.form).ajaxSubmit({dataType: 'json', success: options.callback, beforeSubmit: options.before, beforeSerialize: options.init, clearForm: true}); });
            //inp.change(function () { $(this.form).submit(); });
            newfrm.append(inp);

            newfrm.width(btn.width());
            newfrm.height(btn.height());
            newfrm.hide(0);
            $('body').append(newfrm);

            btn.mouseover(function () { newfrm.show(0); newfrm.offset(btn.offset()); });
            newfrm.mouseout(function() { newfrm.hide(0); });
        });
    }
});
