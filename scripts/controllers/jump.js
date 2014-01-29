/**
 * Simulates jumps with a parabola through tile voxels
 */
var jp = jp || {};

$(document).ready(function () {
    jp.jump = {
        debug: false,
        jumpFactor: 0.4, // @TODO Jump factor should be set subjective to manhattan distance distance

        /**
         * @TODO Currently doesn't take into account jump clearance when searching tiles, may or may not be important
         * @TODO Current size could be too wide, see how well this does first before changing
         * @param oX
         * @param oY
         * @param tX
         * @param tY
         * @returns {boolean}
         */
        isJumpPossible: function (oX, oY, tX, tY) {
            var jumpPath = this.getJumpPath(oX, oY, tX, tY), offset, padding;
            for (var i = 0, len = jumpPath.length; i < len; i++) {
                // Pad all values
                // Ignore origin

                // Loop around the parabola point to gurantee properly padded space
                if (jumpPath[i].x !== oX && jumpPath[i].x !== tX) {
                    offset = -jp.pathFinder.playerSize;
                } else {
                    offset = 0;
                }

                for (padding = jp.pathFinder.playerSize; offset <= padding; offset++) {
                    if (jp.map.blocked(jumpPath[i].x, jumpPath[i].y - offset)) {
                        return false;
                    }

                    if (this.debug) {
                        jp.draw.setJump(jumpPath[i].x, jumpPath[i].y - offset);
                    }
                }
            }

            return true;
        },

        isSameTile: function (x1, y1, x2, y2) {
            return x1 === x2 && y1 === y2;
        },

        /**
         * Returns the curve of a simulated jump, might need to be customized depending upon your tile size
         * @src http://imada.sdu.dk/~marco/Teaching/AY2012-2013/DM810/Slides/dm810-lec4.pdf
         * @param oX Origin x
         * @param oY Origin y
         * @param tX Target x
         * @param tY Target y
         */
        getJumpPath: function (oX, oY, tX, tY) {
            var distX = Math.abs(oX - tX); // Normalize the x length
            var distY = oY - tY;
            var jumpFactor = (10 - jp.helper.distanceM(oX, oY, tX, tY)) * 0.08;
            if (jumpFactor < 0.3) jumpFactor = 0.3; // Stop factor from going too low

            var jumpCurve = this.getJumpCurve(distX, distY, jumpFactor);
            var stack = [];
            var x, y, len;

            // Left to right
            if (oX > tX) {
                for (x = 0, len = distX; x + tX < oX; x += 1) { // We search at 0.5 to increase our chances of finding a blocked tile
                    y = this.getJumpPosY(jumpCurve, x, jumpFactor);
                    stack.push({ x: Math.ceil(oX - x), y: Math.ceil(oY - y) });
                }

            // Right to left
            } else {
                for (x = 0, len = distX; x + oX < tX; x += 1) {
                    y = this.getJumpPosY(jumpCurve, x, jumpFactor);
                    stack.push({ x: Math.ceil(x + oX), y: Math.ceil(oY - y) });
                }
            }

            return stack;
        },


        getJumpPosY: function (jumpCurve, x, jumpFactor) {
            return (-jumpFactor * x * x) + (jumpCurve * x);
        },

        /**
         * Gets the jump curve for the parabola
         * @param distX Distance x axis
         * @param distY Distance y axis
         */
        getJumpCurve: function (distX, distY, jumpFactor) {
            return (distY + (jumpFactor * distX * distX)) / distX;
        }
    };
});