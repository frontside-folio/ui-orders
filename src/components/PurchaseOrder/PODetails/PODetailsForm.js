import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import _ from 'lodash';
import { Select, TextField, Row, Col, Datepicker, IconButton } from '@folio/stripes-components';
import { Required } from '../../Utils/Validate';

class PODetailsForm extends Component {
  static propTypes = {
    showPaneUsers: PropTypes.func,
  }

  render() {
    return (
      <Row>
        <Col xs={6} md={3}>
          <Field label="Vendor" name="vendor" id="vendor" component={TextField} fullWidth disabled />
        </Col>
        <Col xs={6} md={3}>
          <Field label="PO Number" name="po_number" id="po_number" component={TextField} fullWidth />
        </Col>
        <Col xs={6} md={3}>
          <Field label="Created On" name="created" id="created" dateFormat="YYYY-MM-DD" timeZone="UTC" backendDateStandard="YYYY-MM-DD" component={Datepicker} fullWidth />
        </Col>
        <Col xs={6} md={3} style={{ display: 'none' }}>
          <Field label="Created By" name="created_by" id="created_by" component={TextField} fullWidth disabled readOnly />
        </Col>
        <Col xs={6} md={3}>
          <Field label="Created By" name="created_by_name" id="created_by_name" component={TextField} fullWidth disabled readOnly />
        </Col>
        <Col xs={6} md={3} style={{ display: 'none' }}>
          <Field label="Assigned To" name="assigned_to" id="assigned_to" type="hidden" component={TextField} fullWidth />
        </Col>
        <Col xs={6} md={3} style={{ display: 'flex', alignItems: 'center' }}>
          <Field label="Assigned To" name="assigned_to_user" id="assigned_to_user" component={TextField} fullWidth disabled />
          <IconButton
            title="Add Button"
            icon="plus-sign"
            size="small"
            iconSize="small"
            style={{
              borderRadius: '50px',
              marginLeft: '5px',
              marginTop: '10px',
              border: '1px solid #c6c6c6'
            }}
            onClick={() => this.props.showPaneUsers(true)}
          />
        </Col>
      </Row>
    );
  }
}

export default PODetailsForm;
