
const Synthex = artifacts.require('Synthex');
const Synth = artifacts.require('Synth');

const expectThrow = require('./utils').expectThrow;

contract('Synthex', function (accounts) {
    const alice = accounts[0];
    const bob = accounts[1];
    const charlie = accounts[2];
    
    const INITIAL_SUPPLY = 10000000;

    describe('Synthex', function () {
        beforeEach(async function () {
            this.synthex = await Synthex.new(charlie);
        });
        
        it('initial properties', async function () {
            const owner = await this.synthex.owner();
            const token = await this.synthex.token();
            const totalDebt = await this.synthex.totalDebt();
            
            assert.equal(owner, alice);
            assert.equal(token, charlie);
            assert.equal(totalDebt, 0);
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
            this.synthex = await Synthex.new(charlie);
            this.susd = await Synth.new('sUSD', 'Synth USD', Buffer.from('sUSD'));
            await this.synthex.addSynth(this.susd.address);
            await this.susd.setSynthex(this.synthex.address);
        });
        
        it('issue synths', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            
            const balance = await this.susd.balanceOf(bob);            
            assert.equal(balance, 1000);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 1000);
        });

        it('issue synths twice', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            await this.synthex.issueSynths(500, { from: charlie });
            
            const bobBalance = await this.susd.balanceOf(bob);            
            const charlieBalance = await this.susd.balanceOf(charlie);            
            assert.equal(charlieBalance, 500);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 1500);
        });

        it('burn synths', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            await this.synthex.burnSynths(600, { from: bob });
            
            const balance = await this.susd.balanceOf(bob);            
            assert.equal(balance, 400);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 400);
        });
        
        it('cannot burn too much synths', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            expectThrow(this.synthex.burnSynths(1600, { from: bob }));
            
            const balance = await this.susd.balanceOf(bob);            
            assert.equal(balance, 1000);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 1000);
        });
    });
});

