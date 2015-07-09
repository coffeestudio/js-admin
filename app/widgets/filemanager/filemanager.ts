/// <reference path="../widget.d.ts"/>
/// <reference path="../../include/jquery.d.ts"/>
/// <amd-dependency path="./legacy/filemanager"/>

import $ = require('jquery');

class FileManager implements IWidget {
    fm: any;
    $inject: string[] = [];

    constructor() {
        this.fm = $('#file-manager');
    }

    init(data: any) {

    }

    invoke(element, callback) {
        this.fm.filemanager('invoke', element, callback);
    }
}

export = FileManager;
