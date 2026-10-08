import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldOpenRow, openRowLink } from '../src/row-navigation.ts';

test('row activation preserves interactive controls, text selection and prevented clicks', () => {
  globalThis.window = {getSelection:()=>({toString:()=>''})};
  const event={defaultPrevented:false,button:0,target:{closest:()=>null}};
  assert.equal(shouldOpenRow(event),true);
  assert.equal(shouldOpenRow({...event,target:{closest:()=>({})}}),false);
  assert.equal(shouldOpenRow({...event,defaultPrevented:true}),false);
  assert.equal(shouldOpenRow({...event,button:1}),false);
  window.getSelection=()=>({toString:()=>'selected description'});
  assert.equal(shouldOpenRow(event),false);
});

test('internal rows navigate and external or modified clicks open a protected new tab', () => {
  const calls=[];
  globalThis.window={location:{assign:url=>calls.push(['assign',url])},open:(...args)=>calls.push(['open',...args])};
  openRowLink({},'/tutoriais');
  openRowLink({},'https://example.org/',true);
  openRowLink({ctrlKey:true},'/blogs');
  openRowLink({metaKey:true},'/blogs');
  assert.deepEqual(calls,[['assign','/tutoriais'],['open','https://example.org/','_blank','noopener,noreferrer'],['open','/blogs','_blank','noopener,noreferrer'],['open','/blogs','_blank','noopener,noreferrer']]);
});
