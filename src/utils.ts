import { Vec2 } from "kaboom"

export const makeButton = (tpos: Vec2, functionToCall: () => void) => {
  const newButton = add(
    [
      pos(tpos.x, tpos.y),
      rect(10, 10)

    ]
  )

  newButton.on('click', functionToCall)

}
