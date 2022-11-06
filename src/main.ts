import { CellComp } from './interfaces';
import kaboom, { GameObj, Vec2 } from 'kaboom'

kaboom({
    background: [0, 50, 50, 1],
})


const globalToGridCoords = (pos: Vec2, cellSize: number, offset: number) => {
    return vec2(
        Math.floor((pos.x - offset) / cellSize),
        Math.floor((pos.y - offset) / cellSize)
    )
}

const getSelectedCellFromMousePos = (mousePos: Vec2) => {
    const gridCoords = globalToGridCoords(mousePos, CELL_SIZE, CELL_OFFSET)

    const selected_cell = get('cell').filter(cell => {
        return cell.getGridPos().eq(gridCoords)
    })[0] as GameObj<CellComp>

    if (selected_cell) {
        return selected_cell
    }
    return null
}


function cell(cellSize: number = 32): CellComp {
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
                    color: rgb(0, 255, 0),
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

const revealAdjacentCells = (cellGridPos: Vec2, hasBeenFlagged: boolean) => {
    const neighbours = getSurroundingCells(cellGridPos)

    if (hasBeenFlagged)
        return

    for (let neighbour of neighbours) {
        if (neighbour.isCellFlagged())
            continue

        if (neighbour.isCellBomb())
            continue

        if (neighbour.isCellRevealed())
            continue

        if (neighbour.getBombCount() > 0) {
            neighbour.reveal(true)
            continue
        }

        neighbour.reveal()
    }
}

const makeCell = (position: Vec2) => {
    const newCell = add([
        rect(32, 32),
        pos(position),
        color(255, 255, 255),
        outline(4),
        area(),
        cell(CELL_SIZE),
        'cell'
    ])

    return newCell
}

const checkIfAllBombCellsAreFlagged = () => {
    const bombCells = get('cell').filter(cell => {
        return cell.isCellBomb()
    })

    for (let cell of bombCells) {
        if (!cell.isCellFlagged())
            return false
    }

    return true
}

const checkIfAllNonBombCellsAreUnflagged = () => {
    const nonBombCells = get('cell').filter(cell => {
        return !cell.isCellBomb()
    })

    for (let cell of nonBombCells) {
        if (cell.isCellFlagged())
            return false
    }

    return true
}

const generateBombCountForCell = () => {
    const cells = get('cell') as GameObj<CellComp>[]

    for (let cell of cells) {
        const gridPos = cell.getGridPos()
        const surroundingCells = getSurroundingCells(gridPos)

        for (let surroundingCell of surroundingCells) {
            if (surroundingCell.isCellBomb()) {
                cell.increaseBombCount()
            }
        }
    }
}

const getSurroundingCells = (cellToCheckGridPos: Vec2) => {
    const cells = get('cell') as GameObj<CellComp>[]
    const surroundingCells = cells.filter(cell => {
        const currentCellGridPos = cell.getGridPos()
        return currentCellGridPos.x >= cellToCheckGridPos.x - 1 &&
            currentCellGridPos.x <= cellToCheckGridPos.x + 1 &&
            currentCellGridPos.y >= cellToCheckGridPos.y - 1 &&
            currentCellGridPos.y <= cellToCheckGridPos.y + 1
    })

    return surroundingCells
}

const createGrid = (width: number, height: number, cellSize: number, offset: number) => {

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const createdCell = makeCell(vec2(x * cellSize + offset, y * cellSize + offset))

            if (Math.random() > 0.8) {
                createdCell.setBombState(true)
            }
        }
    }
}



const CELL_OFFSET = 10
const CELL_SIZE = 32

scene('game', () => {
    createGrid(15, 15, CELL_SIZE, CELL_OFFSET)
    generateBombCountForCell()

    onClick('cell', (cell) => {
        cell.reveal()
    });


    onMousePress('right', (pos) => {

        const selectedCell = getSelectedCellFromMousePos(pos)
        if (selectedCell) {
            selectedCell.setFlaggedState(!selectedCell.isCellFlagged())
        }

        if (checkIfAllBombCellsAreFlagged() && checkIfAllNonBombCellsAreUnflagged()) {
            console.log("you win")
            go('winner')
        }
    });

})

scene('loser', () => {

    const TEXT_PADDING = 10

    add([
        text("[You lost, try again if you want].red \nPress [Space].wavy to restart", {
            width: width(),
            styles: {
                "red": {
                    color: rgb(128, 3, 34),
                },
                "wavy": (idx, _) => ({
                    color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
                    pos: vec2(0, wave(-4, 4, time() * 6 + idx * 0.5)),
                }),
            },
        }),
        pos(TEXT_PADDING, TEXT_PADDING),
    ])

    onKeyPress('space', () => {
        go('game')
    })
})

scene('winner', () => {


    const PAD = 10
    add([
        text("[You Won, Congratulations!].green \nPress [Space].wavy to restart", {
            width: width(),
            styles: {
                "green": {
                    color: rgb(128, 128, 255),
                },
                "wavy": (idx, _) => ({
                    color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
                    pos: vec2(0, wave(-4, 4, time() * 6 + idx * 0.5)),
                }),
            },
        }),
        pos(PAD, PAD),
    ])

    onKeyPress('space', () => {
        go('game')
    })
})

go('game')