
const Synth = artifacts.require('Synth');

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

    it('issue synth', async function () {
        await this.synth.issue(bob, 1000);
        
        const result = await this.synth.balanceOf(bob);
        
        assert.equal(result, 1000);
    });
});