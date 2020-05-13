
const Synth = artifacts.require('Synth');

const expectThrow = require('./utils').expectThrow;

contract('Synth', function (accounts) {
    const alice = accounts[0];
    const bob = accounts[1];
    const charlie = accounts[2];
    
    beforeEach(async function () {
        this.synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));
    });

    it('create synth', async function () {
        const name = await this.synth.name();
        const decimals = await this.synth.decimals();
        const symbol = await this.synth.symbol();
        const key = await this.synth.key();
        
        assert.equal(name, 'Name');
        assert.equal(decimals, 18);
        assert.equal(symbol, 'SYM1');
        assert.equal(key.toString(), '0x' + Buffer.from('TOK1').toString('hex') + '0'.repeat(28 * 2));
    });
    
    it('initial synthex', async function () {
        const synthex = await this.synth.synthex();
        
        assert.equal(synthex, 0);
    });

    it('set synthex', async function () {
        await this.synth.setSynthex(bob);
        
        const synthex = await this.synth.synthex();
        
        assert.equal(synthex, bob);
    });

    it('only owner can set synthex', async function () {
        expectThrow(this.synth.setSynthex(bob, { from: charlie }));
        
        const synthex = await this.synth.synthex();
        
        assert.equal(synthex, 0);
    });

    it('issue synth', async function () {
        await this.synth.setSynthex(charlie);
        await this.synth.issue(bob, 1000, { from: charlie });
        
        const result = await this.synth.balanceOf(bob);
        
        assert.equal(result, 1000);
    });
    
    it('only synthex can issue synth', async function () {
        expectThrow(this.synth.issue(bob, 1000, { from: bob }));
        
        const result = await this.synth.balanceOf(bob);
        
        assert.equal(result, 0);
    });
    
    it('burn synth', async function () {
        await this.synth.setSynthex(charlie);
        await this.synth.issue(bob, 1000, { from: charlie });
        await this.synth.burn(bob, 600, { from: charlie });
        
        const result = await this.synth.balanceOf(bob);
        
        assert.equal(result, 400);
    });
    
    it('cannot burn too much synth', async function () {
        await this.synth.setSynthex(charlie);
        await this.synth.issue(bob, 1000, { from: charlie });
        expectThrow(this.synth.burn(bob, 1600, { from: charlie }));
        
        const result = await this.synth.balanceOf(bob);
        
        assert.equal(result, 1000);
    });
    
    it('only synthex can burn synth', async function () {
        await this.synth.setSynthex(charlie);
        await this.synth.issue(bob, 1000, { from: charlie });
        expectThrow(this.synth.burn(bob, 600, { from: bob }));
        
        const result = await this.synth.balanceOf(bob);
        
        assert.equal(result, 1000);
    });
});