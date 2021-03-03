module.exports.getJsonFiles = (path) => {
    return require('require-all')({
        dirname: path,
        filter: /.json$/,
        map: function (__, path) {
            return `${path}`;
        }
    });
}