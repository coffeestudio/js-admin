define(["require", "exports", 'widgets/filemanager/filemanager'], function (require, exports, fm) {
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
            fm.invoke($event.target, function (resId, path) {
                var dataOut = { 'objModel': _this.objModel, 'objId': _this.objId, 'token': _this.token, 'resId': resId, 'path': path, 'sort': _this.maxsort + 7 };
                $.post('/coffee.api.model/Attachment/add/id,type,path,name,comment,sort/', dataOut, function (data) {
                    if (data.type != 'model')
                        return;
                    data.model.forEach(function (att) { return _this.attachments.push(new Attachment(att, _this)); });
                });
                return true;
            });
        };
        AttachmentPanel.prototype.loadAttachments = function (callback) {
            this.http({ method: 'GET', url: '/coffee.api.model/Attachment/getList/id,type,path,name,comment,sort', params: { model: this.objModel, id: this.objId } }).success(callback);
        };
        return AttachmentPanel;
    })();
    var State = (function () {
        function State() {
            this.activeId = 0;
            this.name = '';
            this.comment = '';
            this.name0 = '';
            this.comment0 = '';
        }
        State.prototype.setState = function (item, $event) {
            $event.stopPropagation();
            this.activeItem = item;
            this.activeId = item.id;
            this.name = item.name;
            this.comment = item.comment;
            this.name0 = item.name;
            this.comment0 = item.comment;
        };
        State.prototype.edited = function () {
            return this.name != this.name0 || this.comment != this.comment0;
        };
        State.prototype.reset = function () {
            this.activeItem = null;
            this.activeId = 0;
            this.name = '';
            this.comment = '';
            this.name0 = '';
            this.comment0 = '';
        };
        State.prototype.save = function () {
            this.activeItem.name = this.name;
            this.activeItem.comment = this.comment;
            this.name0 = this.name;
            this.comment0 = this.comment;
            this.activeItem.commit();
        };
        return State;
    })();
    var Attachment = (function () {
        function Attachment(model, panel) {
            if (panel === void 0) { panel = null; }
            this.type = 'image';
            this.name = '';
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
            $.post('/coffee.api.model/Attachment/edit/id,type,path,name,comment,sort/?id=' + this.id, { name: this.name, comment: this.comment });
        };
        Attachment.prototype.commitOrder = function () {
            $.post('/coffee.api.model/Attachment/edit/id,type,path,name,comment,sort/?id=' + this.id, { sort: this.sort });
        };
        Attachment.prototype.del = function () {
            var _this = this;
            if (!this.panel)
                return;
            var i = this.panel.attachments.indexOf(this);
            if (i < 0)
                return;
            this.panel.http({ method: 'POST', url: '/coffee.api.model/Attachment/del/', data: { id: this.id } }).success(function (data) {
                if (data.type == 'value' && data.value == true) {
                    _this.panel.attachments.splice(i, 1);
                }
            });
        };
        Attachment.prototype.loadThumb = function () {
            var _this = this;
            if (this.path == '' || !this.panel)
                return;
            var settings = { src: this.path, size: '50x50', flags: 'FILL,CROP,PRIVATED', pos: '50% 50%' };
            this.panel.http({ method: 'GET', url: '/coffee.api.util/Image/', params: settings }).success(function (data) {
                _this.thumb = data.value.src;
            });
        };
        return Attachment;
    })();
    return AttachmentPanel;
});
