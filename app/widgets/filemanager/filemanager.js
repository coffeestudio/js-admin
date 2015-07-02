define(["require", "exports"], function (require, exports) {
    var FileManager = (function () {
        function FileManager(oldfm) {
            this.fm = oldfm;
        }
        FileManager.prototype.invoke = function (element, callback) {
            this.fm.filemanager('invoke', element, callback);
        };
        return FileManager;
    })();
    var fileManager = new FileManager($('#file-manager'));
    return fileManager;
});
