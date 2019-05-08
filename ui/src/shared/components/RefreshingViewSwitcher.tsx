// Libraries
import React, {FunctionComponent} from 'react'
import {Plot} from '@influxdata/vis'

// Components
import GaugeChart from 'src/shared/components/GaugeChart'
import SingleStat from 'src/shared/components/SingleStat'
import TableGraphs from 'src/shared/components/tables/TableGraphs'
import HistogramContainer from 'src/shared/components/HistogramContainer'
import VisTableTransform from 'src/shared/components/VisTableTransform'
import XYContainer from 'src/shared/components/XYContainer'
import LatestValueTransform from 'src/shared/components/LatestValueTransform'

// Types
import {
  QueryViewProperties,
  ViewType,
  SingleStatView,
  XYView,
  XYViewGeom,
} from 'src/types/dashboards'
import {FluxTable, RemoteDataState} from 'src/types'

interface Props {
  tables: FluxTable[]
  files: string[]
  loading: RemoteDataState
  properties: QueryViewProperties
}

const RefreshingViewSwitcher: FunctionComponent<Props> = ({
  properties,
  loading,
  files,
  tables,
}) => {
  switch (properties.type) {
    case ViewType.SingleStat:
      return (
        <VisTableTransform files={files}>
          {table => (
            <LatestValueTransform table={table}>
              {latestValue => (
                <SingleStat stat={latestValue} properties={properties} />
              )}
            </LatestValueTransform>
          )}
        </VisTableTransform>
      )
    case ViewType.Table:
      return <TableGraphs tables={tables} properties={properties} />
    case ViewType.Gauge:
      return (
        <VisTableTransform files={files}>
          {table => (
            <LatestValueTransform table={table}>
              {latestValue => (
                <GaugeChart value={latestValue} properties={properties} />
              )}
            </LatestValueTransform>
          )}
        </VisTableTransform>
      )
    case ViewType.XY:
      return (
        <XYContainer
          files={files}
          viewProperties={properties}
          loading={loading}
        >
          {config => <Plot config={config} />}
        </XYContainer>
      )
    case ViewType.LinePlusSingleStat:
      const xyProperties = {
        ...properties,
        colors: properties.colors.filter(c => c.type === 'scale'),
        type: ViewType.XY,
        geom: XYViewGeom.Line,
      } as XYView

      const singleStatProperties = {
        ...properties,
        colors: properties.colors.filter(c => c.type !== 'scale'),
        type: ViewType.SingleStat,
      } as SingleStatView

      return (
        <XYContainer
          files={files}
          viewProperties={xyProperties}
          loading={loading}
        >
          {config => (
            <Plot config={config}>
              <LatestValueTransform table={config.table} quiet={true}>
                {latestValue => (
                  <SingleStat
                    stat={latestValue}
                    properties={singleStatProperties}
                  />
                )}
              </LatestValueTransform>
            </Plot>
          )}
        </XYContainer>
      )
    case ViewType.Histogram:
      return (
        <VisTableTransform files={files}>
          {table => (
            <HistogramContainer
              table={table}
              loading={loading}
              viewProperties={properties}
            >
              {config => <Plot config={config} />}
            </HistogramContainer>
          )}
        </VisTableTransform>
      )
    default:
      return <div />
  }
}

export default RefreshingViewSwitcher
