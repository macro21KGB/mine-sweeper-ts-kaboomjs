import { Vec2 } from "kaboom"

export interface CellComp {
    id: string,
    require: string[],
    draw: () => void,
    inspect: () => string,
    setBombState: (state: boolean) => void
    isCellBomb: () => boolean
    isCellRevealed: () => boolean
    setFlaggedState: (state: boolean) => void
    isCellFlagged: () => boolean
    reveal: (hasBeenFlagged?: boolean) => void
    getGridPos: () => Vec2
    increaseBombCount: () => void
    getBombCount: () => number
}