import { Vec2 } from "kaboom"
import { CellComp } from "./interfaces"
import { revealAdjacentCells, globalToGridCoords } from "./utils"
import { CELL_OFFSET } from "./constants"


export function cell(cellSize: number = 32): CellComp {
    let isBomb = false
    let isRevealed = false
    let isFlagged = false
    let bombCount = 0

    const TEXT_REDUCTION_SCALE = 3

    return {
        id: "cell-game",
        require: ["pos", "area"],

        draw() {

            if (bombCount == 0 && isRevealed) {
                //@ts-ignore
                this.color = rgb(120, 120, 120)
                return
            }


            if (isFlagged && !isRevealed) {
                drawText({
                    text: "F",
                    color: rgb(255, 255, 0),
                    pos: vec2(cellSize / 2, cellSize / 2),
                    origin: "center",
                    scale: vec2(1 / (TEXT_REDUCTION_SCALE), 1 / (TEXT_REDUCTION_SCALE)),
                })
            }

            if (isRevealed && !isBomb) {
                drawText({
                    text: bombCount.toString(),
                    color: rgb(0, 255, 0),
                    pos: vec2(cellSize / 2, cellSize / 2),
                    origin: "center",
                    scale: vec2(1 / (TEXT_REDUCTION_SCALE), 1 / (TEXT_REDUCTION_SCALE)),
                })
            }

            if (isBomb && isRevealed) {
                //@ts-ignore
                drawCircle({
                    color: rgb(255, 0, 0),
                    pos: vec2(cellSize / 2, cellSize / 2),
                    radius: cellSize / 4,
                    origin: "center",
                })
            }
        },
        inspect() {
            return `${isBomb ? "bomb" : "cell"} count: ${bombCount}`
        },

        isCellBomb() {
            return isBomb
        },

        setBombState(state: boolean) {
            isBomb = state
        },

        setFlaggedState(state: boolean) {
            isFlagged = state
        },
        isCellFlagged() {
            return isFlagged
        },
        isCellRevealed() {
            return isRevealed
        },
        reveal(hasBeenFlagged: boolean = false) {

            if (this.isCellFlagged())
                return

            isRevealed = true

            if (bombCount == 0) {
                revealAdjacentCells(this.getGridPos(), hasBeenFlagged)
            }
            if (isBomb) {
                console.log("game over")
                //@ts-ignore
                addKaboom(this.pos)

                wait(3, () => go('loser'))
            }
        },
        increaseBombCount() {
            bombCount++
        },
        getBombCount() {
            return bombCount
        },
        getGridPos(): Vec2 {
            //@ts-ignore
            return globalToGridCoords(this.pos, cellSize, CELL_OFFSET)
        }
    }
}
