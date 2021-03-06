'use strict';

require('should');
var _ = require('lodash');
var benv = require('benv');
var read = require('fs').readFileSync;
var serverSettings = require('./fixtures/default-server-settings');

var nowData = {
  sgvs: [
    { mgdl: 100, mills: Date.now(), direction: 'Flat', type: 'sgv' }
  ]
};

var exampleProfile = {
  defaultProfile : 'Default'
  , store: {
      'Default' : {
        //General values
        'dia':3,

        // Simple style values, 'from' are in minutes from midnight
        'carbratio': [
          {
            'time': '00:00',
            'value': 30
          }],
        'carbs_hr':30,
        'delay': 20,
        'sens': [
          {
            'time': '00:00',
            'value': 100
          }
          , {
            'time': '8:00',
            'value': 80
          }],
        'startDate': new Date(),
        'timezone': 'UTC',

        //perGIvalues style values
        'perGIvalues': false,
        'carbs_hr_high': 30,
        'carbs_hr_medium': 30,
        'carbs_hr_low': 30,
        'delay_high': 15,
        'delay_medium': 20,
        'delay_low': 20,

        'basal':[
          {
            'time': '00:00',
            'value': 0.1
          }],
        'target_low':[
          {
            'time': '00:00',
            'value': 0
          }],
        'target_high':[
          {
            'time': '00:00',
            'value': 0
          }]
      }
  }
};


var someData = {
    '/api/v1/profile.json': [exampleProfile]
  };


describe('Profile editor', function ( ) {
  var self = this;

  before(function (done) {
    benv.setup(function() {
      self.$ = require('jquery');
      self.$.localStorage = require('./fixtures/localstorage');

      self.$.fn.tipsy = function mockTipsy ( ) { };

      self.$.fn.dialog = function mockDialog (opts) {
        function maybeCall (name, obj) {
          if (obj[name] && obj[name].call) {
            obj[name]();
          }

        }
        maybeCall('open', opts);

        _.forEach(opts.buttons, function (button) {
          maybeCall('click', button);
        });
      };

      var indexHtml = read(__dirname + '/../static/profile/index.html', 'utf8');
      self.$('body').html(indexHtml);

      //var filesys = require('fs');
      //var logfile = filesys.createWriteStream('out.txt', { flags: 'a'} )
      
      self.$.ajax = function mockAjax (url, opts) {
        //logfile.write(url+'\n');
        //console.log(url,opts);
        if (opts && opts.success && opts.success.call) {
          return {
            done: function mockDone (fn) {
                if (someData[url]) {
                  console.log('+++++Data for ' + url + ' sent');
                  opts.success(someData[url]);
                } else {
                  console.log('-----Data for ' + url + ' missing');
                  opts.success([]);
                }
              fn();
              return self.$.ajax();
            },
            fail: function mockFail () {
              return self.$.ajax();
            }
          };
        }
        return {
          done: function mockDone (fn) {
            fn({message: 'OK'});
            return self.$.ajax();
            },
          fail: function mockFail () {
            return self.$.ajax();
            }
        };
      };

      var d3 = require('d3');
      //disable all d3 transitions so most of the other code can run with jsdom
      d3.timer = function mockTimer() { };

      benv.expose({
        $: self.$
        , jQuery: self.$
        , d3: d3
        , serverSettings: serverSettings
        , io: {
          connect: function mockConnect ( ) {
            return {
              on: function mockOn ( ) { }
            };
          }
        }
      });

      benv.require(__dirname + '/../bundle/bundle.source.js');
      benv.require(__dirname + '/../static/profile/js/profileeditor.js');

      done();
    });
  });

  after(function (done) {
    benv.teardown(true);
    done();
  });

  it ('should produce some html', function (done) {
    var plugins = require('../lib/plugins/')().registerClientDefaults();
    var client = require('../lib/client');

    var hashauth = require('../lib/hashauth');
    hashauth.init(client,$);
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next) {
      hashauth.authenticated = true;
      next(true);
    };

     window.confirm = function mockConfirm (text) {
       console.log('Confirm:', text);
       return true;
     };

     window.alert = function mockAlert () {
       return true;
     };

    client.init(serverSettings, plugins);
    client.dataUpdate(nowData);
    
    //var result = $('body').html();
    //var filesys = require('fs');
    //var logfile = filesys.createWriteStream('out.txt', { flags: 'a'} )
    //logfile.write($('body').html());
    
    //console.log(result);

    $('#pe_submit').click();
    done();
  });

});
