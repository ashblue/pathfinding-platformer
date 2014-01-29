var jp = jp || {};

$(document).ready(function () {
    var _private = {
        /**
         * @deprecated Moved into map object
         */
        outOfBounds: function (x, y) {
            return x < 0 || x >= jp.map.dataCollision[0].length ||
                y < 0 || y >= jp.map.dataCollision.length;
        }
    };

    jp.map = {
        dataCollision: null, // Current map with collision tiles (0 or 1)
        dataClearance: null, // Post processed dataCollision map with clearance
        dataMovePaths: null,

        setData: function (map) {
            jp.draw.clearLines();
            this.dataCollision = map;
            var width = this.getWidthInTiles(), height = this.getHeightInTiles();
            jp.clearance.setMap(width, height);
            jp.movement.setMap(width, height, parseInt($('#input-move-clearance').val(), 10), parseInt($('#input-max-jump').val(), 10));

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
         * Returns the bottom right edge of a square from a specific point. Note: All squares are drawn from the top
         * left to bottom right
         * @param xStart Bottom right start point of the square's edge
         * @param yStart Bottom left start point of the square's edge
         * @param distance
         */
        isEdgeOpen: function (xStart, yStart, distance) {
            var x, y, thresholdY, lenY, thresholdX, lenX;
            var count = 0;

            for (y = yStart, lenY = yStart + distance, thresholdY = lenY - 1; y < lenY; y++) {
                for (x = xStart, lenX = xStart + distance, thresholdX = lenX - 1; x < lenX; x++) {
                    if ((x >= thresholdX || y >= thresholdY) && !this.blocked(x, y)) count += 1;
                }
            }

            return count === (distance - 1) * 2 + 1;
        },

        getSides: function (x, y) {
            var sides = [],
                right = this.blocked(x + 1, y),
                left = this.blocked(x - 1, y);

            // Check right, left, bottom, top
            if (!right) sides.push(new jp.Tile(x + 1, y));
            if (!left) sides.push(new jp.Tile(x - 1, y));

            return sides;
        },

        outOfBounds: function (x, y) {
            return x < 0 || x >= this.dataCollision[0].length ||
                y < 0 || y >= this.dataCollision.length;
        },

        getNeighbors: function (x, y, corners) {
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
            // @NOTE Disabled as we don't want diagonals
            if (corners) {
                if (!top && !left && !this.blocked(x - 1, y - 1)) neighbors.push(new jp.Tile(x - 1, y - 1));
                if (!bottom && !left && !this.blocked(x - 1, y + 1)) neighbors.push(new jp.Tile(x - 1, y + 1));
                if (!top && !right && !this.blocked(x + 1, y - 1)) neighbors.push(new jp.Tile(x + 1, y - 1));
                if (!bottom && !right && !this.blocked(x + 1, y + 1)) neighbors.push(new jp.Tile(x + 1, y + 1));
            }

            return neighbors;
        },


        // Only works when moving to adjacent levels
        getCost: function (xC, yC, xT, yT) {
            return this.dataCollision[yT][xT];
        }
    };
});