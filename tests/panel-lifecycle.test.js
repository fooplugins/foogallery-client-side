'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function harness() {
  const dom=new JSDOM('',{runScripts:'outside-only'}), w=dom.window;
  const $=require('jquery')(w), fn={reject: reason=>$.Deferred().reject(reason).promise(),resolved:$.Deferred().resolve().promise()};
  w.FooGallery={$,$: $,Component:{extend:definition=>definition},template:{configure(){}},utils:{is:{fn:v=>typeof v==='function'},fn,obj:{},transition:{}}};
  w.eval(fs.readFileSync(path.resolve(__dirname,'../src/core/js/panel/Panel.js'),'utf8'));
  const p=Object.assign({},w.FooGallery.Panel,{tmpl:{},__pending:[],isDestroying:false,isDestroyed:false,
    trigger:()=>({isDefaultPrevented:()=>false}),doDestroy:()=>true,_super(){this.tmpl=null;}});
  return {dom,$,p};
}
const settle=op=>Promise.race([new Promise(r=>op.then(()=>r('resolved'),()=>r('rejected'))),new Promise(r=>setTimeout(()=>r('timeout'),300))]);

test('a factory destroying its owner rejects before its never-ending media settles',async()=>{
  const {dom,$,p}=harness();try {
    let completed=0;
    const op=p.wait(()=>{p.destroy();return $.Deferred().promise();},()=>completed++);
    assert.equal(await settle(op),'rejected');assert.equal(p.__pending.length,0);assert.equal(completed,0);
  } finally {dom.window.close();}
});
test('destruction from a completion listener rejects instead of reporting obsolete success',async()=>{
  const {dom,$,p}=harness();try {
    assert.equal(await settle(p.wait($.Deferred().resolve(),()=>p.destroy())),'rejected');
    assert.equal(p.__pending.length,0);
  } finally {dom.window.close();}
});
test('destroy guards precede synchronous listeners and reentrant rejection handlers',async()=>{
  const {dom,$,p}=harness();try {
    let listeners=0,cleanups=0,failures=0;
    p.trigger=()=>{listeners++;p.destroy();return {isDefaultPrevented:()=>false};};
    p.doDestroy=()=>{cleanups++;return true;};
    const op=p.wait($.Deferred());op.fail(()=>{failures++;p.destroy();});
    p.destroy();p.destroy();assert.equal(await settle(op),'rejected');
    assert.equal(listeners,2); // destroy + destroyed, neither recurses
    assert.equal(cleanups,1);assert.equal(failures,1);assert.equal(p.__pending.length,0);
  } finally {dom.window.close();}
});
test('live destruction can be vetoed, irreversible owner teardown cannot',()=>{
  const {dom,p}=harness();try {
    p.trigger=()=>({isDefaultPrevented:()=>true});
    p.destroy();assert.equal(p.isActive(),true);
    p.tmpl.destroying=true;p.destroy();assert.equal(p.isDestroyed,true);assert.equal(p.isActive(),false);
  } finally {dom.window.close();}
});
test('forced child teardown rejects pending child operations even when its destroy event is vetoed',async()=>{
  const {dom,$,p}=harness();try {
    let cleanups=0;
    const child={isCreated:true,isAttached:true,isActive(){return !this.isDestroying&&!this.isDestroyed&&p.isActive();},doDestroy(){cleanups++;}};
    const op=p.wait($.Deferred(),null,null,null,child);
    p.trigger=()=>({isDefaultPrevented:()=>true});
    p.isDestroying=true;p.destroyChild(child,'media');p.destroyChild(child,'media');
    assert.equal(await settle(op),'rejected');assert.equal(cleanups,1);assert.equal(child.isAttached,false);assert.equal(child.__pending.length,0);
  } finally {dom.window.close();}
});
