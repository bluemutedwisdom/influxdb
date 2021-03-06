import React, {PureComponent, ChangeEvent} from 'react'
import {connect} from 'react-redux'

// Components
import {Form} from 'src/clockface'
import {
  Alert,
  IconFont,
  ComponentColor,
  ComponentSpacer,
  AlignItems,
  FlexDirection,
  ComponentSize,
  Button,
  ButtonType,
  Input,
  Overlay,
} from '@influxdata/clockface'
import {withRouter, WithRouterProps} from 'react-router'

// Actions
import {createAuthorization} from 'src/authorizations/actions'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import {Authorization} from '@influxdata/influx'

interface DispatchProps {
  onCreateAuthorization: typeof createAuthorization
}

interface State {
  description: string
}

type Props = WithRouterProps & DispatchProps

@ErrorHandling
class AllAccessTokenOverlay extends PureComponent<Props, State> {
  public state = {description: ''}

  render() {
    const {description} = this.state

    return (
      <Overlay visible={true}>
        <Overlay.Container>
          <Overlay.Header
            title="Generate All Access Token"
            onDismiss={this.handleDismiss}
          />
          <Overlay.Body>
            <Form onSubmit={this.handleSave}>
              <ComponentSpacer
                alignItems={AlignItems.Center}
                direction={FlexDirection.Column}
                margin={ComponentSize.Large}
              >
                <Form.Element label="Description">
                  <Input
                    placeholder="Describe this new token"
                    value={description}
                    onChange={this.handleInputChange}
                  />
                </Form.Element>
                <Alert
                  icon={IconFont.AlertTriangle}
                  color={ComponentColor.Warning}
                >
                  This token will be able to create, update, delete, read, and
                  write to anything in this organization
                </Alert>

                <ComponentSpacer
                  alignItems={AlignItems.Center}
                  direction={FlexDirection.Row}
                  margin={ComponentSize.Small}
                >
                  <Button
                    text="Cancel"
                    icon={IconFont.Remove}
                    onClick={this.handleDismiss}
                  />

                  <Button
                    text="Save"
                    icon={IconFont.Checkmark}
                    color={ComponentColor.Success}
                    type={ButtonType.Submit}
                  />
                </ComponentSpacer>
              </ComponentSpacer>
            </Form>
          </Overlay.Body>
        </Overlay.Container>
      </Overlay>
    )
  }

  private handleSave = async () => {
    const {
      params: {orgID},
      onCreateAuthorization,
    } = this.props

    const token: Authorization = {
      orgID,
      description: this.state.description,
      permissions: allAccessPermissions(orgID),
    }

    await onCreateAuthorization(token)

    this.handleDismiss()
  }

  private handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target

    this.setState({description: value})
  }

  private handleDismiss = () => {
    const {
      router,
      params: {orgID},
    } = this.props

    router.push(`/orgs/${orgID}/tokens`)
  }
}

const mdtp: DispatchProps = {
  onCreateAuthorization: createAuthorization,
}

export default connect<{}, DispatchProps, {}>(
  null,
  mdtp
)(withRouter(AllAccessTokenOverlay))
