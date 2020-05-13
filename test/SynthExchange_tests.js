
const SynthExchange = artifacts.require('SynthExchange');

const expectThrow = require('./utils').expectThrow;

contract('SynthExchange', function (accounts) {
    const alice = accounts[0];
    const bob = accounts[1];
    const charlie = accounts[2];
    
    beforeEach(async function () {
        this.synthexchange = await SynthExchange.new();
    });

    it('initial synthex', async function () {
        const synthex = await this.synthexchange.synthex();
        
        assert.equal(synthex, 0);
    });

    it('set synthex', async function () {
        await this.synthexchange.setSynthex(bob);
        
        const synthex = await this.synthexchange.synthex();
        
        assert.equal(synthex, bob);
    });

    it('only owner can set synthex', async function () {
        expectThrow(this.synthexchange.setSynthex(bob, { from: charlie }));
        
        const synthex = await this.synthexchange.synthex();
        
        assert.equal(synthex, 0);
    });
});