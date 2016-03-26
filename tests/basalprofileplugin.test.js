require('should');

describe('basalprofile', function ( ) {

  var basal = require('../lib/plugins/basalprofile')();

  var sandbox = require('../lib/sandbox')();
  var env = require('../env')();
  var ctx = {};
  ctx.ddata = require('../lib/data/ddata')();
  ctx.notifications = require('../lib/notifications')(env, ctx);

  var profileData = 
  {
    'timezone': 'UTC',
    'startDate': '2015-06-21',
    'basal': [
        {
            'time': '00:00',
            'value': 0.175
        },
        {
            'time': '02:30',
            'value': 0.125
        },
        {
            'time': '05:00',
            'value': 0.075
        },
        {
            'time': '08:00',
            'value': 0.1
        },
        {
            'time': '14:00',
            'value': 0.125
        },
        {
            'time': '20:00',
            'value': 0.3
        },
        {
            'time': '22:00',
            'value': 0.225
        }
    ]
  };


  var profile = require('../lib/profilefunctions')([profileData]);

  it('update basal profile pill', function (done) {
    var data = {};

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin, options) {
          options.value.should.equal('0.175U');
          done();
        }
      }
    };

    var time = new Date('2015-06-21T00:00:00').getTime();

    var sbx = sandbox.clientInit(ctx, time, data);
    sbx.data.profile = profile;
    basal.updateVisualisation(sbx);

  });

  
});