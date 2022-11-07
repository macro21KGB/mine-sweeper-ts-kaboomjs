import { CellComp } from './interfaces';
import kaboom, { GameObj, Vec2 } from 'kaboom'
import { makeButton, getSelectedCellFromMousePos, getSurroundingCells, makeCell, isOnDesktop, } from './utils'
import { CELL_OFFSET, CELL_SIZE, GRID_HEIGHT, GRID_WIDTH, ITEM_SPACING, BOMB_PROBABILITY } from './constants'

kaboom({
    background: [0, 50, 50, 1],
    touchToMouse: true,
})


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



const makeGrid = (width: number, height: number, cellSize: number, offset: number) => {

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const createdCell = makeCell(vec2(x * cellSize + offset, y * cellSize + offset))

            if (Math.random() > BOMB_PROBABILITY) {
                bombCount++
                createdCell.setBombState(true)
            }
        }
    }
}

const makeMenuBar = (menuBarItems: any) => {
    for (let i = 0; i < menuBarItems.length; i++) {
        menuBarItems[i].pos.x = 10
        menuBarItems[i].pos.y = GRID_WIDTH * CELL_SIZE + (i + 1) * ITEM_SPACING
    }
}

const handleFlagging = (pos: Vec2) => {

    const selectedCell = getSelectedCellFromMousePos(pos)
    if (selectedCell) {

        if (selectedCell.isCellRevealed())
            return

        if (selectedCell.isCellFlagged())
            bombCount++
        else
            bombCount--


        selectedCell.setFlaggedState(!selectedCell.isCellFlagged())

    }

    if (checkIfAllBombCellsAreFlagged() && checkIfAllNonBombCellsAreUnflagged() && bombCount == 0) {
        console.log("you win")
        go('winner')
    }

}


let bombCount = 0
let isFlaggingEnabled = false

scene('game', () => {

    const isFlaggedText = isOnDesktop() ? add([pos(0, 0), text("")]) : add([
        text("Flag mode is " + (isFlaggingEnabled ? "enabled" : "disabled"), {
            size: 32
        }),
        pos(0, 0),
        "menu-item",
    ])

    const bombCountText = add([
        text("Number of bombs: " + bombCount, {
            size: 32
        }),
        pos(GRID_WIDTH * CELL_SIZE + 16, 16)
    ])

    const menuBarItems = [
        bombCountText,
        makeButton(vec2(0, 0), {
            textToShow: "Reset",
            hoverColor: RED,
            onClick: () => {
                bombCount = 0
                go('game')
            }
        }),
        makeButton(vec2(0, 0), {
            textToShow: "Toggle flag mode",
            hoverColor: BLUE,
            onClick: () => {
                console.log("toggle flag mode")
                isFlaggingEnabled = !isFlaggingEnabled
                isFlaggedText.text = "Flag mode is " + (isFlaggingEnabled ? "enabled" : "disabled")
            },
            onlyMobile: true

        }),
        isFlaggedText

    ]

    makeGrid(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, CELL_OFFSET)
    makeMenuBar(menuBarItems)

    generateBombCountForCell()

    onClick('cell', (cell) => {

        if (isFlaggingEnabled && !isOnDesktop()) {
            handleFlagging(cell.pos)
        }
        if (!isFlaggingEnabled) {

            const selectedCell = getSelectedCellFromMousePos(cell.pos)
            if (selectedCell) {
                selectedCell.reveal()
            }

        }
    });

    onLoad(() => {
        bombCountText.text = "Number of bombs: " + bombCount
    })


    onMousePress('right', (pos: Vec2) => {
        handleFlagging(pos)
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

    onMousePress('left', () => {
        go('game')
    })

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
    onMousePress('left', () => {
        go('game')
    })

    onKeyPress('space', () => {
        go('game')
    })
})

go('game')
