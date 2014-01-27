var jp = jp || {};

$(document).ready(function () {
    jp.Step = function(xC, yC, xT, yT, totalSteps, parentStep) {
        // herustic
        var h = jp.helper.distanceM(xC, yC, xT, yT);

        this.x = xC;
        this.y = yC;
        this.g = totalSteps;
        this.h = h;
        this.f = totalSteps + h;
        this.parent = parentStep;
    };
});