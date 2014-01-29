var jp = jp || {};

$(document).ready(function () {
    /**
     * Creates a new step
     * @param xC {number} Current tile
     * @param yC {number}
     * @param xT {number} Goal of the walking path
     * @param yT {number}
     * @param totalSteps {number} Current number of steps so far
     * @param parentStep {Step|boolean} Link to the previous step
     * (water, crumbling ground, hazards)
     * @constructor
     */
    jp.Step = function(xC, yC, xT, yT, totalSteps, parentStep) {
        this.x = xC;
        this.y = yC;
        this.g = totalSteps; // Total number of steps required to walk here
        this.h = jp.helper.distanceM(xC, yC, xT, yT);
        this.f = totalSteps + this.h; // Calculated total
        this.parent = parentStep;

        return this;
    };
});