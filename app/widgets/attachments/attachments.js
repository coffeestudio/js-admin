/// <reference path="../widget.d.ts"/>
/// <reference path="../../include/jquery.d.ts"/>
define(["require", "exports", 'widgets/filemanager/filemanager'], function (require, exports, FileManager) {
    var AttachmentPanel = (function () {
        function AttachmentPanel($scope, $attrs, $http) {
            var _this = this;
            this.objId = 0;
            this.maxsort = 0;
            this.attachments = [];
            this.$inject = ['$scope', '$attrs', '$http'];
            this.sortable = {
                stop: function (e, ui) {
                    for (var i in _this.attachments) {
                        var att = _this.attachments[i];
                        att.sort = i;
                        att.commitOrder();
                    }
                }
            };
            this.scope = $scope;
            this.http = $http;
            $scope.w = this;
            this.objModel = $attrs.objModel;
            this.objId = isNaN($attrs.objId) ? 0 : $attrs.objId;
            this.token = $attrs.token;
            this.state = new State;
            this.fm = new FileManager;
        }
        AttachmentPanel.prototype.init = function (data) {
            var _this = this;
            if (this.objId > 0) {
                this.loadAttachments(function (data) {
                    if (data.type != 'model')
                        return;
                    _this.attachments = data.model.map(function (m) { return new Attachment(m, _this); });
                });
            }
        };
        AttachmentPanel.prototype.attach = function ($event) {
            var _this = this;
            this.fm.invoke($event.target, function (resId, path) {
                //, 'resId': resId
                var dataOut = { 'path': path, 'sort': _this.maxsort + 7 };
                $.post('/coffee.api.model/' + _this.objModel + '/addAttachment?entityId=' + _this.objId, dataOut, function (data) {
                    if (data.type != 'model')
                        return;
                    data.model.forEach(function (att) { return _this.attachments.push(new Attachment(att, _this)); });
                });
                return true;
            });
        };
        AttachmentPanel.prototype.loadAttachments = function (callback) {
            this.http({ method: 'GET', url: '/coffee.api.model/' + this.objModel + '/getAttachmentsById', params: { entityId: this.objId } }).success(callback);
        };
        return AttachmentPanel;
    })();
    var State = (function () {
        function State() {
            this.activeId = 0;
            this.title = '';
            this.title0 = '';
            this.comment = '';
            this.comment0 = '';
        }
        State.prototype.setState = function (item, $event) {
            $event.stopPropagation();
            this.activeItem = item;
            this.activeId = item.id;
            this.title = item.title;
            this.title0 = item.title;
            this.comment = item.comment;
            this.comment0 = item.comment;
        };
        State.prototype.edited = function () {
            return this.title != this.title0 || this.comment != this.comment0;
        };
        State.prototype.reset = function () {
            this.activeItem = null;
            this.activeId = 0;
            this.title = '';
            this.comment = '';
            this.title0 = '';
            this.comment0 = '';
        };
        State.prototype.save = function () {
            this.activeItem.title = this.title;
            this.activeItem.comment = this.comment;
            this.title0 = this.title;
            this.comment0 = this.comment;
            this.activeItem.commit();
        };
        return State;
    })();
    var Attachment = (function () {
        function Attachment(model, panel) {
            if (panel === void 0) { panel = null; }
            this.type = 'image';
            this.title = '';
            this.comment = '';
            this.path = '';
            this.sort = 0;
            this.thumb = '';
            for (var k in model) {
                if (k == 'path')
                    this.path = model[k];
                else
                    this[k] = model[k];
            }
            this.panel = panel;
            if (panel && panel.maxsort < this.sort)
                panel.maxsort = this.sort;
            this.loadThumb();
        }
        Attachment.prototype.commit = function () {
            $.post('/coffee.api.model/' + this.panel.objModel + '/editAttachment?entityId=' + this.panel.objId + '&attId=' + this.id, { title: this.title, comment: this.comment });
        };
        Attachment.prototype.commitOrder = function () {
            $.post('/coffee.api.model/' + this.panel.objModel + '/editAttachment?entityId=' + this.panel.objId + '&attId=' + this.id, { sort: this.sort });
        };
        Attachment.prototype.del = function () {
            var _this = this;
            if (!this.panel)
                return;
            var i = this.panel.attachments.indexOf(this);
            if (i < 0)
                return;
            this.panel.http.post('/coffee.api.model/' + this.panel.objModel + '/delAttachment?entityId=' + this.panel.objId + '&attId=' + this.id).success(function (data) {
                if (data.type == 'model') {
                    _this.panel.attachments.splice(i, 1);
                }
            });
        };
        Attachment.prototype.loadThumb = function () {
            var _this = this;
            if (this.path == '' || !this.panel)
                return;
            var settings = { src: this.path, size: '50x50', flags: 'FILL,CROP,PRIVATED', pos: '50% 50%' };
            this.panel.http({ method: 'GET', url: '/coffee.api.util/Image', params: settings }).success(function (data) {
                _this.thumb = data.value.src;
            });
        };
        return Attachment;
    })();
    return AttachmentPanel;
});
