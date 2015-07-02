/// <reference path="../widget.d.ts"/>
/// <reference path="../../js/jquery.d.ts"/>

import fm = require('widgets/filemanager/filemanager');

class AttachmentPanel implements IWidget {
    objModel: string;
    objId: number = 0;
    token: string;
    maxsort: number = 0;
    attachments: Array<Attachment> = [];
    state: State;
    scope: any;
    http: any;
    $inject: string[] = ['$scope', '$attrs', '$http'];
    sortable = {
        stop: (e, ui) => {
            for (var i in this.attachments) {
                var att = this.attachments[i];
                att.sort = i;
                att.commitOrder();
            }
        }
    };

    constructor($scope, $attrs, $http) {
        this.scope = $scope;
        this.http = $http;
        $scope.w = this;
        this.objModel = $attrs.objModel;
        this.objId = isNaN($attrs.objId) ? 0 : $attrs.objId;
        this.token = $attrs.token;
        this.state = new State;
    }

    init(data: any) {
        if (this.objId > 0) {
            this.loadAttachments(data => {
                if (data.type != 'model') return;
                this.attachments = data.model.map(m => new Attachment(m, this));
            });
        }
    }

    attach($event) {
        fm.invoke($event.target, (resId, path) => {
            var dataOut =
                { 'objModel': this.objModel
                , 'objId': this.objId
                , 'token': this.token
                , 'resId': resId
                , 'path': path
                , 'sort': this.maxsort + 7
                }
            $.post('/coffee.api.model/Attachment/add/id,type,path,name,comment,sort/'
                , dataOut
                , data => {
                    if (data.type != 'model') return;
                    data.model.forEach(att => this.attachments.push(new Attachment(att, this)));
                }
            );
            return true;
        });
    }

    loadAttachments(callback: (data: any) => void) {
        this.http(
            { method: 'GET'
            , url: '/coffee.api.model/Attachment/getList/id,type,path,name,comment,sort'
            , params: {model: this.objModel, id: this.objId}
            }
        ).success(callback);
    }
}

class State {
    activeItem: Attachment;
    activeId: number = 0;
    name: string = '';
    comment: string = '';
    name0: string = '';
    comment0: string = '';

    setState(item: Attachment, $event) {
        $event.stopPropagation();
        this.activeItem = item;
        this.activeId = item.id;
        this.name = item.name;
        this.comment = item.comment;
        this.name0 = item.name;
        this.comment0 = item.comment;
    }
    edited() {
        return this.name != this.name0 || this.comment != this.comment0;
    }
    reset() {
        this.activeItem = null;
        this.activeId = 0;
        this.name = '';
        this.comment = '';
        this.name0 = '';
        this.comment0 = '';
    }
    save() {
        this.activeItem.name = this.name;
        this.activeItem.comment = this.comment;
        this.name0 = this.name;
        this.comment0 = this.comment;
        this.activeItem.commit();
    }
}

class Attachment {
    id: number;
    type: string = 'image';
    name: string = '';
    comment: string = '';
    path: string = '';
    sort: number = 0;
    panel: AttachmentPanel;
    thumb: string = '';
    constructor(model: Object, panel = null) {
        for (var k in model) {
            if (k == 'path') this.path = model[k];
            else this[k] = model[k];
        }
        this.panel = panel;
        if (panel && panel.maxsort < this.sort) panel.maxsort = this.sort;
        this.loadThumb();
    }
    commit() {
        $.post('/coffee.api.model/Attachment/edit/id,type,path,name,comment,sort/?id='+this.id
            , {name: this.name, comment: this.comment}
        );
    }
    commitOrder() {
        $.post('/coffee.api.model/Attachment/edit/id,type,path,name,comment,sort/?id='+this.id
            , {sort: this.sort}
        );
    }
    del() {
        if (! this.panel) return;
        var i = this.panel.attachments.indexOf(this);
        if (i < 0) return;
        this.panel.http(
            { method: 'POST'
            , url: '/coffee.api.model/Attachment/del/'
            , data: {id: this.id}
            }
        ).success(data => {
            if (data.type == 'value' && data.value == true) {
                this.panel.attachments.splice(i, 1);
            }
        });
    }
    private loadThumb() {
        if (this.path == '' || ! this.panel) return;
        var settings =
        { src: this.path
        , size: '50x50'
        , flags: 'FILL,CROP,PRIVATED'
        , pos: '50% 50%'
        };
        this.panel.http(
            { method: 'GET'
            , url: '/coffee.api.util/Image/'
            , params: settings
            }
        ).success((data) => { this.thumb = data.value.src });
    }
}

export = AttachmentPanel;
