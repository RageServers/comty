import React from 'react'
import { pathMatchRegexp } from 'core'
import HandleError from 'core/libs/errorhandler'
import { Invalid } from 'components'
import styles from './index.less'

import FollowButton from './components/follow'
import Menu from './components/menu'

import * as antd from 'antd'
import { connect } from 'umi'
const matchRegexp = pathMatchRegexp('/@/:id', location.pathname)

class UserLayout extends React.Component{
  state = {
    styleComponent: "UserLayout",
    userString: matchRegexp[1],
    layoutData: {
      avatar: null,
      cover: null,
      about: null,
      followed: null,
      followers: null
    }
  }

  componentDidMount(){
    const { layoutData } = this.props
    if (layoutData) {
      this.setState({ layoutData: {...this.state.layoutData, ...layoutData} })
    }
  }

  render(){
    const { styleComponent } = this.state
    const toStyles = e => styles[`${styleComponent}_${e}`]
    
    return(
      <div className={toStyles("wrapper")} >
          <div className={toStyles("cover")}>
            <img src={this.state.layoutData.cover} />
          </div>
          <div className={toStyles("header")}>

            <div className={toStyles("avatar")}>
              <antd.Avatar shape="square" src={this.state.layoutData.avatar} />
            </div>

            <div className={toStyles("title")}>
              <antd.Tooltip title={`${this.state.layoutData.followers ?? "Non-existent"} Followers`}>
                <h1>{this.state.userString}</h1>
              </antd.Tooltip>
            
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '100',
                  lineHeight: '0',
                  marginBottom: '5px',
                }}
                dangerouslySetInnerHTML={{
                  __html: this.state.layoutData.about,
                }}
              />
            </div>

            <div className={toStyles("options")}>
              <div><FollowButton followed={this.state.layoutData.follow} /></div>
            </div>
           
          </div>

          <div className={toStyles("content")}>
            
          </div>
      </div>
    )
  }
}

@connect(({ app }) => ({ app }))
export default class UserIndexer extends React.Component {
  state = {
    ErrorCode: null,
    loading: true,
    response: null,
    layoutData: null
  }

  promiseState = async state => new Promise(resolve => this.setState(state, resolve));

  componentDidMount(){
    if (matchRegexp) {
      this.props.dispatch({
        type: "user/get",
        req: {
          fetch: "profileData",
          username: matchRegexp[1]
        },
        callback: (err, res) => {
          if(err){
            this.setState({ ErrorCode: err })
            return HandleError({ code: err, msg: res })
          }
          this.setState({ loading: false, layoutData: res })
        }
      })
    }else{
      this.setState({ ErrorCode: 140 })
    }
  }
  render() {
    if (this.state.ErrorCode) {
      return <Invalid typeByCode={this.state.ErrorCode} messageProp1={location.pathname} />
    }
    if (this.state.loading) {
      return <div style={{ display: "flex", width: "100%", justifyContent: "center", alignContent: "center" }}><antd.Card style={{ width: "100%" }} ><antd.Skeleton active /></antd.Card></div>
    }
    return <UserLayout layoutData={this.state.layoutData} /> 
  }
}
