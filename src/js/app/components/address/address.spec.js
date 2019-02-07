const { expect } = require('#test/common');
const { AddressComponent } = require('test-map').default;

describe('AddressComponent', () => {
    it('it should have a placeholder prop', () => {
        expect(AddressComponent.props).to.have.property('placeholder');
    });
});
