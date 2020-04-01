import React from 'react'
import * as antd from 'antd'
import * as Icons from '@ant-design/icons'
import Icon from '@ant-design/icons'

import { withI18n, Trans } from '@lingui/react'
import styles from './mobile.less'
import * as ycore from 'ycore'
import CustomIcons from '../../CustomIcons'

@withI18n()
export default class Sider_Mobile extends React.PureComponent {
  render() {
    const { handleClickMenu, logo } = this.props 
    return (
      <div className={styles.left_sider_wrapper}>
        <antd.Layout.Sider
          trigger={null}
          width='100%'
        >
              <antd.Menu
                mode="horizontal"
                onClick={handleClickMenu}
              >
                <antd.Menu.Item key="explore">
                  <Icons.CompassTwoTone twoToneColor={"#28c35d"} />
                </antd.Menu.Item>

                <antd.Menu.Item key="saves">
                  <Icon component={CustomIcons.SavedPostColor} />
                </antd.Menu.Item>

               
                <antd.Menu.Item key="marketplace">
                  <Icons.ShoppingTwoTone twoToneColor={"#ff7a45"}/>
                </antd.Menu.Item>
         

              <antd.Menu.Item key="events">
                  <Icons.CarryOutTwoTone twoToneColor={"#ff4d4f"}/>
              </antd.Menu.Item>

                <antd.Menu.Item key="general_settings">
                    <Icons.SettingOutlined />
                </antd.Menu.Item>

                <antd.Menu.Item key="SignOut">
                    <Icons.LogoutOutlined style={{ color: 'red' }} />
                </antd.Menu.Item>


              </antd.Menu>

              
   
        
        </antd.Layout.Sider>
      </div>
    )
  }
}