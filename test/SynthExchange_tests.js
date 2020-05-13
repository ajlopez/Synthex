
const SynthExchange = artifacts.require('SynthExchange');
const Synthex = artifacts.require('Synthex');
const Synth = artifacts.require('Synth');

const expectThrow = require('./utils').expectThrow;

contract('SynthExchange', function (accounts) {
    const alice = accounts[0];
    const bob = accounts[1];
    const charlie = accounts[2];
    
    const MANTISSA = 1e6;
    
    describe('SynthExchange', function () {
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

    describe('SynthExchange with Synthex and Synths', function () {
        beforeEach(async function () {
            this.synthexchange = await SynthExchange.new();
            this.synthex = await Synthex.new();
            await this.synthexchange.setSynthex(this.synthex.address);
            this.susd = await Synth.new('sUSD', 'Synth USD', Buffer.from('sUSD'));
            await this.synthex.addSynth(this.susd.address);
            await this.susd.setSynthex(this.synthex.address);
            await this.susd.setSynthExchange(this.synthexchange.address);
            this.sbtc = await Synth.new('sBTC', 'Synth BTC', Buffer.from('sBTC'));
            await this.synthex.addSynth(this.sbtc.address);
            await this.sbtc.setSynthex(this.synthex.address);
            await this.sbtc.setSynthExchange(this.synthexchange.address);
            this.sfoo = await Synth.new('sFOO', 'Synth FOO', Buffer.from('sFOO'));
        });

        it('get sUSD price', async function () {
            const price = await this.synthexchange.prices(await this.susd.key());
            
            assert.equal(price, MANTISSA);
        });
        
        it('set sBTC price', async function () {
            await this.synthexchange.setPrice(await this.sbtc.key(), 10000 * MANTISSA);
            
            const price = await this.synthexchange.prices(await this.sbtc.key());
            
            assert.equal(price, 10000 * MANTISSA);
        });
        
        it('only owner can set sBTC price', async function () {
            expectThrow(this.synthexchange.setPrice(await this.sbtc.key(), 10000 * MANTISSA, { from: bob }));
            
            const price = await this.synthexchange.prices(await this.sbtc.key());
            
            assert.equal(price, 0);
        });
        
        it('only associated synth have price', async function () {
            expectThrow(this.synthexchange.setPrice(await this.sfoo.key(), 10000 * MANTISSA));
            
            const price = await this.synthexchange.prices(await this.sfoo.key());
            
            assert.equal(price, 0);
        });
        
        it('exchange synths with prices', async function () {
            await this.synthex.issueSynths(20000, { from: bob });
            
            const balance1 = await this.susd.balanceOf(bob);
            
            assert.equal(balance1, 20000);
            
            await this.synthexchange.setPrice(await this.sbtc.key(), 10000 * MANTISSA);
            
            const price = await this.synthexchange.prices(await this.sbtc.key());
            
            assert.equal(price, 10000 * MANTISSA);
            
            await this.synthexchange.exchange(await this.susd.key(), 20000, await this.sbtc.key(), { from: bob });

            const balance2 = await this.susd.balanceOf(bob);
            
            assert.equal(balance2, 0);

            const balance3 = await this.sbtc.balanceOf(bob);
            
            assert.equal(balance3, 2);
        });
        
        it('cannot exchange synths without prices', async function () {
            await this.synthex.issueSynths(20000, { from: bob });
            
            const balance1 = await this.susd.balanceOf(bob);
            
            assert.equal(balance1, 20000);
            
            expectThrow(this.synthexchange.exchange(await this.susd.key(), 20000, await this.sbtc.key(), { from: bob }));

            const balance2 = await this.susd.balanceOf(bob);
            
            assert.equal(balance2, 20000);

            const balance3 = await this.sbtc.balanceOf(bob);
            
            assert.equal(balance3, 0);
        });
        
        it('cannot exchange 0 synths', async function () {
            await this.synthex.issueSynths(20000, { from: bob });
            
            const balance1 = await this.susd.balanceOf(bob);
            
            assert.equal(balance1, 20000);
            
            await this.synthexchange.setPrice(await this.sbtc.key(), 10000 * MANTISSA);
            
            const price = await this.synthexchange.prices(await this.sbtc.key());
            
            assert.equal(price, 10000 * MANTISSA);
            
            expectThrow(this.synthexchange.exchange(await this.susd.key(), 0, await this.sbtc.key(), { from: bob }));

            const balance2 = await this.susd.balanceOf(bob);
            
            assert.equal(balance2, 20000);

            const balance3 = await this.sbtc.balanceOf(bob);
            
            assert.equal(balance3, 0);
        });
        
        it('cannot exchange too much synths', async function () {
            await this.synthex.issueSynths(20000, { from: bob });
            
            const balance1 = await this.susd.balanceOf(bob);
            
            assert.equal(balance1, 20000);
            
            await this.synthexchange.setPrice(await this.sbtc.key(), 10000 * MANTISSA);
            
            const price = await this.synthexchange.prices(await this.sbtc.key());
            
            assert.equal(price, 10000 * MANTISSA);
            
            expectThrow(this.synthexchange.exchange(await this.susd.key(), 30000, await this.sbtc.key(), { from: bob }));

            const balance2 = await this.susd.balanceOf(bob);
            
            assert.equal(balance2, 20000);

            const balance3 = await this.sbtc.balanceOf(bob);
            
            assert.equal(balance3, 0);
        });
    });
});

