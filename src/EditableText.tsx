import * as React from "react"
import moize from "moize"

export interface Props {
  className?: string
  value: string
  isEditing: boolean
  onChange: (value: string) => void
  onComplete: () => void
}

const enterKey = 13

const EditableText = (props: Props) =>
  props.isEditing ?
    <input
      className={props.className}
      value={props.value}
      autoFocus
      onFocus={e => e.currentTarget.select()}
      onClick={e => e.stopPropagation()}
      onChange={e => props.onChange(e.currentTarget.value)}
      onKeyPress={e => { if (e.charCode === enterKey) props.onComplete() }}
    /> :
    <div>{props.value}</div>

export default moize.reactSimple(EditableText)
