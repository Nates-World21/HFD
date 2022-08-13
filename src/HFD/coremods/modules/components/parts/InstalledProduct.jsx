const { React } = require('hfd/webpack');
const { Card, Tooltip, Switch } = require('hfd/components');

const BaseProduct = require('./BaseProduct');

class InstalledProduct extends BaseProduct {
  render () {
    return (
      <Card className='hfd-product'>
        {this.renderHeader()}
        {this.renderDetails()}
        {this.renderPermissions()}
        {this.renderFooter()}
      </Card>
    );
  }

  renderHeader () {
    return (
      <div className='hfd-product-header'>
        <h4>{this.props.product.name}</h4>
        <Tooltip text={this.props.isEnabled ? 'Disable' : 'Enable'} position='top'>
          <div>
            <Switch value={this.props.isEnabled} onChange={(v) => this.props.onToggle(v.target.checked)}/>
          </div>
        </Tooltip>
      </div>
    );
  }
}

module.exports = InstalledProduct;
