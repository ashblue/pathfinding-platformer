var jp = jp || {};

$(document).ready(function () {
    var _private = {
        // Euclidean distance, C = current, T = target
        distanceE: function (xC, yC, xT, yT) {
            var dx = xT - xC, dy = yT - yC;
            return Math.sqrt((dx * dx) + (dy * dy));
        },

        // Manhattan distance (use this one)
        distanceM: function (xC, yC, xT, yT) {
            var dx = Math.abs(xT - xC), dy = Math.abs(yT - yC);
            return dx + dy;
        },

        distanceM3d: function (xC, yC, zC, xT, yT, zT) {
            var dx = Math.abs(xT - xC), dy = Math.abs(yT - yC), dz = Math.abs(zT - zC);
            return dx + dy + dz;
        }
    };

    jp.Step = function(xC, yC, xT, yT, totalSteps, parentStep) {
        // herustic
        var h = _private.distanceM(xC, yC, xT, yT);

        this.x = xC;
        this.y = yC;
        this.g = totalSteps;
        this.h = h;
        this.f = totalSteps + h;
        this.parent = parentStep;
    };

    // @TODO Might need to add an extra +1 for every level change
    jp.Step3d = function(xC, yC, zC, xT, yT, zT, totalSteps, parentStep) {
        var h = _private.distanceM3d(xC, yC, zC, xT, yT, zT);

        this.x = xC;
        this.y = yC;
        this.z = zC;
        this.g = totalSteps;
        this.h = h;
        this.f = totalSteps + h;
        this.parent = parentStep;
    };
});