// @TODO Break up clearance code into easier to digest API commands
var jp = jp || {};

$(document).ready(function () {
    var _private = {
        recursiveClearance: function (xStart, yStart, distance) {
            if (jp.map.isEdgeOpen(xStart, yStart, distance)) {
                return _private.recursiveClearance(xStart, yStart, distance + 1);
            }

            // New distance failed, return the previous value
            return distance - 1;
        }
    };

    jp.clearance = {
        map: null, // An array of all existing clearance values
        debug: false, // Output debug display of clearance values

        /**
         * Sets clearance values, reliant on the Map API to have collision data set
         * @param width
         * @param height
         */
        setMap: function (width, height) {
            var x, y, start = Date.now();

            this.map = [];

            for (y = 0; y < height; y++) {
                this.map.push([]);
                for (x = 0; x < width; x++) {
                    // Recursively check clearance until false returns
                    // set clearance equal to number of successful recursive checks
                    this.map[y].push(_private.recursiveClearance(x, y, 1));
                }
            }

            return this;
        },

        getTile: function (x, y) {
            return this.map[y][x];
        }
    };
});