/*
	实现二维展示, 控制 (移动, 旋转, 缩放)

	使用 x,y 轴做二维坐标轴, z轴始终由屏幕内指向外, 即: 默认的坐标轴不变, 相机视角始终沿z轴负方向垂直于 x,y

	修改自 OrbitControls

	Orbit - left mouse / touch: one-finger move
    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
 */

THREE.TwoDimensionalControls = function (object, domElement) {
	if (object.type != 'OrthographicCamera')
		return console.error('必须使用正交相机 OrthographicCamera');

	this.object = object;
	this.domElement = domElement !== undefined ? domElement : document;
	console.log(this.domElement)
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	this.enableDamping = false;	// If damping(inertia) is enabled, you must call controls.update() in your animation loop
	this.dampingFactor = 0.25;
	this.dampingFactorOfPanning = 0.75;// 平移时, 阻尼系数过小会导致飘忽不定的感觉, 因此在这里加一个平移阻尼系数, 给较大的默认值

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	this.enableRotate = true;
	this.rotateSpeed = 1;
	this.autoRotate = false; // If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = true; // if true, pan in screen-space

	this.keyPanSpeed = 7.0; // pixels moved per arrow key push

	// Set to false to disable use of the keys
	this.enableKeys = true;
	// The four arrow keys
	this.keys = {
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		BOTTOM: 40
	};

	// Mouse buttons
	this.mouseButtons = {
		LEFT: THREE.MOUSE.LEFT,
		MIDDLE: THREE.MOUSE.MIDDLE,
		RIGHT: THREE.MOUSE.RIGHT
	};

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	this.saveState = function () {
		scope.target0.copy(scope.target);
		scope.position0.copy(scope.object.position);
		scope.zoom0 = scope.object.zoom;
	};

	this.reset = function () {
		scope.target.copy(scope.target0);
		scope.object.position.copy(scope.position0);
		scope.object.zoom = scope.zoom0;
		scope.object.updateProjectionMatrix();
		scope.dispatchEvent(changeEvent);
		scope.update();
		state = STATE.NONE;
	};

	this.setStartZoom = function (zoom) {
		scope.object.zoom = zoom;
		scope.object.updateProjectionMatrix();
		if (zoom > this.maxZoom) console.warn('设定的初始zoom大于maxZoom');
		if (zoom < this.minZoom) console.warn('设定的初始zoom小于minZoom');
	};

	this.showCompass = function (parentDom, position) {
		position = position || { right: '10px', top: '10px' }
		this.compassDomElement = document.createElement('div')
		this.compassDomElement.style = 'position: absolute;width: 40px;height: 40px;'
			+ Object.keys(position).map(function (m) { return `${m}:${position[m]};` }).join('')
			+ 'background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADCElEQVRYR8WXTWgTURDHZ15sJCHSHCxIFYqiCOJNUAqCgoj4gQcPReoHHqQt5BTivqkIuiqEfS+x9WAU25vVQlEQQaEnUbwIihe9KEV7EHvxUoggJN2RLVlZ101280X3lLw3M//fm5l97y3CGj+4xvrQFQCtNTsLY+brRGS6i3THpZR/dbsK4IfoOMDk5GS6Wq0eMwxj1ltKV8gdczPRcQCl1A0AOExEg40A3Ewg4jXnd0dKMDExkahWqz8AIB2LxXbmcrkv/lo7K3dFvYAdAVBK5RCxWAt8S0p5KajZlFKmH6JtANM044lE4hsi9tdEf/b29vaPjo5WnP/+Wvsh2gbQWl8EgGlvWhHxlGEYT4MAnDEvRFsApmmKZDL5FQAGvADM/IKITjS7sTW9D1iWNSSEmPMLMbMdj8e3ZLPZpWYgmgbQWn8EgN11RK5IKfNdA7As64gQYr6eADMvEtHWrgForV8BwIEQgYNSytdRISKXoFgs7rFt+31YYGaeIaLzYXbufGQApdQzRDwZFpiZfwshNhqG8SvM1pmPBKC13gEAn6PaI+KYYRj3OwkwAwBnowSs2byTUu6NYh+agWKxOLCysrKAiOuiBHRt/AdUPd9QAK31HQDINCPu2DLzbSLKhvk1BMjn832xWOw7IsbDAgXsjMvpdLrPPaBayoBSKo+Il5sV99gPSSkfN/Kvm4FSqZQql8tLiJhqA2BeSnm0JQClFCGi1Yb4aiv09PRsbnRABWagduFwat/XJoDTjFeJ6GZTPaCUGkPEe+2K196GRSnlNkRc/VbwP/9loN6Fw+vIzAsAUKqNZRBxe8M6Ix4yDONlJIBCoTDMzI8CXqvfiPgEAKaklG+885Zl7UfEEUQcAoD1AUKzUsozkQACLhyfHFHbth+Mj48vN1qp86FSqVTOAcAYAOxybZ0Dipk3Bfn/UwLLso4LIZ4DgHOSzTHzNBG9baUXCoXCPmYeYebTiJhk5gwR3W3YA0qpKQD4kEqlHmYymXIrwn4fpdQGIcSwbduDRHTBP/8HE5pHMFW+y+sAAAAASUVORK5CYII=);'
			+ 'background-repeat: no-repeat;'
		parentDom.appendChild(this.compassDomElement)
	}

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {
		var offset = new THREE.Vector3(); // so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
		var quatInverse = quat.clone().inverse();
		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {
			var position = scope.object.position;
			offset.copy(position).sub(scope.target); // rotate offset to "y-axis-is-up" space

			offset.applyQuaternion(quat); // angle from z-axis around y-axis

			if (scope.autoRotate && state === STATE.NONE) {
				rotateRound(getAutoRotationAngle());
			}
			scope.target.add(panOffset);

			offset.applyQuaternion(quatInverse);
			position.copy(scope.target).add(offset); //scope.object.lookAt(scope.target);

			scope.object.rotation.z += rotateAngle;

			if (scope.enableDamping) {
				rotateAngle *= 1 - scope.dampingFactor;
				panOffset.multiplyScalar(1 - scope.dampingFactorOfPanning);
			} else {
				rotateAngle = 0
				panOffset.set(0, 0, 0);
			}

			// compass
			if (this.compassDomElement) {
				compassRotate = `rotate(${scope.object.rotation.z / Math.PI * 180}deg)`
				this.compassDomElement.style['transform'] = compassRotate
				this.compassDomElement.style['-ms-transform'] = compassRotate
				this.compassDomElement.style['-moz-transform'] = compassRotate
				this.compassDomElement.style['-webkit-transform'] = compassRotate
				this.compassDomElement.style['-o-transform'] = compassRotate
			}

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8
			if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
				scope.dispatchEvent(changeEvent);
				lastPosition.copy(scope.object.position);
				lastQuaternion.copy(scope.object.quaternion);
				zoomChanged = false;
				return true;
			}
			return false;
		};
	}();

	this.dispose = function () {
		scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
		scope.domElement.removeEventListener('mousedown', onMouseDown, false);
		scope.domElement.removeEventListener('wheel', onMouseWheel, false);
		scope.domElement.removeEventListener('touchstart', onTouchStart, false);
		scope.domElement.removeEventListener('touchend', onTouchEnd, false);
		scope.domElement.removeEventListener('touchmove', onTouchMove, false);
		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);
		window.removeEventListener('keydown', onKeyDown, false);
	};

	var scope = this;
	var changeEvent = {
		type: 'change'
	};
	var startEvent = {
		type: 'start'
	};
	var endEvent = {
		type: 'end'
	};
	var STATE = {
		NONE: -1,
		ROTATE: 0,
		DOLLY: 1,
		PAN: 2,
		TOUCH_ROTATE: 3,
		TOUCH_DOLLY_PAN: 4
	};
	var state = STATE.NONE;
	var EPS = 0.000001;

	var panOffset = new THREE.Vector3();
	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var zoomChanged = false;
	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var rotateAngle = 0
	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	function getAutoRotationAngle() {
		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}

	function getZoomScale() {
		return Math.pow(0.95, scope.zoomSpeed);
	}

	function rotateRound(angle) {
		rotateAngle -= angle; // z轴的方向是面向相机的, 相机旋转的角度需要翻转来看  
	}

	var panLeft = function () {
		var v = new THREE.Vector3();
		return function panLeft(distance, objectMatrix) {
			v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix

			v.multiplyScalar(-distance);
			panOffset.add(v);
		};
	}();

	var panUp = function () {
		var v = new THREE.Vector3();
		return function panUp(distance, objectMatrix) {
			if (scope.screenSpacePanning === true) {
				v.setFromMatrixColumn(objectMatrix, 1);
			} else {
				v.setFromMatrixColumn(objectMatrix, 0);
				v.crossVectors(scope.object.up, v);
			}

			v.multiplyScalar(distance);
			panOffset.add(v);
		};
	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {
		var offset = new THREE.Vector3();
		return function pan(deltaX, deltaY) {
			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if (scope.object.isPerspectiveCamera) {
				// perspective
				var position = scope.object.position;
				offset.copy(position).sub(scope.target);
				var targetDistance = offset.length(); // half of the fov is center to top of screen

				targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0); // we use only clientHeight here so aspect ratio does not distort speed

				panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
				panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
			} else if (scope.object.isOrthographicCamera) {
				// orthographic
				panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
				panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
			} else {
				// camera neither orthographic nor perspective
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
				scope.enablePan = false;
			}
		};
	}();

	function dollyIn(dollyScale) {
		if (scope.object.isOrthographicCamera) {
			scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {
			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			scope.enableZoom = false;
		}
	}

	function dollyOut(dollyScale) {
		if (scope.object.isOrthographicCamera) {
			scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {
			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			scope.enableZoom = false;
		}
	}

	//
	// event callbacks - update the object state
	//
	function handleMouseDownRotate(event) {
		//console.log( 'handleMouseDownRotate' );
		rotateStart.set(event.clientX, event.clientY);
	}

	function handleMouseDownDolly(event) {
		//console.log( 'handleMouseDownDolly' );
		dollyStart.set(event.clientX, event.clientY);
	}

	function handleMouseDownPan(event) {
		//console.log( 'handleMouseDownPan' );
		panStart.set(event.clientX, event.clientY);
	}

	function handleMouseMoveRotate(event) {
		//console.log( 'handleMouseMoveRotate' );
		rotateEnd.set(event.clientX, event.clientY);
		rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
		var xyTotalIncrement = 0;
		var xIncrement = 0;
		var yIncrement = 0;
		if (rotateEnd.x > element.clientWidth / 2) yIncrement -= rotateDelta.y; else yIncrement += rotateDelta.y;
		if (rotateEnd.y > element.clientHeight / 2) xIncrement += rotateDelta.x; else xIncrement -= rotateDelta.x;
		xyTotalIncrement = xIncrement + yIncrement;
		rotateRound(Math.PI * xyTotalIncrement / ((element.clientHeight + element.clientWidth) / 2));
		rotateStart.copy(rotateEnd);
		scope.update();
	}

	function handleMouseMoveDolly(event) {
		//console.log( 'handleMouseMoveDolly' );
		dollyEnd.set(event.clientX, event.clientY);
		dollyDelta.subVectors(dollyEnd, dollyStart);

		if (dollyDelta.y > 0) {
			dollyIn(getZoomScale());
		} else if (dollyDelta.y < 0) {
			dollyOut(getZoomScale());
		}

		dollyStart.copy(dollyEnd);
		scope.update();
	}

	function handleMouseMovePan(event) {
		//console.log( 'handleMouseMovePan' );
		panEnd.set(event.clientX, event.clientY);
		panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
		pan(panDelta.x, panDelta.y);
		panStart.copy(panEnd);
		scope.update();
	}

	function handleMouseUp(event) {// console.log( 'handleMouseUp' );
	}

	function handleMouseWheel(event) {
		// console.log( 'handleMouseWheel' );
		if (event.deltaY < 0) {
			dollyOut(getZoomScale());
		} else if (event.deltaY > 0) {
			dollyIn(getZoomScale());
		}

		scope.update();
	}

	function handleKeyDown(event) {
		//console.log( 'handleKeyDown' );
		switch (event.keyCode) {
			case scope.keys.UP:
				pan(0, -scope.keyPanSpeed);
				break;

			case scope.keys.BOTTOM:
				pan(0, scope.keyPanSpeed);
				break;

			case scope.keys.LEFT:
				pan(-scope.keyPanSpeed, 0);
				break;

			case scope.keys.RIGHT:
				pan(scope.keyPanSpeed, 0);
				break;
		}

		scope.update();
	}

	function handleTouchStartRotate(event) {
		//console.log( 'handleTouchStartRotate' );
		rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
	}

	function handleTouchStartDollyPan(event) {
		//console.log( 'handleTouchStartDollyPan' );
		if (scope.enableZoom) {
			var dx = event.touches[0].pageX - event.touches[1].pageX;
			var dy = event.touches[0].pageY - event.touches[1].pageY;
			var distance = Math.sqrt(dx * dx + dy * dy);
			dollyStart.set(0, distance);
		}

		if (scope.enablePan) {
			var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
			var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
			panStart.set(x, y);
		}
	}

	function handleTouchMoveRotate(event) {
		//console.log( 'handleTouchMoveRotate' );
		rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
		rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
		rotateRound(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

		rotateStart.copy(rotateEnd);
		scope.update();
	}

	function handleTouchMoveDollyPan(event) {
		//console.log( 'handleTouchMoveDollyPan' );
		if (scope.enableZoom) {
			var dx = event.touches[0].pageX - event.touches[1].pageX;
			var dy = event.touches[0].pageY - event.touches[1].pageY;
			var distance = Math.sqrt(dx * dx + dy * dy);
			dollyEnd.set(0, distance);
			dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
			dollyIn(dollyDelta.y);
			dollyStart.copy(dollyEnd);
		}

		if (scope.enablePan) {
			var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
			var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
			panEnd.set(x, y);
			panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
			pan(panDelta.x, panDelta.y);
			panStart.copy(panEnd);
		}

		scope.update();
	}

	function handleTouchEnd(event) { } //console.log( 'handleTouchEnd' );

	//
	// event handlers - FSM: listen for events and reset state
	//
	function onMouseDown(event) {
		if (scope.enabled === false) return;
		event.preventDefault();

		switch (event.button) {
			case scope.mouseButtons.LEFT:
				if (event.ctrlKey || event.metaKey || event.shiftKey) {
					if (scope.enablePan === false) return;
					handleMouseDownPan(event);
					state = STATE.PAN;
				} else {
					if (scope.enableRotate === false) return;
					handleMouseDownRotate(event);
					state = STATE.ROTATE;
				}

				break;

			case scope.mouseButtons.MIDDLE:
				if (scope.enableZoom === false) return;
				handleMouseDownDolly(event);
				state = STATE.DOLLY;
				break;

			case scope.mouseButtons.RIGHT:
				if (scope.enablePan === false) return;
				handleMouseDownPan(event);
				state = STATE.PAN;
				break;
		}

		if (state !== STATE.NONE) {
			document.addEventListener('mousemove', onMouseMove, false);
			document.addEventListener('mouseup', onMouseUp, false);
			scope.dispatchEvent(startEvent);
		}
	}

	function onMouseMove(event) {
		if (scope.enabled === false) return;
		event.preventDefault();

		switch (state) {
			case STATE.ROTATE:
				if (scope.enableRotate === false) return;
				handleMouseMoveRotate(event);
				break;

			case STATE.DOLLY:
				if (scope.enableZoom === false) return;
				handleMouseMoveDolly(event);
				break;

			case STATE.PAN:
				if (scope.enablePan === false) return;
				handleMouseMovePan(event);
				break;
		}
	}

	function onMouseUp(event) {
		if (scope.enabled === false) return;
		handleMouseUp(event);
		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);
		scope.dispatchEvent(endEvent);
		state = STATE.NONE;
	}

	function onMouseWheel(event) {
		if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE && state !== STATE.ROTATE) return;
		event.preventDefault();
		event.stopPropagation();
		scope.dispatchEvent(startEvent);
		handleMouseWheel(event);
		scope.dispatchEvent(endEvent);
	}

	function onKeyDown(event) {
		if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;
		handleKeyDown(event);
	}

	function onTouchStart(event) {
		if (scope.enabled === false) return;
		event.preventDefault();

		switch (event.touches.length) {
			case 1:
				// one-fingered touch: rotate
				if (scope.enableRotate === false) return;
				handleTouchStartRotate(event);
				state = STATE.TOUCH_ROTATE;
				break;

			case 2:
				// two-fingered touch: dolly-pan
				if (scope.enableZoom === false && scope.enablePan === false) return;
				handleTouchStartDollyPan(event);
				state = STATE.TOUCH_DOLLY_PAN;
				break;

			default:
				state = STATE.NONE;
		}

		if (state !== STATE.NONE) {
			scope.dispatchEvent(startEvent);
		}
	}

	function onTouchMove(event) {
		if (scope.enabled === false) return;
		event.preventDefault();
		event.stopPropagation();

		switch (event.touches.length) {
			case 1:
				// one-fingered touch: rotate
				if (scope.enableRotate === false) return;
				if (state !== STATE.TOUCH_ROTATE) return; // is this needed?

				handleTouchMoveRotate(event);
				break;

			case 2:
				// two-fingered touch: dolly-pan
				if (scope.enableZoom === false && scope.enablePan === false) return;
				if (state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?

				handleTouchMoveDollyPan(event);
				break;

			default:
				state = STATE.NONE;
		}
	}

	function onTouchEnd(event) {
		if (scope.enabled === false) return;
		handleTouchEnd(event);
		scope.dispatchEvent(endEvent);
		state = STATE.NONE;
	}

	function onContextMenu(event) {
		if (scope.enabled === false) return;
		event.preventDefault();
	}


	scope.domElement.addEventListener('contextmenu', onContextMenu, false);
	scope.domElement.addEventListener('mousedown', onMouseDown, false);
	scope.domElement.addEventListener('wheel', onMouseWheel, false);
	scope.domElement.addEventListener('touchstart', onTouchStart, false);
	scope.domElement.addEventListener('touchend', onTouchEnd, false);
	scope.domElement.addEventListener('touchmove', onTouchMove, false);
	window.addEventListener('keydown', onKeyDown, false);

	// force an update at start
	this.update();
};

THREE.TwoDimensionalControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.TwoDimensionalControls.prototype.constructor = THREE.TwoDimensionalControls;