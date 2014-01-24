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
        }
    };

    var main = {
        init: function () {
            jp.visual.init();
            this.bind();
        },

        bind: function () {
            $BTN_PATH.click(_event.findPath);
            $BTN_ERASE.click(jp.visual.erase);
        }
    };

    main.init();
});