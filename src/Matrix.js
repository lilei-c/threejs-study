class Matrix {
    static multiply(a, b) {
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
        return result
    }

    static add(a, b) {
        let result = []
        for (let i = 0; i < a.length; i++) {
            let temp = []
            for (let j = 0; j < a[0].length; j++) {
                temp.push(a[i][j] + b[i][j])
            }
            result.push(temp)
        }
        return result
    }
}
// ;;
// console.log(
//     Matrix.multiply([
//         [1, 2, 3],
//         [4, 5, 6]
//     ], [
//             [1, 4],
//             [2, 5],
//             [3, 6]
//         ])
// )
// console.log(
//     Matrix.multiply([
//         [1, 0, 2],
//         [-1, 3, 1]
//     ], [
//             [3, 1],
//             [2, 1],
//             [0, 1]
//         ])
// )