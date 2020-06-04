
const Synthex = artifacts.require('Synthex');
const Synth = artifacts.require('Synth');
const SynthExchange = artifacts.require('SynthExchange');

const expectThrow = require('./utils').expectThrow;

contract('Synthex', function (accounts) {
    const alice = accounts[0];
    const bob = accounts[1];
    const charlie = accounts[2];
    
    const INITIAL_SUPPLY = 10000000;
    const UNIT = 1000000;

    describe('Synthex', function () {
        beforeEach(async function () {
            this.synthexchange = await SynthExchange.new();
            this.synthex = await Synthex.new(charlie, this.synthexchange.address);
        });
        
        it('initial properties', async function () {
            const owner = await this.synthex.owner();
            const token = await this.synthex.token();
            const totalDebt = await this.synthex.totalDebt();
            const debtIndex = await this.synthex.debtIndex();
            const unit = await this.synthex.UNIT();
            
            assert.equal(owner, alice);
            assert.equal(token, charlie);
            assert.equal(totalDebt, 0);
            assert.equal(debtIndex, UNIT);
            assert.equal(unit, UNIT);
        });
        
        it('initial total issued synths value', async function () {
            const value = await this.synthex.totalIssuedSynthsValue();
            
            assert.equal(value, 0);
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
            this.synthexchange = await SynthExchange.new();
            this.synthex = await Synthex.new(charlie, this.synthexchange.address);
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
            
            const debtIndex = await this.synthex.debtIndex();          
            assert.equal(debtIndex, UNIT);
            
            const issuanceData = await this.synthex.issuanceData(bob);
            
            assert.equal(issuanceData.initialDebtOwnership, UNIT);
            assert.equal(issuanceData.debtIndex, UNIT);
            
            const value = await this.synthex.totalIssuedSynthsValue();
            
            assert.equal(value, 1000 * UNIT);
        });

        it('issue synths twice', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            await this.synthex.issueSynths(500, { from: charlie });
            
            const bobBalance = await this.susd.balanceOf(bob);            
            const charlieBalance = await this.susd.balanceOf(charlie);            
            assert.equal(charlieBalance, 500);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 1500);
            
            const debtIndex = await this.synthex.debtIndex();
            assert.equal(debtIndex, UNIT + UNIT / 2);

            const issuanceData = await this.synthex.issuanceData(charlie);
            
            assert.equal(issuanceData.initialDebtOwnership.toNumber(), 333333);
            assert.equal(issuanceData.debtIndex, UNIT + UNIT / 2);
            
            const value = await this.synthex.totalIssuedSynthsValue();
            
            assert.equal(value, 1500 * UNIT);
        });

        it('issue synths twice same issuer', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            await this.synthex.issueSynths(500, { from: bob });
            
            const bobBalance = await this.susd.balanceOf(bob);            
            assert.equal(bobBalance, 1500);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 1500);
            
            const debtIndex = await this.synthex.debtIndex();
            assert.equal(debtIndex, UNIT + UNIT / 2);

            const issuanceData = await this.synthex.issuanceData(bob);
            
            assert.equal(issuanceData.initialDebtOwnership.toNumber(), UNIT - 666667);
            assert.equal(issuanceData.debtIndex, UNIT + UNIT / 2);
            
            const value = await this.synthex.totalIssuedSynthsValue();
            
            assert.equal(value, 1500 * UNIT);
        });

        it('burn synths', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            await this.synthex.burnSynths(600, { from: bob });
            
            const balance = await this.susd.balanceOf(bob);            
            assert.equal(balance, 400);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 400);
            
            const value = await this.synthex.totalIssuedSynthsValue();
            
            assert.equal(value, 400 * UNIT);
        });
        
        it('cannot burn too much synths', async function () {
            await this.synthex.issueSynths(1000, { from: bob });
            expectThrow(this.synthex.burnSynths(1600, { from: bob }));
            
            const balance = await this.susd.balanceOf(bob);            
            assert.equal(balance, 1000);
            
            const totalDebt = await this.synthex.totalDebt();
            assert.equal(totalDebt, 1000);
            
            const value = await this.synthex.totalIssuedSynthsValue();
            
            assert.equal(value, 1000 * UNIT);
        });
    });
});

