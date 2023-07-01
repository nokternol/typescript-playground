import { deepReadonly, type DeepReadonly } from '../utils/deepReadOnly/deepReadOnly';
import { expect } from 'chai';

describe('deepReadonly', () => {
  it('wont support primitives', () => {
    expect(deepReadonly.bind(null, 'value' as any)).to.throw;
  });
  it('will return the same object', () => {
    const result = deepReadonly({ key: 'value' })
    expect(result).to.eql({ key: 'value' });
  });
  it('will not allow re-assignment', () => {
    const result = deepReadonly({ key: 'value' })
    expect(Object.assign.bind(result, { key: 'another value'})).to.throw;
  });
  it('should freeze array contents', () => {
    const result = deepReadonly({ arr: ['value1', 'value2', 'value3'] }) as any;
    expect(result.arr.push.bind(result, 'value4')).to.throw;
  });
  

});