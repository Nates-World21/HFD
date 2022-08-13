const { React } = require('hfd/webpack');
const {
  Tooltip,
  Icons: {
    Receipt,
    Person,
    Tag,
    Chemistry
  }
} = require('hfd/components');

module.exports = React.memo(
  ({ author, version, description, svgSize }) => (
    <div className='hfd-product-details'>
      <div className='description'>
        <Tooltip
          text='Description'
          position='top'
        >
          <Receipt width={svgSize} height={svgSize}/>
        </Tooltip>
        <span>{description}</span>
      </div>
      <div className='metadata'>
        <div className='author'>
          <Tooltip
            text='Author'
            position='top'
          >
            <Person width={svgSize} height={svgSize}/>
          </Tooltip>
          <span>{author}</span>
        </div>
        <div className='version'>
          <Tooltip
            text='Version'
            position='top'
          >
            <Tag width={svgSize} height={svgSize}/>
          </Tooltip>
          <span>v{version}</span>
          {(/(?:^0|-beta\d*$)/).test(version) &&
          <Tooltip
            text='Beta'
            position='top'
          >
            <Chemistry width={18} height={18}/>
          </Tooltip>}
        </div>
      </div>
    </div>
  )
);
