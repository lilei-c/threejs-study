function getConvexHull(_points) {
  // clone
  let points = JSON.parse(JSON.stringify(_points));

  // 小于4个点不用找
  if (points.length <= 3) return points;

  // 按y排序
  points = points.sort((a, b) => a.y - b.y);

  // 找最小y的点
  let minyPoints = points.filter(m => m.y == points[0].y);

  console.log(minyPoints);

  // 找最小y中最小x的点 (p0)
  originPoint = minyPoints.sort((a, b) => a.x - b.x)[0];

  // 计算 p0 到每个点与x轴的夹角
  points.forEach(m => {
    m.angle = getAngle(originPoint.x, originPoint.y, m.x, m.y);
  });

  // 按角度排序
  points = points.sort((a, b) => a.angle - b.angle);

  // 按x,y去重
  let temp = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (
      points[i].x !== temp[temp.length - 1].x &&
      points[i].y !== temp[temp.length - 1].y
    )
      temp.push(points[i]);
  }
  points = temp;

  // 按角度去重(保留最远的)
  temp = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (points[i].angle != temp[temp.length - 1].angle) {
      temp.push(points[i]);
      continue;
    }
    let tempTail = temp[temp.length - 1];
    // 如果当前距离大, 则替换栈顶
    if (
      Math.pow(points[i].x - points[0].x, 2) +
        Math.pow(points[i].y - points[0].y, 2) >
      Math.pow(tempTail[i].x - points[0].x, 2) +
        Math.pow(tempTail[i].y - points[0].y, 2)
    ) {
      temp.pop();
      temp.push(points[i]);
    }
  }
  points = temp;

  // 小于4个点不用找
  if (points.length <= 3) return points;

  // 以上为准备工作, 下面求凸包
  hull = [points[0], points[1]];

  //
  for (let i = 2; i < points.length - 1; i++) {
    let curPoints = points[i]; // 即将入栈的点(当前点)
    popAndPush(hull, curPoints);
  }

  // 回溯
  function popAndPush(hull, curPoints) {
    let hullTail = hull[hull.length - 1]; // 栈顶的点
    let hullSecondTail = hull[hull.length - 2]; // 栈顶往下第二的点
    // 计算叉积
    // 假设栈顶往下第二的点->栈顶点的射线为A,
    // 情况1.如果当前点在A左侧, 则当前点入栈
    // 情况2.如果当前点在A右侧, 则当前点入栈, 同时栈顶的点出栈; (此时应该继续判断, 直到栈顶的点不用出栈)
    // 情况3.共线, 当前点距离远等同于当前点在A右侧, 反之左侧
    let turnLeft = isTurnLeft(hullSecondTail, hullTail, curPoints);
    if (turnLeft > 0) {
      hull.push(curPoints);
    } else if (turnLeft == 0) {
    } else {
      hull.pop();
      popAndPush(hull, curPoints);
    }
  }

  // 最后一个点必是凸包上的点
  hull.push(points[points.length - 1]);

  return hull;

  /**
   * 计算∠abc的转向, 大于0左偏, 小于0右偏, 等于0共线
   * @param {*} a
   * @param {*} b
   * @param {*} c
   */
  function isTurnLeft(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  /**
   * a到b点的射线与x轴的夹角, 从x轴正方向逆时针算起
   * @param {*} aX
   * @param {*} aY
   * @param {*} bX
   * @param {*} bY
   */
  function getAngle(aX, aY, bX, bY) {
    x = bX - aX;
    y = bY - aY;

    //
    if (x == 0 && y == 0) return 0;
    // 点落在坐标轴上
    if (x == 0) {
      if (y > 0) return Math.PI;
      return Math.PI * 1.5;
    }
    if (y == 0) {
      if (x > 0) return 0;
      return Math.PI;
    }
    // 点落在象限内
    if (x > 0) {
      if (y > 0) return Math.atan(y / x);
      return Math.PI * 2 - Math.atan(-y / x);
    } else {
      if (y > 0) return Math.PI - Math.atan(y / -x);
      return Math.PI + Math.atan(y / x);
    }
  }
}

