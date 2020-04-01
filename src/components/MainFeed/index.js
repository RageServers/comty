import React from 'react'
import * as antd from 'antd'
import * as ycore from 'ycore'
import styles from './index.less'

import { ComponentNewAV, ComponentInvalid, renderFeedPosts } from './components/index.js'

export const RenderFeed = {
  RefreshFeed: () => {
    window.MainFeedComponent.feedGet.first()
    return
  },
  killByID: post_id => {
    window.MainFeedComponent.killByID(post_id)
    return
  },
  addToRend: payload => {
    window.MainFeedComponent.addToRend(payload)
    return
  },
  goToElement: post_id => {
    ycore.goTo.element(post_id)
  },
  disableMenu: () => {
    window.MainFeedComponent.setState({
      disableMenu: true,
    })
  },
  sync: (c) => {
    window.MainFeedComponent.syncService(c)
    return
  }
}
class MainFeed extends React.PureComponent {
  constructor(props) {
    super(props)
    window.MainFeedComponent = this
    this.state = {
      NewAV: false,
      invalid: false,
      loading: false,
      disableMenu: false,
      data: [],
      fkey: 0,
    }
  }

  componentDidMount() {
    this.feedGet.first()
    ycore.sync.FeedListen((data) => {
      this.syncService(data)
    })
  }

  toogleLoader() {
    this.setState({ loading: !this.state.loading })
  }
  
  syncService(data){
    if (!data) return false
    const { last_post_id, now } = data
    const first = this.state.data[0]
    if (first){
      const a = first.id
      console.log(` SYNC => ${last_post_id} | LAST => ${a}`)
      if(last_post_id>a){
        this.setState({ NewAV: true })
      }
    }
  }

  killByID(post_id) {
    const a = this.state.data
    const b = ycore.arrayRemoveByID(a, post_id)
    this.setState({ data: b })
  }

  addToRend(payload) {
    let a = this.state.data
    a.unshift(payload)
    this.setState({ data: a })
  }

  feedGet = {
    first: ()=>{
      try {
        const { get, uid, filters } = this.props
        if (this.props.custompayload) {
          this.setState({
            isEnd: true,
            NewAV: false,
            data: this.props.custompayload,
            loading: false,
          })
          return
        }
        if (!get) {
          ycore.yconsole.error('Please, fill params with an catch type...')
          return
        }
        this.toogleLoader()
        const payload = { fkey: 0, type: get, id: uid }
        ycore.comty_post.getFeed((err, res) => {
          if (err) {
            ycore.notify.error('Error when get data from this input')
            return
          }
          if (JSON.parse(res).api_status == '400') {
            this.setState({ invalid: true })
            return
          }
          try {
            const parsed = JSON.parse(res)['data']
            const isEnd =parsed.length < ycore.AppSettings.limit_post_catch ? true : false
            this.setState({ NewAV: false, isEnd: isEnd, data: parsed, loading: false })
          } catch (error) {
            ycore.yconsole.log(error)
          }
        }, payload)
      } catch (err) {
        ycore.notify.error('err')
      }
    },
    more(fkey){
      try {
        const { get, uid, filters } = this.props
        if (!get) {
          ycore.yconsole.error('Please, fill params with an catch type...')
          return
        }
        if (!fkey) {
          ycore.yconsole.warn(
            'Please, provide a fkey for offset the feed, default using => 0'
          )
        }
        this.toogleLoader()
        const getLastPost = ycore.objectLast(this.state.data)
        ycore.yconsole.log('LAST POST ID =>', getLastPost.id)
  
        const payload = { fkey: getLastPost.id, type: get, id: uid }
        ycore.comty_post.getFeed((err, res) => {
          if (err) {
            return false
          }
          const oldData = this.state.data
          const parsed = JSON.parse(res)['data']
          const mix = oldData.concat(parsed)
          const isEnd =
            parsed.length < ycore.AppSettings.limit_post_catch ? true : false
          this.setState({ isEnd: isEnd, data: mix, loading: false }, () =>
            ycore.goTo.element(getLastPost.id)
          )
          return true
        }, payload)
      } catch (err) {
        ycore.notify.error(err)
      }
    }
  }
  

  render() {
    const { data, loading, isEnd, invalid, NewAV } = this.state
    const renderFeedPosts_payload = {data: data, loading: loading, isEnd: isEnd, feedGet: this.feedGet}
    
    if (invalid){
      return ComponentInvalid()
    }
    if (loading) {
      return (
        <antd.Card style={{ maxWidth: '26.5vw', margin: 'auto' }}>
            <antd.Skeleton avatar paragraph={{ rows: 4 }} active />
        </antd.Card>
      )
    }
    if (!loading) {
      return (
        <div className={styles.main_feed_wrapper} id="mainfeed">
          {NewAV? ComponentNewAV(() => this.feedGet.first()) : null}
          {renderFeedPosts(renderFeedPosts_payload)}
        </div>
      )
    }
  }
}
export default MainFeed
