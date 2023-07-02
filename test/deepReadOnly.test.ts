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
  it('should protect deeply nested properties', () => {
    const originalValue = 5;
    const input = { root: { [1]: [{ [2]: { [3]: originalValue }}]}};
    const adjustedValue = 6;
    input.root[1][0][2][3] = adjustedValue;
    expect(input.root[1][0][2][3]).to.equal(adjustedValue);
    
    const immutable = deepReadonly(input);
    try {
      /**
       * cast to any as TS knows the assignment is readonly 
       * has to be wrapped in try/catch as the assignment throws a runtime error
       */
      (immutable.root[1][0][2][3] as any) = originalValue;
    } catch {}
    
    expect(immutable.root[1][0][2][3]).to.equal(adjustedValue);
  });
  it('should prevent assignment of a new date to a nested property', () => {
    const originalValue = new Date(1990, 0, 1);
    const input = { root: { [1]: [{ [2]: { [3]: originalValue }}]}};
    const adjustedValue = new Date(1980, 0, 1);
    input.root[1][0][2][3] = adjustedValue;
    expect(input.root[1][0][2][3]).to.equal(adjustedValue);
    
    const immutable = deepReadonly(input);
    try {
      /**
       * cast to any as TS knows the assignment is readonly 
       * has to be wrapped in try/catch as the assignment throws a runtime error
       */
      (immutable.root[1][0][2][3] as any) = originalValue;
    } catch {}
    
    expect(immutable.root[1][0][2][3]).to.equal(adjustedValue);
  });

  it('should prevent mutation of Date objects via their set* methods', () => {
    const date = new Date(1990, 0, 1);
    const readOnlyDate = deepReadonly(date);
    readOnlyDate.setFullYear(1991);
    expect(readOnlyDate.getFullYear()).to.equal(1990);
  });
});