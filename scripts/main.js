var jp = jp || {};

$(document).ready(function () {
    var $BTN_PATH = $('#calculate'),
        $BTN_ERASE = $('#erase');

    var _event = {
        findPath: function () {
            var begin = jp.visual.getBegin(),
                end = jp.visual.getEnd();

            jp.map.setData(jp.visual.getMap());
            var path = jp.pathFinder.findPath(begin.x, begin.y, end.x, end.y);
            jp.pathFinder.setVisual();
            jp.visual.setTileGroup(path, 'path')
        },

        findPath3d: function () {
            var begin = jp.visual.getBegin(),
                end = jp.visual.getEnd();

            jp.map.setData(jp.visual.getMap3d());
            var path = jp.pathFinder.findPath3d(begin.x, begin.y, begin.z, end.x, end.y, end.z);
            jp.pathFinder.setVisual();
            jp.visual.setTileGroup(path, 'path')
        }
    };

    var main = {
        init: function () {
            jp.visual.init();
            this.bind();
        },

        bind: function () {
            $BTN_PATH.click(_event.findPath3d);
            $BTN_ERASE.click(jp.visual.erase);
        }
    };

    main.init();
});