import { deepReadonly, type DeepReadonly } from '../utils/deepReadOnly/deepReadOnly';
import { expect } from 'chai';

describe('deepReadonly', () => {
  it('should only accept objects', () => {
    //non-object types
    expect(deepReadonly.bind(null, 'value' as any)).to.throw;
    expect(deepReadonly.bind(null, 1 as any)).to.throw;
    expect(deepReadonly.bind(null, Symbol('key') as any)).to.throw;
    expect(deepReadonly.bind(null, function() {} as any)).to.throw;
    expect(deepReadonly.bind(null, true as any)).to.throw;
    // empty values
    expect(deepReadonly.bind(null, null as any)).to.throw;
    expect(deepReadonly.bind(null, undefined as any)).to.throw;
  });
  it('should gracefully handle object types', () => {
    const date = new Date();
    expect(deepReadonly(date)).to.equal(date);

    const array = new Array(100).map((_, i) => i);
    expect(deepReadonly(array)).to.equal(array);

  });
  it('will return the same object', () => {
    const input = { key: 'value' };
    const result: DeepReadonly<typeof input> = deepReadonly(input)
    expect(result).to.eql({ key: 'value' });
  });
  it('will not allow re-assignment', () => {
    const result = deepReadonly({ key: 'value' })
    expect(Object.assign.bind(result, { key: 'another value'})).to.throw;
  });
  it('should not allow Object.assign', () => {
    const result = deepReadonly({ arr: ['value1', 'value2', 'value3'] }) as any;
    expect(result.arr.push.bind(result, 'value4')).to.throw;
  });
  it('should not allow mutating array methods', () => {
    const result = deepReadonly({ arr: ['value1', 'value2', 'value3'] }) as any;
    expect(result.arr.reverse.bind(result)).to.throw;
  });
  it('should not allow indexed assignment', () => {
    const array = new Array(100).map((_, i) => i);
    const readOnlyArray = deepReadonly(array);
    readOnlyArray.forEach((_, i) => (readOnlyArray as any)[i]++);
    expect(readOnlyArray).deep.equal(array);
  });
});