// points = JSON.parse(
//   '[{"x":0,"y":110},{"x":0,"y":125},{"x":0,"y":84},{"x":1,"y":97},{"x":2,"y":139},{"x":3,"y":152},{"x":3,"y":72},{"x":4,"y":164},{"x":8,"y":59},{"x":10,"y":177},{"x":11,"y":47},{"x":12,"y":189},{"x":13,"y":28},{"x":13,"y":37},{"x":15,"y":121},{"x":15,"y":202},{"x":17,"y":149},{"x":17,"y":201},{"x":18,"y":93},{"x":20,"y":212},{"x":20,"y":23},{"x":23,"y":69},{"x":24,"y":175},{"x":24,"y":42},{"x":29,"y":223},{"x":34,"y":149},{"x":35,"y":109},{"x":36,"y":169},{"x":36,"y":190},{"x":37,"y":234},{"x":38,"y":85},{"x":40,"y":207},{"x":42,"y":13},{"x":44,"y":30},{"x":45,"y":244},{"x":52,"y":254},{"x":53,"y":227},{"x":57,"y":44},{"x":59,"y":192},{"x":61,"y":212},{"x":62,"y":262},{"x":70,"y":246},{"x":70,"y":67},{"x":71,"y":271},{"x":73,"y":8},{"x":78,"y":202},{"x":81,"y":278},{"x":88,"y":263},{"x":88,"y":28},{"x":91,"y":284},{"x":94,"y":233},{"x":102,"y":290},{"x":102,"y":44},{"x":105,"y":8},{"x":110,"y":276},{"x":113,"y":248},{"x":114,"y":65},{"x":115,"y":296},{"x":122,"y":19},{"x":127,"y":302},{"x":131,"y":3},{"x":133,"y":285},{"x":133,"y":41},{"x":135,"y":259},{"x":136,"y":306},{"x":148,"y":18},{"x":150,"y":310},{"x":153,"y":64},{"x":155,"y":294},{"x":156,"y":266},{"x":162,"y":313},{"x":163,"y":42},{"x":166,"y":1},{"x":174,"y":314},{"x":178,"y":17},{"x":180,"y":271},{"x":180,"y":298},{"x":187,"y":316},{"x":195,"y":2},{"x":198,"y":39},{"x":200,"y":317},{"x":204,"y":271},{"x":207,"y":298},{"x":211,"y":15},{"x":213,"y":317},{"x":217,"y":61},{"x":222,"y":243},{"x":224,"y":0},{"x":225,"y":316},{"x":229,"y":0},{"x":231,"y":39},{"x":232,"y":296},{"x":235,"y":17},{"x":238,"y":315},{"x":244,"y":60},{"x":250,"y":80},{"x":251,"y":309},{"x":252,"y":98},{"x":253,"y":1},{"x":253,"y":1},{"x":253,"y":112},{"x":253,"y":208},{"x":253,"y":259},{"x":253,"y":288},{"x":254,"y":139},{"x":255,"y":153},{"x":256,"y":126},{"x":256,"y":166},{"x":256,"y":194},{"x":257,"y":181},{"x":260,"y":233},{"x":262,"y":34},{"x":264,"y":306},{"x":268,"y":133},{"x":269,"y":105},{"x":269,"y":120},{"x":269,"y":21},{"x":269,"y":215},{"x":269,"y":92},{"x":271,"y":147},{"x":271,"y":160},{"x":271,"y":201},{"x":273,"y":174},{"x":273,"y":187},{"x":273,"y":248},{"x":276,"y":301},{"x":279,"y":276},{"x":286,"y":102},{"x":286,"y":6},{"x":287,"y":119},{"x":287,"y":136},{"x":287,"y":153},{"x":287,"y":296},{"x":287,"y":85},{"x":288,"y":205},{"x":289,"y":170},{"x":290,"y":187},{"x":294,"y":235},{"x":297,"y":43},{"x":298,"y":289},{"x":299,"y":263},{"x":304,"y":104},{"x":305,"y":85},{"x":306,"y":124},{"x":306,"y":143},{"x":307,"y":183},{"x":308,"y":163},{"x":308,"y":202},{"x":310,"y":282},{"x":311,"y":51},{"x":312,"y":26},{"x":318,"y":247},{"x":319,"y":273},{"x":320,"y":16},{"x":323,"y":95},{"x":324,"y":114},{"x":324,"y":134},{"x":325,"y":173},{"x":326,"y":153},{"x":327,"y":192},{"x":328,"y":212},{"x":328,"y":264},{"x":334,"y":228},{"x":336,"y":254},{"x":342,"y":245},{"x":342,"y":35},{"x":343,"y":103},{"x":343,"y":84},{"x":344,"y":124},{"x":344,"y":144},{"x":344,"y":200},{"x":345,"y":163},{"x":345,"y":183},{"x":345,"y":57},{"x":351,"y":17},{"x":351,"y":17},{"x":351,"y":17},{"x":352,"y":234},{"x":357,"y":224},{"x":358,"y":185},{"x":362,"y":60},{"x":363,"y":213},{"x":365,"y":37},{"x":366,"y":160},{"x":367,"y":84},{"x":370,"y":135},{"x":370,"y":201},{"x":371,"y":110},{"x":373,"y":23},{"x":377,"y":189},{"x":381,"y":178},{"x":383,"y":165},{"x":385,"y":37},{"x":386,"y":17},{"x":386,"y":52},{"x":387,"y":152},{"x":387,"y":152},{"x":388,"y":62},{"x":388,"y":75},{"x":389,"y":139},{"x":391,"y":113},{"x":392,"y":126},{"x":392,"y":87},{"x":393,"y":100}]'
// );

// let convexHullPoints = getConvexHull(points);

// console.log(convexHullPoints);
