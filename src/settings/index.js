import React from 'react';
import PropTypes from 'prop-types';
import { Settings } from '@folio/stripes/smart-components';
import GeneralSettings from './general-settings';
import SomeFeatureSettings from './some-feature-settings';

/*
  STRIPES-NEW-APP
  Your app's settings pages are defined here.
  The pages "general" and "some feature" are examples. Name them however you like.
*/

export default class OrdersSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
  }

  pages = [
    {
      route: 'general',
      label: this.props.stripes.intl.formatMessage({ id: 'ui-orders.settings.general' }),
      component: GeneralSettings,
    },
    {
      route: 'somefeature',
      label: this.props.stripes.intl.formatMessage({ id: 'ui-orders.settings.some-feature' }),
      component: SomeFeatureSettings,
    },
  ];

  render() {
    return (
      <Settings {...this.props} pages={this.pages} paneTitle="ui-orders" />
    );
  }
}
