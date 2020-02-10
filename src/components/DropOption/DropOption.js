import React from 'react'
import PropTypes from 'prop-types'
import * as icon from '@ant-design/icons';
import { Dropdown, Button, Menu } from 'antd';

const DropOption = ({
  onMenuClick,
  menuOptions = [],
  buttonStyle,
  dropdownProps,
}) => {
  const menu = menuOptions.map(item => (
    <Menu.Item key={item.key}>{item.name}</Menu.Item>
  ))
  return (
    <Dropdown overlay= { 
      <Menu onClick={onMenuClick}>{menu}</Menu> 
    } {...dropdownProps}>

      <Button style={{ border: 'none', ...buttonStyle }}>
        <icon.BarsOutline style={{ marginRight: 2 }} />
        <icon.DownOutline />
      </Button>
    </Dropdown>
  );
}

DropOption.propTypes = {
  onMenuClick: PropTypes.func,
  menuOptions: PropTypes.array.isRequired,
  buttonStyle: PropTypes.object,
  dropdownProps: PropTypes.object,
}

export default DropOption
