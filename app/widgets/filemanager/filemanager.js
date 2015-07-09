/// <reference path="../widget.d.ts"/>
/// <reference path="../../include/jquery.d.ts"/>
/// <amd-dependency path="./legacy/filemanager"/>
define(["require", "exports", 'jquery', "./legacy/filemanager"], function (require, exports, $) {
    var FileManager = (function () {
        function FileManager() {
            this.$inject = [];
            this.fm = $('#file-manager');
        }
        FileManager.prototype.init = function (data) {
        };
        FileManager.prototype.invoke = function (element, callback) {
            this.fm.filemanager('invoke', element, callback);
        };
        return FileManager;
    })();
    return FileManager;
});
