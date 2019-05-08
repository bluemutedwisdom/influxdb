import {fluxToTable} from '@influxdata/vis'

import {latestValues} from 'src/shared/utils/latestValues'

describe('latestValues', () => {
  test('the last value returned does not depend on the ordering of tables in response', () => {
    const respA = `#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,long
#default,1,,,
,result,table,_time,_value
,,0,2018-12-10T18:29:48Z,1
,,0,2018-12-10T18:54:18Z,2

#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,long
#default,1,,,
,result,table,_time,_value
,,1,2018-12-10T18:29:48Z,3
,,1,2018-12-10T18:40:18Z,4`

    const respB = `#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,long
#default,1,,,
,result,table,_time,_value
,,0,2018-12-10T18:29:48Z,3
,,0,2018-12-10T18:40:18Z,4

#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,long
#default,1,,,
,result,table,_time,_value
,,1,2018-12-10T18:29:48Z,1
,,1,2018-12-10T18:54:18Z,2`

    const latestValuesA = latestValues(fluxToTable(respA).table)
    const latestValuesB = latestValues(fluxToTable(respB).table)

    expect(latestValuesA).toEqual([2])
    expect(latestValuesB).toEqual([2])
  })

  test('uses the latest time for which a value is defined', () => {
    const resp = `#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,long
#default,1,,,
,result,table,_time,_value
,,0,2018-12-10T18:29:48Z,3
,,0,2018-12-10T18:40:18Z,4

#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,string
#default,1,,,
,result,table,_time,_value
,,1,2018-12-10T19:00:00Z,howdy
,,1,2018-12-10T20:00:00Z,howdy`

    const result = latestValues(fluxToTable(resp).table)

    expect(result).toEqual([4])
  })

  test('returns no latest values if no _time column exists', () => {
    const resp = `#group,false,false,true,true,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,long
#default,1,,,,
,result,table,_start,_stop,_value
,,0,2018-12-10T18:29:48Z,2018-12-10T18:29:48Z,3
,,0,2018-12-10T18:40:18Z,2018-12-10T18:40:18Z,4`

    const result = latestValues(fluxToTable(resp).table)

    expect(result).toEqual([])
  })

  test('returns no latest values if no numeric _value column exists', () => {
    const resp = `#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,string
#default,1,,,
,result,table,_time,_value
,,1,2018-12-10T19:00:00Z,howdy
,,1,2018-12-10T20:00:00Z,howdy`

    const result = latestValues(fluxToTable(resp).table)

    expect(result).toEqual([])
  })

  test('returns latest values from multiple numeric value columns', () => {
    const resp = `#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,long
#default,1,,,
,result,table,_time,_value
,,0,2018-12-10T18:29:48Z,3
,,0,2018-12-10T18:40:18Z,4

#group,false,false,false,false
#datatype,string,long,dateTime:RFC3339,double
#default,1,,,
,result,table,_time,_value
,,0,2018-12-10T18:29:48Z,2.0
,,0,2018-12-10T18:40:18Z,4.0`
    const result = latestValues(fluxToTable(resp).table)

    expect(result).toEqual([4, 4])
  })
})
