define(["require", "exports", 'jquery', "./upload-widget"], function (require, exports, $) {
    $['filemanager'] = function (e, o) {
        var that = this;
        e.hide(0);
        e.html('<ul class="panel"></ul><div class="statusbar"></div><table class="listing"></table><div class="prevbox"></div>');
        this.container = e;
        this.listing = e.find('> .listing');
        this.statusbar = e.find('> .statusbar');
        this.panel = e.find('> .panel');
        this.prevbox = e.find('> .prevbox');
        this.prevbox.click(function () {
            $(this).toggle(0);
        });
        this.preloaded = false;
        this.cwd = '/res';
        // TODO: add button function
        var li = $('<li/>');
        /*    var btn_up = $('<a/>');
            btn_up.addClass('btn_up');
            btn_up.click(function (ev) {
                ev.preventDefault();
                that.up();
            });
            this.panel.append(li.append(btn_up));*/
        li = $('<li/>');
        var btn_upload = $('<a class="fa fa-upload"> загрузить</a>');
        btn_upload.addClass('btn_upload');
        this.panel.append(li.append(btn_upload));
        btn_upload.uploadWidget({ action: this.getAjaxUrl('upload'), callback: function (data) {
            console.log('Uploaded', data.value);
            that.cd();
        }, init: function (form, opts) {
            console.log('Upload started');
            opts.url = that.getAjaxUrl('upload');
        } });
        that.btn_upload = btn_upload;
        li = $('<li/>');
        var inp_newdir = $('<input/>');
        inp_newdir.attr('type', 'text');
        inp_newdir.attr('placeholder', 'имя папки');
        var btn_mkdir = $('<input/>');
        btn_mkdir.attr('type', 'button');
        btn_mkdir.val('создать папку');
        btn_mkdir.click(function (ev) {
            ev.preventDefault();
            that.mkdir(inp_newdir.val());
            inp_newdir.val('');
        });
        this.panel.append(li.append(inp_newdir, btn_mkdir));
        li = $('<li/>');
        li.addClass('right');
        var btn_close = $('<a/>');
        btn_close.addClass('btn_close');
        btn_close.click(function (ev) {
            ev.preventDefault();
            that.revoke();
        });
        this.panel.append(li.append(btn_close));
        this.e = e;
    };
    var fm = $['filemanager'];
    fm.fn = fm.prototype;
    fm.fn.extend = fm.extend = $.extend;
    fm.fn.extend({
        invoke: function (caller, callback) {
            if (typeof (caller) != 'undefined') {
                this.caller = $(caller);
                var offset = this.caller.offset();
                this.e.css({ left: offset.left, top: offset.top });
            }
            if (typeof (callback) != 'undefined') {
                this.callback = callback;
            }
            this.e.show(200);
            if (!this.preloaded) {
                this.cd();
                this.preloaded = true;
            }
        },
        revoke: function () {
            this.e.hide(200);
            delete this.caller;
            delete this.callback;
        },
        makeBreadCrumbs: function () {
            var that = this;
            var ul = $('<ul/>');
            ul.addClass('breadcrumbs');
            var li, a;
            var stopnow = this.cwd == '/';
            var parr = this.cwd.split('/');
            var acc = '';
            for (var i in parr) {
                if (parr[i] != '') {
                    acc += '/' + parr[i];
                    li = $('<li/>');
                    li.html('&rarr;');
                    ul.append(li);
                }
                else {
                    parr[i] = 'корень';
                }
                li = $('<li/>');
                a = $('<a/>');
                a.data('path', acc);
                a.click(function (ev) {
                    ev.preventDefault();
                    that.cd($(this).data('path'));
                });
                a.text(parr[i]);
                li.append(a);
                ul.append(li);
                if (stopnow)
                    break;
            }
            return ul;
        },
        getAjaxUrl: function (method, fn, custom_wd) {
            if (typeof (custom_wd) == 'undefined')
                custom_wd = this.cwd;
            return '/coffee.api.util/FileManager/' + method + '?path=' + custom_wd + (typeof (fn) != 'undefined' ? '/' + fn : '');
        },
        paste: function (resid, value) {
            var revoke = true;
            if (typeof (this.callback) == 'function') {
                revoke = this.callback(resid, value);
            }
            else if (typeof (this.caller) != 'undefined') {
                var sval = '';
                /*
                if(typeof(value) == 'object') {
                    sval = '[';
                    var first = false;
                    for(f in value) {
                        if(first) first = false;
                        else sval += ',';
                        sval += '"'+f+'"'
                    }
                    sval += ']';
                } else {
                */
                sval = value;
                /* } */
                this.caller.val(sval);
            }
            if (revoke)
                this.revoke();
        },
        rm: function (file) {
            var that = this;
            $.ajax(this.getAjaxUrl('rm', file), { success: function (data) {
                that.cd(that.cwd);
            } });
        },
        cd: function (dir) {
            if (dir == '' || dir == '/') {
                this.btn_upload.hide(0);
            }
            else {
                this.btn_upload.show(0);
            }
            if (typeof (dir) == 'undefined')
                dir = this.cwd;
            var that = this;
            this.cls();
            this.cwd = dir;
            this.statusbar.html(this.makeBreadCrumbs());
            $.ajax(this.getAjaxUrl('ls'), { dataType: 'json', success: function (data) {
                console.log('Files:', data.value.files);
                for (var i in data.value.dirs) {
                    var dn = data.value.dirs[i].dn;
                    var tr = $('<tr/>'), td = $('<td/>'), a = $('<a/>');
                    tr.addClass('fs-entry');
                    a.addClass('dir');
                    a.click(function (dn) {
                        return function (ev) {
                            ev.preventDefault();
                            that.cd(dir + (dir != '/' ? '/' : '') + dn);
                        };
                    }(dn));
                    a.html(dn);
                    that.listing.append(tr.append(td.append(a)));
                }
                for (i in data.value.files) {
                    var fn = data.value.files[i].fn;
                    var resid = data.value.files[i].resid;
                    var thumb = 'thumb' in data.value.files[i] ? data.value.files[i].thumb : false;
                    var tr = $('<tr/>'), td1 = $('<td/>'), td2 = $('<td/>'), td3 = $('<td/>'), a1 = $('<a/>'), a2 = $('<a/>'), a3 = $('<a/>');
                    tr.addClass('fs-entry');
                    if (thumb) {
                        var thumb_e = $('<img class="thumb" alt="' + fn + '" src="' + thumb + '"/>');
                        thumb_e.mouseover(function (fn) {
                            return function (ev) {
                                ev.preventDefault();
                                console.log('Event offset', ev.pageY);
                                that.preview(fn, ev.pageY - that.container.offset().top - 60);
                            };
                        }(fn));
                        thumb_e.mouseout(function () {
                            that.hide_preview();
                        });
                        td1.prepend(thumb_e);
                        a1.addClass('with-thumb');
                    }
                    a1.addClass('file');
                    a1.html(fn);
                    a2.click(function (resid, fn) {
                        return function (ev) {
                            ev.preventDefault();
                            that.paste(resid, that.cwd + '/' + fn);
                        };
                    }(resid, fn));
                    a2.html('вставить');
                    a3.click(function (fn) {
                        return function (ev) {
                            ev.preventDefault();
                            that.rm(fn);
                        };
                    }(fn));
                    a3.html('удалить');
                    that.listing.append(tr.append(td1.append(a1), td2.append(a2), td3.append(a3)));
                }
            } });
        },
        mkdir: function (dir) {
            var that = this;
            $.ajax(this.getAjaxUrl('mkdir', dir), { dataType: 'json', success: function (data) {
                console.log('FM -> mkdir', data.value);
                that.cd(that.cwd);
            } });
        },
        preview: function (fn, pos) {
            var that = this;
            $.ajax(this.getAjaxUrl('preview', fn), { dataType: 'json', success: function (data) {
                that.prevbox.empty();
                that.prevbox.append('<img src="' + data.value.src + '" alt="preview"/>');
                that.prevbox.css('top', pos + 'px');
                that.prevbox.show(0);
            } });
        },
        hide_preview: function () {
            this.prevbox.hide(0);
        },
        up: function () {
            var idx = this.cwd.lastIndexOf('/');
            if (idx < 0)
                return this.cd('/');
            this.cd(this.cwd.substring(0, idx));
        },
        cls: function () {
            this.prevbox.hide(0);
            this.prevbox.empty();
            this.listing.find('.fs-entry').remove();
        }
    });
    $.fn.filemanager = function (o) {
        var instance = $(this).data('filemanager');
        if (typeof (o) == 'string' && instance) {
            var args = Array.prototype.slice.call(arguments, 1);
            return instance[o].apply(instance, args);
        }
        else if (!instance) {
            return this.each(function () {
                $(this).data('filemanager', new fm($(this), o));
            });
        }
    };
});
