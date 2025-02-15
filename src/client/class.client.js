import API from 'src/includes/class.api';
import App from 'src/includes/class.app';
import * as utils from 'src/includes/utils';
import * as dom from './dom';

window.api = new API;
window.utils = utils;
window.dom = dom;

export default class Client extends App {
  constructor(){
    super();
    // 缓存数据
    this._cache = {
      // 当前主题设置
      theme: {},
      // 加载的插件
      plugins: {},
    };
    api.listen((request, sender, fn) => {
      const { action } = request;
      if(!action){
        fn({error: 'action invalid'});
      } else {
        this.doAction(action, (error, data) => {
          fn({error, data});
        },{
          sender,
          request,
        });
      }
      return true;
    });
    this.bindEvents();
  }

  bindEvents(){
    let keyMap = {};
    // 快捷键绑定
    document.addEventListener('keyup', event => {
      const keyCode = event.keyCode || event.which;
      !utils.isNumber(keyMap[keyCode]) && (keyMap[keyCode] = 0);
      keyMap[keyCode]++;
      keyMap[keyCode] >= 2 && this.doAction('double-keyup', keyCode);
      setTimeout(function(){keyMap = {}}, 500);
      this.doAction('keyup', keyCode);
    });
  }

  loadPlugin(name, callback){
    if(this._cache.plugins[name]){
      callback && callback(this._cache.plugins[name]);
      app.doAction(`load-plugin-${name}`);
    } else {
      api.send('plugin', { execute: 'load', name }, ({error, data}) => {
        if(error){
          this.doAction('error', error);
          return;
        }
        this._cache.plugins[name] = data;
        callback && callback(data);
        app.doAction(`load-plugin-${name}`);
      });
    }
  }
}
