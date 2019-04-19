/**
 * 在曲线节点附近显示文字等'方块'时, 避免方块重叠
 * 
 * 曲线不再单独给出, 假定曲线为各节点的连线
 */
class RectanglesAroundCurve {
    /**
     * 
     * @param {*} rectangles 
     * @param {*} accuracy  判断多少个兄弟节点, 取值越大重叠可能性越低
     */
    constructor(rectangles, accuracy = 10) {
        this.rectangles = rectangles
        this.accuracy = accuracy
        rectangles.forEach(function (m) {
            if (!m.h) console.error('需要设置高度')
            if (!m.w) console.error('需要设置宽度')
        })
    }

    get() {
        // 确定矩形
        this.rectangles = this.rectangles.map(function (m, index) {
            m.originX = m.x
            m.originY = m.y
            m.pre = this.rectangles[index - 1]
            return m
        }, this)
        // 确定矩形相对曲线的方位 上/下
        this.rectangles.forEach(function (m, index) {
            if (index == 0) return

            if (m.originX == m.pre.originX) {
                m.x += m.h * 0.25
            } else if (m.originY == m.pre.originY) {
                m.y += m.h * 0.25
            }
            else if (((m.originX - m.pre.originX) ^ (m.originY - m.pre.originY)) > 0) {
                m.y -= m.h * 1.25
            } else {
                // 不用处理
            }
        })
        // 处理重叠
        this.rectangles.forEach(function (m, index) {
            if (index == 0) return
            if (Math.abs(m.originX - m.pre.originX) > Math.abs(m.originY - m.pre.originY)) {  // x的变化比y大, 曲线倾向水平, 矩形上下移动
                if (m.y < m.originY) {
                    while (overLapWithPre(m, this.accuracy)) { m.y -= m.h } // 向下移动
                } else {
                    while (overLapWithPre(m, this.accuracy)) { m.y += m.h } // 向上移动
                }
            } else { // 矩形左右移动
                while (overLapWithPre(m, this.accuracy)) { m.x += m.h }
            }
        }, this)

        return this.rectangles

        function overLapWithPre(m, accuracy) {
            if (!m.pre) return false
            let pre = m.pre
            for (let i = 0; i < accuracy; i++) {
                if (theSameSizeRectangleOverlap(m, pre)) return true
                if (!pre.pre) return false
                pre = pre.pre
            }
            return false
        }

        function theSameSizeRectangleOverlap(a, b) {
            return Math.abs(a.x - b.x) <= a.w && Math.abs(a.y - b.y) <= a.h
        }
    }
}