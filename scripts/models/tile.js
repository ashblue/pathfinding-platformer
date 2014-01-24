var jp = jp || {};

$(document).ready(function () {
    jp.Tile = function (x, y) {
        this.x = x;
        this.y = y;
    };

    jp.Tile3d = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };
});