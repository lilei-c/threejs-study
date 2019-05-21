/**
 * 二维矩阵
 * 
 * 运算时 第一个矩阵和第二个矩阵的命名规则 
 * MatrixA MatrixB
 * A B
 * a b
 */
class Matrix2 {
    constructor(array) {
        this.array = array
    }

    multiply(val) {
        const a = this.array
        const b = this.getArrayOfMatrixB(val)

        let result = []
        for (let i = 0; i < a.length; i++) {
            let temp = []
            for (let j = 0; j < b[0].length; j++) {
                let val = 0
                for (var k = 0; k < b.length; k++) {
                    val += a[i][k] * b[k][j]
                }
                temp.push(val)
            }
            result.push(temp)
        }
        return new Matrix2(result)
    }

    add(val) {
        const a = this.array
        const b = this.getArrayOfMatrixB(val)

        let result = []
        for (let i = 0; i < a.length; i++) {
            let temp = []
            for (let j = 0; j < a[0].length; j++) {
                temp.push(a[i][j] + b[i][j])
            }
            result.push(temp)
        }
        return new Matrix2(result)
    }

    getArrayOfMatrixB(val) {
        if (val instanceof Array)
            return val
        else if (val instanceof Matrix2)
            return val.array
    }
}
// ;;
// console.log(new Matrix2([[1, 2, 3], [4, 5, 6]]).multiply([[1, 4], [2, 5], [3, 6]]).array)
// console.log(new Matrix2([[1, 0, 2], [-1, 3, 1]]).multiply([[3, 1], [2, 1], [1, 0]]).array)
// console.log(new Matrix2([[1, 2], [3, 4]]).add([[4, 3], [2, 1]]).array)