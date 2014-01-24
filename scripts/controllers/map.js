var jp = jp || {};

$(document).ready(function () {
    var _private = {
        outOfBounds: function (x, y) {
            return x < 0 || x >= jp.map.data[0].length ||
                y < 0 || y >= jp.map.data.length;
        },

        outOfBounds3d: function (x, y, z) {
            return x < 0 || x >= jp.map.data[0][0].length ||
                y < 0 || y >= jp.map.data[0].length ||
                z < 0 || z >= jp.map.data.length;
        }
    };

    jp.map = {
        // Current map
        data: null,

        setData: function (map) {
            this.data = map;
            return this;
        },

        getWidthInTiles: function () {
            return this.data[0].length;
        },

        getHeightInTiles: function () {
            return this.data.length;
        },

        blocked: function (x, y) {
            if (_private.outOfBounds(x, y)) {
                return true;
            }

            if (this.data[y][x] === 0) {
                return true;
            }

            return false;
        },

        blocked3d: function (x, y, z) {
            if (_private.outOfBounds3d(x, y, z)) {
                return true;
            }

            if (this.data[z][y][x] === 0) {
                return true;
            }

            return false;
        },

        getNeighbors: function (x, y) {
            var neighbors = [];

            // Check left, right, top, bottom
            if (!this.blocked(x + 1, y)) neighbors.push(new jp.Tile(x + 1, y));
            if (!this.blocked(x - 1, y)) neighbors.push(new jp.Tile(x - 1, y));
            if (!this.blocked(x, y + 1)) neighbors.push(new jp.Tile(x, y + 1));
            if (!this.blocked(x, y - 1)) neighbors.push(new jp.Tile(x, y - 1));

            return neighbors;
        },

        getNeighbors3d: function (x, y, z) {
            var neighbors = [];

            // Check left, right, top, bottom
            if (!this.blocked3d(x + 1, y, z)) neighbors.push(new jp.Tile3d(x + 1, y, z));
            if (!this.blocked3d(x - 1, y, z)) neighbors.push(new jp.Tile3d(x - 1, y, z));
            if (!this.blocked3d(x, y + 1, z)) neighbors.push(new jp.Tile3d(x, y + 1, z));
            if (!this.blocked3d(x, y - 1, z)) neighbors.push(new jp.Tile3d(x, y - 1, z));

            // Get top levels
            if (!this.blocked3d(x + 1, y, z + 1)) neighbors.push(new jp.Tile3d(x + 1, y, z + 1));
            if (!this.blocked3d(x - 1, y, z + 1)) neighbors.push(new jp.Tile3d(x - 1, y, z + 1));
            if (!this.blocked3d(x, y + 1, z + 1)) neighbors.push(new jp.Tile3d(x, y + 1, z + 1));
            if (!this.blocked3d(x, y - 1, z + 1)) neighbors.push(new jp.Tile3d(x, y - 1, z + 1));

            // Get bottom levels
            if (!this.blocked3d(x + 1, y, z - 1)) neighbors.push(new jp.Tile3d(x + 1, y, z - 1));
            if (!this.blocked3d(x - 1, y, z - 1)) neighbors.push(new jp.Tile3d(x - 1, y, z - 1));
            if (!this.blocked3d(x, y + 1, z - 1)) neighbors.push(new jp.Tile3d(x, y + 1, z - 1));
            if (!this.blocked3d(x, y - 1, z - 1)) neighbors.push(new jp.Tile3d(x, y - 1, z - 1));

            return neighbors;
        },


        // Only works when moving to adjacent levels
        getCost: function (xC, yC, xT, yT) {
            return this.data[yT][xT];
        },

        // When adding a new level it should take z, changes in z cost 2
        // @TODO Should cost 2 to move up or down a level
        getCost3d: function (xC, yC, zC, xT, yT, zT) {
            if (Math.abs(zC - zT) >= 1) {
//                console.log(xC, yC, zC, xT, yT, zT, Math.abs(zC - zT));
                return this.data[zT][yT][xT] + Math.abs(zC - zT);
            }

            return this.data[zT][yT][xT];
        }
    };
});