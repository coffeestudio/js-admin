/// <reference path="../../js/jquery.d.ts" />

class FileManager {
    fm: any;
    constructor(oldfm: any) {
        this.fm = oldfm;
    }

    invoke(element, callback) {
        this.fm.filemanager('invoke', element, callback);
    }
}
var fileManager: FileManager = new FileManager($('#file-manager'));

export = fileManager;
