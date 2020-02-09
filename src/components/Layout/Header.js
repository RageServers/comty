import React, { PureComponent, Fragment } from 'react'
import { Icon as LegacyIcon } from '@ant-design/compatible';
import {
  Menu,
  Layout,
  Avatar,
  Popover,
  Badge,
  List,
  Switch,
  Tooltip,
  Dropdown,
  Button,
} from 'antd';
import { Trans, withI18n } from '@lingui/react'
import { Ellipsis } from 'ant-design-pro'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import styles from './Header.less'
import { config } from 'utils'

import * as ycore from 'ycore'
import router from 'umi/router'
import moment from 'moment'

@withI18n()
class Header extends PureComponent {
  constructor(props){
    super(props),
    this.state = {
      createMenuVisible: false,
    }
  }
  isDarkMode = () => {
    const {theme} = this.props
    if (theme == "light") {
      return false;
    }
    return true;
  }
  handleCreateMenuVisible() {
    this.setState({ createMenuVisible: !this.state.createMenuVisible });
  }
  handleOpenMenu() {
    let ListControls = [
      (<div>
          <Button type="dashed" icon={<LegacyIcon type="close" />} shape="circle" onClick={() => ycore.ControlBar.close()}></Button>
      </div>
     )
    ]
    ycore.ControlBar.set(ListControls)
  }

  render() {
    const {
      i18n,
      fixed,
      theme,
      collapsed,
      newRouteList,
      notifications,
      onCollapseChange,
      onAllNotificationsRead,
    } = this.props

    
    const notificationIcon = (
      <Popover
        placement="bottomRight"
        trigger="click"
        key="notifications"
        overlayClassName={styles.notificationPopover}
        getPopupContainer={() => document.querySelector('#layoutHeader')}
        content={
          <div className={styles.notification}>
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              locale={{
                emptyText: <Trans>You have viewed all notifications.</Trans>,
              }}
              renderItem={item => (
                <List.Item className={styles.notificationItem}>
                  <List.Item.Meta
                    title={
                      <Ellipsis tooltip lines={1}>
                        {' '}
                        {item.title}{' '}
                      </Ellipsis>
                    }
                    description={moment(item.date).fromNow()}
                  />
                  <LegacyIcon
                    style={{ fontSize: '15px', color: '#ccc' }}
                    type="right"
                  />
                </List.Item>
              )}
            />
            {notifications.length ? (
              <div
                onClick={onAllNotificationsRead}
                className={styles.clearButton}
              >
                <Trans>Clear notifications</Trans>
              </div>
            ) : null}
          </div>
        }
      >
        <Badge
          count={notifications.length}
          dot
          offset={[-10, 10]}
          className={styles.iconButton}
        >
          <LegacyIcon className={styles.iconFont} type="bell" />
        </Badge>
      </Popover>
    )
  
    return (
      <Layout.Header id='layoutHeader' className={classnames(styles.header, {[styles.fixed]: fixed})} > 
            <div className={styles.leftContainer}>
              <img className={styles.brand} src={config.FullLogoPath} />
              <Tooltip title={'Main'}><a target="_blank" href="" rel="noopener noreferrer"><LegacyIcon type="home" className={styles.iconButton} style={{ fontSize: '15px' }} /></a></Tooltip>
              <Tooltip title={'Search'}><a target="_blank" href="" rel="noopener noreferrer"><LegacyIcon type="search" className={styles.iconButton} style={{ fontSize: '15px' }} /></a></Tooltip>
            </div>
            <div className={styles.rightContainer}>
              <Tooltip title={'Create'}><LegacyIcon type="plus" onClick={() => this.handleOpenMenu()} className={styles.iconButton} style={{ fontSize: '15px' }} /></Tooltip>
              {notificationIcon}
            </div>
      </Layout.Header>
    );
  }
}

Header.propTypes = {
  fixed: PropTypes.bool,
  menus: PropTypes.array,
  theme: PropTypes.string,
  newRouteList: PropTypes.array,
  collapsed: PropTypes.bool,
  onSignOut: PropTypes.func,
  notifications: PropTypes.array,
  onThemeChange: PropTypes.func,
  onCollapseChange: PropTypes.func,
  onAllNotificationsRead: PropTypes.func,
}

export default Header
