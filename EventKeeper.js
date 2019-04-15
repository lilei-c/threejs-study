/**
 * 封装鼠标事件 
 *  
 * 点击 划过
 */
class EventKeeper {
    constructor(scene, camera, app) {
        this.events = {
            click: {},
            mouseover: {},
            mouseout: {}
        };

        addEventListener('click', (e) => {
            let intersect = getIntersects(e).find(m => this.events.click[m.object.uuid]);
            if (intersect)
                this.events.click[intersect.object.uuid].forEach(m => m(intersect.object, intersect, e));
        });
        let theMouseoverOne = null;
        addEventListener('mousemove', (e) => {
            let intersect = getIntersects(e).map(m => m.object).find(m => this.events.mouseover[m.uuid]);
            if (intersect) {
                if (!theMouseoverOne) {
                    theMouseoverOne = intersect;
                    this.events.mouseover[intersect.uuid].forEach(m => m(intersect));
                } else {
                    if (theMouseoverOne.uuid != intersect.uuid) {
                        this.events.mouseout[theMouseoverOne.uuid].forEach(m => m(theMouseoverOne))
                        this.events.mouseover[intersect.uuid].forEach(m => m(intersect));
                        theMouseoverOne = intersect;
                    }
                }
            }
            else {
                if (theMouseoverOne) {
                    this.events.mouseout[theMouseoverOne.uuid].forEach(m => m(theMouseoverOne))
                    theMouseoverOne = null;
                }
            }
        });
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        function getIntersects(e) {
            mouse.x = (e.clientX / (app ? app.clientWidth : window.innerWidth)) * 2 - 1;
            mouse.y = -(e.clientY / (app ? app.clientHeight : window.innerHeight)) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            return raycaster.intersectObjects(scene.children);
        };
    }

    addEventListener = function (type, object, fn) {
        if (!this.events[type][object.uuid]) this.events[type][object.uuid] = []
        this.events[type][object.uuid].push(fn);
    }

    addClickEventListener(object, fn) {
        this.addEventListener('click', object, fn)
    }
    addMouseoverEventListener(object, fn) {
        this.addEventListener('mouseover', object, fn)
    }
    addMouseoutEventListener(object, fn) {
        this.addEventListener('mouseout', object, fn)
    }
}