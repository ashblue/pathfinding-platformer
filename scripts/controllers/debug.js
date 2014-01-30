/**
 * Used for drawing additional data on top of the graph. Think of them as out of the box debugging tools.
 */

var jp = jp || {};

$(document).ready(function () {
//    var _private = {
//
//    };

    jp.debug = {
        squareSize: 42,
        squareMid: 21,

        /**
         * Hook for debugging collision maps
         */
        updateMapCollision: function () {
            // Your custom logic here. Output a mini-map, overlay, whatever it is you want

            return this;
        },

        /**
         * Hook for debugging clearance maps
         * @returns {jp.debug}
         */
        updateMapClearance: function () {
            // Custome logic here

            return this;
        },

        /**
         * Hook for debugging movement maps
         * @returns {jp.debug}
         */
        updateMapMovement: function () {
            // Custom logic here

            return this;
        },

        /**
         * Draw a line between two points on the graph
         * @param xO Beginning tile
         * @param yO
         * @param xT End tile
         * @param yT
         * @param color
         * @src http://monkeyandcrow.com/blog/drawing_lines_with_css3/
         * @returns {jp.debug}
         */
        setLine: function (xO, yO, xT, yT, color) {
            var x1 = (xO * this.squareSize) + this.squareMid,
                y1 = (yO * this.squareSize) + this.squareMid,
                x2 = (xT * this.squareSize) + this.squareMid,
                y2 = (yT * this.squareSize) + this.squareMid;

            var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
            var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            var transform = 'rotate('+angle+'deg)';

            var $line = $('<div>')
                .addClass('line')
                .css({
                    position: 'absolute',
                    transform: transform,
                    background: color
                })
                .width(length)
                .offset({left: x1, top: y1});

            $('#map').append($line);

            return this;
        },

        /**
         *
         * @returns {jp.debug}
         */
        clearLines: function () {
            $('#map').find('.line').detach();
            return this;
        },

        /**
         * Custom logic to set a voxel point
         * @param x
         * @param y
         * @returns {jp.debug}
         */
        setPoint: function (x, y) {
            jp.visual.setTileStatus({ x: x, y: y }, 'jump');

            return this;
        },

        clearPoints: function () {
            return this;
        }
    };
});