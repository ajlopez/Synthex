
const Synth = artifacts.require('Synth');

contract('Synth', function (accounts) {
    it('create synth', async function () {
        const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));
        
        const name = await synth.name();
        const decimals = await synth.decimals();
        const symbol = await synth.symbol();
        const key = await synth.key();
        
        assert.equal(name, 'Name');
        assert.equal(decimals, 18);
        assert.equal(symbol, 'SYM1');
        assert.equal(key.toString(), '0x' + Buffer.from('TOK1').toString('hex') + '0'.repeat(28 * 2));
    });
});