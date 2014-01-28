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

            if (this.debug) console.log('clearance compute time', (Date.now() - start) / 1000);

            return this;
        },

        /**
         * The flat value of a clearance tile represents the maximum vertical height a tile could support on a flat plane.
         * Mostly used to measure clearance from a single location instead of crawling through up through the whole map
         * @param x {number} Start position x
         * @param y {number} Start postion y
         * @param maxHeight {number} If the clearance value exceeds this it will stop the search loop early
         * @returns {number} Verical clearance value
         */
        getFlatValue: function (x, y, maxHeight) {
            for (var yC = y - 1, clearance, clearancePrev = 0; yC >= 0; yC--) {
                clearance = this.getTile(x, yC);

                // Double check not blocked or at maxHeight
                if (jp.map.blocked(x, yC) || clearance >= maxHeight) return clearance;

                // If the value is going down return the previous value
                if (clearancePrev >= clearance) return clearancePrev;

                clearancePrev = clearance;
            }

            return clearance;
        },

        setTile: function (x, y, value) {
            this.map[y][x] = value;
            return this;
        },

        getTile: function (x, y) {
            return this.map[y][x];
        }
    };
});