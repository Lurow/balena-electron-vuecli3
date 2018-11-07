import Vue from 'vue'
import App from './App.vue'
import jsonconfig from '../config.json'

Vue.config.productionTip = false

var ELECTRON_DETECTED = (window && window.process && window.process.type) == 'renderer'

let tmpConfig
if (ELECTRON_DETECTED) {
  const { remote } = require('electron')
  let currentWindow = remote.getCurrentWindow()
  tmpConfig = currentWindow.configuration ? Object.assign({}, currentWindow.configuration) : jsonconfig
} else {
  tmpConfig = jsonconfig
}
console.log(tmpConfig.foo)
export const config = tmpConfig

new Vue({
  render: h => h(App)
}).$mount('#app')
