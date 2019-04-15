class CurveLibrary {
    /**
     * 回旋线
     * 
     * 本示例中的符号定义 -- 不同文档定义不一样
     * 回旋参数 A  回旋常数 C  曲线总长 LS
     * 任意一点(x,y) 到起点的弧长 L
     * 任意一点(x,y) 的曲率半径 R
     * 
     * 关系 C = A * A    LR = C
     * 
     * 方法参考 https://en.wikipedia.org/wiki/Euler_spiral
     * 
     * @param {number} LS 曲线总长
     * @param {*} A  回旋参数
     * @param {*} rot 旋转方向 ccw 逆时针  cw 顺时针
     * @param {*} N 分段数, 越大越精确
     */
    static eulerSpiral(LS, A, rot = 'ccw', N = 10000) {
        var dx, dy, t = 0, prev = { x: 0, y: 0 }, current;
        var ds = LS / N;
        var $2C = 2 * A * A
        var points = []
        while (N--) {
            dx = Math.cos(t * t / $2C) * ds;
            dy = Math.sin(t * t / $2C) * ds;
            t += ds;
            current = {
                x: prev.x + dx,
                y: prev.y + dy
            }
            if (rot == 'ccw')
                points.push({ x: current.x, y: current.y })
            else {
                points.push({ x: current.x, y: -current.y })
            }
            prev = current;
        }
        return points
    }
}