export default class GridUtils {
    static center(width, colCount, col) {
        return (width / colCount) * (col - 0.5);
    }
}
