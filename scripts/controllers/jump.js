/**
 * Simulates jumps with a parabola through tile voxels
 */
var jp = jp || {};

$(document).ready(function () {
    jp.jump = {
        jumpFactor: 0.4, // @TODO Jump factor should be set subjective to manhattan distance distance

        isJumpPossible: function (oX, oY, tX, tY) {
            var jumpPath = this.getJumpPath(oX, oY, tX, tY);
            console.log(jumpPath);
            for (var i = 0, len = jumpPath.length; i < len; i++) {
                if (jp.map.blocked(jumpPath[i].x, jumpPath[i].y)) {
                    console.log('invalid', jumpPath[i].x, jumpPath[i].y);
                    return false;
                }
            }

            return true;
        },

        /**
         * Returns the curve of a simulated jump, might need to be customized depending upon your tile size
         * @TODO Parabola jump equation is cool, but not very accurate. Should be swapped out for a physics simulation test at some point
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
                for (x = 0, len = distX; x + tX < oX; x += 0.5) { // We search at 0.5 to increase our chances of finding a blocked tile
                    y = this.getJumpPosY(jumpCurve, x, jumpFactor);
                    stack.push({ x: Math.round(oX - x), y: Math.round(oY - y) });
                }

            // Right to left
            } else {
                for (x = 0, len = distX; x + oX < tX; x += 0.5) {
                    y = this.getJumpPosY(jumpCurve, x, jumpFactor);
                    stack.push({ x: Math.round(x + oX), y: Math.round(oY - y) });
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