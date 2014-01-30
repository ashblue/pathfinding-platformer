var jp = jp || {};

$(document).ready(function () {
    window.MapCollision = Class.extend({
        dataCollision: null, // Current map with collision tiles (0 or 1)
        dataClearance: null, // Post processed dataCollision map with clearance
        dataMovePaths: null,
        debug: false,

        // Maximum clearance support to speed up checks
        maxClearance: 4,

        // Maximum jump height we will support to speed up linking
        maxJump: 5,

        init: function (map) {
            this.setData(map);
        },

        setData: function (map) {
            this.dataCollision = map;
            if (this.debug === true) jp.debug.updateMapCollision();
            return this;
        },

        /**
         * @TODO Clean out of memory on kill
         * @param mapClearance
         * @returns {MapCollision}
         */
        setClearance: function (mapClearance) {
            this.clearance = mapClearance;
            return this;
        },

        /**
         * @TODO Clean out of memory on kill
         * @param mapMovement
         * @returns {MapCollision}
         */
        setMovement: function (mapMovement) {
            this.movement = mapMovement;
            return this;
        },

        getWidthInTiles: function () {
            return this.dataCollision[0].length;
        },

        getHeightInTiles: function () {
            return this.dataCollision.length;
        },

        blocked: function (x, y) {
            if (this.outOfBounds(x, y)) {
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
            if (!right) sides.push(new MapTile(x + 1, y));
            if (!left) sides.push(new MapTile(x - 1, y));

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
            if (!right) neighbors.push(new MapTile(x + 1, y));
            if (!left) neighbors.push(new MapTile(x - 1, y));
            if (!bottom) neighbors.push(new MapTile(x, y + 1));
            if (!top) neighbors.push(new MapTile(x, y - 1));

            // Check top left, bottom left, top right, bottom right
            // Side checks enforce that corners should not be clipped / ignored
            // @NOTE Disabled as we don't want diagonals
            if (corners) {
                if (!top && !left && !this.blocked(x - 1, y - 1)) neighbors.push(new MapTile(x - 1, y - 1));
                if (!bottom && !left && !this.blocked(x - 1, y + 1)) neighbors.push(new MapTile(x - 1, y + 1));
                if (!top && !right && !this.blocked(x + 1, y - 1)) neighbors.push(new MapTile(x + 1, y - 1));
                if (!bottom && !right && !this.blocked(x + 1, y + 1)) neighbors.push(new MapTile(x + 1, y + 1));
            }

            return neighbors;
        },

        getCost: function (xC, yC, xT, yT) {
            return this.dataCollision[yT][xT];
        }
    });
});