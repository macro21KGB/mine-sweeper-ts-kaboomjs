import { Color, GameObj, Vec2 } from "kaboom"
import { CellComp } from "./interfaces"
import { CELL_OFFSET, CELL_SIZE } from "./constants"
import { cell } from "./components"

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

const makeButton = (tpos: Vec2, options: { textToShow: string, hoverColor: Color, onClick: () => void, onlyMobile?: boolean }) => {

  const { textToShow, hoverColor, onClick: functionToCall } = options

  const BUTTON_PADDING = 20
  const textLength = textToShow.length * 16

  if (options.onlyMobile && isOnDesktop())
    return add([
      pos(0, 0)
    ])

  const newButton = add(
    [
      pos(tpos.x, tpos.y),
      rect(textLength + BUTTON_PADDING, 50),
      area(),
      color(255, 255, 255),
      "menu-items",
      text(textToShow, {
        size: 32,
      })

    ]
  )
  newButton.onHover(() => {
    newButton.color = hoverColor
  },
    () => {
      newButton.color = rgb(255, 255, 255)
    },
  )
  newButton.onClick(functionToCall)

  return newButton
}


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


const isOnDesktop = () => {
  return window.innerWidth > 768
}

export {
  makeCell,
  makeButton,
  globalToGridCoords,
  getSelectedCellFromMousePos,
  revealAdjacentCells,
  getSurroundingCells,
  isOnDesktop
}