
const Synthex = artifacts.require('Synthex');
const Synth = artifacts.require('Synth');

const expectThrow = require('./utils').expectThrow;

contract('Synthex', function (accounts) {
    const alice = accounts[0];
    const bob = accounts[1];
    const charlie = accounts[2];

    describe('Synthex', function () {
        beforeEach(async function () {
            this.synthex = await Synthex.new();
        });
        
        it('unknown synth', async function () {
            const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));

            const result = await this.synthex.synths(await synth.key());
            
            assert.equal(result, 0);
        });

        it('add synth', async function () {
            const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));

            await this.synthex.addSynth(synth.address);
            
            const result = await this.synthex.synths(await synth.key());
            
            assert.equal(result, synth.address);
        });
        
        it('cannot add synth twice', async function () {
            const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));

            await this.synthex.addSynth(synth.address);
            expectThrow(this.synthex.addSynth(synth.address));
            
            const result = await this.synthex.synths(await synth.key());
            
            assert.equal(result, synth.address);
        });
        
        it('only owner can add synth', async function () {
            const synth = await Synth.new('SYM1', 'Name', Buffer.from('TOK1'));

            expectThrow(this.synthex.addSynth(synth.address, { from: bob }));
            
            const result = await this.synthex.synths(await synth.key());
            
            assert.equal(result, 0);
        });
    });
    
    describe('Synthex with sUSD Synth', function () {
        beforeEach(async function () {
            this.synthex = await Synthex.new();
            this.susd = await Synth.new('sUSD', 'Synth USD', Buffer.from('sUSD'));
            await this.synthex.addSynth(this.susd.address);
            await this.susd.setSynthex(this.synthex.address);
        });
        
        it('issue synths', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            
            const balance = await this.susd.balanceOf(bob);
            
            assert.equal(balance, 1000);
        });
    });
});

