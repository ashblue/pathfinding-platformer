/**
 * Simulates jumps with a parabola through tile voxels
 */
var jp = jp || {};

$(document).ready(function () {
    jp.jump = {
        jumpFactor: 0.4, // @TODO Jump factor should be set subjective to manhattan distance distance

        /**
         * Returns the curve of a simulated jump, might need to be customized depending upon your tile size
         * @param oX Origin x
         * @param oY Origin y
         * @param tX Target x
         * @param tY Target y
         */
        getJumpPath: function (oX, oY, tX, tY) {
            var distX = Math.abs(oX - tX); // Normalize the x length
            var distY = oY - tY;
//            var jumpFactor = jp.helper.distanceM(oX, oY, tX, tY) * 0.2;
//            var jumpFactor = 0.7;
            var jumpFactor = (10 - jp.helper.distanceM(oX, oY, tX, tY)) * 0.08; // @TODO Meh, way of getting jump factor
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
//            return (jumpCurve * jumpCurve) - ((x - jumpCurve) * (x - jumpCurve));
            return (-jumpFactor * x * x) + (jumpCurve * x);
        },

        /**
         * Gets the jump curve for the parabola
         * @param distX Distance x axis
         * @param distY Distance y axis
         */
        getJumpCurve: function (distX, distY, jumpFactor) {
            return (distY + (jumpFactor * distX * distX)) / distX;
//            return ((distX * distX) + distY) / (2 * distX);
        }
    };
});