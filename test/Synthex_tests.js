
const Synthex = artifacts.require('Synthex');
const Synth = artifacts.require('Synth');

const expectThrow = require('./utils').expectThrow;

contract('Synthex', function (accounts) {
    const alice = accounts[0];
    const bob = accounts[1];
    const charlie = accounts[2];
    
    it('unknown synth', async function () {
        const synthex = await Synthex.new();
        const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));

        const result = await synthex.synths(await synth.key());
        
        assert.equal(result, 0);
    });

    it('add synth', async function () {
        const synthex = await Synthex.new();
        const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));

        await synthex.addSynth(synth.address);
        
        const result = await synthex.synths(await synth.key());
        
        assert.equal(result, synth.address);
    });
    
    it('only owner can add synth', async function () {
        const synthex = await Synthex.new();
        const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));

        expectThrow(synthex.addSynth(synth.address, { from: bob }));
        
        const result = await synthex.synths(await synth.key());
        
        assert.equal(result, 0);
    });
});

