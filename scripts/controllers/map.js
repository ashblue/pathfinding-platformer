var jp = jp || {};

$(document).ready(function () {
    var _private = {
        outOfBounds: function (x, y) {
            return x < 0 || x >= jp.map.dataCollision[0].length ||
                y < 0 || y >= jp.map.dataCollision.length;
        }
    };

    jp.map = {
        dataCollision: null, // Current map with collision tiles (0 or 1)
        dataClearance: null, // Post processed dataCollision map with clearance

        setData: function (map) {
            this.dataCollision = map;
            return this;
        },

        /**
         * Each tile needs to have a square drawn around it from the top left to bottom right. In order to verify
         * clearance capacity
         * @IMPORTANT This should only be done when initially loading the map or updating existing map
         * @TODO Not a bad idea to break the map into sub-quadrants for detecting changes
         */
        updateClearance: function () {
            var x, y, width, height;
            for (y = 0, height = this.getWidthInTiles(); y < height; y++) {
                for (x = 0, width = this.getHeightInTiles(); x < width; x++) {
                    // Recursively check clearance until false is return
                    // set clearance equal to number of recursive checks
                }
            }

            return this;
        },

        getWidthInTiles: function () {
            return this.dataCollision[0].length;
        },

        getHeightInTiles: function () {
            return this.dataCollision.length;
        },

        blocked: function (x, y) {
            if (_private.outOfBounds(x, y)) {
                return true;
            }

            if (this.dataCollision[y][x] === 0) {
                return true;
            }

            return false;
        },

        /**
         * Returns an edge from a specific tile and all corresponding tiles. Note: All squares are drawn from the top
         * left to bottom right
         * @param xStart
         * @param yStart
         * @param distance
         * @param squareLocation
         * @TODO Expand square location to take more parameters and return different edge pieces
         */
        isEdgeOpen: function (xStart, yStart, distance, squareLocation) {
            var x, y, thresholdY, lenY, thresholdX, lenX;
            var count = 0;
//            if (!squareLocation) squareLocation = 'bottom-right';

            // Get bottom right edge of a square
//            for (y = yStart, threshold = yStart + distance - 1; y < len; y++) {
//                for (x = 0; x < len; x++) {
//                    if ((x >= threshold || y >= threshold) && !this.blocked(x, y)) count += 1;
//                }
//            }

            for (y = yStart, lenY = yStart + distance, thresholdY = lenY - 1; y < lenY; y++) {
                for (x = xStart, lenX = xStart + distance, thresholdX = lenX - 1; x < lenX; x++) {
                    if ((x >= thresholdX || y >= thresholdY) && !this.blocked(x, y)) count += 1;
                }
            }

            return count === (distance - 1) * 2 + 1;
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


        // Only works when moving to adjacent levels
        getCost: function (xC, yC, xT, yT) {
            return this.dataCollision[yT][xT];
        }
    };
});