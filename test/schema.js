require('dotenv').load({ silent: true });

// environment variables
var APIURL = process.env.APIURL;
var USERNAME = process.env.USERNAME;
var PASSWORD =  process.env.PASSWORD;
if (!APIURL) {
  throw('Please set APIURL environment variable with the url of the IBM Graph instance');
}

if (!USERNAME || !PASSWORD) {
  throw('Please set USERNAME & PASSSWORD environment variables '
  + 'with the credentials of the IBM Graph instance');
}

// munge the URLs into pieces required by the library and by Nock
var url = require('url');
var parsed = url.parse(APIURL);
var PATH = parsed.pathname;
var STUB  = parsed.pathname.substr(0, (parsed.pathname.length - 2));
delete parsed.pathname;
var SERVER = url.format(parsed);

// sample response
var SAMPLE_RESPONSE = {
  requestId: '71e9b56e-bded-402e-8fac-cfc83aec9c31',
  status: {
    message: '',
    code: 200,
    attributes: {},
  },
  result: {
    data: null,
    meta: {},
  },
};

// load the GDS library and the http mocking library
var GDS    = require('../lib/client.js');
var nock   = require('nock');
var should = require('should');
var _      = require('underscore');
var uuid   = require('uuid');

describe('Schema', function () {

  var d = new Date();
  var now = d.getTime();
  var schema = {
    edgeIndexes: [],
    edgeLabels: [{ multiplicity: 'SIMPLE', name: 'route' }],
    propertyKeys: [{ cardinality: 'SINGLE', dataType: 'String', name: 'city' + now }],
    vertexIndexes: [
      {
        composite: false,
        name: 'cityIndex',
        propertyKeys: ['city' + now],
        unique: false,
      },
    ],
    vertexLabels: [{ name: 'location' }],
  };

  it('create schema - POST /schema', function (done) {
    var response = _.clone(SAMPLE_RESPONSE);
    response.result.data = [schema];
    var mocks = nock(SERVER)
                .post(PATH + '/schema')
                .reply(200, response);

    var g = new GDS({
      url: APIURL,
      username: USERNAME,
      password: PASSWORD,
    });

    g.schema().set(schema, function (err, data) {
      should(err).equal(null);
      data.should.be.an.Object;
      data.should.have.property('result');
      data.result.should.be.an.Object;
      data.result.should.have.property('data');
      data.result.data.should.be.an.Array;
      data.result.data[0].should.be.an.Object;
      mocks.done();
      done();
    });

  });

  it('fetch schema - GET /schema', function (done) {
    var response = _.clone(SAMPLE_RESPONSE);
    response.result.data = [schema];
    var mocks = nock(SERVER)
                .get(PATH + '/schema')
                .reply(200, response);

    var g = new GDS({
      url: APIURL,
      username: USERNAME,
      password: PASSWORD,
    });

    g.schema().get(function (err, data) {
      should(err).equal(null);
      data.should.be.an.Object;
      data.should.have.property('result');
      data.result.should.be.an.Object;
      data.result.should.have.property('data');
      data.result.data.should.be.an.Array;
      mocks.done();
      done();
    });

  });

  after(function (done) {
    // return schema back to normal schema
    var blankschema = {
      edgeIndexes: [],
      edgeLabels: [],
      propertyKeys: [],
      vertexIndexes: [],
      vertexLabels: [],
    };

    var response = _.clone(SAMPLE_RESPONSE);
    response.result.data = [schema];
    var mocks = nock(SERVER)
                .post(PATH + '/schema')
                .reply(200, response);

    var g = new GDS({
      url: APIURL,
      username: USERNAME,
      password: PASSWORD
    });

    g.schema().set(blankschema, function (err, data) {
      should(err).equal(null);
      data.should.be.an.Object;
      data.should.have.property('result');
      data.result.should.be.an.Object;
      data.result.should.have.property('data');
      data.result.data.should.be.an.Array;
      data.result.data[0].should.be.an.Object;
      mocks.done();
      done();
    });

  });

});
