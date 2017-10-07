/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

const { testDevices } = require('./setup');

describe('Plug', function () {
  before(function () {
    this.timeout(4000);
    this.slow(2000);
  });

  testDevices['plug'].forEach((testPlug) => {
    let plug;
    context(testPlug.name, function () {
      beforeEach(async function () {
        if (!testPlug.getDevice) {
          this.skip();
        }
        plug = await testPlug.getDevice();
      });

      describe('#inUse get', function () {
        it('should return status based on Emeter if supported', function () {
          if (!plug.supportsEmeter) return;

          plug.inUseThreshold = 0;
          plug.emeterRealtime = {power: 0};
          expect(plug.inUse).to.be.false;

          plug.inUseThreshold = 10;
          plug.emeterRealtime = {power: 10};
          expect(plug.inUse).to.be.false;

          plug.inUseThreshold = 0;
          plug.emeterRealtime = {power: 0.1};
          expect(plug.inUse).to.be.true;

          plug.inUseThreshold = 10;
          plug.emeterRealtime = {power: 11};
          expect(plug.inUse).to.be.true;
        });
        it('should return status based on relay_state if Emeter not supported', function () {
          if (plug.supportsEmeter) return;

          plug.sysInfo.relay_state = 0;
          expect(plug.inUse).to.be.false;

          plug.sysInfo.relay_state = 1;
          expect(plug.inUse).to.be.true;
        });
      });

      describe('#getInUse', function () {
        it('should resolve', function () {
          return expect(plug.getInUse()).to.eventually.be.fulfilled;
        });
      });

      describe('#setPowerState()', function () {
        it('should turn on', function () {
          return expect(plug.setPowerState(true)).to.eventually.be.true;
        });

        it('should turn off', function () {
          return expect(plug.setPowerState(false)).to.eventually.be.true;
        });

        it('should emit power-on', function (done) {
          plug.once('power-on', (plug) => {
            expect(plug).to.exist;
            done();
          });
          (async () => {
            try {
              await plug.setPowerState(false);
              await plug.setPowerState(true);
            } catch (err) { done(err); }
          })();
        });

        it('should emit power-off', function (done) {
          plug.once('power-off', (plug) => {
            expect(plug).to.exist;
            done();
          });
          (async () => {
            try {
              await plug.setPowerState(true);
              await plug.setPowerState(false);
            } catch (err) { done(err); }
          })();
        });
      });

      describe('#getPowerState()', function () {
        this.timeout(2000);
        this.slow(1000);
        it('should return power state when on', async function () {
          await plug.setPowerState(true);
          return expect(plug.getPowerState()).to.eventually.be.true;
        });

        it('should return power state when off', async function () {
          await plug.setPowerState(false);
          return expect(plug.getPowerState()).to.eventually.be.false;
        });
      });

      describe('#getAwayRules()', function () {
        it('should return away rules', function () {
          return expect(plug.getAwayRules()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getTimerRules()', function () {
        it('should return timer rules', function () {
          return expect(plug.getTimerRules()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#setLedState()', function () {
        it('should turn LED off', function () {
          return expect(plug.setLedState(false)).to.eventually.be.true;
        });

        it('should turn LED on', function () {
          return expect(plug.setLedState(true)).to.eventually.be.true;
        });
      });

      describe('#getLedState()', function () {
        it('should return LED state when off', async function () {
          await plug.setLedState(false);
          return expect(plug.getLedState()).to.eventually.be.false;
        });

        it('should return LED state when on', async function () {
          await plug.setLedState(true);
          return expect(plug.getLedState()).to.eventually.be.true;
        });
      });

      describe('#blink()', function () {
        this.timeout(5000);
        this.slow(300);
        it('should blink LED', function () {
          return expect(plug.blink(2, 100)).to.eventually.be.true;
        });
      });

      describe('#getInfo()', function () {
        it('should return info', function () {
          return expect(plug.getInfo()).to.eventually.have.property('sysInfo');
        });
      });
    });
  });
});
