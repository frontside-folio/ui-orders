import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Fields } from 'redux-form';
import { IfPermission, Pane, PaneMenu, Button, Icon, Row, Col, AccordionSet, Accordion, ExpandAllButton } from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';
import { EresourcesForm } from './Eresources';
import { POLineDetailsForm } from './POLineDetails';
import { VendorForm } from './Vendor';
import { CostForm } from './Cost';
import { ERESOURCES } from './const';
import HandleErrors from '../Utils/HandleErrors';
import css from './css/POLineForm.css';

class POLineForm extends Component {
  static propTypes = {
    initialValues: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    parentResources: PropTypes.object,
    parentMutator: PropTypes.object,
    poURL: PropTypes.string,
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      sections: {
        LineDetails: true,
        CostDetails: false,
        Claim: false,
        Tags: false,
        Locations: false,
        Vendor: false,
        Eresources: false,
        Item: false,
        Physical: false,
        Renewal: false,
        Adjustments: false,
        License: false
      },
      sectionErrors: {
        POLineDetailsErr: {
          purchase_order_id: false,
          barcode: false
        },
        CostErr: {
          list_price: false
        }
      }
    };
    this.deletePOLine = this.deletePOLine.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.onToggleSection = this.onToggleSection.bind(this);
    this.updateSectionErrors = this.updateSectionErrors.bind(this);
  }

  updateSectionErrors(obj) {
    this.setState({ sectionErrors: obj });
  }

  getAddFirstMenu() {
    const { onCancel } = this.props;
    return (
      <PaneMenu>
        <button type="button" id="clickable-close-new-purchase-order-dialog" onClick={onCancel} title="close" aria-label="Close New Purchase Order Dialog">
          <span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }}>&times</span>
        </button>
      </PaneMenu>
    );
  }

  getLastMenu(id, label) {
    const { pristine, submitting, handleSubmit } = this.props;
    return (
      <PaneMenu>
        <IfPermission perm="po_line.item.post, login.item.post, po_line.item.put, login.item.put">
          <Button
            id={id}
            type="submit"
            title={label}
            disabled={pristine || submitting}
            onClick={handleSubmit}
            style={{ marginBottom: '0' }}
          >
            {label}
          </Button>
        </IfPermission>
      </PaneMenu>
    );
  }

  onToggleSection({ id }) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.sections[id] = !curState.sections[id];
      return newState;
    });
  }

  handleExpandAll(obj) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.sections = obj;
      return newState;
    });
  }

  deletePOLine(ID) {
    const { parentMutator } = this.props;
    parentMutator.poLine.DELETE({ id: ID }).then(() => {
      parentMutator.query.update({
        _path: '/orders',
        layer: null
      });
    });
  }

  grabFieldNames() {
    const { sectionErrors } = this.state;
    const newArr = [];
    Object.keys(sectionErrors).map(key => {
      const name = sectionErrors[key];
      Object.keys(name).map(key2 => {
        return newArr.push(key2);
      });
      return false;
    });

    return newArr;
  }

  render() {
    const { initialValues, onCancel } = this.props;
    const firstMenu = this.getAddFirstMenu();
    const paneTitle = initialValues.id ? (
      <span>
        {`Edit: ${_.get(initialValues, ['id'], '')}`}
      </span>
    ) : 'Add PO Line';
    const lastMenu = initialValues.id ?
      this.getLastMenu('clickable-updatePoLine', 'Update PO Line') :
      this.getLastMenu('clickable-createnewPoLine', 'Create PO Line');
    const showDeleteButton = initialValues.id || false;
    // Section Error Handling
    const { sectionErrors } = this.state;
    const message = (
      <em className={css.requiredIcon} style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
        <Icon icon="validation-error" size="medium" />
        Required fields!
      </em>
    );
    const POLineDetailsErr = _.includes(sectionErrors.POLineDetailsErr, true) ? message : null;
    const CostErr = _.includes(sectionErrors.CostErr, true) ? message : null;

    if (!initialValues) {
      return (
        <Pane id="pane-podetails" defaultWidth="fill" paneTitle="Details" fistMenu={firstMenu} lastMenu={lastMenu} dismissible>
          <div style={{ paddingTop: '1rem' }}><Icon icon="spinner-ellipsis" width="100px" /></div>
        </Pane>
      );
    }

    const showEresourcesForm = ERESOURCES.includes(initialValues.order_format);

    return (
      <Pane id="pane-poLineForm" defaultWidth="fill" paneTitle={paneTitle} lastMenu={lastMenu} onClose={onCancel} dismissible>
        <form id="form-po-line">
          <Row>
            <Col xs={12} md={8}>
              <Fields names={this.grabFieldNames()} component={HandleErrors} sectionErrors={sectionErrors} updateSectionErrors={this.updateSectionErrors} />
            </Col>
            <Col xs={12}>
              <Row center="xs">
                <Col xs={12} md={8}>
                  <Row end="xs">
                    <Col xs={12}>
                      <ExpandAllButton accordionStatus={this.state.sections} onToggle={this.handleExpandAll} />
                    </Col>
                  </Row>
                </Col>
                <Col xs={12} md={8} style={{ textAlign: 'left' }}>
                  <AccordionSet accordionStatus={this.state.sections} onToggle={this.onToggleSection}>
                    <Accordion label="PO Line Details" id="LineDetails" displayWhenClosed={POLineDetailsErr} displayWhenOpen={POLineDetailsErr}>
                      <POLineDetailsForm {...this.props} />
                    </Accordion>
                    <Accordion label="Cost Details" id="CostDetails" displayWhenClosed={CostErr} displayWhenOpen={CostErr}>
                      <CostForm {...this.props} />
                    </Accordion>
                    <Accordion label="Vendor" id="Vendor">
                      <VendorForm {...this.props} />
                    </Accordion>
                    {showEresourcesForm && (
                      <Accordion label="E-resources Details" id="Eresources">
                        <EresourcesForm {...this.props} />
                      </Accordion>
                    )}
                    {/* <Accordion label="Claim" id="Claim">
                      <ClaimForm {...this.props} />
                      <br />
                    </Accordion>
                    <Accordion label="Po Line Tags" id="Tags">
                      <TagForm {...this.props} />
                    </Accordion>
                    <Accordion label="Locations" id="Locations">
                      <LocationForm {...this.props} />
                      <br />
                    </Accordion>
                    <Accordion label="Item Details" id="Item">
                      <ItemForm {...this.props} />
                    </Accordion>
                    <Accordion label="Physical Record Details" id="Physical">
                      <PhysicalForm {...this.props} />
                    </Accordion>
                    <Accordion label="Renewals" id="Renewal">
                      <RenewalForm {...this.props} />
                    </Accordion>
                    <Accordion label="Adjustments" id="Adjustments">
                      <AdjustmentsForm {...this.props} />
                    </Accordion>
                    <Accordion label="License" id="License">
                      <LicenseForm {...this.props} />
                    </Accordion> */}
                  </AccordionSet>
                  <IfPermission perm="po_line.item.delete">
                    <Row end="xs">
                      <Col xs={12}>
                        {
                          showDeleteButton &&
                          <Button type="button" buttonStyle="danger" onClick={() => { this.deletePOLine(this.props.initialValues.id); }}>
                            {`Delete - ${this.props.initialValues.id}`}
                          </Button>
                        }
                      </Col>
                    </Row>
                  </IfPermission>
                </Col>
              </Row>
            </Col>
          </Row>
        </form>
      </Pane>
    );
  }
}

export default stripesForm({
  form: 'POLineForm',
  navigationCheck: true,
  enableReinitialize: true
})(POLineForm);
