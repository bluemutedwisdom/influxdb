import {get, range, flatMap} from 'lodash'
import {isNumeric, Table} from '@influxdata/vis'

/*
  Return a list of the maximum elements in `xs`, which the magnitude of each
  element is computed using the passed function `d`.
*/
const maxesBy = <X>(xs: X[], d: (x: X) => number): X[] => {
  let maxes = []
  let maxDist = -Infinity

  for (const x of xs) {
    const dist = d(x)

    if (dist > maxDist) {
      maxes = [x]
      maxDist = dist
    } else if (dist === maxDist && dist !== -Infinity) {
      maxes.push(x)
    }
  }

  return maxes
}

const isValueCol = (table: Table, colKey: string) =>
  table.columns[colKey].name === '_value' &&
  isNumeric(table.columns[colKey].type)

/*
  Return the a list of the most recent numeric values present in a `Table`.

  This utility searches any numeric column named `_value` to find numeric
  values, and uses the `_time`, `_stop`, or `_start` column as their associated
  timestamps.
*/
export const latestValues = (table: Table): number[] => {
  const timeColData = get(table, 'columns._time.data')

  const valueColsData = Object.keys(table.columns)
    .filter(k => isValueCol(table, k))
    .map(k => table.columns[k].data) as number[][]

  if (!timeColData || !valueColsData.length) {
    return []
  }

  const d = i => {
    const time = timeColData[i]

    if (time && valueColsData.some(colData => !isNaN(colData[i]))) {
      return time
    }

    return -Infinity
  }

  const latestRowIndices = maxesBy(range(table.length), d)

  const latestValues = flatMap(latestRowIndices, i =>
    valueColsData.map(colData => colData[i])
  )

  const definedLatestValues = latestValues.filter(x => !isNaN(x))

  return definedLatestValues
}
