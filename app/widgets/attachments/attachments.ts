/// <reference path="../widget.d.ts"/>
/// <reference path="../../include/jquery.d.ts"/>

import FileManager = require('widgets/filemanager/filemanager');

class AttachmentPanel implements IWidget {
    objModel: string;
    objId: number = 0;
    token: string;
    maxsort: number = 0;
    hasSpecFlag: boolean = false;
    attachments: Array<Attachment> = [];
    mainAtt: Attachment = null;
    state: State;
    scope: any;
    http: any;
    fm: FileManager;
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
        this.hasSpecFlag = $attrs.hasSpec == 'true' || $attrs.hasSpec == 'yes';
        this.fm = new FileManager;
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
        this.fm.invoke($event.target, (resId, path) => {
            //, 'resId': resId
            var dataOut = { 'path': path , 'sort': this.maxsort + 7 };
            $.post('/coffee.api.model/' + this.objModel + '/addAttachment?entityId=' + this.objId
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
            , url: '/coffee.api.model/' + this.objModel + '/getAttachmentsById'
            , params: { entityId: this.objId }
            }
        ).success(callback);
    }
}

class State {
    activeItem: Attachment;
    activeId: number = 0;
    title: string = '';
    title0: string = '';
    comment: string = '';
    comment0: string = '';
    isMain: boolean = false;
    isMain0: boolean = false;
    isSpec: boolean = false;
    isSpec0: boolean = false;

    setState(item: Attachment, $event) {
        $event.stopPropagation();
        this.activeItem = item;
        this.activeId = item.id;
        this.title = item.title;
        this.title0 = item.title;
        this.comment = item.comment;
        this.comment0 = item.comment;
        this.isMain = item.isMain;
        this.isMain0 = item.isMain;
        this.isSpec = item.isSpec;
        this.isSpec0 = item.isSpec;
    }
    edited() {
        return this.title != this.title0 || this.comment != this.comment0 || this.isMain != this.isMain0 || this.isSpec != this.isSpec0;
    }
    reset() {
        this.activeItem = null;
        this.activeId = 0;
        this.title = '';
        this.title0 = '';
        this.comment = '';
        this.comment0 = '';
        this.isMain = false;
        this.isMain0 = false;
        this.isSpec = false;
        this.isSpec0 = false;
    }
    save() {
        this.activeItem.title = this.title;
        this.activeItem.comment = this.comment;
        this.activeItem.isMain = this.isMain;
        if (this.isMain0 != this.isMain) {
            this.activeItem.updateMain();
        }
        this.activeItem.isSpec = this.isSpec;
        this.title0 = this.title;
        this.comment0 = this.comment;
        this.isMain0 = this.isMain;
        this.isSpec0 = this.isSpec;
        this.activeItem.commit();
    }
}

class Attachment {
    id: number;
    type: string = 'image';
    title: string = '';
    comment: string = '';
    path: string = '';
    sort: number = 0;
    isMain: boolean = false;
    isSpec: boolean = false;
    panel: AttachmentPanel;
    thumb: string = '';
    constructor(model: Object, panel = null) {
        for (var k in model) {
            if (k == 'path') this.path = model[k];
            else this[k] = model[k];
        }
        this.panel = panel;
        if (this.isMain) this.panel.mainAtt = this;
        if (panel && panel.maxsort < this.sort) panel.maxsort = this.sort;
        this.loadThumb();
    }
    commit() {
        this.panel.http.post('/coffee.api.model/'+this.panel.objModel+'/editAttachment?entityId='+this.panel.objId+'&attId='+this.id
            , {title: this.title, comment: this.comment, isMain: this.isMain, isSpec: this.isSpec}
        );
    }
    commitOrder() {
        this.panel.http.post('/coffee.api.model/'+this.panel.objModel+'/editAttachment?entityId='+this.panel.objId+'&attId='+this.id
            , {sort: this.sort}
        );
    }
    updateMain() {
        if (this.isMain) {
            if (this.panel.mainAtt) {
                this.panel.mainAtt.isMain = false;
                this.panel.mainAtt.commit();
            }
            this.panel.mainAtt = this;
        } else {
            this.panel.mainAtt = null;
        }
    }
    del() {
        if (! this.panel) return;
        var i = this.panel.attachments.indexOf(this);
        if (i < 0) return;
        this.panel.http.post('/coffee.api.model/'+this.panel.objModel+'/delAttachment?entityId='+this.panel.objId+'&attId='+this.id)
        .success(data => {
            if (data.type == 'model') {
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
            , url: '/coffee.api.util/Image'
            , params: settings
            }
        ).success((data) => { this.thumb = data.value.src });
    }
}

export = AttachmentPanel;
