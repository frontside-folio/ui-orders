import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { filters2cql } from '@folio/stripes/components';
import { SearchAndSort } from '@folio/stripes/smart-components';
import packageInfo from '../../package';
import Panes from '../components/Panes';
import { POForm } from '../components/PurchaseOrder';
import { Filters, SearchableIndexes } from '../components/Utils/FilterConfig';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;
const filterConfig = Filters();
const searchableIndexes = SearchableIndexes;

class Main extends Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: {
      initialValue: {
        query: '',
        filters: '',
        sort: 'id',
      }
    },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    records: {
      type: 'okapi',
      path: 'orders',
      records: 'composite_purchase_orders',
      recordsRequired: '%{resultCount}',
      perRequest: RESULT_COUNT_INCREMENT,
      GET: {
        params: {
          query: (...args) => {
            /*
              This code is not DRY as it is copied from makeQueryFunction in stripes-components.
              This is necessary, as makeQueryFunction only referneces query paramaters as a data source.
              STRIPES-480 is intended to correct this and allow this query function to be replace with a call
              to makeQueryFunction.
              https://issues.folio.org/browse/STRIPES-480
            */
            const resourceData = args[2];
            const sortMap = {
              'ID': 'id',
              'PO Number': 'po_number',
              'Created By': 'created_by',
              'Comments': 'comments',
              'Assigned To': 'assigned_to'
            };

            const index = resourceData.query.qindex ? resourceData.query.qindex : 'all';
            const searchableIndex = searchableIndexes.find(idx => idx.value === index);

            let cql = searchableIndex.makeQuery(resourceData.query.query);
            const filterCql = filters2cql(filterConfig, resourceData.query.filters);
            if (filterCql) {
              if (cql) {
                cql = `(${cql}) and ${filterCql}`;
              } else {
                cql = filterCql;
              }
            }

            const { sort } = resourceData.query;
            if (sort) {
              const sortIndexes = sort.split(',').map((sort1) => {
                let reverse = false;
                if (sort1.startsWith('-')) {
                  // eslint-disable-next-line no-param-reassign
                  sort1 = sort1.substr(1);
                  reverse = true;
                }
                let sortIndex = sortMap[sort1] || sort1;
                if (reverse) {
                  sortIndex = `${sortIndex.replace(' ', '/sort.descending ')}/sort.descending`;
                }
                return sortIndex;
              });

              cql += ` sortby ${sortIndexes.join(' ')}`;
            }
            return cql;
          }
        },
        staticFallback: { params: {} },
      },
    },
    // Po Line
    queryII: {
      initialValue: {
        vendorID: '',
        createdByID: '',
        userID: ''
      }
    },
    vendor: {
      type: 'okapi',
      path: 'vendor',
      records: 'vendors',
      GET: {
        params: {
          query: (...args) => {
            const resourceData = args[2];
            const cql = `(id="${resourceData.queryII.vendorID}")`;
            return cql;
          }
        },
        limit: 1,
        staticFallback: { params: {} },
      },
    },
    vendors: {
      type: 'okapi',
      path: 'vendor',
      records: 'vendors',
      perRequest: 1000,
    },
    user: {
      type: 'okapi',
      path: 'users',
      records: 'users',
      GET: {
        params: {
          query: (...args) => {
            const resourceData = args[2];
            const cql = `(id="${resourceData.queryII.userID}")`;
            return cql;
          }
        },
        limit: 1,
        staticFallback: { params: {} },
      },
    },
    createdBy: {
      type: 'okapi',
      path: 'users',
      records: 'users',
      GET: {
        params: {
          query: (...args) => {
            const resourceData = args[2];
            const cql = `(id="${resourceData.queryII.createdByID}")`;
            return cql;
          }
        },
        limit: 1,
        staticFallback: { params: {} },
      },
    },
    // DropDown
    dropdown: {
      initialValue: {
        acquisitionMethodDD: [
          { value: '', label: '--- Select ---' },
          { value: 'Approval Plan', label: 'Approval Plan' },
          { value: 'Demand Driven Acquisitions (DDA)', label: 'Demand Driven Acquisitions (DDA)' },
          { value: 'Depository', label: 'Depository' },
          { value: 'Evidence Based Acquisitions (EBA)', label: 'Evidence Based Acquisitions (EBA)' },
          { value: 'Exchange', label: 'Exchange' },
          { value: 'Gift', label: 'Gift ' },
          { value: 'Purchase At Vendor System', label: 'Purchase At Vendor System ' },
          { value: 'Purchase', label: 'Purchase ' },
          { value: 'Technical', label: 'Technical ' }
        ],
        orderFormatDD: [
          { value: '', label: '--- Select ---' },
          { value: 'Container', label: 'Container' },
          { value: 'Electronic Resource', label: 'Electronic Resource' },
          { value: 'P/E Mix', label: 'P/E Mix' },
          { value: 'Physical Resource', label: 'Physical Resource' },
          { value: 'Service', label: 'Service' },
        ],
        statusDD: [
          { value: '', label: '--- Select ---' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d5529b9', label: 'Pending' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d552910', label: 'In Review' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d552911', label: 'Not Approved Update Required' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d552912', label: 'Declined' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d552913', label: 'Cancelled ' }
        ],
        orderTypeDD: [
          { value: '', label: '--- Select ---' },
          { value: 'One-Time', label: 'One-Time' },
          { value: 'Ongoing', label: 'Ongoing' },
        ],
        sourceDD: [
          { value: '', label: '--- Select ---' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d552917', label: 'Source 1' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d552918', label: 'Source 2' },
          { value: '5e62ebaf-bb56-495e-a5ae-dda48d552919', label: 'Source 3' }
        ],
        receiptStatusDD: [
          { value: '', label: '--- Select ---' },
          { value: 'Awaiting Receipt', label: 'Awaiting Receipt' },
          { value: 'Cancelled', label: 'Cancelled' },
          { value: 'Fully Received', label: 'Fully Received' },
          { value: 'Partially Received', label: 'Partially Received' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Receipt Not Required', label: 'Receipt Not Required' }
        ],
        workflowStatusDD: [
          { value: '', label: '--- Select ---' },
          { value: 'Closed', label: 'Closed' },
          { value: 'Open', label: 'Open' },
          { value: 'Pending', label: 'Pending' },
        ],
        paymentStatusDD: [
          { value: '', label: '--- Select ---' },
          { value: 'Awaiting Payment', label: 'Awaiting Payment' },
          { value: 'Cancelled', label: 'Cancelled' },
          { value: 'Fully Paid', label: 'Fully Paid' },
          { value: 'Partially Paid', label: 'Partially Paid' },
          { value: 'Payment Not Required', label: 'Payment Not Required' },
          { value: 'Pending', label: 'Pending' },
        ],
        currencyDD: [
          { value: '', label: '--- Select ---' },
          { value: 'USD', label: 'USD' },
        ],
        refNumberTypeDD: [
          { value: '', label: '--- Select ---' },
          { value: "Supplier's continuation order", label: "Supplier's continuation order" },
          { value: "Supplier's unique order line reference number", label: "Supplier's unique order line reference number" },
          { value: "Agent's unique subscription reference number", label: "Agent's unique subscription reference number" },
          { value: "Library's continuation order number", label: "Library's continuation order number" },
          { value: 'Internal vendor number', label: 'Internal vendor number' },
        ]
      },
    },
    source: {
      type: 'okapi',
      path: 'source?query=cql.allRecords=1 sortby desc',
      records: 'sources',
    },
  });

  static propTypes = {
    mutator: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    stripes: PropTypes.shape({
      user: PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.string,
        }),
      })
    }),
    showSingleResult: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    browseOnly: PropTypes.bool,
    onComponentWillUnmount: PropTypes.func,
    disableRecordCreation: PropTypes.bool
  }

  static defaultProps = {
    showSingleResult: true,
    browseOnly: false,
  }

  static getDerivedStateFromProps(props) {
    const assignedTo = filterConfig.find(group => group.name === 'assigned_to');
    if (assignedTo.values.length === 0) {
      const user = props.stripes.user.user;
      assignedTo.values.push({
        name: `${user.firstName} ${user.lastName}`,
        cql: `${user.id}`,
      });
      props.mutator.initializedFilterConfig.replace(true);
    }

    return null;
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  create = (data) => {
    const { mutator } = this.props;
    const deep = _.cloneDeep(data);
    delete deep.created_by_name;
    delete deep.assigned_to_user;
    delete deep.vendor_name;

    mutator.records.POST(deep).then(newOrder => {
      mutator.query.update({
        _path: `/orders/view/${newOrder.id}`,
        layer: null
      });
    });
  }

  render() {
    const { resources, mutator, stripes, browseOnly, showSingleResult, disableRecordCreation, onComponentWillUnmount, stripes: { user: { user: { id, firstName, lastName } } } } = this.props;
    const resultsFormatter = {
      'po_number': data => _.toString(_.get(data, ['po_number'], '')),
      'created': data => _.toString(_.get(data, ['created'], '')),
      'notes': data => _.toString(_.get(data, ['notes'], '')),
      'assigned_to': data => _.toString(_.get(data, ['assigned_to'], '')),
    };
    const getUserID = id || '';
    const getUserName = `${firstName} ${lastName}` || '';

    return (
      <SearchAndSort
        packageInfo={packageInfo}
        objectName="orders"
        baseRoute={packageInfo.stripes.route}
        filterConfig={filterConfig}
        visibleColumns={['po_number', 'created', 'notes', 'assigned_to']}
        resultsFormatter={resultsFormatter}
        viewRecordComponent={Panes}
        editRecordComponent={POForm}
        onCreate={this.create}
        newRecordInitialValues={{ created_by: getUserID, created_by_name: getUserName }}
        initialResultCount={INITIAL_RESULT_COUNT}
        resultCountIncrement={RESULT_COUNT_INCREMENT}
        onComponentWillUnmount={onComponentWillUnmount}
        disableRecordCreation={disableRecordCreation}
        finishedResourceName="perms"
        viewRecordPerms="purchase_order.item.get"
        newRecordPerms="purchase_order.item.post"
        parentResources={resources}
        parentMutator={mutator}
        detailProps={Object.assign({ onUpdateAssignedTo: this.onUpdateAssignedTo }, stripes)}
        stripes={stripes}
        showSingleResult={showSingleResult}
        browseOnly={browseOnly}
      />
    );
  }
}

export default Main;
