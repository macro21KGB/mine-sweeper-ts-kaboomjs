import { Color, Vec2 } from "kaboom"

export const makeButton = (tpos: Vec2, textToShow: string, hoverColor: Color, functionToCall: () => void) => {

  const BUTTON_PADDING = 20
  const textLength = textToShow.length * 16

  const newButton = add(
    [
      pos(tpos.x, tpos.y),
      rect(textLength + BUTTON_PADDING, 50),
      area(),
      color(255, 255, 255),
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
