var jp = jp || {};

$(document).ready(function () {
    var _private = {
        outOfBounds: function (x, y) {
            return x < 0 || x >= jp.map.dataCollision[0].length ||
                y < 0 || y >= jp.map.dataCollision.length;
        },

        recursiveClearance: function (xStart, yStart, distance) {
            if (jp.map.isEdgeOpen(xStart, yStart, distance)) {
                return _private.recursiveClearance(xStart, yStart, distance + 1);
            }

            // New distance failed, return it to the previous value
            return distance - 1;
        }
    };

    jp.map = {
        dataCollision: null, // Current map with collision tiles (0 or 1)
        dataClearance: null, // Post processed dataCollision map with clearance

        setData: function (map) {
            this.dataCollision = map;
            return this.updateClearance();
        },

        /**
         * Each tile needs to have a square drawn around it from the top left to bottom right. In order to verify
         * clearance capacity
         * @IMPORTANT This should only be done when initially loading the map or updating existing map
         * @TODO Not a bad idea to break the map into sub-quadrants for detecting changes
         */
        updateClearance: function () {
            var x, y, width, height;

            this.dataClearance = [];

            for (y = 0, height = this.getHeightInTiles(); y < height; y++) {
                this.dataClearance.push([]);
                for (x = 0, width = this.getWidthInTiles(); x < width; x++) {
                    // Recursively check clearance until false is return
                    // set clearance equal to number of recursive checks
                    this.dataClearance[y].push(_private.recursiveClearance(x, y, 1));
                }
            }

            return this;
        },

        getClearance: function (x, y) {
            return this.dataClearance[y][x];
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
         * @param [squareLocation]
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
            var neighbors = [],
                right = this.blocked(x + 1, y),
                left = this.blocked(x - 1, y),
                bottom = this.blocked(x, y + 1),
                top = this.blocked(x, y - 1);

            // Check right, left, bottom, top
            if (!right) neighbors.push(new jp.Tile(x + 1, y));
            if (!left) neighbors.push(new jp.Tile(x - 1, y));
            if (!bottom) neighbors.push(new jp.Tile(x, y + 1));
            if (!top) neighbors.push(new jp.Tile(x, y - 1));

            // Check top left, bottom left, top right, bottom right
            // Side checks enforce that corners should not be clipped / ignored
            if (!top && !left && !this.blocked(x - 1, y - 1)) neighbors.push(new jp.Tile(x - 1, y - 1));
            if (!bottom && !left && !this.blocked(x - 1, y + 1)) neighbors.push(new jp.Tile(x - 1, y + 1));
            if (!top && !right && !this.blocked(x + 1, y - 1)) neighbors.push(new jp.Tile(x + 1, y - 1));
            if (!bottom && !right && !this.blocked(x + 1, y + 1)) neighbors.push(new jp.Tile(x + 1, y + 1));

            return neighbors;
        },


        // Only works when moving to adjacent levels
        getCost: function (xC, yC, xT, yT) {
            return this.dataCollision[yT][xT];
        }
    };
});